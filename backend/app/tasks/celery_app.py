import asyncio

from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings

celery = Celery("kisanconnect", broker=get_settings().redis_url, include=["app.tasks.jobs"])
celery.conf.timezone = "UTC"
celery.conf.beat_schedule = {
    "sweep-auctions": {"task": "app.tasks.jobs.sweep_auctions", "schedule": 60.0},
    "auto-declare": {"task": "app.tasks.jobs.auto_declare", "schedule": 60.0},
    "nightly-expiry": {"task": "app.tasks.jobs.expire_records", "schedule": crontab(hour=0, minute=15)},
    "daily-ceda-price-sync": {"task": "app.tasks.jobs.sync_ceda_prices", "schedule": crontab(hour=1, minute=30)},
}


def run(coro):
    """Celery tasks are sync; each runs one short-lived event loop and disposes its own engine."""
    return asyncio.run(coro)
