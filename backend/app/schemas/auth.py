from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.enums import Role, UserType


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
    user_type: UserType = UserType.INDIVIDUAL
    organization_name: str | None = None
    registered_apmc_id: int = Field(gt=0, description="Registered APMC is mandatory on the registration form")
    admin_invite_code: str | None = None
    # commission agents are licensed by the APMC they operate in
    firm_name: str | None = None
    license_number: str | None = None
    _v = field_validator("mobile")(_mobile)

    @field_validator("organization_name", "admin_invite_code", "firm_name", "license_number", mode="before")
    @classmethod
    def _blank_is_none(cls, v):
        """Swagger and forms send "" or "string" placeholders; treat empty text as missing."""
        return None if isinstance(v, str) and not v.strip() else v

    @model_validator(mode="after")
    def _by_role(self):
        if self.user_type == UserType.INSTITUTIONAL and not self.organization_name:
            raise ValueError("organization_name is required for institutional users")
        if Role.COMMISSION_AGENT in self.roles and not (self.firm_name and self.license_number):
            raise ValueError("firm_name and license_number are required to register as a commission agent")
        return self


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
