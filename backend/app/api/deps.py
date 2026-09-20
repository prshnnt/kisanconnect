from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DomainError, Forbidden
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import Buyer, CommissionAgent, Seller, User
from app.models.services import ServiceProvider

_bearer = HTTPBearer(auto_error=False)


async def current_user(cred: HTTPAuthorizationCredentials | None = Depends(_bearer), db: AsyncSession = Depends(get_db)) -> User:
    if not cred:
        raise DomainError("UNAUTHENTICATED", "Missing bearer token", 401)
    uid = int(decode_access_token(cred.credentials)["sub"])
    user = await db.scalar(select(User).where(User.id == uid, User.deleted_at.is_(None)))
    if not user:
        raise DomainError("UNAUTHENTICATED", "User no longer exists", 401)
    return user


def require_roles(*roles: str):
    async def _dep(user: User = Depends(current_user)) -> User:
        if "admin" not in user.roles and not set(roles) & set(user.roles):
            raise Forbidden(f"Requires role: {' or '.join(roles)}")
        return user

    return _dep


async def current_seller(user: User = Depends(require_roles("seller")), db: AsyncSession = Depends(get_db)) -> Seller:
    s = await db.scalar(select(Seller).where(Seller.user_id == user.id))
    if not s:
        raise Forbidden("No seller profile")
    return s


async def current_buyer(user: User = Depends(require_roles("buyer")), db: AsyncSession = Depends(get_db)) -> Buyer:
    b = await db.scalar(select(Buyer).where(Buyer.user_id == user.id))
    if not b:
        raise Forbidden("No buyer profile")
    return b


async def current_provider(user: User = Depends(require_roles("service_provider")), db: AsyncSession = Depends(get_db)) -> ServiceProvider:
    p = await db.scalar(select(ServiceProvider).where(ServiceProvider.user_id == user.id))
    if not p:
        raise Forbidden("No service provider profile")
    return p


def idempotency_key(key: str | None = Header(None, alias="Idempotency-Key")) -> str | None:
    return key


async def current_agent(user: User = Depends(require_roles("commission_agent")), db: AsyncSession = Depends(get_db)) -> CommissionAgent:
    a = await db.scalar(select(CommissionAgent).where(CommissionAgent.user_id == user.id))
    if not a:
        raise Forbidden("No commission agent profile")
    return a
