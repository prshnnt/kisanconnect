from pydantic import BaseModel, Field, field_validator

from app.models.enums import Role


def _mobile(v: str) -> str:
    v = v.strip().replace(" ", "")
    if not (v.isdigit() and len(v) == 10):
        raise ValueError("mobile must be 10 digits")
    return v


class OtpRequest(BaseModel):
    mobile: str
    _v = field_validator("mobile")(_mobile)


class RegisterIn(BaseModel):
    mobile: str
    otp: str = Field(min_length=6, max_length=6)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str | None = None
    password: str
    roles: list[Role] = Field(min_length=1)
    registered_apmc_id: int | None = None
    admin_invite_code: str | None = None
    _v = field_validator("mobile")(_mobile)


class LoginIn(BaseModel):
    mobile: str
    password: str | None = None
    otp: str | None = None
    _v = field_validator("mobile")(_mobile)


class RefreshIn(BaseModel):
    refresh_token: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class OtpOut(BaseModel):
    message: str = "OTP sent"
    debug_otp: str | None = None  # only populated when DEBUG_OTP=true


class PasswordChangeIn(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class MeOut(BaseModel):
    id: int
    uuid: str
    mobile: str
    email: str | None
    first_name: str
    last_name: str | None
    roles: list[str]
    mobile_verified: bool
    email_verified: bool
    model_config = {"from_attributes": True}
