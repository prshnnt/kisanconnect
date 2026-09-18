from datetime import datetime

from sqlalchemy import BigInteger, Text, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.trade_licence import TradeLicenseAttachment

class Attachment(Base):
    __tablename__ = "attachments"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    file_url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    mime_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    file_size_bytes: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )

    uploaded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    trade_license_attachments: Mapped[
        list["TradeLicenseAttachment"]
    ] = relationship(
        "TradeLicenseAttachment",
        back_populates="attachment",
    )