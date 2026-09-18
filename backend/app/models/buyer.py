from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from app.models.commodities import APMC, Commodity, State
    from app.models.trade_licence import TradeLicense
    from app.models.users import User


class Buyer(Base, TimestampMixin):
    __tablename__ = "buyers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Relationships
    user: Mapped[User] = relationship("User", back_populates="buyer")

    commodities: Mapped[list[BuyerCommodity]] = relationship("BuyerCommodity", back_populates="buyer", cascade="all, delete-orphan")

    preferred_locations: Mapped[list[BuyerPreferredLocation]] = relationship("BuyerPreferredLocation", back_populates="buyer", cascade="all, delete-orphan")

    trade_licenses: Mapped[list[TradeLicense]] = relationship("TradeLicense", back_populates="buyer", cascade="all, delete-orphan")


class BuyerCommodity(Base):
    __tablename__ = "buyer_commodities"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    buyer_id: Mapped[int] = mapped_column(ForeignKey("buyers.id", ondelete="CASCADE"), nullable=False, index=True)

    commodity_id: Mapped[int] = mapped_column(ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    buyer: Mapped[Buyer] = relationship("Buyer", back_populates="commodities")

    commodity: Mapped[Commodity] = relationship("Commodity", back_populates="buyer_commodities")

    __table_args__ = (
        UniqueConstraint(
            "buyer_id",
            "commodity_id",
            name="uq_buyer_commodity",
        ),
    )


class BuyerPreferredLocation(Base, TimestampMixin):
    __tablename__ = "buyer_preferred_locations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    buyer_id: Mapped[int] = mapped_column(ForeignKey("buyers.id", ondelete="CASCADE"), nullable=False, index=True)

    state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"), nullable=True, index=True)

    apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"), nullable=True, index=True)

    # Relationships
    buyer: Mapped[Buyer] = relationship("Buyer", back_populates="preferred_locations")

    state: Mapped[State | None] = relationship("State")

    apmc: Mapped[APMC | None] = relationship("APMC")