from datetime import date, datetime, timedelta, timezone
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DomainError, NotFound
from app.models import (
    Auction,
    BagType,
    BillCharge,
    Buyer,
    ChargeRule,
    CommissionAgent,
    Equipment,
    GateExit,
    Lot,
    SaleBill,
    Seller,
    Settlement,
    Trade,
    WeighmentRecord,
)
from app.models.enums import ApprovalStatus, BidDecision, ChargeKind, GateExitType, LotStatus, PaymentStatus, PayoutStatus, TradeStatus
from app.schemas.trade import BillIn, PaymentIn, WeighmentIn
from app.services import charges
from app.services.numbering import next_number
from app.services.state import move

now = lambda: datetime.now(timezone.utc)  # noqa: E731
TWO = Decimal("0.01")


def money(v: Decimal) -> Decimal:
    return v.quantize(TWO, rounding=ROUND_HALF_UP)


# ---------------- weighment ----------------
async def record_weighment(db: AsyncSession, d: WeighmentIn) -> WeighmentRecord:
    if d.gross_kg < d.tare_kg:
        raise DomainError("INVALID_WEIGHT", "Gross weight must be >= tare weight", 422)
    if d.equipment_id:
        eq = await db.get(Equipment, d.equipment_id)
        if not eq or not eq.is_active:
            raise NotFound("Equipment")
        if not eq.calibration_expires_on or eq.calibration_expires_on < date.today():
            raise DomainError("CALIBRATION_EXPIRED", "Equipment calibration has expired", 409)
    bag_kg = Decimal(0)
    if d.bag_type_id and d.number_of_bags:
        bag = await db.get(BagType, d.bag_type_id)
        bag_kg = (bag.weight_kg if bag else Decimal(0)) * d.number_of_bags
    net = d.gross_kg - d.tare_kg - bag_kg
    if net <= 0:
        raise DomainError("INVALID_WEIGHT", "Net weight after deductions must be positive", 422)
    w = WeighmentRecord(
        slip_number=await next_number(db, "WS"),
        bag_deduction_kg=money(bag_kg),
        final_qtl=money(net / 100),
        **d.model_dump(
            exclude={"booking_id"},
            include={"lot_id", "vehicle_number", "gross_kg", "tare_kg", "number_of_bags", "bag_type_id", "equipment_id", "operator"},
        ),
        booking_id=d.booking_id,
    )
    db.add(w)
    await db.flush()
    return w


# ---------------- trade / agreement ----------------
async def trade_for(db: AsyncSession, trade_id: int) -> Trade:
    t = await db.scalar(select(Trade).where(Trade.id == trade_id).with_for_update())
    if not t:
        raise NotFound("Trade")
    return t


def _party(t: Trade, seller: Seller | None, buyer: Buyer | None) -> str:
    if seller and seller.id == t.seller_id:
        return "seller"
    if buyer and buyer.id == t.buyer_id:
        return "buyer"
    raise DomainError("FORBIDDEN", "You are not a party to this trade", 403)


async def confirm(db: AsyncSession, t: Trade, seller: Seller | None, buyer: Buyer | None) -> Trade:
    side = _party(t, seller, buyer)
    if t.status not in (TradeStatus.DECLARED, TradeStatus.CONFIRMED):
        raise DomainError("INVALID_STATE", f"Trade is {t.status.value}", 409)
    setattr(t, f"{side}_confirmed_at", now())
    if t.buyer_confirmed_at and t.seller_confirmed_at:
        t.status = TradeStatus.CONFIRMED
    return t


async def attach_weighment(db: AsyncSession, t: Trade, weighment_id: int) -> Trade:
    w = await db.get(WeighmentRecord, weighment_id)
    if not w or w.lot_id != t.lot_id:
        raise DomainError("WEIGHMENT_MISMATCH", "Weighment does not belong to this trade's lot", 422)
    if t.status not in (TradeStatus.CONFIRMED, TradeStatus.WEIGHMENT_PENDING):
        raise DomainError("INVALID_STATE", "Both parties must confirm before weighment", 409)
    t.weighment_id, t.final_qty_qtl = w.id, w.final_qtl
    t.total_value = money(w.final_qtl * t.rate_per_qtl)
    return t


async def generate_agreement(db: AsyncSession, t: Trade) -> Trade:
    if not (t.buyer_confirmed_at and t.seller_confirmed_at):
        raise DomainError("NOT_CONFIRMED", "Both parties must confirm first", 409)
    if not t.weighment_id:
        raise DomainError("NO_WEIGHMENT", "A weighment record is required first", 409)
    if t.status == TradeStatus.CONFIRMED:
        move(t, TradeStatus.WEIGHMENT_PENDING)
    move(t, TradeStatus.AGREEMENT_GENERATED)
    t.agreement_number = await next_number(db, "SA")
    return t


