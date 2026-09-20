from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_buyer, current_seller, current_user
from app.core.errors import NotFound
from app.core.pagination import PageParams, page_params, paginate
from app.db.session import get_db
from app.models import BankAccount, Buyer, Seller, TradeLicense, User
from app.models.enums import AddressKind, OtpPurpose, OwnerType
from app.schemas.auth import OtpOut, OtpRequest
from app.schemas.common import Msg, Page
from app.schemas.profile import (
    AddressIn,
    AddressOut,
    BankIn,
    BankOut,
    EmailIn,
    LicenseIn,
    LicenseOut,
    OtpVerify,
    PreferenceIO,
    ProfileOut,
    ProfilePatch,
)
from app.services import auth as auth_svc
from app.services import profile as svc

router = APIRouter(tags=["B. Profile"])


@router.get("/profile", response_model=ProfileOut)
async def get_profile(user: User = Depends(current_user)):
    return user


@router.patch("/profile", response_model=ProfileOut)
async def patch_profile(b: ProfilePatch, user: User = Depends(current_user)):
    for k, v in b.model_dump(exclude_unset=True).items():
        setattr(user, k, v)
    return user


@router.put("/profile/addresses/{kind}", response_model=AddressOut)
async def put_address(kind: AddressKind, b: AddressIn, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    return await svc.upsert_address(db, user, kind, b)


@router.get("/profile/addresses", response_model=list[AddressOut])
async def list_addresses(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    from app.models import Address

    q = select(Address).where(Address.owner_type == OwnerType.USER, Address.owner_id == user.id)
    return (await db.scalars(q)).all()


@router.post("/profile/mobile/change/request-otp", response_model=OtpOut)
async def mobile_otp(b: OtpRequest, db: AsyncSession = Depends(get_db), user: User = Depends(current_user)):
    return OtpOut(debug_otp=await auth_svc.send_otp(db, b.mobile, OtpPurpose.VERIFY_MOBILE))


@router.post("/profile/mobile/change/confirm", response_model=Msg)
async def mobile_confirm(b: OtpVerify, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    await svc.confirm_mobile_change(db, user, b.target, b.otp)
    return Msg(message="Mobile updated")


@router.post("/profile/email/request-otp", response_model=OtpOut)
async def email_otp(b: EmailIn, db: AsyncSession = Depends(get_db), user: User = Depends(current_user)):
    return OtpOut(debug_otp=await auth_svc.send_otp(db, b.email, OtpPurpose.VERIFY_EMAIL))


@router.post("/profile/email/verify", response_model=Msg)
async def email_verify(b: OtpVerify, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    await svc.confirm_email(db, user, b.target, b.otp)
    return Msg(message="Email verified")


# ---- bank ----
@router.get("/bank-accounts", response_model=list[BankOut], tags=["B. Bank"])
async def list_banks(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.scalars(select(BankAccount).where(BankAccount.user_id == user.id).order_by(BankAccount.id))).all()
    return [BankOut.model_validate(r).model_copy(update={"account_number": svc.mask_account(r.account_number)}) for r in rows]


@router.post("/bank-accounts", response_model=BankOut, status_code=201, tags=["B. Bank"])
async def add_bank(b: BankIn, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    acc = await svc.add_bank(db, user, b)
    return BankOut.model_validate(acc).model_copy(update={"account_number": svc.mask_account(acc.account_number)})


@router.post("/bank-accounts/{bank_id}/verify", response_model=Msg, tags=["B. Bank"])
async def verify_bank(bank_id: int, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    await svc.verify_bank(db, user, bank_id)
    return Msg(message="Verified")


@router.post("/bank-accounts/{bank_id}/make-primary", response_model=Msg, tags=["B. Bank"])
async def primary_bank(bank_id: int, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    await svc.make_primary(db, user, bank_id)
    return Msg(message="Primary account updated")


@router.delete("/bank-accounts/{bank_id}", status_code=204, tags=["B. Bank"])
async def delete_bank(bank_id: int, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    await svc.delete_bank(db, user, bank_id)


# ---- preferences ----
@router.get("/preferences/seller", response_model=PreferenceIO, tags=["C. Preferences"])
async def get_seller_prefs(s: Seller = Depends(current_seller), db: AsyncSession = Depends(get_db)):
    return await svc.get_prefs(db, OwnerType.SELLER, s.id)


@router.put("/preferences/seller", response_model=PreferenceIO, tags=["C. Preferences"])
async def put_seller_prefs(b: PreferenceIO, s: Seller = Depends(current_seller), db: AsyncSession = Depends(get_db)):
    return await svc.set_prefs(db, OwnerType.SELLER, s.id, b)


@router.get("/preferences/buyer", response_model=PreferenceIO, tags=["C. Preferences"])
async def get_buyer_prefs(b: Buyer = Depends(current_buyer), db: AsyncSession = Depends(get_db)):
    return await svc.get_prefs(db, OwnerType.BUYER, b.id)


@router.put("/preferences/buyer", response_model=PreferenceIO, tags=["C. Preferences"])
async def put_buyer_prefs(d: PreferenceIO, b: Buyer = Depends(current_buyer), db: AsyncSession = Depends(get_db)):
    return await svc.set_prefs(db, OwnerType.BUYER, b.id, d)


# ---- trade licences ----
@router.get("/trade-licenses", response_model=Page[LicenseOut], tags=["C. Preferences"])
async def list_licences(p: PageParams = Depends(page_params), b: Buyer = Depends(current_buyer), db: AsyncSession = Depends(get_db)):
    return await paginate(
        db,
        select(TradeLicense).where(TradeLicense.buyer_id == b.id).order_by(TradeLicense.id.desc()),
        p,
        sortable={"expires_on": TradeLicense.expires_on, "number": TradeLicense.number},
    )


@router.post("/trade-licenses", response_model=LicenseOut, status_code=201, tags=["C. Preferences"])
async def add_licence(d: LicenseIn, b: Buyer = Depends(current_buyer), db: AsyncSession = Depends(get_db)):
    return await svc.save_licence(db, b, d)


async def _own_licence(db, b, lid):
    lic = await db.scalar(select(TradeLicense).where(TradeLicense.id == lid, TradeLicense.buyer_id == b.id))
    if not lic:
        raise NotFound("Licence")
    return lic


@router.patch("/trade-licenses/{lid}", response_model=LicenseOut, tags=["C. Preferences"])
async def edit_licence(lid: int, d: LicenseIn, b: Buyer = Depends(current_buyer), db: AsyncSession = Depends(get_db)):
    return await svc.save_licence(db, b, d, await _own_licence(db, b, lid))


@router.delete("/trade-licenses/{lid}", status_code=204, tags=["C. Preferences"])
async def delete_licence(lid: int, b: Buyer = Depends(current_buyer), db: AsyncSession = Depends(get_db)):
    await db.delete(await _own_licence(db, b, lid))
