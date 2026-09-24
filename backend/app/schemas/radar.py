from pydantic import BaseModel
from app.schemas.common import Dec


class MandiPriceRadarItem(BaseModel):
    id: str
    apmc_id: int | None = None
    name: str
    km: float
    price: Dec
    min_price: Dec
    max_price: Dec
    pct_change: float
    as_of: str
    estimated_transport_per_qtl: Dec
    net_after_transport: Dec


class PriceRadarOut(BaseModel):
    crop: str
    commodity_id: int | None = None
    distance_km: int
    after_transport: bool
    mandis: list[MandiPriceRadarItem]
