"""Trade lifecycle: Supply/Demand -> Lot -> Auction -> Bids -> Trade -> Agreement -> Bill -> GateExit.

Decision: TradeConfirmation, SaleAgreement and SaleBill stay separate. They are three different legal
documents with independent approval / payment lifecycles, so merging would only add nullable columns.
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, PKMixin, TimestampMixin
from app.models._types import enum_col
from app.models.enums import (
    ApprovalStatus,
    AuctionStatus,
    BidStatus,
    DeliveryMode,
    GateExitType,
    LotStatus,
    LotType,
    PaymentStatus,
    SaleType,
    TradeStatus,
    Venue,
)


class CommissionAgent(Base, PKMixin, TimestampMixin):
    __tablename__ = "commission_agents"
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    apmc_id: Mapped[int] = mapped_column(ForeignKey("apmcs.id"), index=True)
    firm_name: Mapped[str] = mapped_column(String(200), index=True)
    agent_name: Mapped[str] = mapped_column(String(150))
    license_number: Mapped[str | None] = mapped_column(String(100))
    mobile: Mapped[str | None] = mapped_column(String(20))
    commission_pct: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class EPermit(Base, PKMixin, TimestampMixin):
    __tablename__ = "epermits"
    number: Mapped[str] = mapped_column(String(50), unique=True)
    buyer_id: Mapped[int | None] = mapped_column(ForeignKey("buyers.id", ondelete="SET NULL"))
    source_state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"))
    source_apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"))
    commodity_id: Mapped[int | None] = mapped_column(ForeignKey("commodities.id"))
    quantity_qtl: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    valid_until: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="issued")  # issued | used | expired | cancelled


class Lot(Base, PKMixin, TimestampMixin):
    """Merges Lot + LotSecondarySale + auction-intent fields. Location -> Address(owner_type=lot)."""

    __tablename__ = "lots"
    number: Mapped[str] = mapped_column(String(50), unique=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("sellers.id", ondelete="CASCADE"), index=True)
    lot_type: Mapped[LotType] = mapped_column(enum_col(LotType))
    sale_type: Mapped[SaleType] = mapped_column(enum_col(SaleType), default=SaleType.PRIMARY)
    status: Mapped[LotStatus] = mapped_column(enum_col(LotStatus), default=LotStatus.DRAFT, index=True)

    commodity_id: Mapped[int] = mapped_column(ForeignKey("commodities.id"), index=True)
    variety_id: Mapped[int | None] = mapped_column(ForeignKey("commodity_varieties.id"))
    speciality: Mapped[str | None] = mapped_column(String(255))
    bag_type_id: Mapped[int | None] = mapped_column(ForeignKey("bag_types.id"))
    bags: Mapped[int | None] = mapped_column(Integer)
    quantity_qtl: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    min_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))  # per quintal

    apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"), index=True)
    commission_agent_id: Mapped[int | None] = mapped_column(ForeignKey("commission_agents.id"))
    vehicle_type: Mapped[str | None] = mapped_column(String(100))
    vehicle_number: Mapped[str | None] = mapped_column(String(50))
    delivery_mode: Mapped[DeliveryMode | None] = mapped_column(enum_col(DeliveryMode))

    # Secondary sale only (S25) - was a separate lot_secondary_sales table
    epermit_id: Mapped[int | None] = mapped_column(ForeignKey("epermits.id"))
    source_state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"))
    source_apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"))
    is_enam_trade: Mapped[bool | None] = mapped_column(Boolean)
    fee_applicable: Mapped[bool] = mapped_column(Boolean, default=False)

    # Outside-APMC bid intent (S26). The real auction is created from these.
    bid_start_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    bid_duration_min: Mapped[int | None] = mapped_column(Integer)
    result_after: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_closed_bid: Mapped[bool] = mapped_column(Boolean, default=False)
    __table_args__ = (Index("ix_lots_seller_status", "seller_id", "status"),)


class Supply(Base, PKMixin, TimestampMixin):
    """Advance supply announcement (S28-29). Location -> Address(owner_type=supply)."""

    __tablename__ = "supplies"
    number: Mapped[str] = mapped_column(String(50), unique=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("sellers.id", ondelete="CASCADE"), index=True)
    commodity_id: Mapped[int] = mapped_column(ForeignKey("commodities.id"), index=True)
    variety_id: Mapped[int | None] = mapped_column(ForeignKey("commodity_varieties.id"))
    quantity_qtl: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    expected_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    available_from: Mapped[date] = mapped_column(Date)
    available_to: Mapped[date] = mapped_column(Date)
    delivery_mode: Mapped[DeliveryMode] = mapped_column(enum_col(DeliveryMode))
    contact_by_phone: Mapped[bool] = mapped_column(Boolean, default=True)
    contact_by_email: Mapped[bool] = mapped_column(Boolean, default=False)


class Demand(Base, PKMixin, TimestampMixin):
    """Buyer demand (S30). Delivery location -> Address(owner_type=demand, kind=delivery)."""

    __tablename__ = "demands"
    number: Mapped[str] = mapped_column(String(50), unique=True)  # AD-UP-121-20260913-1
    buyer_id: Mapped[int] = mapped_column(ForeignKey("buyers.id", ondelete="CASCADE"), index=True)
    is_advance: Mapped[bool] = mapped_column(Boolean, default=True)
    commodity_id: Mapped[int] = mapped_column(ForeignKey("commodities.id"), index=True)
    variety_id: Mapped[int | None] = mapped_column(ForeignKey("commodity_varieties.id"))
    min_qty_qtl: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    max_qty_qtl: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    min_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    max_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    deliver_by: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)  # draft|active|fulfilled|cancelled|expired


class Auction(Base, PKMixin, TimestampMixin):
    """One per lot. Live H1 stats are denormalised here on purpose: the pending-declaration screen (S35) reads them hot."""

    __tablename__ = "auctions"
    number: Mapped[str] = mapped_column(String(50), unique=True)
    lot_id: Mapped[int] = mapped_column(ForeignKey("lots.id", ondelete="CASCADE"), unique=True)
    status: Mapped[AuctionStatus] = mapped_column(enum_col(AuctionStatus), default=AuctionStatus.SCHEDULED)
    is_closed_bid: Mapped[bool] = mapped_column(Boolean, default=False)
    is_auto_declare: Mapped[bool] = mapped_column(Boolean, default=False)
    min_price: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    reserve_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    min_increment: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=1)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    result_after: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    h1_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    h1_bid_id: Mapped[int | None] = mapped_column(BigInteger)  # no FK: avoids the circular dependency
    bid_count: Mapped[int] = mapped_column(Integer, default=0)
    bidder_count: Mapped[int] = mapped_column(Integer, default=0)
    winning_buyer_id: Mapped[int | None] = mapped_column(ForeignKey("buyers.id", ondelete="SET NULL"))
    winning_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    declared_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    __table_args__ = (Index("ix_auctions_status_end", "status", "ends_at"),)


class AuctionBid(Base, PKMixin):
    __tablename__ = "auction_bids"
    auction_id: Mapped[int] = mapped_column(ForeignKey("auctions.id", ondelete="CASCADE"), index=True)
    buyer_id: Mapped[int] = mapped_column(ForeignKey("buyers.id", ondelete="CASCADE"), index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    status: Mapped[BidStatus] = mapped_column(enum_col(BidStatus), default=BidStatus.ACTIVE)
    idempotency_key: Mapped[str | None] = mapped_column(String(64), unique=True)
    placed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    __table_args__ = (Index("ix_bids_auction_price", "auction_id", "price"),)


class Trade(Base, PKMixin, TimestampMixin):
    """Merges TradeConfirmation + SaleAgreement (one deal, one row, one status; no 1:1 chain of tables)."""

    __tablename__ = "trades"
    number: Mapped[str] = mapped_column(String(50), unique=True)
    agreement_number: Mapped[str | None] = mapped_column(String(50), unique=True)
    lot_id: Mapped[int] = mapped_column(ForeignKey("lots.id", ondelete="CASCADE"), unique=True)
    auction_id: Mapped[int | None] = mapped_column(ForeignKey("auctions.id", ondelete="SET NULL"))
    seller_id: Mapped[int] = mapped_column(ForeignKey("sellers.id"), index=True)
    buyer_id: Mapped[int] = mapped_column(ForeignKey("buyers.id"), index=True)
    commission_agent_id: Mapped[int | None] = mapped_column(ForeignKey("commission_agents.id"))
    commodity_id: Mapped[int] = mapped_column(ForeignKey("commodities.id"))
    apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"), index=True)
    venue: Mapped[Venue] = mapped_column(enum_col(Venue), default=Venue.INSIDE_APMC, index=True)
    bags: Mapped[int | None] = mapped_column(Integer)
    approx_qty_qtl: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    rate_per_qtl: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    weighment_id: Mapped[int | None] = mapped_column(ForeignKey("weighment_records.id", ondelete="SET NULL"))
    final_qty_qtl: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    total_value: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))  # final_qty * rate
    status: Mapped[TradeStatus] = mapped_column(enum_col(TradeStatus), default=TradeStatus.DECLARED, index=True)
    buyer_confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    seller_confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    buyer_approval: Mapped[ApprovalStatus] = mapped_column(enum_col(ApprovalStatus), default=ApprovalStatus.PENDING)
    seller_approval: Mapped[ApprovalStatus] = mapped_column(enum_col(ApprovalStatus), default=ApprovalStatus.PENDING)
    terms: Mapped[str | None] = mapped_column(Text)


class SaleBill(Base, PKMixin, TimestampMixin):
    """Kept separate from Trade: own payment lifecycle and legal numbering."""

    __tablename__ = "sale_bills"
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True)
    trade_id: Mapped[int] = mapped_column(ForeignKey("trades.id", ondelete="CASCADE"), unique=True)
    invoice_date: Mapped[date] = mapped_column(Date, default=date.today)
    due_date: Mapped[date | None] = mapped_column(Date)
    quantity_qtl: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    rate_per_qtl: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    gross_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    mandi_fee: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    commission: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    other_charges: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)  # weighment + labour
    tax: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    paid: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    payment_status: Mapped[PaymentStatus] = mapped_column(enum_col(PaymentStatus), default=PaymentStatus.PENDING, index=True)
    payment_ref: Mapped[str | None] = mapped_column(String(100))
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class GateExit(Base, PKMixin, TimestampMixin):
    __tablename__ = "gate_exits"
    number: Mapped[str] = mapped_column(String(50), unique=True)
    exit_type: Mapped[GateExitType] = mapped_column(enum_col(GateExitType), index=True)
    lot_id: Mapped[int] = mapped_column(ForeignKey("lots.id", ondelete="CASCADE"), index=True)
    bill_id: Mapped[int | None] = mapped_column(ForeignKey("sale_bills.id", ondelete="SET NULL"))
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    vehicle_type: Mapped[str | None] = mapped_column(String(100))
    vehicle_number: Mapped[str | None] = mapped_column(String(50))
    bags: Mapped[int | None] = mapped_column(Integer)
    quantity_qtl: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    return_reason: Mapped[str | None] = mapped_column(Text)
    approval: Mapped[ApprovalStatus] = mapped_column(enum_col(ApprovalStatus), default=ApprovalStatus.PENDING, index=True)
    approved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
