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
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin
from app.models.enums import (
    AssayingBookingStatus,
    AssayingDeliveryType,
    AssayingLocationType,
    AssayingNegotiationStatus,
    AssayingServiceModel,
    AssayingTestingMethodType,
    CommunicationMethod,
)

if TYPE_CHECKING:
    from app.models.attachment import Attachment
    from app.models.commodities import APMC, Commodity, CommodityVariety, District, State, Tehsil
    from app.models.lot import Lot
    from app.models.service_provider import ServiceProvider
    from app.models.users import User


class AssayingService(Base, TimestampMixin):
    __tablename__ = "assaying_services"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    service_provider_id: Mapped[int] = mapped_column(
        ForeignKey("service_providers.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    business_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    sample_pickup_available: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )

    accreditation_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    response_time: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    service_provider: Mapped[ServiceProvider] = relationship(
        "ServiceProvider",
        back_populates="assaying_service",
    )

    testing_methods: Mapped[list[AssayingTestingMethod]] = relationship(
        "AssayingTestingMethod",
        back_populates="assaying_service",
        cascade="all, delete-orphan",
    )

    commodities: Mapped[list[AssayingCommodity]] = relationship(
        "AssayingCommodity",
        back_populates="assaying_service",
        cascade="all, delete-orphan",
    )

    special_equipment: Mapped[list[AssayingSpecialEquipment]] = relationship(
        "AssayingSpecialEquipment",
        back_populates="assaying_service",
        cascade="all, delete-orphan",
    )

    attachments: Mapped[list[AssayingAttachment]] = relationship(
        "AssayingAttachment",
        back_populates="assaying_service",
        cascade="all, delete-orphan",
    )

    communication_preferences: Mapped[
        list[AssayingCommunicationPreference]
    ] = relationship(
        "AssayingCommunicationPreference",
        back_populates="assaying_service",
        cascade="all, delete-orphan",
    )

    catalogs: Mapped[list[AssayingServiceCatalog]] = relationship(
        "AssayingServiceCatalog",
        back_populates="assaying_service",
        cascade="all, delete-orphan",
    )

    bookings: Mapped[list[AssayingBooking]] = relationship(
        "AssayingBooking",
        back_populates="assaying_service",
    )



class AssayingTestingMethod(Base):
    __tablename__ = "assaying_testing_methods"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    assaying_service_id: Mapped[int] = mapped_column(
        ForeignKey("assaying_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    testing_method: Mapped[AssayingTestingMethodType | None] = mapped_column(
        SQLEnum(
            AssayingTestingMethodType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=True,
    )
    # physical
    # chemical

    assaying_service: Mapped[AssayingService] = relationship(
        "AssayingService",
        back_populates="testing_methods",
    )


class AssayingCommodity(Base):
    __tablename__ = "assaying_commodities"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    assaying_service_id: Mapped[int] = mapped_column(
        ForeignKey("assaying_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    commodity_id: Mapped[int] = mapped_column(
        ForeignKey("commodities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    assaying_service: Mapped[AssayingService] = relationship(
        "AssayingService",
        back_populates="commodities",
    )

    commodity: Mapped[Commodity] = relationship(
        "Commodity",
    )

    __table_args__ = (
        UniqueConstraint(
            "assaying_service_id",
            "commodity_id",
            name="uq_assaying_service_commodity",
        ),
    )


class AssayingSpecialEquipment(Base):
    __tablename__ = "assaying_special_equipment"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    assaying_service_id: Mapped[int] = mapped_column(
        ForeignKey("assaying_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    equipment_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    assaying_service: Mapped[AssayingService] = relationship(
        "AssayingService",
        back_populates="special_equipment",
    )


class AssayingAttachment(Base):
    __tablename__ = "assaying_attachments"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    assaying_service_id: Mapped[int] = mapped_column(
        ForeignKey("assaying_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    attachment_id: Mapped[int] = mapped_column(
        ForeignKey("attachments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    assaying_service: Mapped[AssayingService] = relationship(
        "AssayingService",
        back_populates="attachments",
    )

    attachment: Mapped[Attachment] = relationship(
        "Attachment",
    )

    __table_args__ = (
        UniqueConstraint(
            "assaying_service_id",
            "attachment_id",
            name="uq_assaying_service_attachment",
        ),
    )


class AssayingCommunicationPreference(Base):
    __tablename__ = "assaying_communication_preferences"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    assaying_service_id: Mapped[int] = mapped_column(
        ForeignKey("assaying_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    communication_method: Mapped[CommunicationMethod | None] = mapped_column(
        SQLEnum(
            CommunicationMethod,
            native_enum=False,
            length=20,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=True,
    )
    # phone
    # email

    assaying_service: Mapped[AssayingService] = relationship(
        "AssayingService",
        back_populates="communication_preferences",
    )

    __table_args__ = (
        UniqueConstraint(
            "assaying_service_id",
            "communication_method",
            name="uq_assaying_communication_method",
        ),
    )


class AssayingServiceCatalog(Base, TimestampMixin):
    __tablename__ = "assaying_service_catalogs"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    service_provider_id: Mapped[int] = mapped_column(
        ForeignKey("service_providers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    assaying_service_id: Mapped[int | None] = mapped_column(
        ForeignKey("assaying_services.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    catalog_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    location_type: Mapped[AssayingLocationType] = mapped_column(
        SQLEnum(
            AssayingLocationType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AssayingLocationType.OUTSIDE_APMC,
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

    tehsil_id: Mapped[int | None] = mapped_column(
        ForeignKey("tehsils.id"),
        nullable=True,
        index=True,
    )

    city_or_village: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    location_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    commodity_id: Mapped[int] = mapped_column(
        ForeignKey("commodities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    commodity_variety_id: Mapped[int | None] = mapped_column(
        ForeignKey("commodity_varieties.id"),
        nullable=True,
        index=True,
    )

    assaying_type: Mapped[AssayingTestingMethodType] = mapped_column(
        SQLEnum(
            AssayingTestingMethodType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AssayingTestingMethodType.PHYSICAL,
    )

    service_model: Mapped[AssayingServiceModel] = mapped_column(
        SQLEnum(
            AssayingServiceModel,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AssayingServiceModel.DIGITAL,
    )

    service_delivery: Mapped[AssayingDeliveryType] = mapped_column(
        SQLEnum(
            AssayingDeliveryType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AssayingDeliveryType.ASSAYER_PICKUP,
    )

    turnaround_time: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    operating_hours: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    base_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    min_price: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    max_price: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    price_unit: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="per_sample",
    )

    is_negotiable: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    contact_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    contact_mobile: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    contact_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Relationships
    service_provider: Mapped[ServiceProvider] = relationship(
        "ServiceProvider",
        back_populates="assaying_catalogs",
    )

    assaying_service: Mapped[AssayingService | None] = relationship(
        "AssayingService",
        back_populates="catalogs",
    )

    commodity: Mapped[Commodity] = relationship("Commodity")
    commodity_variety: Mapped[CommodityVariety | None] = relationship("CommodityVariety")
    apmc: Mapped[APMC | None] = relationship("APMC")
    state: Mapped[State | None] = relationship("State")
    district: Mapped[District | None] = relationship("District")
    tehsil: Mapped[Tehsil | None] = relationship("Tehsil")

    parameters: Mapped[list[AssayingCatalogParameter]] = relationship(
        "AssayingCatalogParameter",
        back_populates="catalog",
        cascade="all, delete-orphan",
    )

    bookings: Mapped[list[AssayingBooking]] = relationship(
        "AssayingBooking",
        back_populates="catalog",
    )


class AssayingCatalogParameter(Base):
    __tablename__ = "assaying_catalog_parameters"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    catalog_id: Mapped[int] = mapped_column(
        ForeignKey("assaying_service_catalogs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    parameter_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    standard_specification: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    parameter_fee: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    is_tradeable: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    catalog: Mapped[AssayingServiceCatalog] = relationship(
        "AssayingServiceCatalog",
        back_populates="parameters",
    )


class AssayingBooking(Base, TimestampMixin):
    __tablename__ = "assaying_bookings"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    booking_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    catalog_id: Mapped[int] = mapped_column(
        ForeignKey("assaying_service_catalogs.id"),
        nullable=False,
        index=True,
    )

    seeker_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    service_provider_id: Mapped[int] = mapped_column(
        ForeignKey("service_providers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    assaying_service_id: Mapped[int | None] = mapped_column(
        ForeignKey("assaying_services.id", ondelete="SET NULL"),
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

    lot_id: Mapped[int | None] = mapped_column(
        ForeignKey("lots.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    location_type: Mapped[AssayingLocationType] = mapped_column(
        SQLEnum(
            AssayingLocationType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AssayingLocationType.OUTSIDE_APMC,
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

    tehsil_id: Mapped[int | None] = mapped_column(
        ForeignKey("tehsils.id"),
        nullable=True,
        index=True,
    )

    sample_collection_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    pincode: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    service_delivery: Mapped[AssayingDeliveryType] = mapped_column(
        SQLEnum(
            AssayingDeliveryType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AssayingDeliveryType.ASSAYER_PICKUP,
    )

    scheduled_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    time_slot: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    quantity_quintal: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    number_of_bags: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )

    base_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    quoted_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    seeker_offered_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    assayer_counter_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    final_price: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    negotiation_status: Mapped[AssayingNegotiationStatus] = mapped_column(
        SQLEnum(
            AssayingNegotiationStatus,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AssayingNegotiationStatus.NA,
        index=True,
    )

    booking_status: Mapped[AssayingBookingStatus] = mapped_column(
        SQLEnum(
            AssayingBookingStatus,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=AssayingBookingStatus.REQUESTED,
        index=True,
    )

    report_attachment_id: Mapped[int | None] = mapped_column(
        ForeignKey("attachments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    result_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    seeker_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    provider_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    catalog: Mapped[AssayingServiceCatalog] = relationship(
        "AssayingServiceCatalog",
        back_populates="bookings",
    )

    seeker_user: Mapped[User] = relationship(
        "User",
        foreign_keys=[seeker_user_id],
        back_populates="assaying_booking_requests",
    )

    service_provider: Mapped[ServiceProvider] = relationship(
        "ServiceProvider",
        foreign_keys=[service_provider_id],
        back_populates="assaying_bookings",
    )

    assaying_service: Mapped[AssayingService | None] = relationship(
        "AssayingService",
        foreign_keys=[assaying_service_id],
        back_populates="bookings",
    )

    commodity: Mapped[Commodity] = relationship("Commodity")
    commodity_variety: Mapped[CommodityVariety | None] = relationship("CommodityVariety")
    lot: Mapped[Lot | None] = relationship("Lot")
    apmc: Mapped[APMC | None] = relationship("APMC")
    state: Mapped[State | None] = relationship("State")
    district: Mapped[District | None] = relationship("District")
    tehsil: Mapped[Tehsil | None] = relationship("Tehsil")
    report_attachment: Mapped[Attachment | None] = relationship("Attachment")

    parameters: Mapped[list[AssayingBookingParameter]] = relationship(
        "AssayingBookingParameter",
        back_populates="booking",
        cascade="all, delete-orphan",
    )

    status_logs: Mapped[list[AssayingBookingStatusLog]] = relationship(
        "AssayingBookingStatusLog",
        back_populates="booking",
        cascade="all, delete-orphan",
    )


class AssayingBookingParameter(Base):
    __tablename__ = "assaying_booking_parameters"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("assaying_bookings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    parameter_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    standard_value: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    tested_value: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    unit: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    is_within_standard: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )

    fee: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    booking: Mapped[AssayingBooking] = relationship(
        "AssayingBooking",
        back_populates="parameters",
    )


class AssayingBookingStatusLog(Base, TimestampMixin):
    __tablename__ = "assaying_booking_status_logs"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("assaying_bookings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    from_status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    to_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    changed_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    booking: Mapped[AssayingBooking] = relationship(
        "AssayingBooking",
        back_populates="status_logs",
    )

    changed_by_user: Mapped[User | None] = relationship("User")