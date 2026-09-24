from datetime import date
from pydantic import BaseModel, Field

from app.schemas.common import ORM


class BuyerLicenseOut(ORM):
    id: int
    name: str
    number: str
    status: str
    issued_on: date | None = None
    expires_on: date | None = None
    days_to_expire: int | None = None
    is_unified: bool = False


class ComplianceDocIn(BaseModel):
    name: str
    kind: str = "licence"
    file_url: str | None = None
    number: str | None = None


class ComplianceDocOut(ORM):
    id: int
    name: str
    kind: str
    file_url: str | None = None
    uploaded_at: str | None = None


class BuyerTrustOut(BaseModel):
    buyer_id: int
    is_verified: bool
    verification_label: str
    trust_score: float
    completed_deals_count: int
    expiring_licenses_count: int
    licenses: list[BuyerLicenseOut]
    documents: list[ComplianceDocOut]
