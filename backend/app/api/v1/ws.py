"""Live auction feed. REST stays the source of truth; this only pushes 'something changed, refetch' events."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
_rooms: dict[int, set[WebSocket]] = {}  # single-process; swap for Redis pub/sub when running multiple workers


async def broadcast(auction_id: int, event: dict) -> None:
    for ws in list(_rooms.get(auction_id, ())):
        try:
            await ws.send_json(event)
        except Exception:
            _rooms[auction_id].discard(ws)


@router.websocket("/ws/auctions/{auction_id}")
async def auction_feed(ws: WebSocket, auction_id: int):
    await ws.accept()
    _rooms.setdefault(auction_id, set()).add(ws)
    try:
        while True:
            await ws.receive_text()  # keep-alive pings from the client
    except WebSocketDisconnect:
        _rooms[auction_id].discard(ws)
