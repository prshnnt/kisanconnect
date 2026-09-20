import io
from datetime import date

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_buyer, current_seller
from app.core.errors import NotFound
from app.core.pagination import PageParams, page_params, paginate
from app.db.session import get_db
from app.models import Address, Buyer, Demand, Lot, Seller, Supply
from app.models.enums import AddressKind, LotStatus, LotType, OwnerType, SaleType
from app.schemas.common import Page
from app.schemas.lots import DemandIn, DemandOut, LotIn, LotOut, LotPatch, SupplyIn, SupplyOut
from app.services import lots as svc
from app.services.state import move

router = APIRouter(tags=["E. Lots, Supply, Demand"])
LOT_SORT = {"created_at": Lot.created_at, "quantity_qtl": Lot.quantity_qtl, "status": Lot.status, "number": Lot.number}


def _lot_query(seller: Seller, status, commodity_id, lot_type, sale_type, date_from, date_to, q):
    stmt = select(Lot).where(Lot.seller_id == seller.id).order_by(Lot.id.desc())
    for col, val in ((Lot.status, status), (Lot.commodity_id, commodity_id), (Lot.lot_type, lot_type), (Lot.sale_type, sale_type)):
        if val is not None:
            stmt = stmt.where(col == val)
    if date_from:
        stmt = stmt.where(Lot.created_at >= date_from)
    if date_to:
        stmt = stmt.where(Lot.created_at < date.fromordinal(date_to.toordinal() + 1))
    if q:
        stmt = stmt.where(Lot.number.ilike(f"%{q}%"))
    return stmt


@router.post("/lots", response_model=LotOut, status_code=201)
async def create_lot(b: LotIn, activate: bool = False, seller: Seller = Depends(current_seller), db: AsyncSession = Depends(get_db)):
    return await svc.create_lot(db, seller, b, activate)


@router.get("/lots", response_model=Page[LotOut])
async def my_lots(
    status: LotStatus | None = None,
    commodity_id: int | None = None,
    lot_type: LotType | None = None,
    sale_type: SaleType | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    q: str | None = None,
    p: PageParams = Depends(page_params),
    seller: Seller = Depends(current_seller),
    db: AsyncSession = Depends(get_db),
):
    return await paginate(db, _lot_query(seller, status, commodity_id, lot_type, sale_type, date_from, date_to, q), p, sortable=LOT_SORT)


@router.get("/lots/export")
async def export_lots(status: LotStatus | None = None, seller: Seller = Depends(current_seller), db: AsyncSession = Depends(get_db)):
    rows = (await db.scalars(_lot_query(seller, status, None, None, None, None, None, None).limit(5000))).all()
    wb = Workbook()
    ws = wb.active
    ws.title = "Lots"
    ws.append(["Lot Code", "Type", "Sale", "Commodity ID", "Bags", "Quantity (QTL)", "Min Price", "Status", "Created"])
    for r in rows:
        ws.append(
            [
                r.number,
                r.lot_type.value,
                r.sale_type.value,
                r.commodity_id,
                r.bags,
                float(r.quantity_qtl),
                float(r.min_price) if r.min_price is not None else None,
                r.status.value,
                r.created_at.isoformat(),
            ]
        )
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=my_lots.xlsx"},
    )


@router.get("/lots/{lot_id}", response_model=LotOut)
async def get_lot(lot_id: int, seller: Seller = Depends(current_seller), db: AsyncSession = Depends(get_db)):
    lot = await db.scalar(select(Lot).where(Lot.id == lot_id, Lot.seller_id == seller.id))
    if not lot:
        raise NotFound("Lot")
    return lot


@router.patch("/lots/{lot_id}", response_model=LotOut)
async def patch_lot(lot_id: int, b: LotPatch, seller: Seller = Depends(current_seller), db: AsyncSession = Depends(get_db)):
    return await svc.patch_lot(db, seller, lot_id, b)


