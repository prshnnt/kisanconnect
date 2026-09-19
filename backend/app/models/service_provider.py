from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Enum as SQLEnum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin
from app.models.enums import CommunicationMethod, ServiceProviderType

if TYPE_CHECKING:
    from app.models.assaying_service import (
        AssayingBooking,
        AssayingService,
        AssayingServiceCatalog,
    )
    from app.models.commodities import APMC, District, State, Tehsil
    from app.models.logistic_service import LogisticsService
    from app.models.users import User
    from app.models.warehouse_service import WarehouseService
    from app.models.weighment_service import WeighmentService


class ServiceProvider(Base, TimestampMixin):
    __tablename__ = "service_providers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    user: Mapped[User] = relationship("User", back_populates="service_provider")

    services: Mapped[list[ServiceProviderService]] = relationship(
        "ServiceProviderService",
        back_populates="service_provider",
        cascade="all, delete-orphan",
    )

    locations: Mapped[list[ServiceProviderLocation]] = relationship(
        "ServiceProviderLocation",
        back_populates="service_provider",
        cascade="all, delete-orphan",
    )

    communication_preferences: Mapped[
        list[ServiceProviderCommunicationPreference]
    ] = relationship(
        "ServiceProviderCommunicationPreference",
        back_populates="service_provider",
        cascade="all, delete-orphan",
    )

    weighment_service: Mapped[WeighmentService | None] = relationship(
        "WeighmentService",
        back_populates="service_provider",
        uselist=False,
        cascade="all, delete-orphan",
    )

    warehouse_service: Mapped[WarehouseService | None] = relationship(
        "WarehouseService",
        back_populates="service_provider",
        uselist=False,
        cascade="all, delete-orphan",
    )

    logistics_service: Mapped[LogisticsService | None] = relationship(
        "LogisticsService",
        back_populates="service_provider",
        uselist=False,
        cascade="all, delete-orphan",
    )

    assaying_service: Mapped[AssayingService | None] = relationship(
        "AssayingService",
        back_populates="service_provider",
        uselist=False,
        cascade="all, delete-orphan",
    )

    assaying_catalogs: Mapped[list[AssayingServiceCatalog]] = relationship(
        "AssayingServiceCatalog",
        back_populates="service_provider",
        cascade="all, delete-orphan",
    )

    assaying_bookings: Mapped[list[AssayingBooking]] = relationship(
        "AssayingBooking",
        foreign_keys="AssayingBooking.service_provider_id",
        back_populates="service_provider",
    )



class ServiceProviderService(Base):
    __tablename__ = "service_provider_services"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    service_provider_id: Mapped[int] = mapped_column(ForeignKey("service_providers.id", ondelete="CASCADE"), nullable=False, index=True)

    service_type: Mapped[ServiceProviderType] = mapped_column(
        SQLEnum(
            ServiceProviderType,
            native_enum=False,
            length=50,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    # weightment
    # warehouse
    # logistics
    # assaying
    # assurance
    # packaging
    # grading_and_sorting
    # labour

    service_provider: Mapped[ServiceProvider] = relationship("ServiceProvider", back_populates="services")

    __table_args__ = (
        UniqueConstraint(
            "service_provider_id",
            "service_type",
            name="uq_service_provider_service_type",
        ),
    )


class ServiceProviderLocation(Base, TimestampMixin):
    __tablename__ = "service_provider_locations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    service_provider_id: Mapped[int] = mapped_column(ForeignKey("service_providers.id", ondelete="CASCADE"), nullable=False, index=True)

    state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"), nullable=True, index=True)
    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"), nullable=True, index=True)
    tehsil_id: Mapped[int | None] = mapped_column(ForeignKey("tehsils.id"), nullable=True, index=True)
    city_or_village: Mapped[str | None] = mapped_column(String(150), nullable=True)

    apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"), nullable=True, index=True)

    service_provider: Mapped[ServiceProvider] = relationship("ServiceProvider", back_populates="locations")

    state: Mapped[State | None] = relationship("State")
    district: Mapped[District | None] = relationship("District")
    tehsil: Mapped[Tehsil | None] = relationship("Tehsil")
    apmc: Mapped[APMC | None] = relationship("APMC")


class ServiceProviderCommunicationPreference(Base, TimestampMixin):
    __tablename__ = "service_provider_communication_preferences"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    service_provider_id: Mapped[int] = mapped_column(ForeignKey("service_providers.id", ondelete="CASCADE"), nullable=False, index=True)

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
    service_provider: Mapped[ServiceProvider] = relationship("ServiceProvider", back_populates="communication_preferences")

    __table_args__ = (
        UniqueConstraint(
            "service_provider_id",
            "communication_method",
            name="uq_service_provider_communication_method",
        ),
    )