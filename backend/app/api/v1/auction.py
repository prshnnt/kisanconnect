from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_buyer, idempotency_key, require_roles
from app.api.v1.ws import broadcast
from app.core.errors import NotFound
from app.core.pagination import PageParams, page_params, paginate
from app.db.session import get_db
from app.models import Auction, AuctionBid, Buyer, Lot, Seller, User
from app.models.enums import AuctionStatus, LotStatus
from app.schemas.common import Page
from app.schemas.lots import LotOut
from app.schemas.trade import AuctionOut, BidIn, BidOut, BidResult, BulkAuctionIn, BulkAuctionResult, PendingOut, PendingRow
from app.services import auction as svc

router = APIRouter(prefix="/auctions", tags=["F. Auctions"])
staff = require_roles("admin", "seller")


@router.get("/eligible-lots", response_model=Page[LotOut])
async def eligible_lots(
    created_from: date | None = None,
    created_to: date | None = None,
    q: str | None = None,
    p: PageParams = Depends(page_params),
    user: User = Depends(staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Lot).where(Lot.status == LotStatus.ACTIVE, Lot.min_price.is_not(None)).order_by(Lot.id.desc())
    if "admin" not in user.roles:
        seller = await db.scalar(select(Seller).where(Seller.user_id == user.id))
        stmt = stmt.where(Lot.seller_id == (seller.id if seller else 0))
    if created_from:
        stmt = stmt.where(Lot.created_at >= created_from)
    if created_to:
        stmt = stmt.where(Lot.created_at < date.fromordinal(created_to.toordinal() + 1))
    if q:
        stmt = stmt.where(Lot.number.ilike(f"%{q}%"))
    return await paginate(db, stmt, p)


@router.post("/bulk", response_model=list[BulkAuctionResult])
async def bulk_create(b: BulkAuctionIn, user: User = Depends(staff), db: AsyncSession = Depends(get_db)):
    seller = None
    if "admin" not in user.roles:
        seller = await db.scalar(select(Seller).where(Seller.user_id == user.id))
    return await svc.bulk_create(db, b, seller)


@router.get("/pending", response_model=PendingOut)
async def pending(
    tab: str = Query("live", pattern="^(live|closed)$"),
    bid_end_from: date | None = None,
    bid_end_to: date | None = None,
    q: str | None = None,
    p: PageParams = Depends(page_params),
    _: User = Depends(staff),
    db: AsyncSession = Depends(get_db),
):
    live = tab == "live"
    stmt = (
        select(Auction, Lot.number, Lot.commodity_id, Lot.quantity_qtl)
        .join(Lot, Lot.id == Auction.lot_id)
        .where(Auction.status == (AuctionStatus.LIVE if live else AuctionStatus.CLOSED))
        .order_by(Auction.ends_at)
    )
    if bid_end_from:
        stmt = stmt.where(Auction.ends_at >= bid_end_from)
    if bid_end_to:
        stmt = stmt.where(Auction.ends_at < date.fromordinal(bid_end_to.toordinal() + 1))
    if q:
        stmt = stmt.where(Lot.number.ilike(f"%{q}%"))
    page = await paginate(db, stmt, p, scalars=False)
    t = datetime.now(timezone.utc)
    rows = []
    for m in page["items"]:
        a = m["Auction"]
        rows.append(
            PendingRow.model_validate(
                {
                    **AuctionOut.model_validate(a).model_dump(),
                    "lot_number": m["number"],
                    "commodity_id": m["commodity_id"],
                    "quantity_qtl": m["quantity_qtl"],
                    "bid_ending_in_sec": max(int((a.ends_at - t).total_seconds()), 0),
                }
            )
        )
    return {**page, "items": rows, "summary": await svc.pending_summary(db, live)}


@router.get("/winning", response_model=Page[AuctionOut])
async def winning(
    declared_from: date | None = None,
    declared_to: date | None = None,
    p: PageParams = Depends(page_params),
    _: User = Depends(staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Auction).where(Auction.status == AuctionStatus.DECLARED).order_by(Auction.declared_at.desc())
    if declared_from:
        stmt = stmt.where(Auction.declared_at >= declared_from)
    if declared_to:
        stmt = stmt.where(Auction.declared_at < date.fromordinal(declared_to.toordinal() + 1))
    return await paginate(db, stmt, p)


@router.get("/{auction_id}", response_model=AuctionOut)
async def get_auction(auction_id: int, _: User = Depends(require_roles("seller", "buyer")), db: AsyncSession = Depends(get_db)):
    a = await db.get(Auction, auction_id)
    if not a:
        raise NotFound("Auction")
    return a


@router.post("/{auction_id}/bids", response_model=BidResult, status_code=201)
async def place_bid(
    auction_id: int,
    b: BidIn,
    key: str | None = Depends(idempotency_key),
    buyer: Buyer = Depends(current_buyer),
    db: AsyncSession = Depends(get_db),
):
    result = await svc.place_bid(db, auction_id, buyer, b, key)
    await broadcast(auction_id, {"event": "bid_placed", "h1_price": f"{result['h1_price']:.2f}", "bid_count": result["bid_count"]})
    return result


@router.get("/{auction_id}/bids/mine", response_model=list[BidOut])
async def my_bids(auction_id: int, buyer: Buyer = Depends(current_buyer), db: AsyncSession = Depends(get_db)):
    q = select(AuctionBid).where(AuctionBid.auction_id == auction_id, AuctionBid.buyer_id == buyer.id).order_by(AuctionBid.id.desc())
    return (await db.scalars(q)).all()


@router.post("/{auction_id}/declare", response_model=AuctionOut)
async def declare(auction_id: int, force: bool = False, _: User = Depends(require_roles("admin")), db: AsyncSession = Depends(get_db)):
    return await svc.declare(db, auction_id, force=force)


@router.post("/{auction_id}/close", response_model=AuctionOut)
async def close(auction_id: int, _: User = Depends(require_roles("admin")), db: AsyncSession = Depends(get_db)):
    """Ops helper: run the same open/close sweep the Celery beat job runs, then return the auction."""
    await svc.close_due(db)
    a = await db.get(Auction, auction_id)
    if not a:
        raise NotFound("Auction")
    return a
