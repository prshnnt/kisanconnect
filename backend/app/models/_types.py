"""Column helpers so models stay short and readable."""

from sqlalchemy import Enum as SAEnum


def enum_col(enum_cls, length: int = 30):
    """Store enums as VARCHAR so adding a value never needs a migration."""
    return SAEnum(enum_cls, native_enum=False, length=length, values_callable=lambda e: [m.value for m in e])
