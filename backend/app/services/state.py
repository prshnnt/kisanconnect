"""Single place that defines legal status transitions. Services call `move()`; nobody sets .status directly."""

from app.core.errors import DomainError
from app.models.enums import AuctionStatus as A
from app.models.enums import BookingStatus as B
from app.models.enums import LotStatus as L
from app.models.enums import TradeStatus as T

EDGES: dict[type, dict] = {
    L: {
        L.DRAFT: {L.ACTIVE, L.CANCELLED},
        L.ACTIVE: {L.AUCTIONED, L.CANCELLED, L.EXPIRED, L.DRAFT},
        L.AUCTIONED: {L.SOLD, L.ACTIVE, L.CANCELLED},
        L.SOLD: set(),
        L.CANCELLED: set(),
        L.EXPIRED: set(),
    },
    A: {
        A.SCHEDULED: {A.LIVE, A.CANCELLED},
        A.LIVE: {A.CLOSED, A.CANCELLED},
        A.CLOSED: {A.DECLARED, A.REJECTED},
        A.DECLARED: set(),
        A.REJECTED: set(),
        A.CANCELLED: set(),
    },
    T: {
        T.DECLARED: {T.CONFIRMED, T.WEIGHMENT_PENDING, T.CANCELLED},
        T.CONFIRMED: {T.WEIGHMENT_PENDING, T.CANCELLED},
        T.WEIGHMENT_PENDING: {T.AGREEMENT_GENERATED, T.CANCELLED},
        T.AGREEMENT_GENERATED: set(),
        T.CANCELLED: set(),
    },
    B: {
        B.REQUESTED: {B.NEGOTIATING, B.ACCEPTED, B.REJECTED, B.CANCELLED},
        B.NEGOTIATING: {B.ACCEPTED, B.REJECTED, B.CANCELLED},
        B.ACCEPTED: {B.IN_PROGRESS, B.CANCELLED},
        B.IN_PROGRESS: {B.COMPLETED, B.CANCELLED},
        B.COMPLETED: set(),
        B.CANCELLED: set(),
        B.REJECTED: set(),
    },
}


def move(obj, to, *, attr: str = "status"):
    """Validate and apply a status change. Raises 409 INVALID_TRANSITION on an illegal edge."""
    cur = getattr(obj, attr)
    allowed = EDGES[type(to)].get(cur, set())
    if to not in allowed:
        raise DomainError("INVALID_TRANSITION", f"Cannot move {cur.value} -> {to.value}", 409)
    setattr(obj, attr, to)
    return obj
