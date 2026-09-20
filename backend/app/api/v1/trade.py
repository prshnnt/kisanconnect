from fastapi import APIRouter, Depends, Path, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import idempotency_key, require_roles
from app.core.errors import DomainError
from app.core.pagination import PageParams, page_params, paginate
from app.db.session import get_db
from app.models import BillCharge, Buyer, CommissionAgent, GateExit, SaleBill, Seller, Settlement, Trade, User, WeighmentRecord
from app.models.enums import ApprovalStatus, GateExitType, PaymentStatus, PayoutStatus, TradeStatus, Venue
from app.schemas.common import ORM, Dec, Msg, Page
from app.schemas.trade import BillIn, BillOut, PaymentIn, TradeOut, WeighmentIn, WeighmentOut
from app.services import trade as svc

router = APIRouter(tags=["G/H/K. Weighment, Trade, Gate exit"])
any_party = require_roles("seller", "buyer")


async def _roles(db: AsyncSession, user: User) -> tuple[Seller | None, Buyer | None]:
    seller = await db.scalar(select(Seller).where(Seller.user_id == user.id))
    buyer = await db.scalar(select(Buyer).where(Buyer.user_id == user.id))
    return seller, buyer


# ---------- weighment ----------
@router.post("/weighment/records", response_model=WeighmentOut, status_code=201)
async def record_weighment(b: WeighmentIn, _: User = Depends(require_roles("service_provider")), db: AsyncSession = Depends(get_db)):
    return await svc.record_weighment(db, b)


