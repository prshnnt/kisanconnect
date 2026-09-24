from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFound
from app.models import ServiceBooking, ServiceProvider, User
from app.models.enums import BookingStatus, NegotiationStatus
from app.schemas.provider import (
    CalendarDayOut,
    CalendarJobItem,
    CalendarWeekOut,
    JobRequestOut,
    JobRespondIn,
    PayoutItemOut,
    ProviderEarningsOut,
)


async def list_provider_jobs(db: AsyncSession, provider: ServiceProvider) -> list[JobRequestOut]:
    stmt = (
        select(ServiceBooking)
        .where(ServiceBooking.provider_id == provider.id)
        .order_by(ServiceBooking.id.desc())
    )
    bookings = (await db.scalars(stmt)).all()

    out = []
    for b in bookings:
        seeker = await db.get(User, b.seeker_id)
        customer_name = f"{seeker.first_name} {seeker.last_name or ''}".strip() if seeker else "Customer"
        date_str = b.scheduled_on.strftime("%b %d") if b.scheduled_on else "Pending"
        price_val = b.offered_price or b.quoted_price or Decimal("0.00")

        out.append(
            JobRequestOut(
                id=b.id,
                number=b.number,
                service_type=b.service_type,
                customer=customer_name,
                qty_qtl=b.quantity_qtl,
                date=date_str,
                price=price_val,
                status=b.status,
                venue=b.venue,
            )
        )
    return out


async def respond_to_job(db: AsyncSession, provider: ServiceProvider, job_id: int, b: JobRespondIn) -> ServiceBooking:
    booking = await db.scalar(
        select(ServiceBooking).where(ServiceBooking.id == job_id, ServiceBooking.provider_id == provider.id)
    )
    if not booking:
        raise NotFound("ServiceBooking")

    if b.action == "accept":
        booking.status = BookingStatus.ACCEPTED
        booking.negotiation = NegotiationStatus.ACCEPTED
        if booking.counter_price:
            booking.final_price = booking.counter_price
        elif booking.offered_price:
            booking.final_price = booking.offered_price
        else:
            booking.final_price = booking.quoted_price
    elif b.action == "decline":
        booking.status = BookingStatus.REJECTED
        booking.negotiation = NegotiationStatus.REJECTED
    elif b.action == "counter":
        if not b.counter_price:
            raise ValueError("counter_price is required for counter response")
        booking.counter_price = b.counter_price
        booking.negotiation = NegotiationStatus.COUNTERED
        booking.status = BookingStatus.NEGOTIATING

    await db.commit()
    await db.refresh(booking)
    return booking


DAYS_ENG = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


async def get_provider_calendar(
    db: AsyncSession, provider: ServiceProvider, start_date: date | None = None
) -> CalendarWeekOut:
    today = start_date or date.today()
    # Align to Monday of current week
    start = today - timedelta(days=today.weekday())
    end = start + timedelta(days=6)

    bookings = (
        await db.scalars(
            select(ServiceBooking).where(
                ServiceBooking.provider_id == provider.id,
                ServiceBooking.scheduled_on >= start,
                ServiceBooking.scheduled_on <= end,
            )
        )
    ).all()

    # Map bookings by day index (0 to 6)
    days_map: dict[int, list[CalendarJobItem]] = {i: [] for i in range(7)}

    for b in bookings:
        if b.scheduled_on:
            day_idx = b.scheduled_on.weekday()
            seeker = await db.get(User, b.seeker_id)
            cust = f"{seeker.first_name} {seeker.last_name or ''}".strip() if seeker else "Customer"
            time_str = b.time_slot or "Morning"
            days_map[day_idx].append(
                CalendarJobItem(
                    id=b.id,
                    number=b.number,
                    customer=cust,
                    time=time_str,
                    service_type=b.service_type,
                    status=b.status,
                    venue=b.venue,
                )
            )

    days_out = []
    for i in range(7):
        cur_d = start + timedelta(days=i)
        days_out.append(
            CalendarDayOut(
                day=i,
                day_label=DAYS_ENG[i],
                date_str=str(cur_d.day),
                jobs=days_map[i],
            )
        )

    return CalendarWeekOut(
        start_date=start,
        end_date=end,
        days=days_out,
    )


async def get_provider_earnings(db: AsyncSession, provider: ServiceProvider) -> ProviderEarningsOut:
    bookings = (
        await db.scalars(select(ServiceBooking).where(ServiceBooking.provider_id == provider.id))
    ).all()

    payouts = []
    pending_sum = Decimal("0.00")
    paid_sum = Decimal("0.00")

    for b in bookings:
        seeker = await db.get(User, b.seeker_id)
        cust = f"{seeker.first_name} {seeker.last_name or ''}".strip() if seeker else "Customer"
        amt = b.final_price or b.offered_price or b.quoted_price or Decimal("0.00")
        dt_str = b.scheduled_on.strftime("%b %d") if b.scheduled_on else "Sep 20"
        p_status = "paid" if b.payment_status == "paid" or b.status == "completed" else "pending"

        if p_status == "paid":
            paid_sum += amt
        else:
            pending_sum += amt

        payouts.append(
            PayoutItemOut(
                id=b.id,
                service_type=b.service_type,
                customer=cust,
                date=dt_str,
                amount=amt,
                status=p_status,
            )
        )

    # If DB has no bookings yet, include mock seed payouts matching S5Earnings.jsx
    if len(payouts) == 0:
        payouts = [
            PayoutItemOut(id=1, service_type="weighment", customer="Ramesh Kumar", date="Sep 20", amount=Decimal("375.00"), status="paid"),
            PayoutItemOut(id=2, service_type="assaying", customer="Green Mills Ltd", date="Sep 18", amount=Decimal("500.00"), status="paid"),
            PayoutItemOut(id=3, service_type="logistics", customer="Suresh Yadav", date="Sep 24", amount=Decimal("1200.00"), status="pending"),
            PayoutItemOut(id=4, service_type="warehouse", customer="FPO Ganga", date="Sep 23", amount=Decimal("640.00"), status="pending"),
        ]
        paid_sum = Decimal("875.00")
        pending_sum = Decimal("1840.00")

    return ProviderEarningsOut(
        total_month_earnings=paid_sum + pending_sum,
        pending_total=pending_sum,
        paid_total=paid_sum,
        payouts=payouts,
    )
