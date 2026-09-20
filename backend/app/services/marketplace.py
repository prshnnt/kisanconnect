from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DomainError, NotFound
from app.models import Address, CommodityLink, ProviderService, ServiceBooking, ServiceCatalog, ServiceProvider, User
from app.models.enums import AddressKind, BookingStatus, NegotiationStatus, OwnerType, PaymentStatus, ServiceType, Venue
from app.schemas.services import BookingIn, CatalogIn, NegotiationIn, ProviderServiceIn
from app.services.numbering import next_number
from app.services.state import move

now = lambda: datetime.now(timezone.utc)  # noqa: E731
PREFIX = {ServiceType.ASSAYING: "AB", ServiceType.WEIGHMENT: "WB", ServiceType.WAREHOUSE: "WH", ServiceType.LOGISTICS: "LR"}


# ---------- provider registration (the 'Preferred Services' forms) ----------
async def upsert_provider_service(db: AsyncSession, provider: ServiceProvider, d: ProviderServiceIn) -> ProviderService:
    provider.notify_by_phone, provider.notify_by_email = d.notify_by_phone, d.notify_by_email
    ps = await db.scalar(
        select(ProviderService).where(ProviderService.provider_id == provider.id, ProviderService.service_type == d.service_type)
    )
    fields = d.model_dump(include={"shop_name", "license_number", "license_expires_on", "response_time", "details"})
    if ps:
        for k, v in fields.items():
            setattr(ps, k, v)
    else:
        ps = ProviderService(provider_id=provider.id, service_type=d.service_type, **fields)
        db.add(ps)
    await db.flush()
    # replace-all for linked commodities and service areas
    await db.execute(delete(CommodityLink).where(CommodityLink.owner_type == OwnerType.PROVIDER, CommodityLink.owner_id == ps.id))
    await db.execute(delete(Address).where(Address.owner_type == OwnerType.PROVIDER, Address.owner_id == ps.id))
    for cid in dict.fromkeys(d.commodity_ids):
        db.add(CommodityLink(owner_type=OwnerType.PROVIDER, owner_id=ps.id, commodity_id=cid, role="expertise"))
    for sid in dict.fromkeys(d.state_ids):
        db.add(Address(owner_type=OwnerType.PROVIDER, owner_id=ps.id, kind=AddressKind.SERVICE_AREA, state_id=sid))
    await db.flush()
    return ps


# ---------- catalogs ----------
async def create_catalog(db: AsyncSession, provider: ServiceProvider, d: CatalogIn) -> ServiceCatalog:
    ps = await db.scalar(
        select(ProviderService).where(ProviderService.provider_id == provider.id, ProviderService.service_type == d.service_type)
    )
    if not ps:
        raise DomainError("SERVICE_NOT_REGISTERED", f"Register your {d.service_type.value} service first", 409)
    cat = ServiceCatalog(provider_service_id=ps.id, **d.model_dump())
    db.add(cat)
    await db.flush()
    return cat


async def own_catalog(db: AsyncSession, provider: ServiceProvider, cid: int) -> ServiceCatalog:
    cat = await db.scalar(
        select(ServiceCatalog)
        .join(ProviderService, ProviderService.id == ServiceCatalog.provider_service_id)
        .where(ServiceCatalog.id == cid, ProviderService.provider_id == provider.id)
    )
    if not cat:
        raise NotFound("Catalog")
    return cat


# ---------- bookings ----------
def log(b: ServiceBooking, to: str, by: int, note: str | None = None) -> None:
    b.history = [*b.history, {"from": b.status.value if b.status else None, "to": to, "by": by, "at": now().isoformat(), "note": note}]


async def create_booking(db: AsyncSession, user: User, d: BookingIn) -> ServiceBooking:
    cat = await db.get(ServiceCatalog, d.catalog_id)
    if not cat or not cat.is_active:
        raise NotFound("Catalog")
    ps = await db.get(ProviderService, cat.provider_service_id)
    provider = await db.get(ServiceProvider, ps.provider_id)
    if provider.user_id == user.id:
        raise DomainError("OWN_SERVICE", "You cannot book your own service", 403)
    if d.scheduled_on and d.scheduled_on < date.today():
        raise DomainError("INVALID_DATE", "Scheduled date is in the past", 422)
    if d.offered_price is not None:
        if not cat.is_negotiable:
            raise DomainError("NOT_NEGOTIABLE", "This service has a fixed price", 409)
        if not cat.min_price <= d.offered_price <= cat.max_price:
            raise DomainError("OFFER_OUT_OF_RANGE", f"Offer must be between {cat.min_price} and {cat.max_price}", 422)
    b = ServiceBooking(
        number=await next_number(db, PREFIX.get(cat.service_type, "SB")),
        catalog_id=cat.id,
        service_type=cat.service_type,
        seeker_id=user.id,
        provider_id=provider.id,
        venue=cat.venue,
        is_free=cat.venue == Venue.INSIDE_APMC and cat.max_price == 0,
        quoted_price=cat.base_price or cat.min_price,
        offered_price=d.offered_price,
        status=BookingStatus.REQUESTED,
        history=[],
        negotiation=NegotiationStatus.REQUESTED if d.offered_price is not None else NegotiationStatus.NA,
        **d.model_dump(include={"lot_id", "scheduled_on", "time_slot", "quantity_qtl", "notes", "details"}),
    )
    log(b, "requested", user.id)
    db.add(b)
    await db.flush()
    return b