@router.get("/weighment/records", response_model=Page[WeighmentOut])
async def list_weighments(
    lot_id: int | None = None,
    p: PageParams = Depends(page_params),
    _: User = Depends(require_roles("service_provider", "seller", "buyer")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(WeighmentRecord).order_by(WeighmentRecord.id.desc())
    if lot_id:
        stmt = stmt.where(WeighmentRecord.lot_id == lot_id)
    return await paginate(db, stmt, p)


# ---------- trades (Buy / Sell sides share one table, filtered by who is asking) ----------
def _side_query(side: str, seller: Seller | None, buyer: Buyer | None, venue: Venue | None, q: str | None, status):
    party = Trade.buyer_id == (buyer.id if buyer else 0) if side == "buy" else Trade.seller_id == (seller.id if seller else 0)
    stmt = select(Trade).where(party).order_by(Trade.id.desc())
    if venue:
        stmt = stmt.where(Trade.venue == venue)
    if status:
        stmt = stmt.where(Trade.status.in_(status))
    if q:
        stmt = stmt.where(Trade.number.ilike(f"%{q}%"))
    return stmt


@router.get("/trade/{side}/trades", response_model=Page[TradeOut])
async def my_trades(
    side: str = Path(..., pattern="^(buy|sell)$"),
    location: Venue | None = None,
    q: str | None = None,
    status: list[TradeStatus] = Query(default=[]),
    p: PageParams = Depends(page_params),
    user: User = Depends(any_party),
    db: AsyncSession = Depends(get_db),
):
    """buy  -> Confirm Lot / Sale Agreement lists.  sell -> Declared Bid / Sale Agreement lists.  `location` = the Inside/Outside tab."""
    seller, buyer = await _roles(db, user)
    return await paginate(db, _side_query(side, seller, buyer, location, q, status), p)


async def _my_trade(db: AsyncSession, user: User, trade_id: int):
    seller, buyer = await _roles(db, user)
    t = await svc.trade_for(db, trade_id)
    svc._party(t, seller, buyer)  # 403 unless the caller is a party
    return t, seller, buyer


@router.post("/trade/trades/{trade_id}/confirm", response_model=TradeOut)
async def confirm(trade_id: int, user: User = Depends(any_party), db: AsyncSession = Depends(get_db)):
    t, seller, buyer = await _my_trade(db, user, trade_id)
    return await svc.confirm(db, t, seller, buyer)


class AttachWeighment(BaseModel):
    weighment_id: int


@router.post("/trade/trades/{trade_id}/weighment", response_model=TradeOut)
async def attach_weighment(trade_id: int, b: AttachWeighment, user: User = Depends(any_party), db: AsyncSession = Depends(get_db)):
    t, *_ = await _my_trade(db, user, trade_id)
    return await svc.attach_weighment(db, t, b.weighment_id)


@router.post("/trade/trades/{trade_id}/generate-agreement", response_model=TradeOut)
async def generate_agreement(trade_id: int, user: User = Depends(any_party), db: AsyncSession = Depends(get_db)):
    t, *_ = await _my_trade(db, user, trade_id)
    return await svc.generate_agreement(db, t)


@router.post("/trade/trades/{trade_id}/approve", response_model=TradeOut)
async def approve(trade_id: int, user: User = Depends(any_party), db: AsyncSession = Depends(get_db)):
    t, seller, buyer = await _my_trade(db, user, trade_id)
    return await svc.decide(db, t, seller, buyer, True)


@router.post("/trade/trades/{trade_id}/reject", response_model=TradeOut)
async def reject(trade_id: int, user: User = Depends(any_party), db: AsyncSession = Depends(get_db)):
    t, seller, buyer = await _my_trade(db, user, trade_id)
    return await svc.decide(db, t, seller, buyer, False)


# ---------- bills ----------
@router.post("/trade/trades/{trade_id}/generate-bill", response_model=BillOut, status_code=201)
async def generate_bill(trade_id: int, b: BillIn, user: User = Depends(any_party), db: AsyncSession = Depends(get_db)):
    t, *_ = await _my_trade(db, user, trade_id)
    return await svc.generate_bill(db, t, b)


@router.get("/trade/{side}/bills", response_model=Page[BillOut])
async def my_bills(
    side: str = Path(..., pattern="^(buy|sell)$"),
    status: PaymentStatus | None = None,
    p: PageParams = Depends(page_params),
    user: User = Depends(any_party),
    db: AsyncSession = Depends(get_db),
):
    seller, buyer = await _roles(db, user)
    party = Trade.buyer_id == (buyer.id if buyer else 0) if side == "buy" else Trade.seller_id == (seller.id if seller else 0)
    stmt = select(SaleBill).join(Trade, Trade.id == SaleBill.trade_id).where(party).order_by(SaleBill.id.desc())
    if status:
        stmt = stmt.where(SaleBill.payment_status == status)
    return await paginate(db, stmt, p)


@router.post("/trade/bills/{bill_id}/payments", response_model=BillOut)
async def pay(
    bill_id: int,
    b: PaymentIn,
    key: str | None = Depends(idempotency_key),
    user: User = Depends(require_roles("buyer")),
    db: AsyncSession = Depends(get_db),
):
    bill = await db.get(SaleBill, bill_id)
    t = await db.get(Trade, bill.trade_id) if bill else None
    _, buyer = await _roles(db, user)
    if not t or not buyer or t.buyer_id != buyer.id:
        raise DomainError("NOT_FOUND", "Bill not found", 404)
    return await svc.pay(db, bill_id, b)


# ---------- gate exit ----------
class GateExitIn(BaseModel):
    exit_type: GateExitType
    lot_id: int
    vehicle_type: str | None = None
    vehicle_number: str | None = None
    bags: int | None = Field(None, gt=0)
    quantity_qtl: Dec | None = None
    return_reason: str | None = None


class GateExitOut(ORM):
    id: int
    number: str
    exit_type: GateExitType
    lot_id: int
    bill_id: int | None
    vehicle_number: str | None
    approval: ApprovalStatus


@router.post("/gate-exits", response_model=GateExitOut, status_code=201)
async def create_gate_exit(b: GateExitIn, user: User = Depends(any_party), db: AsyncSession = Depends(get_db)):
    return await svc.create_gate_exit(
        db, user.id, b.exit_type, b.lot_id, b.vehicle_type, b.vehicle_number, b.bags, b.quantity_qtl, b.return_reason
    )


@router.get("/gate-exits", response_model=Page[GateExitOut])
async def list_gate_exits(
    approval: ApprovalStatus | None = None,
    p: PageParams = Depends(page_params),
    _: User = Depends(require_roles("seller", "buyer")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(GateExit).order_by(GateExit.id.desc())
    if approval:
        stmt = stmt.where(GateExit.approval == approval)
    return await paginate(db, stmt, p)


@router.post("/gate-exits/{gx_id}/approve", response_model=GateExitOut)
async def approve_exit(gx_id: int, user: User = Depends(require_roles("admin")), db: AsyncSession = Depends(get_db)):
    return await svc.decide_gate_exit(db, gx_id, user.id, True)


@router.post("/gate-exits/{gx_id}/reject", response_model=GateExitOut)
async def reject_exit(gx_id: int, user: User = Depends(require_roles("admin")), db: AsyncSession = Depends(get_db)):
    return await svc.decide_gate_exit(db, gx_id, user.id, False)


# ---------- seller accepts / rejects the declared top bid (e-NAM step 4) ----------
@router.post("/trade/trades/{trade_id}/accept-bid", response_model=TradeOut)
async def accept_bid(trade_id: int, user: User = Depends(require_roles("seller")), db: AsyncSession = Depends(get_db)):
    seller, _ = await _roles(db, user)
    return await svc.decide_bid(db, await svc.trade_for(db, trade_id), seller, True)


@router.post("/trade/trades/{trade_id}/reject-bid", response_model=Msg)
async def reject_bid(trade_id: int, user: User = Depends(require_roles("seller")), db: AsyncSession = Depends(get_db)):
    """Farmer declines the price: the lot goes back to the pool and can be auctioned again."""
    seller, _ = await _roles(db, user)
    await svc.decide_bid(db, await svc.trade_for(db, trade_id), seller, False)
    return Msg(message="Bid rejected; lot is available for a new auction")


# ---------- settlements: what each party is paid out of a paid bill ----------
class SettlementOut(ORM):
    id: int
    bill_id: int
    payee_role: str
    amount: Dec
    status: str
    reference: str | None


class ChargeLineOut(ORM):
    kind: str
    side: str
    basis: str
    rate: Dec
    amount: Dec
    payee: str


class BillBreakdownOut(BaseModel):
    """Both ledgers from one sale: what the buyer pays, and what the seller nets after deductions."""

    bill: BillOut
    buyer_pays: Dec
    seller_receives: Dec
    charges: list[ChargeLineOut]
    settlements: list[SettlementOut]


@router.get("/trade/bills/{bill_id}/breakdown", response_model=BillBreakdownOut)
async def bill_breakdown(
    bill_id: int, user: User = Depends(require_roles("seller", "buyer", "commission_agent")), db: AsyncSession = Depends(get_db)
):
    bill = await db.get(SaleBill, bill_id)
    t = await db.get(Trade, bill.trade_id) if bill else None
    if not t:
        raise DomainError("NOT_FOUND", "Bill not found", 404)
    seller, buyer = await _roles(db, user)
    agent = await db.scalar(select(CommissionAgent).where(CommissionAgent.user_id == user.id))
    allowed = (seller and seller.id == t.seller_id) or (buyer and buyer.id == t.buyer_id) or (agent and agent.id == t.commission_agent_id)
    if not allowed:
        raise DomainError("NOT_FOUND", "Bill not found", 404)  # do not reveal other people's bills
    lines = (await db.scalars(select(BillCharge).where(BillCharge.bill_id == bill.id).order_by(BillCharge.id))).all()
    sets = (await db.scalars(select(Settlement).where(Settlement.bill_id == bill.id).order_by(Settlement.id))).all()
    if agent and not (seller or buyer):  # an agent sees only their own payout, not the seller's net
        sets = [x for x in sets if x.payee_user_id == user.id]
    return BillBreakdownOut(bill=bill, buyer_pays=bill.total, seller_receives=bill.seller_net, charges=lines, settlements=sets)


@router.get("/settlements", response_model=Page[SettlementOut])
async def my_settlements(
    status: PayoutStatus | None = None,
    p: PageParams = Depends(page_params),
    user: User = Depends(require_roles("seller", "commission_agent")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Settlement).where(Settlement.payee_user_id == user.id).order_by(Settlement.id.desc())
    if status:
        stmt = stmt.where(Settlement.status == status)
    return await paginate(db, stmt, p)


class ReleaseIn(BaseModel):
    reference: str = Field(min_length=3, max_length=100)


@router.post("/settlements/{settlement_id}/release", response_model=SettlementOut)
async def release(settlement_id: int, b: ReleaseIn, _: User = Depends(require_roles("admin")), db: AsyncSession = Depends(get_db)):
    return await svc.release_settlement(db, settlement_id, b.reference)
