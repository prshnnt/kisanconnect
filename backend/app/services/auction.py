from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DomainError, NotFound
from app.models import Auction, AuctionBid, Buyer, Lot, Seller, Trade, TradeLicense
from app.models.enums import AuctionStatus, BidStatus, LicenseStatus, LotStatus, Venue
from app.schemas.trade import BidIn, BulkAuctionIn
from app.services.numbering import next_number
from app.services.state import move

now = lambda: datetime.now(timezone.utc)  # noqa: E731


async def bulk_create(db: AsyncSession, d: BulkAuctionIn, seller: Seller | None) -> list[dict]:
    """One result per lot so a single bad lot never blocks the batch. Each lot is its own savepoint."""
    out = []
    for lot_id in d.lot_ids:
        try:
            async with db.begin_nested():
                stmt = select(Lot).where(Lot.id == lot_id).with_for_update()
                lot = await db.scalar(stmt)
                if not lot or (seller and lot.seller_id != seller.id):
                    raise DomainError("NOT_FOUND", "Lot not found")
                if lot.status != LotStatus.ACTIVE:
                    raise DomainError("LOT_NOT_ACTIVE", f"Lot is {lot.status.value}")
                if lot.min_price is None:
                    raise DomainError("NO_MIN_PRICE", "Lot has no minimum expected price")
                a = Auction(
                    number=await next_number(db, "AUC"),
                    lot_id=lot.id,
                    min_price=lot.min_price,
                    starts_at=d.starts_at,
                    ends_at=d.ends_at,
                    result_after=d.result_after or d.ends_at,
                    is_closed_bid=d.is_closed_bid,
                    is_auto_declare=d.is_auto_declare,
                    min_increment=d.min_increment,
                    reserve_price=d.reserve_price,
                    status=AuctionStatus.LIVE if d.starts_at <= now() else AuctionStatus.SCHEDULED,
                )
                db.add(a)
                move(lot, LotStatus.AUCTIONED)
                await db.flush()
            out.append({"lot_id": lot_id, "ok": True, "auction_id": a.id})
        except IntegrityError:
            out.append({"lot_id": lot_id, "ok": False, "error": "Lot already has an auction"})
        except DomainError as e:
            out.append({"lot_id": lot_id, "ok": False, "error": e.message})
    return out


async def _has_valid_licence(db: AsyncSession, buyer: Buyer, lot: Lot) -> bool:
    q = select(TradeLicense.id).where(
        TradeLicense.buyer_id == buyer.id, TradeLicense.status == LicenseStatus.ACTIVE, TradeLicense.expires_on >= now().date()
    )
    if lot.apmc_id:  # inside-APMC lots need a licence valid for that APMC or a unified one
        q = q.where((TradeLicense.operating_apmc_id == lot.apmc_id) | (TradeLicense.is_unified.is_(True)))
    return await db.scalar(q.limit(1)) is not None


async def place_bid(db: AsyncSession, auction_id: int, buyer: Buyer, d: BidIn, key: str | None) -> dict:
    """Race-safe: the auction row is locked for the whole transaction, so concurrent bids serialise."""
    if key:  # idempotent replay returns the original outcome instead of a duplicate bid
        prior = await db.scalar(select(AuctionBid).where(AuctionBid.idempotency_key == f"{buyer.id}:{key}"))
        if prior:
            a = await db.get(Auction, prior.auction_id)
            return {"bid": prior, "h1_price": a.h1_price, "bid_count": a.bid_count}

    a = await db.scalar(select(Auction).where(Auction.id == auction_id).with_for_update())
    if not a:
        raise NotFound("Auction")
    lot = await db.get(Lot, a.lot_id)
    t = now()
    if a.status != AuctionStatus.LIVE or not (a.starts_at <= t < a.ends_at):
        raise DomainError("AUCTION_NOT_LIVE", "Auction is not accepting bids", 409)
    seller = await db.get(Seller, lot.seller_id)
    if seller.user_id == buyer.user_id:
        raise DomainError("SELLER_CANNOT_BID", "You cannot bid on your own lot", 403)
    if not await _has_valid_licence(db, buyer, lot):
        raise DomainError("LICENCE_INVALID", "No active trade licence for this market", 403)

    floor = a.min_price if a.h1_price is None else a.h1_price + a.min_increment
    if d.price < floor:
        raise DomainError("BID_TOO_LOW", f"Bid must be at least {floor}", 409, minimum=str(floor))

    first_from_buyer = not await db.scalar(
        select(AuctionBid.id).where(AuctionBid.auction_id == a.id, AuctionBid.buyer_id == buyer.id).limit(1)
    )
    if a.h1_bid_id:
        prev = await db.get(AuctionBid, a.h1_bid_id)
        prev.status = BidStatus.OUTBID
    bid = AuctionBid(
        auction_id=a.id,
        buyer_id=buyer.id,
        price=d.price,
        status=BidStatus.ACTIVE,
        placed_at=t,
        idempotency_key=f"{buyer.id}:{key}" if key else None,
    )
    db.add(bid)
    await db.flush()
    a.h1_price, a.h1_bid_id, a.bid_count = d.price, bid.id, a.bid_count + 1
    a.bidder_count += int(first_from_buyer)
    await db.flush()
    return {"bid": bid, "h1_price": a.h1_price, "bid_count": a.bid_count}


