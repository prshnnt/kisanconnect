"""Find Mandis (public). Captcha is server-side, case-sensitive, single-use, 5-minute TTL."""

import base64
import io
import math
import random
import string
import time
import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DomainError
from app.core.security import safe_eq, sha256
from app.db.session import get_db
from app.models import Apmc
from app.schemas.common import ORM

router = APIRouter(tags=["L. Find Mandis"])
_captchas: dict[str, tuple[str, float]] = {}  # in-memory for a single process; use Redis (SETEX) when running >1 worker
TTL = 300


class CaptchaOut(BaseModel):
    captcha_id: str
    image_base64: str


class NearbyIn(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    radius_km: float = Field(20, gt=0, le=200)
    captcha_id: str
    captcha_text: str


class MandiOut(ORM):
    id: int
    name: str
    state_id: int
    distance_km: float | None = None


def _render(text: str) -> str:
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (160, 48), "white")
    d = ImageDraw.Draw(img)
    for _ in range(6):
        d.line([(random.randint(0, 160), random.randint(0, 48)), (random.randint(0, 160), random.randint(0, 48))], fill="gray")
    for i, ch in enumerate(text):
        d.text((10 + i * 24, random.randint(8, 20)), ch, fill="black")
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return base64.b64encode(buf.getvalue()).decode()


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(lng2 - lng1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(a))


@router.get("/captcha", response_model=CaptchaOut)
async def captcha():
    now = time.time()
    for k in [k for k, (_, exp) in _captchas.items() if exp < now]:
        _captchas.pop(k, None)  # sweep expired entries
    text = "".join(random.choices(string.ascii_uppercase.replace("O", "").replace("I", "") + "23456789", k=6))
    cid = uuid.uuid4().hex
    _captchas[cid] = (sha256(text), now + TTL)
    try:
        return CaptchaOut(captcha_id=cid, image_base64=_render(text))
    except ImportError:
        return CaptchaOut(captcha_id=cid, image_base64="")


def _check_captcha(cid: str, text: str) -> None:
    entry = _captchas.pop(cid, None)  # pop => single use, even on a wrong answer
    if not entry or entry[1] < time.time() or not safe_eq(entry[0], sha256(text)):
        raise DomainError("CAPTCHA_INVALID", "Captcha is wrong or expired", 400)


@router.post("/mandis/nearby", response_model=list[MandiOut])
async def nearby(b: NearbyIn, db: AsyncSession = Depends(get_db)):
    _check_captcha(b.captcha_id, b.captcha_text)
    rows = (await db.scalars(select(Apmc).where(Apmc.latitude.is_not(None), Apmc.longitude.is_not(None)))).all()
    hits = [(haversine_km(b.lat, b.lng, float(a.latitude), float(a.longitude)), a) for a in rows]
    return [
        MandiOut(id=a.id, name=a.name, state_id=a.state_id, distance_km=round(d, 2))
        for d, a in sorted((h for h in hits if h[0] <= b.radius_km), key=lambda h: h[0])
    ]


@router.get("/mandis/by-state", response_model=list[MandiOut])
async def by_state(state_id: int, q: str | None = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Apmc).where(Apmc.state_id == state_id).order_by(Apmc.name).limit(500)
    if q:
        stmt = stmt.where(Apmc.name.ilike(f"%{q}%"))
    return [MandiOut(id=a.id, name=a.name, state_id=a.state_id) for a in (await db.scalars(stmt)).all()]
