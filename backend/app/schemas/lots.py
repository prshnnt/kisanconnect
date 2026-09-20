from datetime import date, datetime

from pydantic import BaseModel, Field, model_validator

from app.models.enums import DeliveryMode, LotStatus, LotType, SaleType
from app.schemas.common import ORM, Dec
from app.schemas.profile import AddressIn


class SecondaryIn(BaseModel):
    is_enam_trade: bool
    epermit_number: str
    source_state_id: int
    source_apmc_id: int | None = None
    fee_applicable: bool = False


class BidIntent(BaseModel):
    start_at: datetime
    duration_minutes: int = Field(gt=0, le=60 * 24)
    result_after: datetime
    is_closed_bid: bool = False
    delivery_mode: DeliveryMode


class LotIn(BaseModel):
    lot_type: LotType
    sale_type: SaleType = SaleType.PRIMARY
    commodity_id: int
    variety_id: int | None = None
    speciality: str | None = None
    bag_type_id: int | None = None
    bags: int | None = Field(None, gt=0)
    quantity_qtl: Dec = Field(gt=0)
    min_price: Dec | None = Field(None, ge=0)
    vehicle_type: str | None = None
    vehicle_number: str | None = None
    commission_agent_id: int | None = None
    apmc_id: int | None = None  # advance lots
    location: AddressIn | None = None  # outside-APMC lots
    bid: BidIntent | None = None  # outside-APMC lots
    secondary: SecondaryIn | None = None  # secondary sales
    attachment_ids: list[int] = []

    @model_validator(mode="after")
    def _shape(self):
        if self.lot_type == LotType.ADVANCE and not self.apmc_id:
            raise ValueError("apmc_id is required for advance lots")
        if self.lot_type == LotType.OUTSIDE_APMC and not (self.location and self.bid):
            raise ValueError("location and bid are required for outside-APMC lots")
        if self.sale_type == SaleType.SECONDARY and not self.secondary:
            raise ValueError("secondary details are required for secondary sales")
        if self.bid and self.bid.result_after < self.bid.start_at:
            raise ValueError("result_after must be after start_at")
        return self


class LotPatch(BaseModel):
    bags: int | None = Field(None, gt=0)
    quantity_qtl: Dec | None = Field(None, gt=0)
    min_price: Dec | None = Field(None, ge=0)
    speciality: str | None = None
    vehicle_type: str | None = None
    vehicle_number: str | None = None


class LotOut(ORM):
    id: int
    number: str
    lot_type: LotType
    sale_type: SaleType
    status: LotStatus
    commodity_id: int
    variety_id: int | None
    bag_type_id: int | None
    bags: int | None
    quantity_qtl: Dec
    min_price: Dec | None
    apmc_id: int | None
    commission_agent_id: int | None
    created_at: datetime


class SupplyIn(BaseModel):
    commodity_id: int
    variety_id: int | None = None
    quantity_qtl: Dec = Field(gt=0)
    expected_price: Dec | None = Field(None, ge=0)
    available_from: date
    available_to: date
    delivery_mode: DeliveryMode
    location: AddressIn
    contact_by_phone: bool = True
    contact_by_email: bool = False

    @model_validator(mode="after")
    def _dates(self):
        if self.available_to < self.available_from:
            raise ValueError("available_to must be on/after available_from")
        return self


class SupplyOut(ORM):
    id: int
    number: str
    commodity_id: int
    quantity_qtl: Dec
    expected_price: Dec | None
    available_from: date
    available_to: date
    delivery_mode: DeliveryMode


class DemandIn(BaseModel):
    commodity_id: int
    variety_id: int | None = None
    min_qty_qtl: Dec = Field(gt=0)
    max_qty_qtl: Dec | None = None
    min_price: Dec | None = None
    max_price: Dec | None = None
    deliver_by: date | None = None
    is_advance: bool = True
    location: AddressIn

    @model_validator(mode="after")
    def _ranges(self):
        if self.max_qty_qtl is not None and self.max_qty_qtl < self.min_qty_qtl:
            raise ValueError("max_qty_qtl must be >= min_qty_qtl")
        if self.min_price is not None and self.max_price is not None and self.max_price < self.min_price:
            raise ValueError("max_price must be >= min_price")
        return self


class DemandOut(ORM):
    id: int
    number: str
    commodity_id: int
    variety_id: int | None
    min_qty_qtl: Dec
    min_price: Dec | None
    max_price: Dec | None
    deliver_by: date | None
    status: str
