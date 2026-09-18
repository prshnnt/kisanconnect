from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from app.models.commodities import APMC, Commodity, District, State
    from app.models.service_provider import ServiceProvider


class LogisticsService(Base, TimestampMixin):
    __tablename__ = "logistics_services"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    service_provider_id: Mapped[int] = mapped_column(
        ForeignKey("service_providers.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    base_location: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    vehicle_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    vehicle_capacity: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    vehicle_capacity_unit: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    response_time: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    service_provider: Mapped[ServiceProvider] = relationship(
        "ServiceProvider",
        back_populates="logistics_service",
    )

    service_models: Mapped[list[LogisticsServiceModel]] = relationship(
        "LogisticsServiceModel",
        back_populates="logistics_service",
        cascade="all, delete-orphan",
    )

    routes: Mapped[list[LogisticsRoute]] = relationship(
        "LogisticsRoute",
        back_populates="logistics_service",
        cascade="all, delete-orphan",
    )

    services_offered: Mapped[list[LogisticsServiceOffered]] = relationship(
        "LogisticsServiceOffered",
        back_populates="logistics_service",
        cascade="all, delete-orphan",
    )

    commodities: Mapped[list[LogisticsCommodity]] = relationship(
        "LogisticsCommodity",
        back_populates="logistics_service",
        cascade="all, delete-orphan",
    )

    special_equipment: Mapped[list[LogisticsSpecialEquipment]] = relationship(
        "LogisticsSpecialEquipment",
        back_populates="logistics_service",
        cascade="all, delete-orphan",
    )

    communication_preferences: Mapped[
        list[LogisticsCommunicationPreference]
    ] = relationship(
        "LogisticsCommunicationPreference",
        back_populates="logistics_service",
        cascade="all, delete-orphan",
    )


class LogisticsServiceModel(Base):
    __tablename__ = "logistics_service_models"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    logistics_service_id: Mapped[int] = mapped_column(
        ForeignKey("logistics_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    service_model: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    # door_to_door
    # first_mile_pickup
    # last_mile_pickup
    # inter_state
    # intra_state
    # hub_and_spoke

    logistics_service: Mapped[LogisticsService] = relationship(
        "LogisticsService",
        back_populates="service_models",
    )


class LogisticsRoute(Base):
    __tablename__ = "logistics_routes"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    logistics_service_id: Mapped[int] = mapped_column(
        ForeignKey("logistics_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    source_state_id: Mapped[int | None] = mapped_column(
        ForeignKey("states.id"),
        nullable=True,
        index=True,
    )

    source_district_id: Mapped[int | None] = mapped_column(
        ForeignKey("districts.id"),
        nullable=True,
        index=True,
    )

    source_apmc_id: Mapped[int | None] = mapped_column(
        ForeignKey("apmcs.id"),
        nullable=True,
        index=True,
    )

    destination_state_id: Mapped[int | None] = mapped_column(
        ForeignKey("states.id"),
        nullable=True,
        index=True,
    )

    destination_district_id: Mapped[int | None] = mapped_column(
        ForeignKey("districts.id"),
        nullable=True,
        index=True,
    )

    destination_apmc_id: Mapped[int | None] = mapped_column(
        ForeignKey("apmcs.id"),
        nullable=True,
        index=True,
    )

    route_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    logistics_service: Mapped[LogisticsService] = relationship(
        "LogisticsService",
        back_populates="routes",
    )

    source_state: Mapped[State | None] = relationship(
        "State",
        foreign_keys=[source_state_id],
    )

    source_district: Mapped[District | None] = relationship(
        "District",
        foreign_keys=[source_district_id],
    )

    source_apmc: Mapped[APMC | None] = relationship(
        "APMC",
        foreign_keys=[source_apmc_id],
    )

    destination_state: Mapped[State | None] = relationship(
        "State",
        foreign_keys=[destination_state_id],
    )

    destination_district: Mapped[District | None] = relationship(
        "District",
        foreign_keys=[destination_district_id],
    )

    destination_apmc: Mapped[APMC | None] = relationship(
        "APMC",
        foreign_keys=[destination_apmc_id],
    )


class LogisticsServiceOffered(Base):
    __tablename__ = "logistics_services_offered"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    logistics_service_id: Mapped[int] = mapped_column(
        ForeignKey("logistics_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    service_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    logistics_service: Mapped[LogisticsService] = relationship(
        "LogisticsService",
        back_populates="services_offered",
    )


class LogisticsCommodity(Base):
    __tablename__ = "logistics_commodities"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    logistics_service_id: Mapped[int] = mapped_column(
        ForeignKey("logistics_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    commodity_id: Mapped[int] = mapped_column(
        ForeignKey("commodities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    logistics_service: Mapped[LogisticsService] = relationship(
        "LogisticsService",
        back_populates="commodities",
    )

    commodity: Mapped[Commodity] = relationship(
        "Commodity",
    )

    __table_args__ = (
        UniqueConstraint(
            "logistics_service_id",
            "commodity_id",
            name="uq_logistics_service_commodity",
        ),
    )


class LogisticsSpecialEquipment(Base):
    __tablename__ = "logistics_special_equipment"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    logistics_service_id: Mapped[int] = mapped_column(
        ForeignKey("logistics_services.id", ondelete="CASCADE"),
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

    logistics_service: Mapped[LogisticsService] = relationship(
        "LogisticsService",
        back_populates="special_equipment",
    )


class LogisticsCommunicationPreference(Base):
    __tablename__ = "logistics_communication_preferences"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    logistics_service_id: Mapped[int] = mapped_column(
        ForeignKey("logistics_services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    communication_method: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )
    # phone
    # email

    logistics_service: Mapped[LogisticsService] = relationship(
        "LogisticsService",
        back_populates="communication_preferences",
    )

    __table_args__ = (
        UniqueConstraint(
            "logistics_service_id",
            "communication_method",
            name="uq_logistics_communication_method",
        ),
    )