async def decide(db: AsyncSession, t: Trade, seller: Seller | None, buyer: Buyer | None, approve: bool) -> Trade:
    if t.status != TradeStatus.AGREEMENT_GENERATED:
        raise DomainError("NO_AGREEMENT", "Agreement has not been generated", 409)
    side = _party(t, seller, buyer)
    setattr(t, f"{side}_approval", ApprovalStatus.APPROVED if approve else ApprovalStatus.REJECTED)
    return t


# ---------------- billing ----------------
async def rules_for(db: AsyncSession, apmc_id: int | None, commodity_id: int) -> list[charges.Rule]:
    """Most specific rule wins per charge kind: (APMC + commodity) > (APMC) > (default). Rates are data, not code."""
    rows = (
        await db.scalars(
            select(ChargeRule).where(
                ChargeRule.is_active.is_(True),
                or_(ChargeRule.apmc_id == apmc_id, ChargeRule.apmc_id.is_(None)),
                or_(ChargeRule.commodity_id == commodity_id, ChargeRule.commodity_id.is_(None)),
            )
        )
    ).all()
    best: dict[tuple, ChargeRule] = {}
    specificity = lambda r: (r.apmc_id is not None) * 2 + (r.commodity_id is not None)  # noqa: E731
    for r in rows:
        key = (r.kind, r.side, r.basis)
        if key not in best or specificity(r) > specificity(best[key]):
            best[key] = r
    return [charges.Rule(r.kind, r.side, r.basis, r.rate) for r in best.values()]


async def generate_bill(db: AsyncSession, t: Trade, d: BillIn) -> SaleBill:
    """Buyer's invoice + the seller/agent settlements, from one computation. Commission comes OUT of the seller's
    proceeds; it is not added to what the buyer pays."""
    if t.status != TradeStatus.AGREEMENT_GENERATED or not (t.buyer_approval == t.seller_approval == ApprovalStatus.APPROVED):
        raise DomainError("AGREEMENT_NOT_APPROVED", "Both parties must approve the agreement", 409)
    if await db.scalar(select(SaleBill.id).where(SaleBill.trade_id == t.id)):
        raise DomainError("BILL_EXISTS", "Bill already generated", 409)

    rules = await rules_for(db, t.apmc_id, t.commodity_id)
    if t.commission_agent_id:
        agent = await db.get(CommissionAgent, t.commission_agent_id)
        rules = charges.with_agent_rate(rules, agent.commission_pct)
    try:
        b = charges.compute(t.final_qty_qtl, t.rate_per_qtl, t.bags or 0, rules, has_agent=t.commission_agent_id is not None)
    except ValueError as e:
        raise DomainError("DEDUCTIONS_EXCEED_VALUE", str(e), 422) from None
    extra = money(d.other_charges)  # one-off buyer-side charge entered at billing time
    buyer_total = b.buyer_total + extra
    tax = money(buyer_total * d.tax_pct / 100)

    bill = SaleBill(
        invoice_number=await next_number(db, "INV", dated="%y%m"),
        trade_id=t.id,
        quantity_qtl=t.final_qty_qtl,
        rate_per_qtl=t.rate_per_qtl,
        gross_amount=b.gross,
        mandi_fee=sum((line.amount for line in b.lines if line.kind == ChargeKind.MANDI_FEE), Decimal(0)),
        commission=b.commission,
        other_charges=b.buyer_charges + extra,
        tax=tax,
        total=buyer_total + tax,
        seller_deductions=b.seller_deductions,
        seller_net=b.seller_net,
        due_date=date.today() + timedelta(days=d.due_days),
    )
    db.add(bill)
    await db.flush()
    for line in b.lines:
        db.add(
            BillCharge(
                bill_id=bill.id, kind=line.kind, side=line.side, basis=line.basis, rate=line.rate, amount=line.amount, payee=line.payee
            )
        )
    await _create_settlements(db, t, bill)
    await db.flush()
    return bill


async def _create_settlements(db: AsyncSession, t: Trade, bill: SaleBill) -> None:
    """Who gets paid out once the buyer has paid: the seller (net) and the commission agent (their commission)."""
    seller = await db.get(Seller, t.seller_id)
    db.add(Settlement(bill_id=bill.id, payee_user_id=seller.user_id, payee_role="seller", amount=bill.seller_net))
    if bill.commission > 0 and t.commission_agent_id:
        agent = await db.get(CommissionAgent, t.commission_agent_id)
        db.add(Settlement(bill_id=bill.id, payee_user_id=agent.user_id, payee_role="commission_agent", amount=bill.commission))


