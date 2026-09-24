from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORM


class DisputeIn(BaseModel):
    dispute_type: str
    trade_id: int | None = None
    lot_id: int | None = None
    farmer_id: int | None = None
    buyer_id: int | None = None
    description: str | None = None
    evidence: dict = Field(default_factory=dict)
    sla_hours: int = 48


class DisputeResolveIn(BaseModel):
    resolution_type: str
    resolution_note: str


class DisputeOut(ORM):
    id: int
    number: str
    dispute_type: str
    farmer_id: int | None = None
    buyer_id: int | None = None
    farmer_name: str | None = None
    buyer_name: str | None = None
    trade_id: int | None = None
    lot_id: int | None = None
    description: str | None = None
    evidence: dict = Field(default_factory=dict)
    sla_hours: int = 48
    opened_at: datetime
    elapsed_hours: int = 0
    urgent: bool = False
    status: str = "open"
    resolution_type: str | None = None
    resolution_note: str | None = None
    resolved_at: datetime | None = None


class ProblemReportIn(BaseModel):
    problem_type: str
    deal_id: int | None = None
    description: str | None = None
    photos: list[str] = Field(default_factory=list)
    voice_note_url: str | None = None
