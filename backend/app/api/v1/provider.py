from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_provider
from app.db.session import get_db
from app.models import ServiceProvider
from app.schemas.provider import (
    CalendarWeekOut,
    JobRequestOut,
    JobRespondIn,
    ProviderEarningsOut,
)
from app.services import provider_ops as provider_svc

router = APIRouter(prefix="/provider", tags=["Provider Services"])


# ---------- Job Management (S1Jobs) ----------
@router.get("/jobs", response_model=list[JobRequestOut])
async def list_jobs(
    p: ServiceProvider = Depends(current_provider),
    db: AsyncSession = Depends(get_db),
):
    return await provider_svc.list_provider_jobs(db, p)


@router.post("/jobs/{jid}/respond")
async def respond_to_job(
    jid: int,
    b: JobRespondIn,
    p: ServiceProvider = Depends(current_provider),
    db: AsyncSession = Depends(get_db),
):
    booking = await provider_svc.respond_to_job(db, p, jid, b)
    return {"message": f"Job response '{b.action}' processed successfully", "booking_id": booking.id, "status": booking.status}


# ---------- Scheduling & Calendar (S4Calendar) ----------
@router.get("/calendar", response_model=CalendarWeekOut)
async def get_calendar(
    start_date: date | None = None,
    p: ServiceProvider = Depends(current_provider),
    db: AsyncSession = Depends(get_db),
):
    return await provider_svc.get_provider_calendar(db, p, start_date=start_date)


# ---------- Earnings Tracking (S5Earnings) ----------
@router.get("/earnings", response_model=ProviderEarningsOut)
async def get_earnings(
    p: ServiceProvider = Depends(current_provider),
    db: AsyncSession = Depends(get_db),
):
    return await provider_svc.get_provider_earnings(db, p)