async def booking_for(db: AsyncSession, bid: int) -> ServiceBooking:
    b = await db.scalar(select(ServiceBooking).where(ServiceBooking.id == bid).with_for_update())
    if not b:
        raise NotFound("Booking")
    return b


def role_in(b: ServiceBooking, user: User, provider: ServiceProvider | None) -> str:
    if b.seeker_id == user.id:
        return "seeker"
    if provider and b.provider_id == provider.id:
        return "provider"
    raise NotFound("Booking")  # 404 not 403: do not reveal other people's bookings


def transition(b: ServiceBooking, to: BookingStatus, user: User, note: str | None = None) -> None:
    prev = b.status
    move(b, to)
    b.history = [*b.history, {"from": prev.value, "to": to.value, "by": user.id, "at": now().isoformat(), "note": note}]


def accept_price(b: ServiceBooking, price: Decimal) -> None:
    b.final_price, b.negotiation = price, NegotiationStatus.ACCEPTED


async def negotiate(db: AsyncSession, b: ServiceBooking, user: User, side: str, d: NegotiationIn) -> ServiceBooking:
    """seeker: offer / accept / reject   provider: counter / accept / reject   (any finished state is final)"""
    if b.status not in (BookingStatus.REQUESTED, BookingStatus.NEGOTIATING):
        raise DomainError("NEGOTIATION_CLOSED", f"Booking is {b.status.value}", 409)
    cat = await db.get(ServiceCatalog, b.catalog_id)
    if not cat.is_negotiable:
        raise DomainError("NOT_NEGOTIABLE", "This service has a fixed price", 409)
    allowed = {"seeker": {"offer", "accept", "reject"}, "provider": {"counter", "accept", "reject"}}[side]
    if d.action not in allowed:
        raise DomainError("ACTION_NOT_ALLOWED", f"{side} cannot {d.action}", 403)

    if d.action in ("offer", "counter"):
        if d.price is None or not cat.min_price <= d.price <= cat.max_price:
            raise DomainError("OFFER_OUT_OF_RANGE", f"Price must be between {cat.min_price} and {cat.max_price}", 422)
        if d.action == "offer":
            b.offered_price, b.negotiation = d.price, NegotiationStatus.REQUESTED
        else:
            b.counter_price, b.negotiation = d.price, NegotiationStatus.COUNTERED
        if b.status == BookingStatus.REQUESTED:
            transition(b, BookingStatus.NEGOTIATING, user, f"{d.action} {d.price}")
    elif d.action == "accept":
        agreed = b.counter_price if side == "seeker" else b.offered_price  # you accept the OTHER side's number
        if agreed is None:
            raise DomainError("NOTHING_TO_ACCEPT", "The other party has not made an offer", 409)
        accept_price(b, agreed)
        transition(b, BookingStatus.ACCEPTED, user, f"accepted {agreed}")
    else:
        b.negotiation = NegotiationStatus.REJECTED
        transition(b, BookingStatus.REJECTED if side == "provider" else BookingStatus.CANCELLED, user, "rejected")
    return b


async def provider_decide(b: ServiceBooking, user: User, accept: bool) -> ServiceBooking:
    if accept:
        if b.final_price is None:
            b.final_price = b.quoted_price
        transition(b, BookingStatus.ACCEPTED, user)
    else:
        transition(b, BookingStatus.REJECTED, user)
    return b


async def progress(b: ServiceBooking, user: User, to: BookingStatus, details: dict, note: str | None) -> ServiceBooking:
    transition(b, to, user, note)
    b.details = {**b.details, **details}
    if to == BookingStatus.COMPLETED:
        b.completed_at = now()
        if b.is_free or not b.final_price:
            b.payment_status = PaymentStatus.PAID  # nothing to collect
    return b