@router.post("/lots/{lot_id}/activate", response_model=LotOut)
async def activate_lot(lot_id: int, seller: Seller = Depends(current_seller), db: AsyncSession = Depends(get_db)):
    return move(await svc.own_lot(db, seller, lot_id), LotStatus.ACTIVE)


@router.post("/lots/{lot_id}/cancel", response_model=LotOut)
async def cancel_lot(lot_id: int, seller: Seller = Depends(current_seller), db: AsyncSession = Depends(get_db)):
    return move(await svc.own_lot(db, seller, lot_id), LotStatus.CANCELLED)


# ---- advance supply ----
@router.post("/advance-supplies", response_model=SupplyOut, status_code=201)
async def create_supply(b: SupplyIn, seller: Seller = Depends(current_seller), db: AsyncSession = Depends(get_db)):
    return await svc.create_supply(db, seller, b)


@router.get("/advance-supplies", response_model=Page[SupplyOut])
async def my_supplies(p: PageParams = Depends(page_params), seller: Seller = Depends(current_seller), db: AsyncSession = Depends(get_db)):
    return await paginate(
        db,
        select(Supply).where(Supply.seller_id == seller.id).order_by(Supply.id.desc()),
        p,
        sortable={"available_from": Supply.available_from, "expected_price": Supply.expected_price},
    )


@router.get("/advance-supplies/market", response_model=Page[SupplyOut])
async def supply_market(
    commodity_id: int | None = None,
    p: PageParams = Depends(page_params),
    _: Buyer = Depends(current_buyer),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Supply).where(Supply.available_to >= date.today()).order_by(Supply.available_from)
    if commodity_id:
        stmt = stmt.where(Supply.commodity_id == commodity_id)
    return await paginate(db, stmt, p)


@router.delete("/advance-supplies/{sid}", status_code=204)
async def delete_supply(sid: int, seller: Seller = Depends(current_seller), db: AsyncSession = Depends(get_db)):
    s = await db.scalar(select(Supply).where(Supply.id == sid, Supply.seller_id == seller.id))
    if not s:
        raise NotFound("Supply")
    await db.delete(s)


# ---- demand ----
@router.post("/demands", response_model=DemandOut, status_code=201)
async def create_demand(b: DemandIn, buyer: Buyer = Depends(current_buyer), db: AsyncSession = Depends(get_db)):
    return await svc.create_demand(db, buyer, b)


@router.get("/demands", response_model=Page[DemandOut])
async def demand_market(
    commodity_id: int | None = None,
    state_id: int | None = None,
    p: PageParams = Depends(page_params),
    db: AsyncSession = Depends(get_db),
    _: Seller = Depends(current_seller),
):
    stmt = select(Demand).where(Demand.status == "active").order_by(Demand.id.desc())
    if commodity_id:
        stmt = stmt.where(Demand.commodity_id == commodity_id)
    if state_id:
        stmt = stmt.join(
            Address, (Address.owner_type == OwnerType.DEMAND) & (Address.owner_id == Demand.id) & (Address.kind == AddressKind.DELIVERY)
        ).where(Address.state_id == state_id)
    return await paginate(db, stmt, p, sortable={"deliver_by": Demand.deliver_by, "min_price": Demand.min_price})


@router.get("/demands/mine", response_model=Page[DemandOut])
async def my_demands(p: PageParams = Depends(page_params), buyer: Buyer = Depends(current_buyer), db: AsyncSession = Depends(get_db)):
    return await paginate(db, select(Demand).where(Demand.buyer_id == buyer.id).order_by(Demand.id.desc()), p)


@router.delete("/demands/{did}", status_code=204)
async def cancel_demand(did: int, buyer: Buyer = Depends(current_buyer), db: AsyncSession = Depends(get_db)):
    d = await db.scalar(select(Demand).where(Demand.id == did, Demand.buyer_id == buyer.id))
    if not d:
        raise NotFound("Demand")
    d.status = "cancelled"
