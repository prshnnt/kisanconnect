from decimal import Decimal
from pydantic import BaseModel, Field

from app.models.enums import ChargeBasis, ChargeKind, ChargeSide
from app.schemas.common import Dec, ORM


class RuleIn(BaseModel):
    apmc_id: int | None = None
    commodity_id: int | None = None
    kind: ChargeKind
    side: ChargeSide
    basis: ChargeBasis
    rate: Dec = Field(gt=0)
    is_active: bool = True


class RuleOut(ORM):
    id: int
    apmc_id: int | None = None
    apmc_name: str | None = None
    commodity_id: int | None = None
    commodity_name: str | None = None
    kind: ChargeKind
    side: ChargeSide
    basis: ChargeBasis
    rate: Dec
    is_active: bool


class RulePreviewIn(BaseModel):
    sale_amount: Dec = Field(default=Decimal("100.00"), gt=0)
    qty_qtl: Dec = Field(default=Decimal("1.00"), gt=0)
    bags: int = Field(default=1, ge=1)
    apmc_id: int | None = None
    commodity_id: int | None = None
    has_agent: bool = True


class RulePreviewOut(BaseModel):
    sale_amount: Dec
    buyer_pays: Dec
    seller_deductions: Dec
    farmer_receives: Dec
    breakdown_lines: list[dict]
