import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.errors import DomainError

_ph = PasswordHasher()


def hash_password(p: str) -> str:
    return _ph.hash(p)


def verify_password(p: str, hashed: str | None) -> bool:
    if not hashed:
        return False
    try:
        return _ph.verify(hashed, p)
    except VerifyMismatchError:
        return False


def sha256(v: str) -> str:
    return hashlib.sha256(v.encode()).hexdigest()


def safe_eq(a: str, b: str) -> bool:
    return hmac.compare_digest(a, b)


def new_otp() -> str:
    return f"{secrets.randbelow(10**6):06d}"


def new_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def create_access_token(user_id: int, roles: list[str]) -> str:
    s = get_settings()
    exp = datetime.now(timezone.utc) + timedelta(minutes=s.access_minutes)
    return jwt.encode({"sub": str(user_id), "roles": roles, "exp": exp}, s.jwt_secret, algorithm=s.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    s = get_settings()
    try:
        return jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_algorithm])
    except JWTError:
        raise DomainError("INVALID_TOKEN", "Invalid or expired token", 401) from None


def validate_password_policy(p: str) -> None:
    ok = len(p) >= 8 and any(c.isupper() for c in p) and any(c.islower() for c in p) and any(c.isdigit() for c in p)
    if not ok:
        raise DomainError("WEAK_PASSWORD", "Min 8 chars with upper, lower and a digit", 422)
