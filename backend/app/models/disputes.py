from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, PKMixin, TimestampMixin


class Dispute(Base, PKMixin, TimestampMixin):
    """Disputes and complaints table for Admin Dispute management & Farmer problem reporting."""

    __tablename__ = "disputes"

    number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    dispute_type: Mapped[str] = mapped_column(String(50), index=True)
    farmer_id: Mapped[int | None] = mapped_column(ForeignKey("sellers.id", ondelete="SET NULL"), index=True)
    buyer_id: Mapped[int | None] = mapped_column(ForeignKey("buyers.id", ondelete="SET NULL"), index=True)
    trade_id: Mapped[int | None] = mapped_column(ForeignKey("trades.id", ondelete="SET NULL"))
    lot_id: Mapped[int | None] = mapped_column(ForeignKey("lots.id", ondelete="SET NULL"))
    description: Mapped[str | None] = mapped_column(Text)
    evidence: Mapped[dict] = mapped_column(JSONB, default=dict)
    sla_hours: Mapped[int] = mapped_column(Integer, default=48)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    status: Mapped[str] = mapped_column(String(30), default="open", index=True)  # open, urgent, escalated, resolved, rejected
    resolution_type: Mapped[str | None] = mapped_column(String(100))
    resolution_note: Mapped[str | None] = mapped_column(Text)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