async def decide_bid(db: AsyncSession, t: Trade, seller: Seller, accept: bool) -> Trade:
    """e-NAM step 4: after bid declaration the farmer may accept the top price, or reject it and re-auction."""
    if t.seller_id != seller.id:
        raise DomainError("FORBIDDEN", "Not your trade", 403)
    if t.bid_decision != BidDecision.PENDING or t.status != TradeStatus.DECLARED:
        raise DomainError("ALREADY_DECIDED", "The top bid has already been decided", 409)
    if accept:
        t.bid_decision = BidDecision.ACCEPTED
        return t
    t.bid_decision = BidDecision.REJECTED
    move(t, TradeStatus.CANCELLED)
    lot = await db.get(Lot, t.lot_id)
    move(lot, LotStatus.ACTIVE)  # lot returns to the pool for another auction
    old = await db.get(Auction, t.auction_id) if t.auction_id else None
    if old:
        await db.delete(t)  # frees the one-trade-per-lot slot and the one-auction-per-lot slot
        await db.flush()
        await db.delete(old)
    return t


async def release_settlement(db: AsyncSession, settlement_id: int, reference: str) -> Settlement:
    """Admin releases a payout. Only allowed once the buyer's bill is fully paid (money must exist before it moves)."""
    st = await db.scalar(select(Settlement).where(Settlement.id == settlement_id).with_for_update())
    if not st:
        raise NotFound("Settlement")
    bill = await db.get(SaleBill, st.bill_id)
    if bill.payment_status != PaymentStatus.PAID:
        raise DomainError("BILL_NOT_PAID", "The buyer has not fully paid this bill yet", 409)
    if st.status == PayoutStatus.PAID:
        raise DomainError("ALREADY_PAID", "Already released", 409)
    st.status, st.reference, st.paid_at = PayoutStatus.PAID, reference, now()
    return st


async def pay(db: AsyncSession, bill_id: int, d: PaymentIn) -> SaleBill:
    bill = await db.scalar(select(SaleBill).where(SaleBill.id == bill_id).with_for_update())
    if not bill:
        raise NotFound("Bill")
    if bill.payment_status == PaymentStatus.PAID:
        raise DomainError("ALREADY_PAID", "Bill is already fully paid", 409)
    if bill.paid + d.amount > bill.total:
        raise DomainError("OVERPAYMENT", f"Only {bill.total - bill.paid} is outstanding", 422)
    bill.paid, bill.payment_ref = bill.paid + d.amount, d.reference
    bill.payment_status = PaymentStatus.PAID if bill.paid == bill.total else PaymentStatus.PARTIAL
    if bill.payment_status == PaymentStatus.PAID:
        bill.paid_at = now()
    return bill


# ---------------- gate exit ----------------
async def create_gate_exit(
    db: AsyncSession,
    user_id: int,
    exit_type: GateExitType,
    lot_id: int,
    vehicle_type: str | None,
    vehicle_number: str | None,
    bags: int | None,
    qty,
    reason: str | None,
) -> GateExit:
    lot = await db.get(Lot, lot_id)
    if not lot:
        raise NotFound("Lot")
    if await db.scalar(
        select(GateExit.id).where(GateExit.lot_id == lot_id, GateExit.exit_type == exit_type, GateExit.approval != ApprovalStatus.REJECTED)
    ):
        raise DomainError("EXIT_EXISTS", "An open gate exit already exists for this lot", 409)
    bill_id = None
    if exit_type == GateExitType.POST_TRADE:
        bill = await db.scalar(select(SaleBill).join(Trade, Trade.id == SaleBill.trade_id).where(Trade.lot_id == lot_id))
        if not bill or bill.payment_status != PaymentStatus.PAID:
            raise DomainError("PAYMENT_PENDING", "Gate exit needs the bill to be fully paid", 409)
        bill_id = bill.id
    elif not reason:
        raise DomainError("REASON_REQUIRED", "A return reason is required for goods return", 422)
    g = GateExit(
        number=await next_number(db, "GX"),
        exit_type=exit_type,
        lot_id=lot_id,
        bill_id=bill_id,
        created_by=user_id,
        vehicle_type=vehicle_type,
        vehicle_number=vehicle_number,
        bags=bags,
        quantity_qtl=qty,
        return_reason=reason,
    )
    db.add(g)
    await db.flush()
    return g


async def decide_gate_exit(db: AsyncSession, gx_id: int, admin_id: int, approve: bool) -> GateExit:
    g = await db.scalar(select(GateExit).where(GateExit.id == gx_id).with_for_update())
    if not g:
        raise NotFound("Gate exit")
    if g.approval != ApprovalStatus.PENDING:
        raise DomainError("ALREADY_DECIDED", f"Already {g.approval.value}", 409)
    g.approval = ApprovalStatus.APPROVED if approve else ApprovalStatus.REJECTED
    g.approved_by, g.approved_at = admin_id, now()
    if approve and g.exit_type == GateExitType.POST_TRADE:
        move(await db.get(Lot, g.lot_id), LotStatus.SOLD)  # goods physically left: lot is finally sold
    return g
