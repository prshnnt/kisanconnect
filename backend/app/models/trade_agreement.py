from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin
from app.models.enums import (
    AgreementApprovalStatus,
    PaymentStatus,
    SaleAgreementStatus,
    TradeConfirmationStatus,
    TradeLocationType,
)

if TYPE_CHECKING:
    from app.models.attachment import Attachment
    from app.models.auction import Auction
    from app.models.buyer import Buyer
    from app.models.commodities import APMC, BagType, Commodity, CommodityVariety, District, State
    from app.models.commission_agent import CommissionAgent
    from app.models.lot import Lot
    from app.models.seller import Seller
    from app.models.weighment_service import WeighmentRecord


class TradeConfirmation(Base, TimestampMixin):
    __tablename__ = "trade_confirmations"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    confirmation_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    lot_id: Mapped[int] = mapped_column(
        ForeignKey("lots.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    auction_id: Mapped[int | None] = mapped_column(
        ForeignKey("auctions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("sellers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    buyer_id: Mapped[int] = mapped_column(
        ForeignKey("buyers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    commission_agent_id: Mapped[int | None] = mapped_column(
        ForeignKey("commission_agents.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    commodity_id: Mapped[int] = mapped_column(
        ForeignKey("commodities.id"),
        nullable=False,
        index=True,
    )

    commodity_variety_id: Mapped[int | None] = mapped_column(
        ForeignKey("commodity_varieties.id"),
        nullable=True,
        index=True,
    )

    location_type: Mapped[TradeLocationType] = mapped_column(
        SQLEnum(
            TradeLocationType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=TradeLocationType.INSIDE_APMC,
        index=True,
    )

    apmc_id: Mapped[int | None] = mapped_column(
        ForeignKey("apmcs.id"),
        nullable=True,
        index=True,
    )

    state_id: Mapped[int | None] = mapped_column(
        ForeignKey("states.id"),
        nullable=True,
        index=True,
    )

    district_id: Mapped[int | None] = mapped_column(
        ForeignKey("districts.id"),
        nullable=True,
        index=True,
    )

    bag_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("bag_types.id"),
        nullable=True,
        index=True,
    )

    number_of_bags: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )

    approx_quantity: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    uom: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="quintal",
    )

    agreed_rate: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    final_weightment_id: Mapped[int | None] = mapped_column(
        ForeignKey("weighment_records.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    final_weight_quintal: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    confirmation_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
    )

    buyer_confirmed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    buyer_confirmed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    seller_confirmed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    seller_confirmed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    status: Mapped[TradeConfirmationStatus] = mapped_column(
        SQLEnum(
            TradeConfirmationStatus,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=TradeConfirmationStatus.DECLARED,
        index=True,
    )

    # Relationships
    lot: Mapped[Lot] = relationship("Lot")
    auction: Mapped[Auction | None] = relationship("Auction")
    seller: Mapped[Seller] = relationship("Seller")
    buyer: Mapped[Buyer] = relationship("Buyer")
    commission_agent: Mapped[CommissionAgent | None] = relationship("CommissionAgent")
    commodity: Mapped[Commodity] = relationship("Commodity")
    commodity_variety: Mapped[CommodityVariety | None] = relationship("CommodityVariety")
    apmc: Mapped[APMC | None] = relationship("APMC")
    state: Mapped[State | None] = relationship("State")
    district: Mapped[District | None] = relationship("District")
    bag_type: Mapped[BagType | None] = relationship("BagType")
    final_weightment: Mapped[WeighmentRecord | None] = relationship("WeighmentRecord")

    sale_agreement: Mapped[SaleAgreement | None] = relationship(
        "SaleAgreement",
        back_populates="trade_confirmation",
        uselist=False,
    )


class SaleAgreement(Base, TimestampMixin):
    __tablename__ = "sale_agreements"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    agreement_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    trade_confirmation_id: Mapped[int | None] = mapped_column(
        ForeignKey("trade_confirmations.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True,
    )

    lot_id: Mapped[int] = mapped_column(
        ForeignKey("lots.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    auction_id: Mapped[int | None] = mapped_column(
        ForeignKey("auctions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("sellers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    buyer_id: Mapped[int] = mapped_column(
        ForeignKey("buyers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    commission_agent_id: Mapped[int | None] = mapped_column(
        ForeignKey("commission_agents.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    commodity_id: Mapped[int] = mapped_column(
        ForeignKey("commodities.id"),
        nullable=False,
        index=True,
    )

    commodity_variety_id: Mapped[int | None] = mapped_column(
        ForeignKey("commodity_varieties.id"),
        nullable=True,
        index=True,
    )

    location_type: Mapped[TradeLocationType] = mapped_column(
        SQLEnum(
            TradeLocationType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=TradeLocationType.INSIDE_APMC,
        index=True,
    )

    apmc_id: Mapped[int | None] = mapped_column(
        ForeignKey("apmcs.id"),
        nullable=True,
        index=True,
    )

    state_id: Mapped[int | None] = mapped_column(
        ForeignKey("states.id"),
        nullable=True,
        index=True,
    )

    district_id: Mapped[int | None] = mapped_column(
        ForeignKey("districts.id"),
        nullable=True,
        index=True,
    )

    bag_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("bag_types.id"),
        nullable=True,
        index=True,
    )

    number_of_bags: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )

    final_weightment_id: Mapped[int | None] = mapped_column(
        ForeignKey("weighment_records.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    final_weight_quintal: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    rate_per_quintal: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    total_commodity_value: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    agreement_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
    )

    seller_approval_status: Mapped[AgreementApprovalStatus] = mapped_column(
        SQLEnum(
            AgreementApprovalStatus,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AgreementApprovalStatus.PENDING,
    )

    seller_approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    buyer_approval_status: Mapped[AgreementApprovalStatus] = mapped_column(
        SQLEnum(
            AgreementApprovalStatus,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AgreementApprovalStatus.PENDING,
    )

    buyer_approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    agreement_status: Mapped[SaleAgreementStatus] = mapped_column(
        SQLEnum(
            SaleAgreementStatus,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=SaleAgreementStatus.PENDING_APPROVAL,
        index=True,
    )

    agreement_attachment_id: Mapped[int | None] = mapped_column(
        ForeignKey("attachments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    terms_and_conditions: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    trade_confirmation: Mapped[TradeConfirmation | None] = relationship(
        "TradeConfirmation",
        back_populates="sale_agreement",
    )

    lot: Mapped[Lot] = relationship("Lot")
    auction: Mapped[Auction | None] = relationship("Auction")
    seller: Mapped[Seller] = relationship("Seller")
    buyer: Mapped[Buyer] = relationship("Buyer")
    commission_agent: Mapped[CommissionAgent | None] = relationship("CommissionAgent")
    commodity: Mapped[Commodity] = relationship("Commodity")
    commodity_variety: Mapped[CommodityVariety | None] = relationship("CommodityVariety")
    apmc: Mapped[APMC | None] = relationship("APMC")
    state: Mapped[State | None] = relationship("State")
    district: Mapped[District | None] = relationship("District")
    bag_type: Mapped[BagType | None] = relationship("BagType")
    final_weightment: Mapped[WeighmentRecord | None] = relationship("WeighmentRecord")
    agreement_attachment: Mapped[Attachment | None] = relationship("Attachment")

    sale_bill: Mapped[SaleBill | None] = relationship(
        "SaleBill",
        back_populates="sale_agreement",
        uselist=False,
        cascade="all, delete-orphan",
    )


class SaleBill(Base, TimestampMixin):
    __tablename__ = "sale_bills"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    invoice_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    sale_agreement_id: Mapped[int] = mapped_column(
        ForeignKey("sale_agreements.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    lot_id: Mapped[int] = mapped_column(
        ForeignKey("lots.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("sellers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    buyer_id: Mapped[int] = mapped_column(
        ForeignKey("buyers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    commission_agent_id: Mapped[int | None] = mapped_column(
        ForeignKey("commission_agents.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    commodity_id: Mapped[int] = mapped_column(
        ForeignKey("commodities.id"),
        nullable=False,
        index=True,
    )

    location_type: Mapped[TradeLocationType] = mapped_column(
        SQLEnum(
            TradeLocationType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=TradeLocationType.INSIDE_APMC,
        index=True,
    )

    apmc_id: Mapped[int | None] = mapped_column(
        ForeignKey("apmcs.id"),
        nullable=True,
        index=True,
    )

    invoice_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
    )

    due_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    quantity: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    uom: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="quintal",
    )

    rate_per_uom: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    gross_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    mandi_fee_percentage: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    mandi_fee_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    ca_commission_percentage: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    ca_commission_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    weighment_charges: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    labour_charges: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    tax_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    invoice_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    payment_status: Mapped[PaymentStatus] = mapped_column(
        SQLEnum(
            PaymentStatus,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=PaymentStatus.PENDING,
        index=True,
    )

    paid_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    payment_reference: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    bill_attachment_id: Mapped[int | None] = mapped_column(
        ForeignKey("attachments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    sale_agreement: Mapped[SaleAgreement] = relationship(
        "SaleAgreement",
        back_populates="sale_bill",
    )

    lot: Mapped[Lot] = relationship("Lot")
    seller: Mapped[Seller] = relationship("Seller")
    buyer: Mapped[Buyer] = relationship("Buyer")
    commission_agent: Mapped[CommissionAgent | None] = relationship("CommissionAgent")
    commodity: Mapped[Commodity] = relationship("Commodity")
    apmc: Mapped[APMC | None] = relationship("APMC")
    bill_attachment: Mapped[Attachment | None] = relationship("Attachment")
