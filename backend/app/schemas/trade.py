from datetime import date, datetime

from pydantic import BaseModel, Field, model_validator

from app.models.enums import ApprovalStatus, AuctionStatus, PaymentStatus, TradeStatus, Venue
from app.schemas.common import ORM, Dec


class BulkAuctionIn(BaseModel):
    lot_ids: list[int] = Field(min_length=1, max_length=200)
    starts_at: datetime
    ends_at: datetime
    result_after: datetime | None = None
    is_closed_bid: bool = False
    is_auto_declare: bool = False
    min_increment: Dec = Field(default=1, gt=0)
    reserve_price: Dec | None = Field(None, ge=0)

    @model_validator(mode="after")
    def _window(self):
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        if self.result_after and self.result_after < self.ends_at:
            raise ValueError("result_after must be on/after ends_at")
        return self


class BulkAuctionResult(BaseModel):
    lot_id: int
    ok: bool
    auction_id: int | None = None
    error: str | None = None


class AuctionOut(ORM):
    id: int
    number: str
    lot_id: int
    status: AuctionStatus
    is_closed_bid: bool
    min_price: Dec
    starts_at: datetime
    ends_at: datetime
    result_after: datetime | None
    h1_price: Dec | None
    bid_count: int
    bidder_count: int
    winning_buyer_id: int | None
    winning_price: Dec | None


class PendingRow(AuctionOut):
    lot_number: str
    commodity_id: int
    quantity_qtl: Dec
    bid_ending_in_sec: int


class PendingSummary(BaseModel):
    total_lots: int
    lots_with_bids: int
    total_bids: int
    zero_bid_lots: int


class PendingOut(BaseModel):
    summary: PendingSummary
    items: list[PendingRow]
    page: int
    page_size: int
    total: int


class BidIn(BaseModel):
    price: Dec = Field(gt=0)


class BidOut(ORM):
    id: int
    auction_id: int
    price: Dec
    status: str
    placed_at: datetime


class BidResult(BaseModel):
    bid: BidOut
    h1_price: Dec
    bid_count: int


class WeighmentIn(BaseModel):
    lot_id: int
    vehicle_number: str = Field(min_length=4, max_length=50)
    gross_kg: Dec = Field(gt=0)
    tare_kg: Dec = Field(ge=0)
    number_of_bags: int | None = Field(None, ge=0)
    bag_type_id: int | None = None
    equipment_id: int | None = None
    operator: str | None = None
    booking_id: int | None = None


class WeighmentOut(ORM):
    id: int
    slip_number: str
    lot_id: int | None
    vehicle_number: str
    gross_kg: Dec
    tare_kg: Dec
    bag_deduction_kg: Dec
    final_qtl: Dec


class TradeOut(ORM):
    id: int
    number: str
    agreement_number: str | None
    lot_id: int
    seller_id: int
    buyer_id: int
    venue: Venue
    approx_qty_qtl: Dec
    rate_per_qtl: Dec
    final_qty_qtl: Dec | None
    total_value: Dec | None
    status: TradeStatus
    buyer_approval: ApprovalStatus
    seller_approval: ApprovalStatus
    buyer_confirmed_at: datetime | None
    seller_confirmed_at: datetime | None


class BillOut(ORM):
    id: int
    invoice_number: str
    trade_id: int
    invoice_date: date
    due_date: date | None
    quantity_qtl: Dec
    rate_per_qtl: Dec
    gross_amount: Dec
    mandi_fee: Dec
    commission: Dec
    other_charges: Dec
    tax: Dec
    total: Dec
    paid: Dec
    payment_status: PaymentStatus


class PaymentIn(BaseModel):
    amount: Dec = Field(gt=0)
    reference: str = Field(min_length=3, max_length=100)


class BillIn(BaseModel):
    """Charges are inputs, not hard-coded, because mandi fee rules differ per APMC (see PRD open question 2)."""

    mandi_fee_pct: Dec = Field(default=0, ge=0, le=100)
    commission_pct: Dec = Field(default=0, ge=0, le=100)
    other_charges: Dec = Field(default=0, ge=0)
    tax_pct: Dec = Field(default=0, ge=0, le=100)
    due_days: int = Field(default=7, ge=0, le=90)
