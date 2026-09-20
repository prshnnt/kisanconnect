from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.models.enums import BookingStatus, NegotiationStatus, PaymentStatus, ServiceType, Venue
from app.schemas.common import ORM, Dec

ResponseTime = Literal["Within 30 Minutes", "30 Minutes to 1 Hour", "Up to 6 Hours", "More Than 6 Hours"]


# ---- per-type `details` shapes: the JSONB is validated here, not by the database ----
class WarehouseDetails(BaseModel):
    warehouse_types: list[str] = Field(min_length=1)
    capacity_mt: Dec = Field(gt=0)
    rental_models: list[str] = Field(min_length=1)
    services_offered: list[str] = []
    wdra_accredited: bool = False
    godown_name: str = Field(min_length=1)


class LogisticsDetails(BaseModel):
    service_models: list[str] = Field(min_length=1)
    vehicle_types: list[str] = Field(min_length=1)
    vehicle_capacity: str
    goods_specialisation: list[str] = Field(min_length=1)
    route_details: str | None = None
    base_location: str | None = None
    special_equipment: list[str] = []


class AssayingDetails(BaseModel):
    testing_methods: list[Literal["Chemical Testing", "Physical Testing"]] = Field(min_length=1)
    sample_pickup: bool
    accreditations: list[str] = Field(min_length=1)
    special_equipment: list[str] = []


class WeighmentDetails(BaseModel):
    weighing_methods: list[Literal["Weigh Bridge", "Weighing Scale"]] = Field(min_length=1)
    inside_apmc: bool


DETAILS_MODEL: dict[ServiceType, type[BaseModel]] = {
    ServiceType.WAREHOUSE: WarehouseDetails,
    ServiceType.LOGISTICS: LogisticsDetails,
    ServiceType.ASSAYING: AssayingDetails,
    ServiceType.WEIGHMENT: WeighmentDetails,
}
NEEDS_SHOP = {ServiceType.WEIGHMENT, ServiceType.ASSAYING}
NEEDS_LICENSE = {ServiceType.WEIGHMENT}


class ProviderServiceIn(BaseModel):
    service_type: ServiceType
    shop_name: str | None = None
    license_number: str | None = None
    license_expires_on: date | None = None
    response_time: ResponseTime
    details: dict = {}
    commodity_ids: list[int] = []
    state_ids: list[int] = []
    notify_by_phone: bool = True
    notify_by_email: bool = False

    @model_validator(mode="after")
    def _by_type(self):
        if not (self.notify_by_phone or self.notify_by_email):
            raise ValueError("choose at least one communication method")
        if self.service_type in NEEDS_SHOP and not self.shop_name:
            raise ValueError("shop_name is required")
        if self.service_type in NEEDS_LICENSE and not self.license_number:
            raise ValueError("license_number is required")
        model = DETAILS_MODEL.get(self.service_type)
        if model:
            self.details = model.model_validate(self.details).model_dump(mode="json")
        return self


class ProviderServiceOut(ORM):
    id: int
    service_type: ServiceType
    shop_name: str | None
    license_number: str | None
    response_time: str | None
    is_active: bool
    details: dict


class CatalogIn(BaseModel):
    service_type: ServiceType
    name: str = Field(min_length=2, max_length=200)
    venue: Venue = Venue.OUTSIDE_APMC
    apmc_id: int | None = None
    state_id: int | None = None
    commodity_id: int | None = None
    variety_id: int | None = None
    price_unit: str = "per_sample"
    base_price: Dec | None = Field(None, ge=0)
    min_price: Dec = Field(ge=0)
    max_price: Dec = Field(ge=0)
    is_negotiable: bool = False
    turnaround: str | None = None
    operating_hours: str | None = None
    details: dict = {}

    @model_validator(mode="after")
    def _prices(self):
        if self.max_price < self.min_price:
            raise ValueError("max_price must be >= min_price")
        if self.venue == Venue.INSIDE_APMC and not self.apmc_id:
            raise ValueError("apmc_id is required for inside-APMC catalogs")
        return self


class CatalogOut(ORM):
    id: int
    service_type: ServiceType
    name: str
    venue: Venue
    state_id: int | None
    commodity_id: int | None
    price_unit: str
    base_price: Dec | None
    min_price: Dec
    max_price: Dec
    is_negotiable: bool
    turnaround: str | None
    operating_hours: str | None
    is_active: bool
    details: dict


class BookingIn(BaseModel):
    catalog_id: int
    lot_id: int | None = None
    scheduled_on: date | None = None
    time_slot: str | None = None
    quantity_qtl: Dec | None = Field(None, gt=0)
    offered_price: Dec | None = Field(None, gt=0)
    notes: str | None = None
    details: dict = {}


class NegotiationIn(BaseModel):
    action: Literal["offer", "counter", "accept", "reject"]
    price: Dec | None = Field(None, gt=0)


class BookingOut(ORM):
    id: int
    number: str
    catalog_id: int
    service_type: ServiceType
    venue: Venue
    is_free: bool
    scheduled_on: date | None
    quantity_qtl: Dec | None
    quoted_price: Dec | None
    offered_price: Dec | None
    counter_price: Dec | None
    final_price: Dec | None
    negotiation: NegotiationStatus
    status: BookingStatus
    payment_status: PaymentStatus
    details: dict
    history: list
    created_at: datetime


class BookingAction(BaseModel):
    note: str | None = None
    details: dict = {}
