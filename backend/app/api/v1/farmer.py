from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_seller, current_user
from app.db.session import get_db
from app.models import Seller, User
from app.schemas.disputes import DisputeOut, ProblemReportIn
from app.schemas.radar import PriceRadarOut
from app.services import disputes as dispute_svc
from app.services import radar as radar_svc

router = APIRouter(prefix="/farmer", tags=["Farmer Features"])


# ---------- Problem/Complaint Reporting (F17Problem) ----------
@router.post("/problems", response_model=DisputeOut, status_code=201)
async def report_problem(
    b: ProblemReportIn,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    dispute = await dispute_svc.create_dispute(db, user, b)
    items = await dispute_svc.list_disputes(db)
    for item in items:
        if item["id"] == dispute.id:
            return item
    return dispute


@router.get("/problems", response_model=list[DisputeOut])
async def list_problems(
    seller: Seller = Depends(current_seller),
    db: AsyncSession = Depends(get_db),
):
    items = await dispute_svc.list_disputes(db)
    return [i for i in items if i.get("farmer_id") == seller.id]


# ---------- Price Radar & Analytics (F2PriceRadar) ----------
@router.get("/price-radar", response_model=PriceRadarOut)
async def get_price_radar(
    crop: str = "wheat",
    distance_km: int = 100,
    after_transport: bool = True,
    lat: float | None = None,
    lon: float | None = None,
    _: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    return await radar_svc.get_price_radar(
        db=db,
        crop=crop,
        distance_km=distance_km,
        after_transport=after_transport,
        lat=lat,
        lon=lon,
    )
