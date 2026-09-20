"""Commission agent APIs: their lots, their earnings, and the APMC fee schedule."""

from decimal import Decimal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_agent, require_roles
from app.core.errors import NotFound
from app.core.pagination import PageParams, page_params, paginate
from app.db.session import get_db
from app.models import ChargeRule, CommissionAgent, Lot, Settlement, User
from app.models.enums import ChargeBasis, ChargeKind, ChargeSide, LotStatus, PayoutStatus
from app.schemas.common import ORM, Dec, Page
from app.schemas.lots import LotOut

router = APIRouter(tags=["M. Commission agents & fees"])
MAX_AGENT_COMMISSION_PCT = 15  # guard against a typo (or abuse) taking most of the farmer's proceeds; states cap this in law


class AgentOut(ORM):
    id: int
    firm_name: str
    agent_name: str
    apmc_id: int
    license_number: str | None
    commission_pct: Dec | None
    is_active: bool


class AgentPatch(BaseModel):
    firm_name: str | None = None
    commission_pct: Dec | None = Field(None, ge=0, le=MAX_AGENT_COMMISSION_PCT)


class EarningsOut(BaseModel):
    pending: Dec
    paid: Dec
    trades: int


@router.get("/agents/me", response_model=AgentOut)
async def my_profile(a: CommissionAgent = Depends(current_agent)):
    return a


@router.patch("/agents/me", response_model=AgentOut)
async def edit_profile(b: AgentPatch, a: CommissionAgent = Depends(current_agent)):
    for k, v in b.model_dump(exclude_unset=True).items():
        setattr(a, k, v)
    return a


@router.get("/agents/me/lots", response_model=Page[LotOut])
async def lots_assigned_to_me(
    status: LotStatus | None = None,
    p: PageParams = Depends(page_params),
    a: CommissionAgent = Depends(current_agent),
    db: AsyncSession = Depends(get_db),
):
    """Lots farmers have routed through this agent (gate-entry slip: 'Commission Agent's name and Company')."""
    stmt = select(Lot).where(Lot.commission_agent_id == a.id).order_by(Lot.id.desc())
    if status:
        stmt = stmt.where(Lot.status == status)
    return await paginate(db, stmt, p)


@router.get("/agents/me/earnings", response_model=EarningsOut)
async def my_earnings(a: CommissionAgent = Depends(current_agent), db: AsyncSession = Depends(get_db)):
    rows = dict(
        (
            await db.execute(
                select(Settlement.status, func.coalesce(func.sum(Settlement.amount), 0))
                .where(Settlement.payee_user_id == a.user_id, Settlement.payee_role == "commission_agent")
                .group_by(Settlement.status)
            )
        ).all()
    )
    count = await db.scalar(
        select(func.count())
        .select_from(Settlement)
        .where(Settlement.payee_user_id == a.user_id, Settlement.payee_role == "commission_agent")
    )
    return EarningsOut(pending=rows.get(PayoutStatus.PENDING, Decimal(0)), paid=rows.get(PayoutStatus.PAID, Decimal(0)), trades=count or 0)


# ---------- APMC fee schedule (admin) ----------
class RuleIn(BaseModel):
    apmc_id: int | None = None
    commodity_id: int | None = None
    kind: ChargeKind
    side: ChargeSide
    basis: ChargeBasis
    rate: Dec = Field(ge=0)


class RuleOut(RuleIn, ORM):
    id: int
    is_active: bool


@router.post("/charge-rules", response_model=RuleOut, status_code=201)
async def add_rule(b: RuleIn, _: User = Depends(require_roles("admin")), db: AsyncSession = Depends(get_db)):
    if b.kind == ChargeKind.COMMISSION and b.side != ChargeSide.SELLER:
        from app.core.errors import DomainError

        raise DomainError("INVALID_SIDE", "Commission is deducted from the seller, not charged to the buyer", 422)
    rule = ChargeRule(**b.model_dump())
    db.add(rule)
    await db.flush()
    return rule


@router.get("/charge-rules", response_model=list[RuleOut])
async def list_rules(
    apmc_id: int | None = None,
    _: User = Depends(require_roles("admin", "seller", "buyer", "commission_agent")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ChargeRule).where(ChargeRule.is_active.is_(True)).order_by(ChargeRule.id)
    if apmc_id:
        stmt = stmt.where((ChargeRule.apmc_id == apmc_id) | (ChargeRule.apmc_id.is_(None)))
    return (await db.scalars(stmt)).all()


@router.delete("/charge-rules/{rule_id}", status_code=204)
async def deactivate_rule(rule_id: int, _: User = Depends(require_roles("admin")), db: AsyncSession = Depends(get_db)):
    rule = await db.get(ChargeRule, rule_id)
    if not rule:
        raise NotFound("Rule")
    rule.is_active = False  # soft: past bills keep their snapshot regardless
