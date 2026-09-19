from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Enum as SQLEnum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin
from app.models.enums import WeighingMethod, WeighmentLocationType

if TYPE_CHECKING:
    from app.models.attachment import Attachment
    from app.models.commodities import State
    from app.models.service_provider import ServiceProvider


class WeighmentService(Base, TimestampMixin):
    __tablename__ = "weighment_services"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    service_provider_id: Mapped[int] = mapped_column(ForeignKey("service_providers.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
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
    # inside_apmc
    # outside_apmc

    weighing_method: Mapped[WeighingMethod | None] = mapped_column(
        SQLEnum(
            WeighingMethod,
            native_enum=False,
            length=50,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=True,
    )
    # weigh_bridge
    # weighing_scale
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


class WeighmentServiceLocation(Base):
    __tablename__ = "weighment_service_locations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    weighment_service_id: Mapped[int] = mapped_column(ForeignKey("weighment_services.id", ondelete="CASCADE"), nullable=False, index=True)

    state_id: Mapped[int] = mapped_column(ForeignKey("states.id"), nullable=False, index=True)

    weighment_service: Mapped[WeighmentService] = relationship("WeighmentService", back_populates="locations")

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

    weighment_service_id: Mapped[int] = mapped_column(ForeignKey("weighment_services.id", ondelete="CASCADE"), nullable=False, index=True)

    attachment_id: Mapped[int] = mapped_column(ForeignKey("attachments.id", ondelete="CASCADE"), nullable=False, index=True)

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