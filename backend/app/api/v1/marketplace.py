from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_provider, current_user, require_roles
from app.core.errors import NotFound
from app.core.pagination import PageParams, page_params, paginate
from app.db.session import get_db
from app.models import ProviderService, ServiceBooking, ServiceCatalog, ServiceProvider, User
from app.models.enums import BookingStatus, ServiceType, Venue
from app.schemas.common import Page
from app.schemas.services import (
    BookingAction,
    BookingIn,
    BookingOut,
    CatalogIn,
    CatalogOut,
    NegotiationIn,
    ProviderServiceIn,
    ProviderServiceOut,
)
from app.services import marketplace as svc

router = APIRouter(tags=["C/I/J. Service marketplace"])


# ---------- provider: registration + catalogs ----------
@router.put("/service-profiles", response_model=ProviderServiceOut)
async def register_service(b: ProviderServiceIn, p: ServiceProvider = Depends(current_provider), db: AsyncSession = Depends(get_db)):
    return await svc.upsert_provider_service(db, p, b)


@router.get("/service-profiles/me", response_model=list[ProviderServiceOut])
async def my_services(p: ServiceProvider = Depends(current_provider), db: AsyncSession = Depends(get_db)):
    return (await db.scalars(select(ProviderService).where(ProviderService.provider_id == p.id))).all()


@router.post("/catalogs", response_model=CatalogOut, status_code=201)
async def create_catalog(b: CatalogIn, p: ServiceProvider = Depends(current_provider), db: AsyncSession = Depends(get_db)):
    return await svc.create_catalog(db, p, b)


@router.get("/catalogs/mine", response_model=Page[CatalogOut])
async def my_catalogs(
    service_type: ServiceType | None = None,
    pg: PageParams = Depends(page_params),
    p: ServiceProvider = Depends(current_provider),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ServiceCatalog)
        .join(ProviderService, ProviderService.id == ServiceCatalog.provider_service_id)
        .where(ProviderService.provider_id == p.id)
        .order_by(ServiceCatalog.id.desc())
    )
    if service_type:
        stmt = stmt.where(ServiceCatalog.service_type == service_type)
    return await paginate(db, stmt, pg)


@router.patch("/catalogs/{cid}", response_model=CatalogOut)
async def edit_catalog(cid: int, b: CatalogIn, p: ServiceProvider = Depends(current_provider), db: AsyncSession = Depends(get_db)):
    cat = await svc.own_catalog(db, p, cid)
    for k, v in b.model_dump().items():
        setattr(cat, k, v)
    return cat


@router.delete("/catalogs/{cid}", status_code=204)
async def deactivate_catalog(cid: int, p: ServiceProvider = Depends(current_provider), db: AsyncSession = Depends(get_db)):
    (await svc.own_catalog(db, p, cid)).is_active = False  # soft: bookings keep their reference


