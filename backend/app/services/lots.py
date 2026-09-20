from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DomainError, NotFound
from app.models import Address, Apmc, CommissionAgent, Demand, EPermit, Lot, Seller, State, Supply
from app.models.enums import AddressKind, LotStatus, OwnerType, SaleType
from app.schemas.lots import DemandIn, LotIn, LotPatch, SupplyIn
from app.services.numbering import next_number
from app.services.profile import link_attachments
from app.services.state import move


async def _state_code(db: AsyncSession, state_id: int | None) -> str:
    st = await db.get(State, state_id) if state_id else None
    return (st.code or st.name[:2]).upper() if st else "XX"


async def create_lot(db: AsyncSession, seller: Seller, d: LotIn, activate: bool) -> Lot:
    if d.commission_agent_id:
        agent = await db.get(CommissionAgent, d.commission_agent_id)
        if not agent or (d.apmc_id and agent.apmc_id != d.apmc_id):
            raise DomainError("INVALID_AGENT", "Commission agent does not belong to the chosen APMC", 422)

    state_id = d.location.state_id if d.location else None
    if d.apmc_id:
        apmc = await db.get(Apmc, d.apmc_id)
        if not apmc:
            raise NotFound("APMC")
        state_id = apmc.state_id

    lot = Lot(
        seller_id=seller.id,
        number=await next_number(db, "LOT", await _state_code(db, state_id)),
        **d.model_dump(
            include={
                "lot_type",
                "sale_type",
                "commodity_id",
                "variety_id",
                "speciality",
                "bag_type_id",
                "bags",
                "quantity_qtl",
                "min_price",
                "vehicle_type",
                "vehicle_number",
                "commission_agent_id",
                "apmc_id",
            }
        )
    )
    if d.bid:
        lot.bid_start_at, lot.bid_duration_min, lot.result_after = d.bid.start_at, d.bid.duration_minutes, d.bid.result_after
        lot.is_closed_bid, lot.delivery_mode = d.bid.is_closed_bid, d.bid.delivery_mode

    if d.sale_type == SaleType.SECONDARY:
        permit = await db.scalar(select(EPermit).where(EPermit.number == d.secondary.epermit_number))
        if not permit or permit.status != "issued" or (permit.valid_until and permit.valid_until < date.today()):
            raise DomainError("INVALID_EPERMIT", "e-Permit not found, used or expired", 422)
        lot.epermit_id, lot.source_state_id = permit.id, d.secondary.source_state_id
        lot.source_apmc_id, lot.is_enam_trade = d.secondary.source_apmc_id, d.secondary.is_enam_trade
        lot.fee_applicable = d.secondary.fee_applicable
        permit.status = "used"

    db.add(lot)
    await db.flush()
    if d.location:
        db.add(
            Address(owner_type=OwnerType.LOT, owner_id=lot.id, kind=AddressKind.LOT, **d.location.model_dump(exclude={"same_as_permanent"}))
        )
    if d.attachment_ids:
        await link_attachments(db, d.attachment_ids, OwnerType.LOT, lot.id, "photo")
    if activate:
        move(lot, LotStatus.ACTIVE)
    await db.flush()
    return lot


async def own_lot(db: AsyncSession, seller: Seller, lot_id: int) -> Lot:
    lot = await db.scalar(select(Lot).where(Lot.id == lot_id, Lot.seller_id == seller.id).with_for_update())
    if not lot:
        raise NotFound("Lot")
    return lot


async def patch_lot(db: AsyncSession, seller: Seller, lot_id: int, d: LotPatch) -> Lot:
    from app.models import Auction

    lot = await own_lot(db, seller, lot_id)
    if lot.status not in (LotStatus.DRAFT, LotStatus.ACTIVE):
        raise DomainError("LOT_LOCKED", "Only draft or active lots can be edited", 409)
    if await db.scalar(select(Auction.id).where(Auction.lot_id == lot.id)):
        raise DomainError("LOT_LOCKED", "Lot already has an auction", 409)
    for k, v in d.model_dump(exclude_unset=True).items():
        setattr(lot, k, v)
    return lot


async def create_supply(db: AsyncSession, seller: Seller, d: SupplyIn) -> Supply:
    state = await _state_code(db, d.location.state_id)
    s = Supply(seller_id=seller.id, number=await next_number(db, "AS", state), **d.model_dump(exclude={"location"}))
    db.add(s)
    await db.flush()
    db.add(
        Address(owner_type=OwnerType.SUPPLY, owner_id=s.id, kind=AddressKind.LOT, **d.location.model_dump(exclude={"same_as_permanent"}))
    )
    return s


async def create_demand(db: AsyncSession, buyer, d: DemandIn) -> Demand:
    """Portal format: AD-<STATE>-<buyer id>-<YYYYMMDD>-<seq>, e.g. AD-UP-121-20260913-1"""
    number = await next_number(db, "AD", await _state_code(db, d.location.state_id), str(buyer.id), dated="%Y%m%d", pad=1)
    dm = Demand(buyer_id=buyer.id, number=number, **d.model_dump(exclude={"location"}))
    db.add(dm)
    await db.flush()
    db.add(
        Address(
            owner_type=OwnerType.DEMAND, owner_id=dm.id, kind=AddressKind.DELIVERY, **d.location.model_dump(exclude={"same_as_permanent"})
        )
    )
    return dm
