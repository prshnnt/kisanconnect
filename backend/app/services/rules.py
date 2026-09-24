from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFound
from app.models import Apmc, ChargeRule, Commodity
from app.schemas.rules import RuleIn, RulePreviewIn, RulePreviewOut
from app.services.charges import Rule, compute


async def list_rules(db: AsyncSession, apmc_id: int | None = None, is_active: bool | None = None) -> list[dict]:
    stmt = select(ChargeRule).order_by(ChargeRule.id.desc())
    if apmc_id:
        stmt = stmt.where(ChargeRule.apmc_id == apmc_id)
    if is_active is not None:
        stmt = stmt.where(ChargeRule.is_active == is_active)

    rules = (await db.scalars(stmt)).all()
    res = []
    for r in rules:
        apmc_name = "All"
        commodity_name = "All"
        if r.apmc_id:
            apmc = await db.get(Apmc, r.apmc_id)
            if apmc:
                apmc_name = apmc.name
        if r.commodity_id:
            c = await db.get(Commodity, r.commodity_id)
            if c:
                commodity_name = c.name

        res.append({
            "id": r.id,
            "apmc_id": r.apmc_id,
            "apmc_name": apmc_name,
            "commodity_id": r.commodity_id,
            "commodity_name": commodity_name,
            "kind": r.kind,
            "side": r.side,
            "basis": r.basis,
            "rate": r.rate,
            "is_active": r.is_active,
        })
    return res


async def create_rule(db: AsyncSession, b: RuleIn) -> ChargeRule:
    rule = ChargeRule(**b.model_dump())
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule


async def update_rule(db: AsyncSession, rule_id: int, b: RuleIn) -> ChargeRule:
    rule = await db.get(ChargeRule, rule_id)
    if not rule:
        raise NotFound("ChargeRule")
    for k, v in b.model_dump().items():
        setattr(rule, k, v)
    await db.commit()
    await db.refresh(rule)
    return rule


async def delete_rule(db: AsyncSession, rule_id: int) -> None:
    rule = await db.get(ChargeRule, rule_id)
    if not rule:
        raise NotFound("ChargeRule")
    rule.is_active = False
    await db.commit()


async def preview_rules(db: AsyncSession, b: RulePreviewIn) -> RulePreviewOut:
    stmt = select(ChargeRule).where(ChargeRule.is_active.is_(True))
    if b.apmc_id:
        stmt = stmt.where((ChargeRule.apmc_id == b.apmc_id) | (ChargeRule.apmc_id.is_(None)))
    if b.commodity_id:
        stmt = stmt.where((ChargeRule.commodity_id == b.commodity_id) | (ChargeRule.commodity_id.is_(None)))

    db_rules = (await db.scalars(stmt)).all()
    domain_rules = [Rule(kind=r.kind, side=r.side, basis=r.basis, rate=r.rate) for r in db_rules]

    bd = compute(
        qty_qtl=b.qty_qtl,
        rate_per_qtl=b.sale_amount / b.qty_qtl,
        bags=b.bags,
        rules=domain_rules,
        has_agent=b.has_agent,
    )

    lines = [
        {
            "kind": line.kind,
            "side": line.side,
            "basis": line.basis,
            "rate": str(line.rate),
            "amount": str(line.amount),
            "payee": line.payee,
        }
        for line in bd.lines
    ]

    return RulePreviewOut(
        sale_amount=bd.gross,
        buyer_pays=bd.buyer_total,
        seller_deductions=bd.seller_deductions,
        farmer_receives=bd.seller_net,
        breakdown_lines=lines,
    )
