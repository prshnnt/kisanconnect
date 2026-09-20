from datetime import date, datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.models import Auction, Demand, EPermit, SaleBill, TradeLicense
from app.models.enums import AuctionStatus, LicenseStatus, PaymentStatus
from app.services import auction as auction_svc
from app.tasks.celery_app import celery, run


async def _with_session(fn):
    engine = create_async_engine(get_settings().database_url)
    try:
        async with async_sessionmaker(engine, expire_on_commit=False)() as db:
            result = await fn(db)
            await db.commit()
            return result
    finally:
        await engine.dispose()


@celery.task(name="app.tasks.jobs.sweep_auctions")
def sweep_auctions() -> int:
    """scheduled -> live at start time, live -> closed at end time."""
    return run(_with_session(auction_svc.close_due))


@celery.task(name="app.tasks.jobs.auto_declare")
def auto_declare() -> int:
    async def work(db):
        now = datetime.now(timezone.utc)
        ids = (
            await db.scalars(
                select(Auction.id).where(
                    Auction.status == AuctionStatus.CLOSED, Auction.is_auto_declare.is_(True), Auction.result_after <= now
                )
            )
        ).all()
        for i in ids:
            await auction_svc.declare(db, i)
        return len(ids)

    return run(_with_session(work))


async def expire_due(db) -> dict:
    """Nightly: expire licences, demands, e-permits; flag overdue bills. Returns rows changed per rule."""
    today = date.today()
    open_bills = [PaymentStatus.PENDING, PaymentStatus.PARTIAL]
    rules = {
        "licences": update(TradeLicense)
        .where(TradeLicense.expires_on < today, TradeLicense.status == LicenseStatus.ACTIVE)
        .values(status=LicenseStatus.EXPIRED),
        "demands": update(Demand).where(Demand.deliver_by < today, Demand.status == "active").values(status="expired"),
        "epermits": update(EPermit).where(EPermit.valid_until < today, EPermit.status == "issued").values(status="expired"),
        "bills_overdue": update(SaleBill)
        .where(SaleBill.due_date < today, SaleBill.payment_status.in_(open_bills))
        .values(payment_status=PaymentStatus.OVERDUE),
    }
    return {name: (await db.execute(stmt)).rowcount for name, stmt in rules.items()}


@celery.task(name="app.tasks.jobs.expire_records")
def expire_records() -> dict:
    return run(_with_session(expire_due))
