"""Reference data: State > District > Tehsil, APMC, Commodity, Variety, BagType."""

from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, PKMixin, TimestampMixin
from app.models._types import enum_col
from app.models.enums import ApmcType


class State(Base, PKMixin):
    __tablename__ = "states"
    name: Mapped[str] = mapped_column(String(100), unique=True)
    code: Mapped[str | None] = mapped_column(String(10))


class District(Base, PKMixin):
    __tablename__ = "districts"
    state_id: Mapped[int] = mapped_column(ForeignKey("states.id"), index=True)
    name: Mapped[str] = mapped_column(String(100))


class Tehsil(Base, PKMixin):
    __tablename__ = "tehsils"
    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id"), index=True)
    name: Mapped[str] = mapped_column(String(100))


class Apmc(Base, PKMixin, TimestampMixin):
    __tablename__ = "apmcs"
    name: Mapped[str] = mapped_column(String(200), index=True)
    state_id: Mapped[int] = mapped_column(ForeignKey("states.id"), index=True)
    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"), index=True)
    apmc_type: Mapped[ApmcType] = mapped_column(enum_col(ApmcType), default=ApmcType.ENAM)
    address: Mapped[str | None] = mapped_column(Text)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))  # Find Mandis (S48)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))


class Commodity(Base, PKMixin, TimestampMixin):
    __tablename__ = "commodities"
    name: Mapped[str] = mapped_column(String(150), index=True)
    code: Mapped[str | None] = mapped_column(String(50))
    category: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(default=True)
    varieties: Mapped[list["Variety"]] = relationship(back_populates="commodity")


class Variety(Base, PKMixin):
    __tablename__ = "commodity_varieties"
    commodity_id: Mapped[int] = mapped_column(ForeignKey("commodities.id"), index=True)  # was a bare column before
    name: Mapped[str] = mapped_column(String(150))
    commodity: Mapped[Commodity] = relationship(back_populates="varieties")


class BagType(Base, PKMixin):
    __tablename__ = "bag_types"
    name: Mapped[str] = mapped_column(String(100))
    material: Mapped[str | None] = mapped_column(String(50))
    weight_kg: Mapped[Decimal] = mapped_column(Numeric(10, 2))
