from datetime import date

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

_SQL = text(
    "INSERT INTO number_sequences(prefix, last) VALUES (:p, 1) "
    "ON CONFLICT (prefix) DO UPDATE SET last = number_sequences.last + 1 RETURNING last"
)


async def next_number(db: AsyncSession, *parts: str, dated: str | None = "%y%m%d", pad: int = 4) -> str:
    """Atomic, gap-free ID: LOT-UP-260919-0007. `dated` is a strftime format, or None for no date part.
    The counter is per full prefix, so it restarts each day. Never derived from MAX(id)."""
    prefix = "-".join(parts) + (f"-{date.today().strftime(dated)}" if dated else "")
    n = (await db.execute(_SQL, {"p": prefix})).scalar_one()
    return f"{prefix}-{n:0{pad}d}"