async def close_due(db: AsyncSession) -> int:
    """Celery beat: open scheduled auctions whose start passed, close live ones whose end passed."""
    t = now()
    n = 0
    for a in (
        await db.scalars(
            select(Auction)
            .where(Auction.status == AuctionStatus.SCHEDULED, Auction.starts_at <= t, Auction.ends_at > t)
            .with_for_update(skip_locked=True)
        )
    ).all():
        move(a, AuctionStatus.LIVE)
        n += 1
    for a in (
        await db.scalars(
            select(Auction).where(Auction.status == AuctionStatus.LIVE, Auction.ends_at <= t).with_for_update(skip_locked=True)
        )
    ).all():
        move(a, AuctionStatus.CLOSED)
        n += 1
    return n


async def declare(db: AsyncSession, auction_id: int, *, force: bool = False) -> Auction:
    a = await db.scalar(select(Auction).where(Auction.id == auction_id).with_for_update())
    if not a:
        raise NotFound("Auction")
    if a.status == AuctionStatus.LIVE and a.ends_at <= now():
        move(a, AuctionStatus.CLOSED)
    if a.status != AuctionStatus.CLOSED:
        raise DomainError("AUCTION_NOT_CLOSED", "Bidding is still open", 409)
    if a.result_after and a.result_after > now() and not force:
        raise DomainError("TOO_EARLY", "Result declaration time not reached", 409)

    lot = await db.get(Lot, a.lot_id)
    top = await db.get(AuctionBid, a.h1_bid_id) if a.h1_bid_id else None
    if not top or (a.reserve_price is not None and top.price < a.reserve_price):
        move(a, AuctionStatus.REJECTED)
        move(lot, LotStatus.ACTIVE)  # lot returns to the pool for re-auction
        a.declared_at = now()
        return a

    top.status = BidStatus.WINNING
    a.winning_buyer_id, a.winning_price, a.declared_at = top.buyer_id, top.price, now()
    move(a, AuctionStatus.DECLARED)
    db.add(
        Trade(
            number=await next_number(db, "TC"),
            lot_id=lot.id,
            auction_id=a.id,
            seller_id=lot.seller_id,
            buyer_id=top.buyer_id,
            commission_agent_id=lot.commission_agent_id,
            commodity_id=lot.commodity_id,
            apmc_id=lot.apmc_id,
            venue=Venue.INSIDE_APMC if lot.apmc_id else Venue.OUTSIDE_APMC,
            bags=lot.bags,
            approx_qty_qtl=lot.quantity_qtl,
            rate_per_qtl=top.price,
        )
    )
    await db.flush()
    return a


async def pending_summary(db: AsyncSession, live: bool) -> dict:
    """KPI tiles on the Pending-for-Declaration screen."""
    cond = Auction.status == (AuctionStatus.LIVE if live else AuctionStatus.CLOSED)
    row = (
        await db.execute(
            select(func.count(), func.count().filter(Auction.bid_count > 0), func.coalesce(func.sum(Auction.bid_count), 0)).where(cond)
        )
    ).one()
    return {"total_lots": row[0], "lots_with_bids": row[1], "total_bids": int(row[2]), "zero_bid_lots": row[0] - row[1]}
