from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user, require_roles
from app.db.session import get_db
from app.models import User
from app.schemas.disputes import DisputeOut, DisputeResolveIn
from app.schemas.rules import RuleIn, RuleOut, RulePreviewIn, RulePreviewOut
from app.services import disputes as dispute_svc
from app.services import rules as rule_svc

router = APIRouter(prefix="/admin", tags=["Admin Operations"])


# ---------- Dispute management (D5Disputes) ----------
@router.get("/disputes", response_model=list[DisputeOut])
async def list_disputes(
    status: str | None = None,
    _: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await dispute_svc.list_disputes(db, status=status)


@router.post("/disputes/{did}/resolve", response_model=DisputeOut)
async def resolve_dispute(
    did: int,
    b: DisputeResolveIn,
    admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    dispute = await dispute_svc.resolve_dispute(db, did, admin, b)
    # return refreshed dict view
    items = await dispute_svc.list_disputes(db)
    for item in items:
        if item["id"] == dispute.id:
            return item
    return dispute


# ---------- Rule configuration (D7Rules) ----------
@router.get("/rules", response_model=list[RuleOut])
async def list_rules(
    apmc_id: int | None = None,
    is_active: bool | None = None,
    _: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await rule_svc.list_rules(db, apmc_id=apmc_id, is_active=is_active)


@router.post("/rules", response_model=RuleOut, status_code=201)
async def create_rule(
    b: RuleIn,
    _: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await rule_svc.create_rule(db, b)


@router.put("/rules/{rid}", response_model=RuleOut)
async def update_rule(
    rid: int,
    b: RuleIn,
    _: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await rule_svc.update_rule(db, rid, b)


@router.delete("/rules/{rid}", status_code=204)
async def delete_rule(
    rid: int,
    _: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    await rule_svc.delete_rule(db, rid)


@router.post("/rules/preview", response_model=RulePreviewOut)
async def preview_rule(
    b: RulePreviewIn,
    _: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    return await rule_svc.preview_rules(db, b)
