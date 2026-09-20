from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import Conflict, DomainError
from app.core.security import (
    create_access_token,
    hash_password,
    new_otp,
    new_refresh_token,
    safe_eq,
    sha256,
    validate_password_policy,
    verify_password,
)
from app.models import Buyer, OtpChallenge, RefreshToken, Seller, User
from app.models.enums import OtpPurpose, Role
from app.models.services import ServiceProvider
from app.schemas.auth import LoginIn, RegisterIn

S = get_settings()
now = lambda: datetime.now(timezone.utc)  # noqa: E731


async def send_otp(db: AsyncSession, target: str, purpose: OtpPurpose) -> str | None:
    """Rate-limited (3 per 10 min per target+purpose). SMS delivery is an adapter; here we only store the hash."""
    sent = await db.scalar(
        select(func.count())
        .select_from(OtpChallenge)
        .where(OtpChallenge.target == target, OtpChallenge.purpose == purpose, OtpChallenge.created_at > now() - timedelta(minutes=10))
    )
    if sent >= 3:
        raise DomainError("OTP_RATE_LIMITED", "Too many OTP requests, try later", 429)
    code = new_otp()
    db.add(
        OtpChallenge(
            target=target,
            purpose=purpose,
            code_hash=sha256(f"{target}:{purpose}:{code}"),
            expires_at=now() + timedelta(minutes=S.otp_ttl_minutes),
        )
    )
    await db.flush()
    return code if S.debug_otp else None


async def verify_otp(db: AsyncSession, target: str, purpose: OtpPurpose, code: str) -> None:
    ch = await db.scalar(
        select(OtpChallenge)
        .where(OtpChallenge.target == target, OtpChallenge.purpose == purpose, OtpChallenge.consumed_at.is_(None))
        .order_by(OtpChallenge.id.desc())
        .limit(1)
        .with_for_update()
    )
    if not ch or ch.expires_at < now():
        raise DomainError("OTP_EXPIRED", "OTP expired or not requested", 400)
    if ch.attempts >= S.otp_max_attempts:
        raise DomainError("OTP_LOCKED", "Too many attempts, request a new OTP", 429)
    ch.attempts += 1
    if not safe_eq(ch.code_hash, sha256(f"{target}:{purpose}:{code}")):
        await db.flush()
        raise DomainError("OTP_INVALID", "Incorrect OTP", 400)
    ch.consumed_at = now()


async def _issue_tokens(db: AsyncSession, user: User) -> dict:
    raw = new_refresh_token()
    db.add(RefreshToken(user_id=user.id, token_hash=sha256(raw), expires_at=now() + timedelta(days=S.refresh_days)))
    await db.flush()
    return {"access_token": create_access_token(user.id, user.roles), "refresh_token": raw}


async def register(db: AsyncSession, data: RegisterIn) -> dict:
    if await db.scalar(select(User.id).where(User.mobile == data.mobile)):
        raise Conflict("MOBILE_EXISTS", "Mobile already registered")
    if Role.ADMIN in data.roles and (not S.admin_invite_code or data.admin_invite_code != S.admin_invite_code):
        raise DomainError("INVALID_INVITE", "Admin role needs a valid invite code", 403)
    validate_password_policy(data.password)
    await verify_otp(db, data.mobile, OtpPurpose.REGISTER, data.otp)

    user = User(
        mobile=data.mobile,
        first_name=data.first_name,
        last_name=data.last_name,
        mobile_verified=True,
        roles=sorted({r.value for r in data.roles}),
        password_hash=hash_password(data.password),
        registered_apmc_id=data.registered_apmc_id,
    )
    db.add(user)
    await db.flush()
    if Role.SELLER in data.roles:
        db.add(Seller(user_id=user.id))
    if Role.BUYER in data.roles:
        db.add(Buyer(user_id=user.id))
    if Role.SERVICE_PROVIDER in data.roles:
        db.add(ServiceProvider(user_id=user.id))
    await db.flush()
    return await _issue_tokens(db, user)


async def login(db: AsyncSession, data: LoginIn) -> dict:
    user = await db.scalar(select(User).where(User.mobile == data.mobile, User.deleted_at.is_(None)).with_for_update())
    bad = DomainError("INVALID_CREDENTIALS", "Invalid mobile or password", 401)
    if not user:
        raise bad
    if user.locked_until and user.locked_until > now():
        raise DomainError("ACCOUNT_LOCKED", "Too many failed attempts, try later", 423)
    if data.otp:
        await verify_otp(db, data.mobile, OtpPurpose.LOGIN, data.otp)
    elif not (data.password and verify_password(data.password, user.password_hash)):
        user.failed_logins += 1
        if user.failed_logins >= S.max_failed_logins:
            user.locked_until, user.failed_logins = now() + timedelta(minutes=S.lockout_minutes), 0
        await db.commit()  # persist the counter even though we raise
        raise bad
    user.failed_logins, user.locked_until = 0, None
    return await _issue_tokens(db, user)


async def refresh(db: AsyncSession, raw: str) -> dict:
    tok = await db.scalar(select(RefreshToken).where(RefreshToken.token_hash == sha256(raw)).with_for_update())
    if not tok or tok.expires_at < now():
        raise DomainError("INVALID_TOKEN", "Invalid refresh token", 401)
    if tok.revoked_at:  # reuse of a rotated token => assume theft, kill every session
        await db.execute(
            update(RefreshToken).where(RefreshToken.user_id == tok.user_id, RefreshToken.revoked_at.is_(None)).values(revoked_at=now())
        )
        await db.commit()
        raise DomainError("TOKEN_REUSED", "Refresh token reuse detected; sign in again", 401)
    tok.revoked_at = now()
    user = await db.get(User, tok.user_id)
    return await _issue_tokens(db, user)


async def logout(db: AsyncSession, raw: str) -> None:
    await db.execute(update(RefreshToken).where(RefreshToken.token_hash == sha256(raw)).values(revoked_at=now()))


async def change_password(db: AsyncSession, user: User, current: str, new: str, confirm: str) -> None:
    if new != confirm:
        raise DomainError("PASSWORD_MISMATCH", "Passwords do not match", 422)
    if not verify_password(current, user.password_hash):
        raise DomainError("INVALID_CREDENTIALS", "Current password is wrong", 401)
    validate_password_policy(new)
    user.password_hash = hash_password(new)
    await db.execute(
        update(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None)).values(revoked_at=now())
    )
