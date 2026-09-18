from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins.timestamp import TimestampMixin


class BankAccount(Base, TimestampMixin):
    __tablename__ = "bank_accounts"

    id: Mapped[int] = mapped_column(BigInteger,primary_key=True,autoincrement=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"),nullable=False,index=True)

    account_number: Mapped[str] = mapped_column(String(50),nullable=False)

    ifsc_code: Mapped[str] = mapped_column(String(20),nullable=False)

    account_holder_name: Mapped[str | None] = mapped_column(String(200),nullable=True)

    bank_name: Mapped[str | None] = mapped_column(String(200),nullable=True)

    # Relationships
    user = relationship("User",back_populates="bank_accounts")