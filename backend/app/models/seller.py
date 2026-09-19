from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Enum as SQLEnum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin
from app.models.enums import SellerType

if TYPE_CHECKING:
    from app.models.commodities import APMC, Commodity, State
    from app.models.users import User


class Seller(Base, TimestampMixin):
    __tablename__ = "sellers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    seller_type: Mapped[SellerType] = mapped_column(
        SQLEnum(
            SellerType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    # farmer
    # fpo

    # Relationships
    user: Mapped[User] = relationship("User", back_populates="seller")

    commodities: Mapped[list[SellerCommodity]] = relationship("SellerCommodity", back_populates="seller", cascade="all, delete-orphan")

    preferred_locations: Mapped[list[SellerPreferredLocation]] = relationship("SellerPreferredLocation", back_populates="seller", cascade="all, delete-orphan")


class SellerCommodity(Base):
    __tablename__ = "seller_commodities"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    seller_id: Mapped[int] = mapped_column(ForeignKey("sellers.id", ondelete="CASCADE"), nullable=False, index=True)

    commodity_id: Mapped[int] = mapped_column(ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    seller: Mapped[Seller] = relationship("Seller", back_populates="commodities")

    commodity: Mapped[Commodity] = relationship("Commodity", back_populates="seller_commodities")

    __table_args__ = (
        UniqueConstraint(
            "seller_id",
            "commodity_id",
            name="uq_seller_commodity",
        ),
    )


class SellerPreferredLocation(Base, TimestampMixin):
    __tablename__ = "seller_preferred_locations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    seller_id: Mapped[int] = mapped_column(ForeignKey("sellers.id", ondelete="CASCADE"), nullable=False, index=True)

    state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"), nullable=True, index=True)

    apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"), nullable=True, index=True)

    # Relationships
    seller: Mapped[Seller] = relationship("Seller", back_populates="preferred_locations")

    state: Mapped[State | None] = relationship("State")

    apmc: Mapped[APMC | None] = relationship("APMC")