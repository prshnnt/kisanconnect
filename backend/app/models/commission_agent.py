from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin

if TYPE_CHECKING:
    from app.models.commodities import APMC, District, State
    from app.models.lot import Lot
    from app.models.users import User


class CommissionAgent(Base, TimestampMixin):
    __tablename__ = "commission_agents"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    apmc_id: Mapped[int] = mapped_column(
        ForeignKey("apmcs.id"),
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

    firm_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    agent_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    license_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    contact_mobile: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    contact_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    shop_number: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    commission_rate: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Relationships
    user: Mapped[User | None] = relationship("User")
    apmc: Mapped[APMC] = relationship("APMC")
    state: Mapped[State | None] = relationship("State")
    district: Mapped[District | None] = relationship("District")
    lots: Mapped[list[Lot]] = relationship("Lot", back_populates="commission_agent")
