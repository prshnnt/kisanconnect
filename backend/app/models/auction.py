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
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin
from app.models.enums import (
    AuctionBidType,
    AuctionDeclarationType,
    AuctionStatus,
    BidStatus,
)

if TYPE_CHECKING:
    from app.models.buyer import Buyer
    from app.models.commodities import APMC, BagType, Commodity, CommodityVariety
    from app.models.commission_agent import CommissionAgent
    from app.models.lot import Lot
    from app.models.seller import Seller
    from app.models.users import User


class Auction(Base, TimestampMixin):
    __tablename__ = "auctions"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    auction_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    lot_id: Mapped[int] = mapped_column(
        ForeignKey("lots.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("sellers.id", ondelete="CASCADE"),
        nullable=False,
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

    apmc_id: Mapped[int | None] = mapped_column(
        ForeignKey("apmcs.id"),
        nullable=True,
        index=True,
    )

    commission_agent_id: Mapped[int | None] = mapped_column(
        ForeignKey("commission_agents.id"),
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

    quantity: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    uom: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="quintal",
    )

    bid_type: Mapped[AuctionBidType] = mapped_column(
        SQLEnum(
            AuctionBidType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AuctionBidType.OPEN,
    )

    declaration_type: Mapped[AuctionDeclarationType] = mapped_column(
        SQLEnum(
            AuctionDeclarationType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AuctionDeclarationType.MANUAL,
    )

    min_expected_price: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    reserve_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    min_bid_increment: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=1.00,
    )

    # Live statistics & current H1 bidder
    current_h1_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    current_h1_bidder_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    current_h1_bid_id: Mapped[int | None] = mapped_column(
        ForeignKey("auction_bids.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    no_of_bids: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    no_of_bidders: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # Timings
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    result_declared_after: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    declaration_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    # Status & Results
    status: Mapped[AuctionStatus] = mapped_column(
        SQLEnum(
            AuctionStatus,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AuctionStatus.LIVE,
        index=True,
    )

    winning_bid_id: Mapped[int | None] = mapped_column(
        ForeignKey("auction_bids.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    winning_buyer_id: Mapped[int | None] = mapped_column(
        ForeignKey("buyers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    winning_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    commodity_value: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    declared_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    lot: Mapped[Lot] = relationship("Lot", back_populates="auction")
    seller: Mapped[Seller] = relationship("Seller")
    commodity: Mapped[Commodity] = relationship("Commodity")
    commodity_variety: Mapped[CommodityVariety | None] = relationship("CommodityVariety")
    apmc: Mapped[APMC | None] = relationship("APMC")
    commission_agent: Mapped[CommissionAgent | None] = relationship("CommissionAgent")
    bag_type: Mapped[BagType | None] = relationship("BagType")

    current_h1_bidder: Mapped[User | None] = relationship(
        "User",
        foreign_keys=[current_h1_bidder_id],
    )

    current_h1_bid: Mapped[AuctionBid | None] = relationship(
        "AuctionBid",
        foreign_keys=[current_h1_bid_id],
        post_update=True,
    )

    winning_buyer: Mapped[Buyer | None] = relationship(
        "Buyer",
        foreign_keys=[winning_buyer_id],
    )

    winning_bid: Mapped[AuctionBid | None] = relationship(
        "AuctionBid",
        foreign_keys=[winning_bid_id],
        post_update=True,
    )

    bids: Mapped[list[AuctionBid]] = relationship(
        "AuctionBid",
        foreign_keys="AuctionBid.auction_id",
        back_populates="auction",
        cascade="all, delete-orphan",
    )


class AuctionBid(Base, TimestampMixin):
    __tablename__ = "auction_bids"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    auction_id: Mapped[int] = mapped_column(
        ForeignKey("auctions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    bidder_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    buyer_id: Mapped[int | None] = mapped_column(
        ForeignKey("buyers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    bid_price: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    bid_quantity: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    total_bid_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    bid_status: Mapped[BidStatus] = mapped_column(
        SQLEnum(
            BidStatus,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=BidStatus.ACTIVE,
    )

    is_h1: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    bid_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.now,
    )

    # Relationships
    auction: Mapped[Auction] = relationship(
        "Auction",
        foreign_keys=[auction_id],
        back_populates="bids",
    )

    bidder_user: Mapped[User] = relationship(
        "User",
        foreign_keys=[bidder_user_id],
        back_populates="auction_bids",
    )

    buyer: Mapped[Buyer | None] = relationship(
        "Buyer",
        foreign_keys=[buyer_id],
    )
