from decimal import Decimal
from datetime import date

from sqlalchemy import BigInteger, Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin


class AdvancedSupply(Base, TimestampMixin):
    __tablename__ = "advanced_supplies"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    seller_id: Mapped[int] = mapped_column(
        ForeignKey("sellers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    supply_number: Mapped[str] = mapped_column(
        String(50), nullable=False, unique=True, index=True
    )

    commodity_id: Mapped[int] = mapped_column(
        ForeignKey("commodities.id"), nullable=False, index=True
    )
    commodity_variety_id: Mapped[int | None] = mapped_column(
        ForeignKey("commodity_varieties.id"), nullable=True, index=True
    )

    quantity_quintal: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False
    )
    expected_price_per_unit: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2), nullable=True
    )

    availability_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    availability_end_date: Mapped[date] = mapped_column(Date, nullable=False)

    delivery_preference: Mapped[str] = mapped_column(
        String(30), nullable=False
    )
    # seller_delivery
    # buyer_pickup

    preferred_communication_method: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )
    # phone
    # email

    seller: Mapped["Seller"] = relationship("Seller")
    commodity: Mapped["Commodity"] = relationship("Commodity")
    commodity_variety: Mapped["CommodityVariety | None"] = relationship(
        "CommodityVariety"
    )

    location: Mapped["AdvancedSupplyLocation"] = relationship(
        "AdvancedSupplyLocation",
        back_populates="advanced_supply",
        uselist=False,
        cascade="all, delete-orphan",
    )

    attachments: Mapped[list["AdvancedSupplyAttachment"]] = relationship(
        "AdvancedSupplyAttachment",
        back_populates="advanced_supply",
        cascade="all, delete-orphan",
    )


class AdvancedSupplyLocation(Base):
    __tablename__ = "advanced_supply_locations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    advanced_supply_id: Mapped[int] = mapped_column(
        ForeignKey("advanced_supplies.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    pincode: Mapped[str | None] = mapped_column(String(10), nullable=True)
    state_id: Mapped[int] = mapped_column(
        ForeignKey("states.id"), nullable=False, index=True
    )
    district_id: Mapped[int | None] = mapped_column(
        ForeignKey("districts.id"), nullable=True, index=True
    )
    apmc_id: Mapped[int | None] = mapped_column(
        ForeignKey("apmcs.id"), nullable=True, index=True
    )
    city_or_village: Mapped[str | None] = mapped_column(String(150), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    advanced_supply: Mapped["AdvancedSupply"] = relationship(
        "AdvancedSupply", back_populates="location"
    )
    state: Mapped["State"] = relationship("State")
    district: Mapped["District | None"] = relationship("District")
    apmc: Mapped["APMC | None"] = relationship("APMC")


class AdvancedSupplyAttachment(Base):
    __tablename__ = "advanced_supply_attachments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    advanced_supply_id: Mapped[int] = mapped_column(
        ForeignKey("advanced_supplies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    attachment_id: Mapped[int] = mapped_column(
        ForeignKey("attachments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    advanced_supply: Mapped["AdvancedSupply"] = relationship(
        "AdvancedSupply", back_populates="attachments"
    )
    attachment: Mapped["Attachment"] = relationship("Attachment")