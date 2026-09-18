from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from app.models.buyer import BuyerCommodity
    from app.models.seller import SellerCommodity
    from app.models.users import User


class State(Base):
    __tablename__ = "states"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    code: Mapped[str | None] = mapped_column(String(20), nullable=True)

    districts: Mapped[list[District]] = relationship("District", back_populates="state")

    apmcs: Mapped[list[APMC]] = relationship("APMC", back_populates="state")


class District(Base):
    __tablename__ = "districts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    state_id: Mapped[int] = mapped_column(ForeignKey("states.id"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    state: Mapped[State] = relationship("State", back_populates="districts")

    tehsils: Mapped[list[Tehsil]] = relationship("Tehsil", back_populates="district")

    apmcs: Mapped[list[APMC]] = relationship("APMC", back_populates="district")


class Tehsil(Base):
    __tablename__ = "tehsils"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    district: Mapped[District] = relationship("District", back_populates="tehsils")


class APMC(Base, TimestampMixin):
    __tablename__ = "apmcs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(200), nullable=False)

    state_id: Mapped[int] = mapped_column(ForeignKey("states.id"), nullable=False, index=True)

    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"), nullable=True, index=True)

    apmc_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    # enam
    # non_enam

    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    state: Mapped[State] = relationship("State", back_populates="apmcs")

    district: Mapped[District | None] = relationship("District", back_populates="apmcs")

    registered_users: Mapped[list[User]] = relationship("User", back_populates="registered_apmc")


class Commodity(Base, TimestampMixin):
    __tablename__ = "commodities"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(150), nullable=False)

    code: Mapped[str | None] = mapped_column(String(50), nullable=True)

    category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    seller_commodities: Mapped[list[SellerCommodity]] = relationship("SellerCommodity", back_populates="commodity")

    buyer_commodities: Mapped[list[BuyerCommodity]] = relationship("BuyerCommodity", back_populates="commodity")
