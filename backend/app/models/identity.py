"""Who a person is and how they sign in. Seller/Buyer/Provider are role profiles, not separate identities."""

from datetime import date, datetime

from sqlalchemy import ARRAY, Boolean, Date, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, PKMixin, SoftDeleteMixin, TimestampMixin
from app.models._types import enum_col
from app.models.enums import ApmcType, Gender, LicenseStatus, OtpPurpose, SellerType, UserType


class User(Base, PKMixin, TimestampMixin, SoftDeleteMixin):
    """Merges the old User + UserCredential + UserRole (roles = ARRAY, no join table)."""

    __tablename__ = "users"
    uuid: Mapped[str] = mapped_column(String(36), unique=True, server_default=text("gen_random_uuid()::text"))
    user_type: Mapped[UserType] = mapped_column(enum_col(UserType), default=UserType.INDIVIDUAL)
    organization_name: Mapped[str | None] = mapped_column(String(200))  # institutional users (FPOs, firms)
    registered_apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"))

    first_name: Mapped[str] = mapped_column(String(100))
    middle_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    guardian_relation: Mapped[str | None] = mapped_column(String(10))  # s/o | d/o | w/o
    guardian_name: Mapped[str | None] = mapped_column(String(200))
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[Gender | None] = mapped_column(enum_col(Gender))

    mobile: Mapped[str] = mapped_column(String(20), unique=True)
    alt_mobile: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    mobile_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    roles: Mapped[list[str]] = mapped_column(ARRAY(String(30)), default=list)  # values of Role
    password_hash: Mapped[str | None] = mapped_column(String(255))  # load deferred in queries
    failed_logins: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class BankAccount(Base, PKMixin, TimestampMixin):
    __tablename__ = "bank_accounts"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    account_number: Mapped[str] = mapped_column(String(50))
    ifsc: Mapped[str] = mapped_column(String(20))
    holder_name: Mapped[str | None] = mapped_column(String(200))
    bank_name: Mapped[str | None] = mapped_column(String(200))
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    __table_args__ = (Index("uq_one_primary_bank", "user_id", unique=True, postgresql_where=text("is_primary")),)


class Seller(Base, PKMixin, TimestampMixin):
    """Preferences (commodities, locations) live in CommodityLink / Address, not here."""

    __tablename__ = "sellers"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    seller_type: Mapped[SellerType] = mapped_column(enum_col(SellerType), default=SellerType.FARMER)


class Buyer(Base, PKMixin, TimestampMixin):
    __tablename__ = "buyers"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    organization: Mapped[str | None] = mapped_column(String(200), index=True)
    contact_person: Mapped[str | None] = mapped_column(String(150))
    gstin: Mapped[str | None] = mapped_column(String(20))


class TradeLicense(Base, PKMixin, TimestampMixin):
    """Buyer's licence to trade in a state/APMC. Files go in Attachment(owner_type=license)."""

    __tablename__ = "trade_licenses"
    buyer_id: Mapped[int] = mapped_column(ForeignKey("buyers.id", ondelete="CASCADE"), index=True)
    issuing_state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"))
    issuing_apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"))
    operating_state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"), index=True)
    operating_apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"), index=True)
    is_unified: Mapped[bool] = mapped_column(Boolean, default=False)  # single | unified
    apmc_type: Mapped[ApmcType] = mapped_column(enum_col(ApmcType), default=ApmcType.ENAM)
    number: Mapped[str] = mapped_column(String(100))
    issued_on: Mapped[date | None] = mapped_column(Date)
    expires_on: Mapped[date | None] = mapped_column(Date)
    status: Mapped[LicenseStatus] = mapped_column(enum_col(LicenseStatus), default=LicenseStatus.ACTIVE)
    __table_args__ = (UniqueConstraint("buyer_id", "number", name="uq_buyer_license_number"),)


class OtpChallenge(Base, PKMixin, TimestampMixin):
    __tablename__ = "otp_challenges"
    target: Mapped[str] = mapped_column(String(255), index=True)  # mobile or email
    purpose: Mapped[OtpPurpose] = mapped_column(enum_col(OtpPurpose))
    code_hash: Mapped[str] = mapped_column(String(128))  # never store raw OTP
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class RefreshToken(Base, PKMixin, TimestampMixin):
    __tablename__ = "refresh_tokens"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(128), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
