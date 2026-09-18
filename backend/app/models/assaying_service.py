from sqlalchemy import (
    BigInteger,
    Boolean,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin


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

    service_provider: Mapped["ServiceProvider"] = relationship(
        "ServiceProvider",
        back_populates="assaying_service",
    )

    testing_methods: Mapped[list["AssayingTestingMethod"]] = relationship(
        "AssayingTestingMethod",
        back_populates="assaying_service",
        cascade="all, delete-orphan",
    )

    commodities: Mapped[list["AssayingCommodity"]] = relationship(
        "AssayingCommodity",
        back_populates="assaying_service",
        cascade="all, delete-orphan",
    )

    special_equipment: Mapped[list["AssayingSpecialEquipment"]] = relationship(
        "AssayingSpecialEquipment",
        back_populates="assaying_service",
        cascade="all, delete-orphan",
    )

    attachments: Mapped[list["AssayingAttachment"]] = relationship(
        "AssayingAttachment",
        back_populates="assaying_service",
        cascade="all, delete-orphan",
    )

    communication_preferences: Mapped[
        list["AssayingCommunicationPreference"]
    ] = relationship(
        "AssayingCommunicationPreference",
        back_populates="assaying_service",
        cascade="all, delete-orphan",
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

    testing_method: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )
    # physical
    # chemical

    assaying_service: Mapped["AssayingService"] = relationship(
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

    assaying_service: Mapped["AssayingService"] = relationship(
        "AssayingService",
        back_populates="commodities",
    )

    commodity: Mapped["Commodity"] = relationship(
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

    assaying_service: Mapped["AssayingService"] = relationship(
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

    assaying_service: Mapped["AssayingService"] = relationship(
        "AssayingService",
        back_populates="attachments",
    )

    attachment: Mapped["Attachment"] = relationship(
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

    communication_method: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )
    # phone
    # email

    assaying_service: Mapped["AssayingService"] = relationship(
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