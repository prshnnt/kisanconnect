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
    WeighingMethod,
    WeighmentBookingStatus,
    WeighmentEquipmentType,
    WeighmentLocationType,
)

if TYPE_CHECKING:
    from app.models.attachment import Attachment
    from app.models.commodities import APMC, BagType, Commodity, District, State, Tehsil
    from app.models.lot import Lot
    from app.models.service_provider import ServiceProvider
    from app.models.users import User


class WeighmentService(Base, TimestampMixin):
    __tablename__ = "weighment_services"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    service_provider_id: Mapped[int] = mapped_column(
        ForeignKey("service_providers.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    business_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    apmc_location_type: Mapped[WeighmentLocationType | None] = mapped_column(
        SQLEnum(
            WeighmentLocationType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=True,
    )
    weighing_method: Mapped[WeighingMethod | None] = mapped_column(
        SQLEnum(
            WeighingMethod,
            native_enum=False,
            length=50,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=True,
    )
    response_time: Mapped[str | None] = mapped_column(String(100), nullable=True)

    service_provider: Mapped[ServiceProvider] = relationship(
        "ServiceProvider",
        back_populates="weighment_service",
    )

    locations: Mapped[list[WeighmentServiceLocation]] = relationship(
        "WeighmentServiceLocation",
        back_populates="weighment_service",
        cascade="all, delete-orphan",
    )

    certificates: Mapped[list[WeighmentCertificate]] = relationship(
        "WeighmentCertificate",
        back_populates="weighment_service",
        cascade="all, delete-orphan",
    )

    equipments: Mapped[list[WeighmentEquipment]] = relationship(
        "WeighmentEquipment",
        back_populates="weighment_service",
        cascade="all, delete-orphan",
    )

    catalogs: Mapped[list[WeighmentCatalog]] = relationship(
        "WeighmentCatalog",
        back_populates="weighment_service",
        cascade="all, delete-orphan",
    )

    bookings: Mapped[list[WeighmentBooking]] = relationship(
        "WeighmentBooking",
        back_populates="weighment_service",
    )

    records: Mapped[list[WeighmentRecord]] = relationship(
        "WeighmentRecord",
        back_populates="weighment_service",
    )


class WeighmentServiceLocation(Base):
    __tablename__ = "weighment_service_locations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    weighment_service_id: Mapped[int] = mapped_column(
        ForeignKey("weighment_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    state_id: Mapped[int] = mapped_column(
        ForeignKey("states.id"),
        nullable=False,
        index=True,
    )

    weighment_service: Mapped[WeighmentService] = relationship(
        "WeighmentService",
        back_populates="locations",
    )

    state: Mapped[State] = relationship("State")

    __table_args__ = (
        UniqueConstraint(
            "weighment_service_id",
            "state_id",
            name="uq_weighment_service_state",
        ),
    )


class WeighmentCertificate(Base):
    __tablename__ = "weighment_certificates"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    weighment_service_id: Mapped[int] = mapped_column(
        ForeignKey("weighment_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    attachment_id: Mapped[int] = mapped_column(
        ForeignKey("attachments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    weighment_service: Mapped[WeighmentService] = relationship(
        "WeighmentService",
        back_populates="certificates",
    )

    attachment: Mapped[Attachment] = relationship(
        "Attachment",
    )

    __table_args__ = (
        UniqueConstraint(
            "weighment_service_id",
            "attachment_id",
            name="uq_weighment_service_certificate",
        ),
    )


class WeighmentEquipment(Base, TimestampMixin):
    __tablename__ = "weighment_equipments"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    weighment_service_id: Mapped[int] = mapped_column(
        ForeignKey("weighment_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    equipment_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    equipment_type: Mapped[WeighmentEquipmentType] = mapped_column(
        SQLEnum(
            WeighmentEquipmentType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=WeighmentEquipmentType.WEIGH_BRIDGE,
    )

    capacity_tonnes: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    installation_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    make_and_model: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    serial_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    calibration_certificate_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    last_calibration_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    calibration_expiry_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    weighment_service: Mapped[WeighmentService] = relationship(
        "WeighmentService",
        back_populates="equipments",
    )

    records: Mapped[list[WeighmentRecord]] = relationship(
        "WeighmentRecord",
        back_populates="equipment",
    )


class WeighmentCatalog(Base, TimestampMixin):
    __tablename__ = "weighment_catalogs"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    weighment_service_id: Mapped[int | None] = mapped_column(
        ForeignKey("weighment_services.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    service_provider_id: Mapped[int] = mapped_column(
        ForeignKey("service_providers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    catalog_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    location_type: Mapped[WeighmentLocationType] = mapped_column(
        SQLEnum(
            WeighmentLocationType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=WeighmentLocationType.OUTSIDE_APMC,
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

    location_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    weighing_method: Mapped[WeighingMethod] = mapped_column(
        SQLEnum(
            WeighingMethod,
            native_enum=False,
            length=50,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=WeighingMethod.WEIGH_BRIDGE,
    )

    operating_hours: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    rate_per_vehicle: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    rate_per_quintal: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    rate_per_bag: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    min_charge: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    contact_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    contact_mobile: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Relationships
    weighment_service: Mapped[WeighmentService | None] = relationship(
        "WeighmentService",
        back_populates="catalogs",
    )

    service_provider: Mapped[ServiceProvider] = relationship(
        "ServiceProvider",
        back_populates="weighment_catalogs",
    )

    apmc: Mapped[APMC | None] = relationship("APMC")
    state: Mapped[State | None] = relationship("State")
    district: Mapped[District | None] = relationship("District")
    tehsil: Mapped[Tehsil | None] = relationship("Tehsil")

    bookings: Mapped[list[WeighmentBooking]] = relationship(
        "WeighmentBooking",
        back_populates="catalog",
    )


class WeighmentBooking(Base, TimestampMixin):
    __tablename__ = "weighment_bookings"

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
        ForeignKey("weighment_catalogs.id"),
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

    weighment_service_id: Mapped[int | None] = mapped_column(
        ForeignKey("weighment_services.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    lot_id: Mapped[int | None] = mapped_column(
        ForeignKey("lots.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    commodity_id: Mapped[int | None] = mapped_column(
        ForeignKey("commodities.id"),
        nullable=True,
        index=True,
    )

    vehicle_number: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    vehicle_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    driver_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    driver_mobile: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    scheduled_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    time_slot: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    quoted_price: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    final_price: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    booking_status: Mapped[WeighmentBookingStatus] = mapped_column(
        SQLEnum(
            WeighmentBookingStatus,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=WeighmentBookingStatus.REQUESTED,
        index=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    catalog: Mapped[WeighmentCatalog] = relationship(
        "WeighmentCatalog",
        back_populates="bookings",
    )

    seeker_user: Mapped[User] = relationship(
        "User",
        foreign_keys=[seeker_user_id],
        back_populates="weighment_booking_requests",
    )

    service_provider: Mapped[ServiceProvider] = relationship(
        "ServiceProvider",
        foreign_keys=[service_provider_id],
        back_populates="weighment_bookings",
    )

    weighment_service: Mapped[WeighmentService | None] = relationship(
        "WeighmentService",
        foreign_keys=[weighment_service_id],
        back_populates="bookings",
    )

    lot: Mapped[Lot | None] = relationship("Lot")
    commodity: Mapped[Commodity | None] = relationship("Commodity")

    records: Mapped[list[WeighmentRecord]] = relationship(
        "WeighmentRecord",
        back_populates="booking",
    )


class WeighmentRecord(Base, TimestampMixin):
    __tablename__ = "weighment_records"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    slip_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    booking_id: Mapped[int | None] = mapped_column(
        ForeignKey("weighment_bookings.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    weighment_service_id: Mapped[int] = mapped_column(
        ForeignKey("weighment_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    equipment_id: Mapped[int | None] = mapped_column(
        ForeignKey("weighment_equipments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    lot_id: Mapped[int | None] = mapped_column(
        ForeignKey("lots.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    seller_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    buyer_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    commodity_id: Mapped[int | None] = mapped_column(
        ForeignKey("commodities.id"),
        nullable=True,
        index=True,
    )

    vehicle_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    vehicle_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    driver_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
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

    gross_weight_kg: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    tare_weight_kg: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    net_weight_kg: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    bag_deduction_kg: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    final_payable_weight_kg: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    final_weight_quintal: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    gross_weight_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    tare_weight_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    operator_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    certificate_attachment_id: Mapped[int | None] = mapped_column(
        ForeignKey("attachments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    booking: Mapped[WeighmentBooking | None] = relationship(
        "WeighmentBooking",
        back_populates="records",
    )

    weighment_service: Mapped[WeighmentService] = relationship(
        "WeighmentService",
        back_populates="records",
    )

    equipment: Mapped[WeighmentEquipment | None] = relationship(
        "WeighmentEquipment",
        back_populates="records",
    )

    lot: Mapped[Lot | None] = relationship(
        "Lot",
        back_populates="weighment_records",
    )

    commodity: Mapped[Commodity | None] = relationship("Commodity")
    bag_type: Mapped[BagType | None] = relationship("BagType")
    certificate_attachment: Mapped[Attachment | None] = relationship("Attachment")