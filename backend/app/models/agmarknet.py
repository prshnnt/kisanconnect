"""Agmarknet price ingestion & market intelligence ORM models."""

from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Index, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, PKMixin, TimestampMixin


class DailyMarketPrice(Base, PKMixin, TimestampMixin):
    """Stores daily commodity prices and arrival quantities from Agmarknet / CEDA API."""

    __tablename__ = "daily_market_prices"

    commodity_id: Mapped[int] = mapped_column(ForeignKey("commodities.id", ondelete="CASCADE"), index=True)
    state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id", ondelete="SET NULL"), index=True)
    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id", ondelete="SET NULL"), index=True)
    apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id", ondelete="SET NULL"), index=True)

    price_date: Mapped[date] = mapped_column(Date, index=True)
    min_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    max_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    modal_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    quantity: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    source: Mapped[str] = mapped_column(String(50), default="agmarknet_ceda")

    __table_args__ = (
        UniqueConstraint("apmc_id", "commodity_id", "price_date", name="uq_daily_market_price_apmc_commodity_date"),
        Index("ix_daily_market_prices_lookup", "state_id", "district_id", "commodity_id", "price_date"),
    )
