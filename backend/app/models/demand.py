from decimal import Decimal
from datetime import date

from sqlalchemy import BigInteger, Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin


class Demand(Base, TimestampMixin):
    __tablename__ = "demands"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    buyer_id: Mapped[int] = mapped_column(
        ForeignKey("buyers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    demand_number: Mapped[str] = mapped_column(
        String(50), nullable=False, unique=True, index=True
    )

    demand_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )
    # normal
    # advanced

    commodity_id: Mapped[int] = mapped_column(
        ForeignKey("commodities.id"), nullable=False, index=True
    )
    commodity_variety_id: Mapped[int | None] = mapped_column(
        ForeignKey("commodity_varieties.id"), nullable=True, index=True
    )

    min_quantity_quintal: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False
    )
    max_quantity_quintal: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2), nullable=True
    )

    min_expected_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    max_expected_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    price_unit: Mapped[str] = mapped_column(
        String(30), nullable=False, default="quintal"
    )

    expected_delivery_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="active"
    )
    # draft
    # active
    # fulfilled
    # cancelled
    # expired

    buyer: Mapped["Buyer"] = relationship("Buyer")
    commodity: Mapped["Commodity"] = relationship("Commodity")
    commodity_variety: Mapped["CommodityVariety | None"] = relationship(
        "CommodityVariety"
    )

    delivery_location: Mapped["DemandLocation | None"] = relationship(
        "DemandLocation",
        back_populates="demand",
        uselist=False,
        cascade="all, delete-orphan",
    )


class DemandLocation(Base):
    __tablename__ = "demand_locations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    demand_id: Mapped[int] = mapped_column(
        ForeignKey("demands.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    pincode: Mapped[str | None] = mapped_column(String(10), nullable=True)
    state_id: Mapped[int | None] = mapped_column(
        ForeignKey("states.id"), nullable=True, index=True
    )
    district_id: Mapped[int | None] = mapped_column(
        ForeignKey("districts.id"), nullable=True, index=True
    )
    tehsil_id: Mapped[int | None] = mapped_column(
        ForeignKey("tehsils.id"), nullable=True, index=True
    )
    apmc_id: Mapped[int | None] = mapped_column(
        ForeignKey("apmcs.id"), nullable=True, index=True
    )
    city_or_village: Mapped[str | None] = mapped_column(String(150), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    demand: Mapped["Demand"] = relationship(
        "Demand", back_populates="delivery_location"
    )
    state: Mapped["State | None"] = relationship("State")
    district: Mapped["District | None"] = relationship("District")
    tehsil: Mapped["Tehsil | None"] = relationship("Tehsil")
    apmc: Mapped["APMC | None"] = relationship("APMC")