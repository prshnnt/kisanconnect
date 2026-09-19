from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Date, Enum as SQLEnum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin
from app.models.enums import APMCType, TradeLicenseStatus, TradeLicenseType

if TYPE_CHECKING:
    from app.models.attachment import Attachment
    from app.models.buyer import Buyer
    from app.models.commodities import APMC, State


class TradeLicense(Base, TimestampMixin):
    __tablename__ = "trade_licenses"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    buyer_id: Mapped[int] = mapped_column(ForeignKey("buyers.id", ondelete="CASCADE"), nullable=False, index=True)

    issuing_state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"), nullable=True, index=True)

    issuing_apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"), nullable=True, index=True)

    operating_state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"), nullable=True, index=True)

    operating_apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"), nullable=True, index=True)

    license_type: Mapped[TradeLicenseType | None] = mapped_column(
        SQLEnum(
            TradeLicenseType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=True,
    )
    # single
    # unified

    apmc_type: Mapped[APMCType | None] = mapped_column(
        SQLEnum(
            APMCType,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=True,
    )
    # enam
    # non_enam

    license_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    status: Mapped[TradeLicenseStatus | None] = mapped_column(
        SQLEnum(
            TradeLicenseStatus,
            native_enum=False,
            length=30,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=True,
    )
    # active
    # expired
    # suspended

    # Relationships
    buyer: Mapped[Buyer] = relationship("Buyer", back_populates="trade_licenses")

    issuing_state: Mapped[State | None] = relationship("State", foreign_keys=[issuing_state_id])

    issuing_apmc: Mapped[APMC | None] = relationship("APMC", foreign_keys=[issuing_apmc_id])

    operating_state: Mapped[State | None] = relationship("State", foreign_keys=[operating_state_id])

    operating_apmc: Mapped[APMC | None] = relationship("APMC", foreign_keys=[operating_apmc_id])

    attachments: Mapped[list[TradeLicenseAttachment]] = relationship(
        "TradeLicenseAttachment",
        back_populates="trade_license",
        cascade="all, delete-orphan",
    )


class TradeLicenseAttachment(Base):
    __tablename__ = "trade_license_attachments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    trade_license_id: Mapped[int] = mapped_column(ForeignKey("trade_licenses.id", ondelete="CASCADE"), nullable=False, index=True)

    attachment_id: Mapped[int] = mapped_column(ForeignKey("attachments.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    trade_license: Mapped[TradeLicense] = relationship("TradeLicense", back_populates="attachments")

    attachment: Mapped[Attachment] = relationship("Attachment", back_populates="trade_license_attachments")