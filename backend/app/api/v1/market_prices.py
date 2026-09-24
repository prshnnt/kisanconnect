"""API router for Agmarknet daily market prices & CEDA ingestion management."""

from datetime import date
from typing import Any

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import DailyMarketPrice
from app.services.ceda_ingestion import run_ceda_full_ingestion

router = APIRouter(prefix="/market-prices", tags=["market-prices"])


class DailyMarketPriceOut(BaseModel):
    id: int
    commodity_id: int
    state_id: int | None = None
    district_id: int | None = None
    apmc_id: int | None = None
    price_date: date
    min_price: float | None = None
    max_price: float | None = None
    modal_price: float | None = None
    quantity: float | None = None
    source: str

    model_config = {"from_attributes": True}


class CedaSyncResponse(BaseModel):
    status: str
    timestamp: str
    commodities_synced: int
    states_synced: int
    districts_synced: int
    prices_synced: int


@router.get("", response_model=list[DailyMarketPriceOut])
async def list_market_prices(
    commodity_id: int | None = Query(None, description="Filter by Commodity ID"),
    state_id: int | None = Query(None, description="Filter by State ID"),
    district_id: int | None = Query(None, description="Filter by District ID"),
    apmc_id: int | None = Query(None, description="Filter by APMC ID"),
    from_date: date | None = Query(None, description="Start date filter"),
    to_date: date | None = Query(None, description="End date filter"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve daily market prices ingested from CEDA Agmarknet."""
    stmt = select(DailyMarketPrice)
    if commodity_id is not None:
        stmt = stmt.where(DailyMarketPrice.commodity_id == commodity_id)
    if state_id is not None:
        stmt = stmt.where(DailyMarketPrice.state_id == state_id)
    if district_id is not None:
        stmt = stmt.where(DailyMarketPrice.district_id == district_id)
    if apmc_id is not None:
        stmt = stmt.where(DailyMarketPrice.apmc_id == apmc_id)
    if from_date is not None:
        stmt = stmt.where(DailyMarketPrice.price_date >= from_date)
    if to_date is not None:
        stmt = stmt.where(DailyMarketPrice.price_date <= to_date)

    stmt = stmt.order_by(DailyMarketPrice.price_date.desc()).offset(offset).limit(limit)
    res = await db.scalars(stmt)
    return res.all()


@router.post("/sync-ceda", response_model=CedaSyncResponse)
async def trigger_ceda_sync(
    days_back: int = Query(14, ge=1, le=365, description="Number of past days to ingest prices for"),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Manually trigger CEDA Agmarknet price and geography ingestion."""
    return await run_ceda_full_ingestion(db, days_back=days_back)

