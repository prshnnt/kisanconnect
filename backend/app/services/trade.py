from datetime import date, datetime, timedelta, timezone
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DomainError, NotFound
from app.models import BagType, Buyer, Equipment, GateExit, Lot, SaleBill, Seller, Trade, WeighmentRecord
from app.models.enums import ApprovalStatus, GateExitType, LotStatus, PaymentStatus, TradeStatus
from app.schemas.trade import BillIn, PaymentIn, WeighmentIn
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
async def generate_bill(db: AsyncSession, t: Trade, d: BillIn) -> SaleBill:
    if t.status != TradeStatus.AGREEMENT_GENERATED or not (t.buyer_approval == t.seller_approval == ApprovalStatus.APPROVED):
        raise DomainError("AGREEMENT_NOT_APPROVED", "Both parties must approve the agreement", 409)
    if await db.scalar(select(SaleBill.id).where(SaleBill.trade_id == t.id)):
        raise DomainError("BILL_EXISTS", "Bill already generated", 409)
    gross = money(t.final_qty_qtl * t.rate_per_qtl)
    fee, comm = money(gross * d.mandi_fee_pct / 100), money(gross * d.commission_pct / 100)
    tax = money((gross + fee + comm + d.other_charges) * d.tax_pct / 100)
    bill = SaleBill(
        invoice_number=await next_number(db, "INV", dated="%y%m"),
        trade_id=t.id,
        quantity_qtl=t.final_qty_qtl,
        rate_per_qtl=t.rate_per_qtl,
        gross_amount=gross,
        mandi_fee=fee,
        commission=comm,
        other_charges=money(d.other_charges),
        tax=tax,
        total=gross + fee + comm + money(d.other_charges) + tax,
        due_date=date.today() + timedelta(days=d.due_days),
    )
    db.add(bill)
    await db.flush()
    return bill


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
