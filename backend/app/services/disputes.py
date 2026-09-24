from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFound
from app.models import Buyer, Dispute, Seller, User
from app.schemas.disputes import DisputeIn, DisputeResolveIn, ProblemReportIn


async def create_dispute(db: AsyncSession, user: User, b: DisputeIn | ProblemReportIn) -> Dispute:
    seq_res = await db.scalar(select(Dispute.id).order_by(Dispute.id.desc()).limit(1))
    next_num = (seq_res or 0) + 1
    num_str = f"C{next_num:03d}"

    farmer_id = None
    buyer_id = None

    if isinstance(b, ProblemReportIn):
        dispute_type = b.problem_type
        desc = b.description
        evidence = {"photos": b.photos, "voice_note_url": b.voice_note_url}
        seller = await db.scalar(select(Seller).where(Seller.user_id == user.id))
        if seller:
            farmer_id = seller.id
    else:
        dispute_type = b.dispute_type
        desc = b.description
        evidence = b.evidence
        farmer_id = b.farmer_id
        buyer_id = b.buyer_id

    dispute = Dispute(
        number=num_str,
        dispute_type=dispute_type,
        farmer_id=farmer_id,
        buyer_id=buyer_id,
        trade_id=getattr(b, "trade_id", None) or getattr(b, "deal_id", None),
        lot_id=getattr(b, "lot_id", None),
        description=desc,
        evidence=evidence,
        sla_hours=getattr(b, "sla_hours", 48),
        status="open",
    )
    db.add(dispute)
    await db.commit()
    await db.refresh(dispute)
    return dispute


async def list_disputes(db: AsyncSession, status: str | None = None) -> list[dict]:
    stmt = select(Dispute).order_by(Dispute.id.desc())
    if status:
        stmt = stmt.where(Dispute.status == status)
    disputes = (await db.scalars(stmt)).all()

    res = []
    now = datetime.now(timezone.utc)
    for d in disputes:
        farmer_name = "Unknown Farmer"
        buyer_name = "Unknown Buyer"

        if d.farmer_id:
            s = await db.scalar(select(Seller).where(Seller.id == d.farmer_id))
            if s:
                u = await db.get(User, s.user_id)
                if u:
                    farmer_name = f"{u.first_name} {u.last_name or ''}".strip()
        if d.buyer_id:
            b = await db.scalar(select(Buyer).where(Buyer.id == d.buyer_id))
            if b:
                if b.organization:
                    buyer_name = b.organization
                else:
                    u = await db.get(User, b.user_id)
                    if u:
                        buyer_name = f"{u.first_name} {u.last_name or ''}".strip()

        opened = d.opened_at or d.created_at
        elapsed_hours = 0
        if opened:
            if opened.tzinfo is None:
                opened = opened.replace(tzinfo=timezone.utc)
            elapsed_hours = int((now - opened).total_seconds() // 3600)
        pct = (elapsed_hours / d.sla_hours * 100) if d.sla_hours > 0 else 0
        urgent = pct > 80

        res.append({
            "id": d.id,
            "number": d.number,
            "dispute_type": d.dispute_type,
            "farmer_id": d.farmer_id,
            "buyer_id": d.buyer_id,
            "farmer_name": farmer_name,
            "buyer_name": buyer_name,
            "trade_id": d.trade_id,
            "lot_id": d.lot_id,
            "description": d.description,
            "evidence": d.evidence or {},
            "sla_hours": d.sla_hours,
            "opened_at": opened,
            "elapsed_hours": elapsed_hours,
            "urgent": urgent,
            "status": d.status,
            "resolution_type": d.resolution_type,
            "resolution_note": d.resolution_note,
            "resolved_at": d.resolved_at,
        })
    return res


async def resolve_dispute(db: AsyncSession, dispute_id: int, user: User, b: DisputeResolveIn) -> Dispute:
    dispute = await db.get(Dispute, dispute_id)
    if not dispute:
        raise NotFound("Dispute")
    dispute.resolution_type = b.resolution_type
    dispute.resolution_note = b.resolution_note
    dispute.status = "resolved"
    dispute.resolved_at = datetime.now(timezone.utc)
    dispute.resolved_by = user.id
    await db.commit()
    await db.refresh(dispute)
    return dispute
