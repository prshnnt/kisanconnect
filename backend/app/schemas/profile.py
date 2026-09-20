from datetime import date

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import AddressKind, ApmcType, Gender
from app.schemas.common import ORM


class ProfileOut(ORM):
    id: int
    mobile: str
    email: str | None
    mobile_verified: bool
    email_verified: bool
    first_name: str
    middle_name: str | None
    last_name: str | None
    guardian_relation: str | None
    guardian_name: str | None
    date_of_birth: date | None
    gender: Gender | None
    alt_mobile: str | None
    registered_apmc_id: int | None
    roles: list[str]


class ProfilePatch(BaseModel):
    first_name: str | None = None
    middle_name: str | None = None
    last_name: str | None = None
    guardian_relation: str | None = Field(None, pattern="^(s/o|d/o|w/o)$")
    guardian_name: str | None = None
    date_of_birth: date | None = None
    gender: Gender | None = None
    alt_mobile: str | None = None


class AddressIn(BaseModel):
    line1: str | None = None
    line2: str | None = None
    pincode: str | None = None
    state_id: int | None = None
    district_id: int | None = None
    tehsil_id: int | None = None
    apmc_id: int | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    same_as_permanent: bool = False  # only meaningful for kind=current


class AddressOut(ORM):
    id: int
    kind: AddressKind
    line1: str | None
    line2: str | None
    pincode: str | None
    state_id: int | None
    district_id: int | None
    tehsil_id: int | None
    apmc_id: int | None
    city: str | None


class OtpVerify(BaseModel):
    target: str
    otp: str = Field(min_length=6, max_length=6)


class EmailIn(BaseModel):
    email: EmailStr


class BankIn(BaseModel):
    account_number: str = Field(min_length=6, max_length=20, pattern=r"^\d+$")
    ifsc: str = Field(pattern=r"^[A-Z]{4}0[A-Z0-9]{6}$")
    holder_name: str | None = None
    bank_name: str | None = None


class BankOut(ORM):
    id: int
    account_number: str
    ifsc: str
    holder_name: str | None
    bank_name: str | None
    is_verified: bool
    is_primary: bool


class LocationPref(BaseModel):
    state_id: int
    apmc_id: int | None = None


class PreferenceIO(BaseModel):
    commodity_ids: list[int] = []
    locations: list[LocationPref] = []


class LicenseIn(BaseModel):
    issuing_state_id: int | None = None
    issuing_apmc_id: int | None = None
    operating_state_id: int
    operating_apmc_id: int | None = None
    is_unified: bool = False
    apmc_type: ApmcType = ApmcType.ENAM
    number: str = Field(min_length=3, max_length=100)
    issued_on: date
    expires_on: date
    attachment_ids: list[int] = []


class LicenseOut(ORM):
    id: int
    operating_state_id: int | None
    operating_apmc_id: int | None
    apmc_type: ApmcType
    number: str
    issued_on: date | None
    expires_on: date | None
    status: str
