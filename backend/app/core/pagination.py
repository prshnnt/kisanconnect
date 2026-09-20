from typing import Any

from fastapi import Query
from pydantic import BaseModel
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession


class PageParams(BaseModel):
    page: int = 1
    page_size: int = 10
    sort: str | None = None


def page_params(
    page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100), sort: str | None = Query(None, description="field or -field")
) -> PageParams:
    return PageParams(page=page, page_size=page_size, sort=sort)


async def paginate(db: AsyncSession, stmt: Select, p: PageParams, *, sortable: dict[str, Any] | None = None, scalars: bool = True) -> dict:
    """Wraps any SELECT into the standard {items, page, page_size, total} envelope."""
    if p.sort and sortable:
        col = sortable.get(p.sort.lstrip("-"))
        if col is not None:
            stmt = stmt.order_by(col.desc() if p.sort.startswith("-") else col.asc())
    total = await db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery()))
    rows = await db.execute(stmt.limit(p.page_size).offset((p.page - 1) * p.page_size))
    items = list(rows.scalars()) if scalars else list(rows.mappings())
    return {"items": items, "page": p.page, "page_size": p.page_size, "total": total or 0}