# ---------- seeker: browse ----------
@router.get("/services", response_model=Page[CatalogOut])
async def browse(
    service_type: ServiceType,
    venue: Venue | None = None,
    state_id: int | None = None,
    commodity_id: int | None = None,
    q: str | None = None,
    max_price: float | None = None,
    pg: PageParams = Depends(page_params),
    _: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    """All Services (S31): tab = `venue`."""
    stmt = (
        select(ServiceCatalog)
        .where(ServiceCatalog.service_type == service_type, ServiceCatalog.is_active.is_(True))
        .order_by(ServiceCatalog.min_price)
    )
    for col, val in ((ServiceCatalog.venue, venue), (ServiceCatalog.state_id, state_id), (ServiceCatalog.commodity_id, commodity_id)):
        if val is not None:
            stmt = stmt.where(col == val)
    if q:
        stmt = stmt.where(ServiceCatalog.name.ilike(f"%{q}%"))
    if max_price is not None:
        stmt = stmt.where(ServiceCatalog.min_price <= max_price)
    return await paginate(db, stmt, pg, sortable={"min_price": ServiceCatalog.min_price, "name": ServiceCatalog.name})


@router.get("/services/{cid}", response_model=CatalogOut)
async def service_detail(cid: int, _: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    cat = await db.get(ServiceCatalog, cid)
    if not cat or not cat.is_active:
        raise NotFound("Service")
    return cat


# ---------- bookings ----------
async def _ctx(db: AsyncSession, user: User, bid: int):
    provider = await db.scalar(select(ServiceProvider).where(ServiceProvider.user_id == user.id))
    b = await svc.booking_for(db, bid)
    return b, svc.role_in(b, user, provider)


@router.post("/bookings", response_model=BookingOut, status_code=201)
async def request_booking(b: BookingIn, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    return await svc.create_booking(db, user, b)


@router.get("/bookings/mine", response_model=Page[BookingOut])
async def my_bookings(
    service_type: ServiceType | None = None,
    venue: Venue | None = None,
    free: bool | None = None,
    status: BookingStatus | None = None,
    pg: PageParams = Depends(page_params),
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    """Seeker view (S33). Tabs: Outside APMC = venue=outside_apmc, Free Inside = venue=inside_apmc&free=true, Paid Inside = free=false."""
    stmt = select(ServiceBooking).where(ServiceBooking.seeker_id == user.id).order_by(ServiceBooking.id.desc())
    for col, val in (
        (ServiceBooking.service_type, service_type),
        (ServiceBooking.venue, venue),
        (ServiceBooking.is_free, free),
        (ServiceBooking.status, status),
    ):
        if val is not None:
            stmt = stmt.where(col == val)
    return await paginate(db, stmt, pg)


@router.get("/bookings/received", response_model=Page[BookingOut])
async def received(
    service_type: ServiceType | None = None,
    status: BookingStatus | None = None,
    pg: PageParams = Depends(page_params),
    p: ServiceProvider = Depends(current_provider),
    db: AsyncSession = Depends(get_db),
):
    """Provider view: 'Service Requests Received' (S47)."""
    stmt = select(ServiceBooking).where(ServiceBooking.provider_id == p.id).order_by(ServiceBooking.id.desc())
    if service_type:
        stmt = stmt.where(ServiceBooking.service_type == service_type)
    if status:
        stmt = stmt.where(ServiceBooking.status == status)
    return await paginate(db, stmt, pg)


@router.get("/bookings/{bid}", response_model=BookingOut)
async def booking_detail(bid: int, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    return (await _ctx(db, user, bid))[0]


@router.post("/bookings/{bid}/negotiation", response_model=BookingOut)
async def negotiation(bid: int, b: NegotiationIn, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    booking, side = await _ctx(db, user, bid)
    return await svc.negotiate(db, booking, user, side, b)


@router.post("/bookings/{bid}/accept", response_model=BookingOut)
async def accept(bid: int, user: User = Depends(require_roles("service_provider")), db: AsyncSession = Depends(get_db)):
    booking, side = await _ctx(db, user, bid)
    if side != "provider":
        raise NotFound("Booking")
    return await svc.provider_decide(booking, user, True)


@router.post("/bookings/{bid}/reject", response_model=BookingOut)
async def reject(bid: int, user: User = Depends(require_roles("service_provider")), db: AsyncSession = Depends(get_db)):
    booking, side = await _ctx(db, user, bid)
    if side != "provider":
        raise NotFound("Booking")
    return await svc.provider_decide(booking, user, False)


@router.post("/bookings/{bid}/start", response_model=BookingOut)
async def start(bid: int, b: BookingAction, user: User = Depends(require_roles("service_provider")), db: AsyncSession = Depends(get_db)):
    booking, side = await _ctx(db, user, bid)
    if side != "provider":
        raise NotFound("Booking")
    return await svc.progress(booking, user, BookingStatus.IN_PROGRESS, b.details, b.note)


@router.post("/bookings/{bid}/complete", response_model=BookingOut)
async def complete(bid: int, b: BookingAction, user: User = Depends(require_roles("service_provider")), db: AsyncSession = Depends(get_db)):
    booking, side = await _ctx(db, user, bid)
    if side != "provider":
        raise NotFound("Booking")
    return await svc.progress(booking, user, BookingStatus.COMPLETED, b.details, b.note)


@router.post("/bookings/{bid}/cancel", response_model=BookingOut)
async def cancel(bid: int, b: BookingAction, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    booking, _side = await _ctx(db, user, bid)
    svc.transition(booking, BookingStatus.CANCELLED, user, b.note)
    return booking
