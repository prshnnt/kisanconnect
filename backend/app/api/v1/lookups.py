from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.core.errors import NotFound
from app.db.session import get_db
from app.models import Apmc, Attachment, BagType, CommissionAgent, Commodity, District, State, Tehsil, User, Variety
from app.schemas.common import ORM

router = APIRouter(prefix="/lookups", tags=["D. Lookups"], dependencies=[Depends(current_user)])


class Item(ORM):
    id: int
    name: str


class AgentOut(ORM):
    id: int
    firm_name: str
    agent_name: str
    apmc_id: int


async def _names(db: AsyncSession, model, *where, q: str | None = None, limit: int = 500):
    stmt = select(model.id, model.name).where(*where).order_by(model.name).limit(limit)
    if q:
        stmt = stmt.where(model.name.ilike(f"%{q}%"))
    return [Item(id=i, name=n) for i, n in (await db.execute(stmt)).all()]


@router.get("/states", response_model=list[Item])
async def states(db: AsyncSession = Depends(get_db)):
    return await _names(db, State)


@router.get("/districts", response_model=list[Item])
async def districts(state_id: int, db: AsyncSession = Depends(get_db)):
    return await _names(db, District, District.state_id == state_id)


@router.get("/tehsils", response_model=list[Item])
async def tehsils(district_id: int, db: AsyncSession = Depends(get_db)):
    return await _names(db, Tehsil, Tehsil.district_id == district_id)


@router.get("/apmcs", response_model=list[Item])
async def apmcs(state_id: int, q: str | None = None, db: AsyncSession = Depends(get_db)):
    return await _names(db, Apmc, Apmc.state_id == state_id, q=q)


@router.get("/commodities", response_model=list[Item])
async def commodities(q: str | None = None, db: AsyncSession = Depends(get_db)):
    return await _names(db, Commodity, Commodity.is_active.is_(True), q=q)


@router.get("/commodities/{commodity_id}/varieties", response_model=list[Item])
async def varieties(commodity_id: int, db: AsyncSession = Depends(get_db)):
    return await _names(db, Variety, Variety.commodity_id == commodity_id)


@router.get("/bag-types", response_model=list[Item])
async def bag_types(db: AsyncSession = Depends(get_db)):
    return await _names(db, BagType)


@router.get("/commission-agents", response_model=list[AgentOut])
async def agents(apmc_id: int, q: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    stmt = select(CommissionAgent).where(CommissionAgent.apmc_id == apmc_id, CommissionAgent.is_active.is_(True))
    if q:
        stmt = stmt.where(CommissionAgent.agent_name.ilike(f"%{q}%") | CommissionAgent.firm_name.ilike(f"%{q}%"))
    return (await db.scalars(stmt.limit(50))).all()


ENUMS = {
    "response_times": ["Within 30 Minutes", "30 Minutes to 1 Hour", "Up to 6 Hours", "More Than 6 Hours"],
    "warehouse_types": [
        "Dry Storage",
        "Cold Storage",
        "Controlled Atmosphere (CA)",
        "Refrigerated",
        "Silos",
        "Open Yard",
        "Grading & Sorting Unit",
    ],
    "rental_models": ["Per Bag/Per Day", "Per MT/Per Month", "Fixed Annual Lease", "Per Lot Storage", "Pay-as-you-store"],
    "warehouse_services": ["Grading", "Sorting", "Cleaning", "Packing", "Ripening", "Loading/Unloading", "Pest Control/Fumigation"],
    "logistics_models": ["Door-to-Door", "First Mile Pickup", "Last Mile Delivery", "Inter-State", "Intra-State", "Hub & Spoke"],
    "vehicle_types": [
        "Mini Truck (Tempo, Tata Ace)",
        "Pickup Van",
        "LCV (Light Commercial Vehicle)",
        "HCV (Heavy Commercial Vehicle)",
        "Tractor with Trolley",
        "Reefer Truck (Refrigerated)",
        "Container Truck",
    ],
    "testing_types": ["Chemical Testing", "Physical Testing"],
    "assaying_equipment": [
        "NIR Analyzer (Near Infrared)",
        "Spectrophotometer",
        "Electronic Weighing Scale",
        "Grain Moisture Meter",
        "Sample Divider",
        "Crushing Mill",
    ],
    "service_types": ["weighment", "warehouse", "logistics", "assaying", "assurance", "packaging", "grading", "labour"],
}


@router.get("/enums/{name}", response_model=list[str])
async def enum_values(name: str):
    if name not in ENUMS:
        raise NotFound(f"Enum '{name}'")
    return ENUMS[name]


uploads = APIRouter(prefix="/uploads", tags=["C. Uploads"])
ALLOWED_MIME = {"application/pdf", "image/jpeg", "image/png"}
MAX_BYTES = 10 * 1024 * 1024


class PresignIn(BaseModel):
    file_name: str
    mime_type: str
    size: int


class PresignOut(BaseModel):
    attachment_id: int
    upload_url: str


@uploads.post("/presign", response_model=PresignOut)
async def presign(b: PresignIn, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    from app.core.errors import DomainError

    if b.mime_type not in ALLOWED_MIME or not 0 < b.size <= MAX_BYTES:
        raise DomainError("INVALID_FILE", "Only PDF/JPG/PNG up to 10 MB", 422)
    att = Attachment(file_name=b.file_name[:255], file_url="", mime_type=b.mime_type, size_bytes=b.size, uploaded_by=user.id)
    db.add(att)
    await db.flush()
    att.file_url = f"attachments/{user.id}/{att.id}/{b.file_name}"
    return PresignOut(attachment_id=att.id, upload_url=f"/storage/{att.file_url}")  # swap for an S3 pre-signed URL in prod
