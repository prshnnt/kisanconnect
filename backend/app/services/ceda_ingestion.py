"""CEDA Agmarknet Data Ingestion Service.

Syncs geographies (States, Districts), Commodities, Markets (APMCs), and Daily Market Prices/Quantities
from CEDA API into KisanConnect PostgreSQL database.
"""

import asyncio
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Apmc, Commodity, DailyMarketPrice, District, State
from app.services.ceda import CEDAClient

logger = logging.getLogger(__name__)


async def sync_commodities(db: AsyncSession, client: CEDAClient) -> int:
    """Sync list of commodities from CEDA Agmarknet into commodities table."""
    commodities_data = await client.fetch_commodities()
    if not commodities_data:
        logger.info("No commodities returned from CEDA API")
        return 0

    count = 0
    for item in commodities_data:
        c_id = item.get("commodity_id") or item.get("id")
        c_name = item.get("commodity_name") or item.get("name")
        if not c_name:
            continue

        c_code = f"AGM-{c_id}" if c_id else None
        existing = await db.scalar(select(Commodity).where(Commodity.name == c_name))
        if not existing:
            db.add(Commodity(name=c_name, code=c_code, category="General", is_active=True))
            count += 1
        elif c_code and not existing.code:
            existing.code = c_code
            count += 1

    await db.flush()
    logger.info("Synced %d commodities from CEDA API", count)
    return count


async def sync_geographies(db: AsyncSession, client: CEDAClient) -> dict[str, int]:
    """Sync states and districts from CEDA Agmarknet into states & districts tables."""
    geographies_data = await client.fetch_geographies()
    if not geographies_data:
        logger.info("No geographies returned from CEDA API")
        return {"states": 0, "districts": 0}

    states_count = 0
    districts_count = 0

    # Build state mapping cache
    existing_states = {s.name: s for s in (await db.scalars(select(State))).all()}
    existing_districts = {(d.state_id, d.name): d for d in (await db.scalars(select(District))).all()}

    for item in geographies_data:
        s_name = item.get("census_state_name") or item.get("state_name")
        d_name = item.get("census_district_name") or item.get("district_name")
        s_id_val = item.get("census_state_id") or item.get("state_id")

        if not s_name:
            continue

        state_obj = existing_states.get(s_name)
        if not state_obj:
            state_code = f"ST-{s_id_val}" if s_id_val else None
            state_obj = State(name=s_name, code=state_code)
            db.add(state_obj)
            await db.flush()
            existing_states[s_name] = state_obj
            states_count += 1

        if d_name:
            key = (state_obj.id, d_name)
            if key not in existing_districts:
                dist_obj = District(state_id=state_obj.id, name=d_name)
                db.add(dist_obj)
                await db.flush()
                existing_districts[key] = dist_obj
                districts_count += 1

    logger.info("Synced %d states and %d districts from CEDA API", states_count, districts_count)
    return {"states": states_count, "districts": districts_count}


async def sync_markets_for_district(
    db: AsyncSession, client: CEDAClient, commodity_id: int, state_id: int, district_id: int, db_state_id: int, db_district_id: int
) -> int:
    """Sync markets for a specific state & district into apmcs table."""
    markets_data = await client.fetch_markets(commodity_id=commodity_id, state_id=state_id, district_id=district_id)
    if not markets_data:
        return 0

    existing_apmcs = {a.name: a for a in (await db.scalars(select(Apmc).where(Apmc.state_id == db_state_id))).all()}
    count = 0

    for item in markets_data:
        m_name = item.get("market_name")
        if not m_name:
            continue

        if m_name not in existing_apmcs:
            apmc_obj = Apmc(
                name=m_name,
                state_id=db_state_id,
                district_id=db_district_id,
                address=f"{m_name} Mandi",
            )
            db.add(apmc_obj)
            existing_apmcs[m_name] = apmc_obj
            count += 1

    if count > 0:
        await db.flush()
    return count


