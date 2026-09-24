from datetime import date
from pydantic import BaseModel, Field

from app.schemas.common import Dec, ORM


class JobRespondIn(BaseModel):
    action: str
    counter_price: Dec | None = None


class JobRequestOut(ORM):
    id: int
    number: str
    service_type: str
    customer: str
    qty_qtl: Dec | None = None
    date: str
    price: Dec
    status: str
    venue: str


class CalendarJobItem(BaseModel):
    id: int
    number: str
    customer: str
    time: str
    service_type: str
    status: str
    venue: str


class CalendarDayOut(BaseModel):
    day: int
    day_label: str
    date_str: str
    jobs: list[CalendarJobItem]


class CalendarWeekOut(BaseModel):
    start_date: date
    end_date: date
    days: list[CalendarDayOut]


class PayoutItemOut(BaseModel):
    id: int
    service_type: str
    customer: str
    date: str
    amount: Dec
    status: str


class ProviderEarningsOut(BaseModel):
    total_month_earnings: Dec
    pending_total: Dec
    paid_total: Dec
    payouts: list[PayoutItemOut]
