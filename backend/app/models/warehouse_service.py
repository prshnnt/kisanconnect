from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from app.models.commodities import Commodity, District, State, Tehsil
    from app.models.service_provider import ServiceProvider


class WarehouseService(Base, TimestampMixin):
    __tablename__ = "warehouse_services"

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

    warehouse_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    warehouse_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    storage_capacity: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    storage_capacity_unit: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    wdra_accredited: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )

    response_time: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    service_provider: Mapped[ServiceProvider] = relationship(
        "ServiceProvider",
        back_populates="warehouse_service",
    )

    locations: Mapped[list[WarehouseLocation]] = relationship(
        "WarehouseLocation",
        back_populates="warehouse_service",
        cascade="all, delete-orphan",
    )

    services_offered: Mapped[list[WarehouseServiceOffered]] = relationship(
        "WarehouseServiceOffered",
        back_populates="warehouse_service",
        cascade="all, delete-orphan",
    )

    rental_models: Mapped[list[WarehouseRentalModel]] = relationship(
        "WarehouseRentalModel",
        back_populates="warehouse_service",
        cascade="all, delete-orphan",
    )

    commodities: Mapped[list[WarehouseCommodity]] = relationship(
        "WarehouseCommodity",
        back_populates="warehouse_service",
        cascade="all, delete-orphan",
    )

    communication_preferences: Mapped[
        list[WarehouseCommunicationPreference]
    ] = relationship(
        "WarehouseCommunicationPreference",
        back_populates="warehouse_service",
        cascade="all, delete-orphan",
    )


class WarehouseLocation(Base):
    __tablename__ = "warehouse_locations"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    warehouse_service_id: Mapped[int] = mapped_column(
        ForeignKey("warehouse_services.id", ondelete="CASCADE"),
        nullable=False,
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

    warehouse_service: Mapped[WarehouseService] = relationship(
        "WarehouseService",
        back_populates="locations",
    )

    state: Mapped[State | None] = relationship("State")
    district: Mapped[District | None] = relationship("District")
    tehsil: Mapped[Tehsil | None] = relationship("Tehsil")


class WarehouseServiceOffered(Base):
    __tablename__ = "warehouse_services_offered"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    warehouse_service_id: Mapped[int] = mapped_column(
        ForeignKey("warehouse_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    service_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    warehouse_service: Mapped[WarehouseService] = relationship(
        "WarehouseService",
        back_populates="services_offered",
    )


class WarehouseRentalModel(Base):
    __tablename__ = "warehouse_rental_models"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    warehouse_service_id: Mapped[int] = mapped_column(
        ForeignKey("warehouse_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    rental_model: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    warehouse_service: Mapped[WarehouseService] = relationship(
        "WarehouseService",
        back_populates="rental_models",
    )


class WarehouseCommodity(Base):
    __tablename__ = "warehouse_commodities"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    warehouse_service_id: Mapped[int] = mapped_column(
        ForeignKey("warehouse_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    commodity_id: Mapped[int] = mapped_column(
        ForeignKey("commodities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    warehouse_service: Mapped[WarehouseService] = relationship(
        "WarehouseService",
        back_populates="commodities",
    )

    commodity: Mapped[Commodity] = relationship(
        "Commodity",
    )

    __table_args__ = (
        UniqueConstraint(
            "warehouse_service_id",
            "commodity_id",
            name="uq_warehouse_service_commodity",
        ),
    )


class WarehouseCommunicationPreference(Base):
    __tablename__ = "warehouse_communication_preferences"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    warehouse_service_id: Mapped[int] = mapped_column(
        ForeignKey("warehouse_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    communication_method: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )
    # phone
    # email

    warehouse_service: Mapped[WarehouseService] = relationship(
        "WarehouseService",
        back_populates="communication_preferences",
    )

    __table_args__ = (
        UniqueConstraint(
            "warehouse_service_id",
            "communication_method",
            name="uq_warehouse_communication_method",
        ),
    )