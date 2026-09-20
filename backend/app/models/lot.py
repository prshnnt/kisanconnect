from __future__ import annotations
from typing import TYPE_CHECKING

from decimal import Decimal
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from app.models.auction import Auction
    from app.models.commodities import APMC, BagType, Commodity, CommodityVariety, District, State, Tehsil
    from app.models.commission_agent import CommissionAgent
    from app.models.seller import Seller
    from app.models.weighment_service import WeighmentRecord


class Lot(Base, TimestampMixin):
    __tablename__ = "lots"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    seller_id: Mapped[int] = mapped_column(
        ForeignKey("sellers.id", ondelete="CASCADE"), nullable=False, index=True
    )

    lot_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    lot_type: Mapped[str] = mapped_column(String(30), nullable=False)
    # advanced
    # outside

    sale_type: Mapped[str] = mapped_column(String(30), nullable=False)
    # primary
    # secondary

    commodity_id: Mapped[int] = mapped_column(
        ForeignKey("commodities.id"), nullable=False, index=True
    )
    commodity_variety_id: Mapped[int | None] = mapped_column(
        ForeignKey("commodity_varieties.id"), nullable=True, index=True
    )
    commodity_speciality: Mapped[str | None] = mapped_column(String(255), nullable=True)

    bag_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("bag_types.id"), nullable=True, index=True
    )
    number_of_bags: Mapped[int | None] = mapped_column(
        BigInteger, nullable=True
    )
    quantity_quintal: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2), nullable=True
    )

    vehicle_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    vehicle_number: Mapped[str | None] = mapped_column(String(50), nullable=True)

    commission_agent_id: Mapped[int | None] = mapped_column(
        ForeignKey("commission_agents.id"), nullable=True, index=True
    )

    minimum_expected_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    price_unit: Mapped[str] = mapped_column(
        String(30), nullable=False, default="quintal"
    )

    auction_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    # open
    # closed

    delivery_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    # delivery
    # pickup

    lot_status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="draft"
    )
    # draft
    # active
    # auctioned
    # sold
    # cancelled
    # expired

    seller: Mapped["Seller"] = relationship("Seller")
    commodity: Mapped["Commodity"] = relationship("Commodity")
    commodity_variety: Mapped["CommodityVariety | None"] = relationship("CommodityVariety")
    bag_type: Mapped["BagType | None"] = relationship("BagType")
    commission_agent: Mapped["CommissionAgent | None"] = relationship(
        "CommissionAgent", back_populates="lots"
    )

    auction: Mapped["Auction | None"] = relationship(
        "Auction",
        back_populates="lot",
        uselist=False,
        cascade="all, delete-orphan",
    )

    weighment_records: Mapped[list["WeighmentRecord"]] = relationship(
        "WeighmentRecord",
        back_populates="lot",
    )

    location: Mapped["LotLocation | None"] = relationship(
        "LotLocation",
        back_populates="lot",
        uselist=False,
        cascade="all, delete-orphan",
    )

    secondary_sale: Mapped["LotSecondarySale | None"] = relationship(
        "LotSecondarySale",
        back_populates="lot",
        uselist=False,
        cascade="all, delete-orphan",
    )

    attachments: Mapped[list["LotAttachment"]] = relationship(
        "LotAttachment",
        back_populates="lot",
        cascade="all, delete-orphan",
    )


class LotLocation(Base):
    __tablename__ = "lot_locations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    lot_id: Mapped[int] = mapped_column(
        ForeignKey("lots.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    location_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    # farm_gate
    # warehouse

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
    city_or_village: Mapped[str | None] = mapped_column(String(150), nullable=True)
    apmc_id: Mapped[int | None] = mapped_column(
        ForeignKey("apmcs.id"), nullable=True, index=True
    )
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    lot: Mapped["Lot"] = relationship("Lot", back_populates="location")
    state: Mapped["State | None"] = relationship("State")
    district: Mapped["District | None"] = relationship("District")
    tehsil: Mapped["Tehsil | None"] = relationship("Tehsil")
    apmc: Mapped["APMC | None"] = relationship("APMC")


class LotSecondarySale(Base):
    __tablename__ = "lot_secondary_sales"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    lot_id: Mapped[int] = mapped_column(
        ForeignKey("lots.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    trade_type: Mapped[str] = mapped_column(String(30), nullable=False)
    # enam
    # non_enam

    epermit_id: Mapped[int | None] = mapped_column(
        ForeignKey("epermits.id"), nullable=True, index=True
    )
    source_state_id: Mapped[int | None] = mapped_column(
        ForeignKey("states.id"), nullable=True, index=True
    )
    source_apmc_id: Mapped[int | None] = mapped_column(
        ForeignKey("apmcs.id"), nullable=True, index=True
    )
    fee_applicable: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )

    lot: Mapped["Lot"] = relationship("Lot", back_populates="secondary_sale")
    epermit: Mapped["EPermit | None"] = relationship("EPermit")
    source_state: Mapped["State | None"] = relationship(
        "State", foreign_keys=[source_state_id]
    )
    source_apmc: Mapped["APMC | None"] = relationship(
        "APMC", foreign_keys=[source_apmc_id]
    )


class LotAttachment(Base):
    __tablename__ = "lot_attachments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    lot_id: Mapped[int] = mapped_column(
        ForeignKey("lots.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    attachment_id: Mapped[int] = mapped_column(
        ForeignKey("attachments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    lot: Mapped["Lot"] = relationship("Lot", back_populates="attachments")
    attachment: Mapped["Attachment"] = relationship("Attachment")