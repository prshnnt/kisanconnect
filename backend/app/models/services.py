"""Service marketplace (weighment, warehouse, logistics, assaying, ...).

Before: ~45 tables (4 x profile/catalog/booking/children). After: 5 tables.
Type-specific fields live in `details` JSONB and are validated by a Pydantic schema per ServiceType;
anything we filter/sort/join on (price, venue, commodity, status) stays a real column.
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, PKMixin, TimestampMixin
from app.models._types import enum_col
from app.models.enums import BookingStatus, NegotiationStatus, PaymentStatus, ServiceType, Venue


class ServiceProvider(Base, PKMixin, TimestampMixin):
    """One row per user. Replaces 4 communication-preference tables with two booleans."""

    __tablename__ = "service_providers"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    business_name: Mapped[str | None] = mapped_column(String(200))
    notify_by_phone: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_by_email: Mapped[bool] = mapped_column(Boolean, default=False)


class ProviderService(Base, PKMixin, TimestampMixin):
    """A provider's registration for one service type (the 'Preferred Services' form, S6-S20).
    Replaces weighment_services, warehouse_services, logistics_services, assaying_services + all their child tables."""

    __tablename__ = "provider_services"
    provider_id: Mapped[int] = mapped_column(ForeignKey("service_providers.id", ondelete="CASCADE"), index=True)
    service_type: Mapped[ServiceType] = mapped_column(enum_col(ServiceType))
    shop_name: Mapped[str | None] = mapped_column(String(200))
    license_number: Mapped[str | None] = mapped_column(String(100))
    license_expires_on: Mapped[date | None] = mapped_column(Date)
    response_time: Mapped[str | None] = mapped_column(String(40))  # <30m | 30m-1h | <=6h | >6h
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # e.g. warehouse: {types:[...], capacity_mt, rental_models:[...], wdra:true}
    #      logistics: {service_models:[...], vehicle_types:[...], routes:[...], equipment:[...]}
    #      assaying:  {testing_methods:[...], sample_pickup:true, accreditations:[...], equipment:[...]}
    details: Mapped[dict] = mapped_column(JSONB, default=dict)
    __table_args__ = (UniqueConstraint("provider_id", "service_type", name="uq_provider_service_type"),)
    # service areas -> Address(owner_type=provider, kind=service_area); expertise -> CommodityLink(role=expertise)
    # certificates -> Attachment(owner_type=provider, kind=certificate)


class ServiceCatalog(Base, PKMixin, TimestampMixin):
    """A priced offering shown in 'All Services' (S31). Replaces 4 catalog tables + assaying_catalog_parameters."""

    __tablename__ = "service_catalogs"
    provider_service_id: Mapped[int] = mapped_column(ForeignKey("provider_services.id", ondelete="CASCADE"), index=True)
    service_type: Mapped[ServiceType] = mapped_column(enum_col(ServiceType), index=True)  # denormalised for fast filtering
    name: Mapped[str] = mapped_column(String(200), index=True)
    venue: Mapped[Venue] = mapped_column(enum_col(Venue), default=Venue.OUTSIDE_APMC, index=True)
    apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"), index=True)
    state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"), index=True)
    commodity_id: Mapped[int | None] = mapped_column(ForeignKey("commodities.id"), index=True)
    variety_id: Mapped[int | None] = mapped_column(ForeignKey("commodity_varieties.id"))
    price_unit: Mapped[str] = mapped_column(String(30), default="per_sample")
    base_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    min_price: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    max_price: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    is_negotiable: Mapped[bool] = mapped_column(Boolean, default=False)
    turnaround: Mapped[str | None] = mapped_column(String(100))
    operating_hours: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # assaying: {assaying_type, service_model, delivery, parameters:[{name,spec,fee,tradeable}]}
    # weighment: {method, rate_per_vehicle, rate_per_bag} ; logistics: {vehicle_type, capacity_t, per_km}
    details: Mapped[dict] = mapped_column(JSONB, default=dict)
    __table_args__ = (Index("ix_catalog_search", "service_type", "venue", "state_id", "is_active"),)


class ServiceBooking(Base, PKMixin, TimestampMixin):
    """A seeker's request for a catalog (S33, S46, S47). Replaces assaying/weighment/warehouse bookings,
    logistics requests + orders, and assaying status logs (status history is in `history`)."""

    __tablename__ = "service_bookings"
    number: Mapped[str] = mapped_column(String(50), unique=True)
    catalog_id: Mapped[int] = mapped_column(ForeignKey("service_catalogs.id"), index=True)
    service_type: Mapped[ServiceType] = mapped_column(enum_col(ServiceType), index=True)
    seeker_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    provider_id: Mapped[int] = mapped_column(ForeignKey("service_providers.id"), index=True)
    lot_id: Mapped[int | None] = mapped_column(ForeignKey("lots.id", ondelete="SET NULL"))
    venue: Mapped[Venue] = mapped_column(enum_col(Venue))
    is_free: Mapped[bool] = mapped_column(Boolean, default=False)  # 'Free Inside APMC' tab
    scheduled_on: Mapped[date | None] = mapped_column(Date)
    time_slot: Mapped[str | None] = mapped_column(String(50))
    quantity_qtl: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    quoted_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    offered_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))  # seeker's offer
    counter_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))  # provider's counter
    final_price: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    negotiation: Mapped[NegotiationStatus] = mapped_column(enum_col(NegotiationStatus), default=NegotiationStatus.NA)
    status: Mapped[BookingStatus] = mapped_column(enum_col(BookingStatus), default=BookingStatus.REQUESTED, index=True)
    payment_status: Mapped[PaymentStatus] = mapped_column(enum_col(PaymentStatus), default=PaymentStatus.PENDING)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)
    # type-specific: vehicle/driver (weighment, logistics), pickup/drop, distance_km, test results, invoice lines
    details: Mapped[dict] = mapped_column(JSONB, default=dict)
    # [{"from": "requested", "to": "accepted", "by": 12, "at": "...", "note": ""}]
    history: Mapped[list] = mapped_column(JSONB, default=list)
    # pickup/drop/sample-collection -> Address(owner_type=booking); report/slip -> Attachment(owner_type=booking)
    __table_args__ = (Index("ix_booking_provider_status", "provider_id", "status"),)


class Equipment(Base, PKMixin, TimestampMixin):
    """Weighbridge / scale / lab instrument. Kept as a table: calibration expiry blocks weighments (PRD rule)."""

    __tablename__ = "equipment"
    provider_service_id: Mapped[int] = mapped_column(ForeignKey("provider_services.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(150))
    kind: Mapped[str | None] = mapped_column(String(50))  # weigh_bridge | scale | nir | ...
    capacity_tonnes: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    serial_number: Mapped[str | None] = mapped_column(String(100))
    calibration_cert_no: Mapped[str | None] = mapped_column(String(100))
    calibration_expires_on: Mapped[date | None] = mapped_column(Date, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class WeighmentRecord(Base, PKMixin, TimestampMixin):
    """Kept separate: it is a legal measurement record feeding agreements, with its own strict columns."""

    __tablename__ = "weighment_records"
    slip_number: Mapped[str] = mapped_column(String(50), unique=True)
    booking_id: Mapped[int | None] = mapped_column(ForeignKey("service_bookings.id", ondelete="SET NULL"))
    lot_id: Mapped[int | None] = mapped_column(ForeignKey("lots.id", ondelete="SET NULL"), index=True)
    vehicle_number: Mapped[str] = mapped_column(String(50), index=True)
    bag_type_id: Mapped[int | None] = mapped_column(ForeignKey("bag_types.id"))
    number_of_bags: Mapped[int | None] = mapped_column(Integer)
    gross_kg: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    tare_kg: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    bag_deduction_kg: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    final_qtl: Mapped[Decimal] = mapped_column(Numeric(15, 2))  # (gross - tare - bag_deduction) / 100
    operator: Mapped[str | None] = mapped_column(String(100))
    equipment_id: Mapped[int | None] = mapped_column(ForeignKey("equipment.id", ondelete="SET NULL"))
