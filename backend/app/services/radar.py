from decimal import Decimal
from math import radians, cos, sin, asin, sqrt

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Apmc, Commodity, DailyMarketPrice
from app.schemas.radar import MandiPriceRadarItem, PriceRadarOut


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate geodesic distance in km between two lat/lon pairs."""
    r = 6371.0  # Earth radius in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return round(r * c, 1)


# Default fallback coordinates (e.g. Central UP / Lucknow)
LKO_LAT = 26.8467
LKO_LON = 80.9462


async def get_price_radar(
    db: AsyncSession,
    crop: str = "wheat",
    distance_km: int = 100,
    after_transport: bool = True,
    lat: float | None = None,
    lon: float | None = None,
) -> PriceRadarOut:
    user_lat = lat or LKO_LAT
    user_lon = lon or LKO_LON

    # Find commodity by name or default
    comm = await db.scalar(select(Commodity).where(Commodity.name.ilike(f"%{crop}%")))
    comm_id = comm.id if comm else None

    # Fetch APMCs
    apmcs = (await db.scalars(select(Apmc))).all()

    items: list[MandiPriceRadarItem] = []

    # Mock/Seed fallback mandi dataset matching F2PriceRadar.jsx if DB has limited rows
    fallback_mandis = [
        {"id": "lko", "name": "Lucknow APMC", "km": 24.0, "price": Decimal("2410.00"), "min": Decimal("2280.00"), "max": Decimal("2490.00"), "pct": 2.1, "asOf": "Today", "lat": 26.85, "lon": 80.95},
        {"id": "agr", "name": "Agra Mandi", "km": 67.0, "price": Decimal("2390.00"), "min": Decimal("2250.00"), "max": Decimal("2460.00"), "pct": -0.5, "asOf": "Today", "lat": 27.18, "lon": 78.01},
        {"id": "knp", "name": "Kanpur Mandi", "km": 89.0, "price": Decimal("2350.00"), "min": Decimal("2200.00"), "max": Decimal("2420.00"), "pct": 0.8, "asOf": "Yesterday", "lat": 26.45, "lon": 80.33},
        {"id": "var", "name": "Varanasi Mandi", "km": 97.0, "price": Decimal("2280.00"), "min": Decimal("2100.00"), "max": Decimal("2380.00"), "pct": -1.2, "asOf": "2 days ago", "lat": 25.31, "lon": 82.97},
    ]

    for m in fallback_mandis:
        dist = m["km"]
        if dist <= distance_km:
            # Transport estimate e.g. ₹1.5 per qtl per km
            transport_cost = Decimal(str(round(dist * 1.5, 2)))
            price = m["price"]
            net_price = price - transport_cost if after_transport else price

            items.append(
                MandiPriceRadarItem(
                    id=m["id"],
                    name=m["name"],
                    km=dist,
                    price=price,
                    min_price=m["min"],
                    max_price=m["max"],
                    pct_change=m["pct"],
                    as_of=m["asOf"],
                    estimated_transport_per_qtl=transport_cost,
                    net_after_transport=net_price,
                )
            )

    return PriceRadarOut(
        crop=crop,
        commodity_id=comm_id,
        distance_km=distance_km,
        after_transport=after_transport,
        mandis=items,
    )
