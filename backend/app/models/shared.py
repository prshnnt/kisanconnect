"""The consolidation core. ONE table each replaces 4-8 near-identical tables.

Polymorphic pattern: (owner_type, owner_id). There is no DB-level FK on owner_id
(trade-off accepted; integrity is enforced in the service layer + cleanup on delete).
"""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, PKMixin, TimestampMixin
from app.models._types import enum_col
from app.models.enums import AddressKind, CommodityRole, OwnerType


class Address(Base, PKMixin, TimestampMixin):
    """Replaces: user_addresses, lot_locations, demand_locations, advanced_supply_locations,
    seller/buyer_preferred_locations, service_provider_locations, warehouse_locations, weighment_service_locations."""

    __tablename__ = "addresses"
    owner_type: Mapped[OwnerType] = mapped_column(enum_col(OwnerType))
    owner_id: Mapped[int] = mapped_column(BigInteger)
    kind: Mapped[AddressKind] = mapped_column(enum_col(AddressKind))
    line1: Mapped[str | None] = mapped_column(String(255))
    line2: Mapped[str | None] = mapped_column(String(255))
    pincode: Mapped[str | None] = mapped_column(String(10))
    state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"), index=True)
    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"))
    tehsil_id: Mapped[int | None] = mapped_column(ForeignKey("tehsils.id"))
    apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"), index=True)
    city: Mapped[str | None] = mapped_column(String(150))
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    __table_args__ = (Index("ix_addresses_owner", "owner_type", "owner_id", "kind"),)


class Attachment(Base, PKMixin):
    """Replaces: attachments + lot/supply/license/assaying/weighment attachment & certificate join tables.
    A file has exactly one owner, so no many-to-many join is needed."""

    __tablename__ = "attachments"
    owner_type: Mapped[OwnerType | None] = mapped_column(enum_col(OwnerType))  # NULL until linked (presigned upload)
    owner_id: Mapped[int | None] = mapped_column(BigInteger)
    kind: Mapped[str | None] = mapped_column(String(40))  # licence, certificate, report, invoice_pdf, photo
    file_name: Mapped[str] = mapped_column(String(255))
    file_url: Mapped[str] = mapped_column(Text)
    mime_type: Mapped[str | None] = mapped_column(String(100))
    size_bytes: Mapped[int | None] = mapped_column(BigInteger)
    uploaded_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    uploaded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    __table_args__ = (Index("ix_attachments_owner", "owner_type", "owner_id"),)


class CommodityLink(Base, PKMixin):
    """Replaces: seller/buyer/warehouse/logistics/assaying _commodities."""

    __tablename__ = "commodity_links"
    owner_type: Mapped[OwnerType] = mapped_column(enum_col(OwnerType))
    owner_id: Mapped[int] = mapped_column(BigInteger)
    commodity_id: Mapped[int] = mapped_column(ForeignKey("commodities.id", ondelete="CASCADE"), index=True)
    role: Mapped[CommodityRole] = mapped_column(enum_col(CommodityRole), default=CommodityRole.PREFERRED)
    __table_args__ = (UniqueConstraint("owner_type", "owner_id", "commodity_id", "role", name="uq_commodity_link"),)


class NumberSequence(Base, PKMixin):
    """Atomic counter behind every human-readable ID: INSERT .. ON CONFLICT DO UPDATE SET last = last + 1 RETURNING last."""

    __tablename__ = "number_sequences"
    prefix: Mapped[str] = mapped_column(String(60), unique=True)  # e.g. 'AD-UP-121-20260913'
    last: Mapped[int] = mapped_column(BigInteger, default=0)
