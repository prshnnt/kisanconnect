"""Fee maths for a sale, kept free of database code so it is easy to test and reason about.

Two ledgers come out of one sale (this is how a mandi actually settles, see docs/TRADE_FLOW.md):

    BUYER pays     = gross sale value  + buyer-side charges (mandi fee, cess ...)
    SELLER receives = gross sale value - seller-side charges (commission, hamali, weighing, transport ...)

The commission agent's commission is a SELLER-side deduction. It is never added to the buyer's invoice.
"""

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

from app.models.enums import ChargeBasis, ChargeKind, ChargeSide

CENT = Decimal("0.01")
PAYEE = {ChargeKind.MANDI_FEE: "mandi", ChargeKind.COMMISSION: "commission_agent"}


def money(v: Decimal) -> Decimal:
    return v.quantize(CENT, rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class Rule:
    kind: ChargeKind
    side: ChargeSide
    basis: ChargeBasis
    rate: Decimal


@dataclass(frozen=True)
class Line:
    kind: ChargeKind
    side: ChargeSide
    basis: ChargeBasis
    rate: Decimal
    amount: Decimal
    payee: str


@dataclass(frozen=True)
class Breakdown:
    gross: Decimal
    lines: list[Line]
    buyer_charges: Decimal
    seller_deductions: Decimal
    buyer_total: Decimal  # what the buyer must pay
    seller_net: Decimal  # what the seller receives
    commission: Decimal  # the agent's share (also inside seller_deductions)


def amount_for(rule: Rule, gross: Decimal, qty_qtl: Decimal, bags: int) -> Decimal:
    base = {
        ChargeBasis.PERCENT: gross * rule.rate / 100,
        ChargeBasis.PER_QTL: qty_qtl * rule.rate,
        ChargeBasis.PER_BAG: Decimal(bags) * rule.rate,
        ChargeBasis.FLAT: rule.rate,
    }[rule.basis]
    return money(base)


def compute(qty_qtl: Decimal, rate_per_qtl: Decimal, bags: int, rules: list[Rule], has_agent: bool) -> Breakdown:
    """Apply every rule. Commission rules are skipped when the lot has no commission agent (a direct sale pays none)."""
    gross = money(qty_qtl * rate_per_qtl)
    lines = []
    for r in rules:
        if r.kind == ChargeKind.COMMISSION and not has_agent:
            continue
        lines.append(Line(r.kind, r.side, r.basis, r.rate, amount_for(r, gross, qty_qtl, bags), PAYEE.get(r.kind, "provider")))
    buyer = sum((line.amount for line in lines if line.side == ChargeSide.BUYER), Decimal(0))
    seller = sum((line.amount for line in lines if line.side == ChargeSide.SELLER), Decimal(0))
    commission = sum((line.amount for line in lines if line.kind == ChargeKind.COMMISSION), Decimal(0))
    if seller > gross:
        raise ValueError("Seller deductions exceed the sale value")
    return Breakdown(gross, lines, buyer, seller, gross + buyer, gross - seller, commission)


def with_agent_rate(rules: list[Rule], agent_pct: Decimal | None) -> list[Rule]:
    """An agent's own commission rate replaces the APMC's commission percentage. If the APMC has no commission rule,
    the agent's rate still applies (they agreed it with the farmer). Non-percent commission rules are left alone."""
    if agent_pct is None:
        return rules
    out, replaced = [], False
    for r in rules:
        if r.kind == ChargeKind.COMMISSION and r.basis == ChargeBasis.PERCENT:
            out.append(Rule(r.kind, r.side, r.basis, agent_pct))
            replaced = True
        else:
            out.append(r)
    if not replaced:
        out.append(Rule(ChargeKind.COMMISSION, ChargeSide.SELLER, ChargeBasis.PERCENT, agent_pct))
    return out
