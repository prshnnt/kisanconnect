from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Date, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.soft_delete import SoftDeleteMixin
from app.db.mixins.timestamp import TimestampMixin
from app.db.mixins.uuid import UUIDMixin

if TYPE_CHECKING:
    from app.models.bank_account import BankAccount
    from app.models.buyer import Buyer
    from app.models.commodities import APMC, District, State, Tehsil
    from app.models.seller import Seller
    from app.models.service_provider import ServiceProvider


class User(
    Base,
    UUIDMixin,
    TimestampMixin,
    SoftDeleteMixin,
):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    registered_apmc_id: Mapped[int | None] = mapped_column(ForeignKey("apmcs.id"), nullable=True, index=True)

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    middle_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    relationship_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    relationship_name: Mapped[str | None] = mapped_column(String(200), nullable=True)

    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(30), nullable=True)

    mobile_number: Mapped[str] = mapped_column(String(20), nullable=False, unique=True, index=True)
    alternate_mobile_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email_address: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True, index=True)

    # Relationships
    registered_apmc: Mapped[APMC | None] = relationship("APMC", back_populates="registered_users")

    addresses: Mapped[list[UserAddress]] = relationship("UserAddress", back_populates="user", cascade="all, delete-orphan")

    bank_accounts: Mapped[list[BankAccount]] = relationship("BankAccount", back_populates="user", cascade="all, delete-orphan")

    roles: Mapped[list[UserRole]] = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")

    seller: Mapped[Seller | None] = relationship("Seller", back_populates="user", uselist=False, cascade="all, delete-orphan")

    buyer: Mapped[Buyer | None] = relationship("Buyer", back_populates="user", uselist=False, cascade="all, delete-orphan")

    service_provider: Mapped[ServiceProvider | None] = relationship("ServiceProvider", back_populates="user", uselist=False, cascade="all, delete-orphan")


class UserRole(Base, TimestampMixin):
    __tablename__ = "user_roles"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    role_type: Mapped[str] = mapped_column(String(30), nullable=False)

    # Relationships
    user: Mapped[User] = relationship("User", back_populates="roles")

    __table_args__ = (UniqueConstraint("user_id", "role_type", name="uq_user_role"),)


class UserAddress(Base, TimestampMixin):
    __tablename__ = "user_addresses"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    address_line_1: Mapped[str | None] = mapped_column(String(255), nullable=True)

    address_line_2: Mapped[str | None] = mapped_column(String(255), nullable=True)

    pincode: Mapped[str | None] = mapped_column(String(10), nullable=True)

    state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"), nullable=True, index=True)

    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"), nullable=True, index=True)

    tehsil_id: Mapped[int | None] = mapped_column(ForeignKey("tehsils.id"), nullable=True, index=True)

    city: Mapped[str | None] = mapped_column(String(100), nullable=True)

    address_type: Mapped[str] = mapped_column(String(30), nullable=False)

    # Relationships
    user: Mapped[User] = relationship("User", back_populates="addresses")

    state: Mapped[State | None] = relationship("State")
    district: Mapped[District | None] = relationship("District")
    tehsil: Mapped[Tehsil | None] = relationship("Tehsil")