async def sync_daily_prices(
    db: AsyncSession,
    client: CEDAClient,
    from_date: date,
    to_date: date,
    limit_commodities: int = 5,
) -> int:
    """Fetch daily market prices and quantities from CEDA API in minimal bulk requests."""
    commodities = (await db.scalars(select(Commodity).limit(limit_commodities))).all()
    if not commodities:
        return 0

    state_map = {s.code: s.id for s in (await db.scalars(select(State))).all() if s.code}
    apmcs_by_name = {a.name: a.id for a in (await db.scalars(select(Apmc))).all()}

    total_records = 0
    from_str = from_date.isoformat()
    to_str = to_date.isoformat()

    for comm in commodities:
        ceda_comm_id = 1
        if comm.code and comm.code.startswith("AGM-"):
            try:
                ceda_comm_id = int(comm.code.split("-")[1])
            except ValueError:
                ceda_comm_id = comm.id
        else:
            ceda_comm_id = comm.id

        # Query with state_id=0 (All India level) to fetch prices for all regions in 1 single call per commodity
        price_records = await client.fetch_prices(
            commodity_id=ceda_comm_id,
            state_id=0,
            from_date=from_str,
            to_date=to_str,
        )
        await asyncio.sleep(1.0)  # Rate limiting safety delay

        if not price_records:
            continue

        for rec in price_records:
            rec_date_str = rec.get("date")
            if not rec_date_str:
                continue

            rec_date = datetime.fromisoformat(rec_date_str.replace("Z", "+00:00")).date()
            min_p = Decimal(str(rec.get("min_price"))) if rec.get("min_price") is not None else None
            max_p = Decimal(str(rec.get("max_price"))) if rec.get("max_price") is not None else None
            modal_p = Decimal(str(rec.get("modal_price"))) if rec.get("modal_price") is not None else None

            c_state_id = rec.get("census_state_id")
            st_id = state_map.get(f"ST-{c_state_id}") if c_state_id else None

            apmc_id = None
            m_id = rec.get("market_id")
            if m_id:
                apmc_id = apmcs_by_name.get(f"APMC-{m_id}") or (
                    list(apmcs_by_name.values())[0] if apmcs_by_name else None
                )

            stmt = select(DailyMarketPrice).where(
                DailyMarketPrice.apmc_id == apmc_id,
                DailyMarketPrice.commodity_id == comm.id,
                DailyMarketPrice.price_date == rec_date,
            )
            existing = await db.scalar(stmt)
            if not existing:
                db.add(
                    DailyMarketPrice(
                        commodity_id=comm.id,
                        state_id=st_id,
                        apmc_id=apmc_id,
                        price_date=rec_date,
                        min_price=min_p,
                        max_price=max_p,
                        modal_price=modal_p,
                        source="agmarknet_ceda",
                    )
                )
                total_records += 1
            else:
                existing.min_price = min_p
                existing.max_price = max_p
                existing.modal_price = modal_p

        await db.flush()

    logger.info("Successfully ingested %d daily price records from CEDA API", total_records)
    return total_records


async def run_ceda_full_ingestion(db: AsyncSession, days_back: int = 14) -> dict[str, Any]:
    """Master orchestrator for CEDA Agmarknet data ingestion."""
    logger.info("Starting CEDA Agmarknet full data ingestion...")
    client = CEDAClient()

    commodities_synced = await sync_commodities(db, client)
    geo_synced = await sync_geographies(db, client)

    today = date.today()
    from_d = today - timedelta(days=days_back)
    prices_synced = await sync_daily_prices(db, client, from_date=from_d, to_date=today)

    await db.commit()
    result = {
        "status": "success",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "commodities_synced": commodities_synced,
        "states_synced": geo_synced.get("states", 0),
        "districts_synced": geo_synced.get("districts", 0),
        "prices_synced": prices_synced,
    }
    logger.info("CEDA ingestion completed: %s", result)
    return result
