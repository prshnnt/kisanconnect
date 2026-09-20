from datetime import date, datetime, timezone

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import Conflict, DomainError, NotFound
from app.models import Address, Attachment, BankAccount, Buyer, CommodityLink, Lot, RefreshToken, Seller, TradeLicense, User
from app.models.enums import AddressKind, LicenseStatus, LotStatus, OtpPurpose, OwnerType
from app.schemas.profile import AddressIn, BankIn, LicenseIn, PreferenceIO
from app.services import auth as auth_svc

OWNER_OF = {"seller": OwnerType.SELLER, "buyer": OwnerType.BUYER}


def mask_account(n: str) -> str:
    return "X" * max(len(n) - 4, 0) + n[-4:]


# ---------- addresses ----------
async def upsert_address(db: AsyncSession, user: User, kind: AddressKind, d: AddressIn) -> Address:
    if kind not in (AddressKind.PERMANENT, AddressKind.CURRENT):
        raise DomainError("INVALID_KIND", "Only permanent/current allowed here", 422)
    values = d.model_dump(exclude={"same_as_permanent"})
    if kind == AddressKind.CURRENT and d.same_as_permanent:
        perm = await db.scalar(
            select(Address).where(Address.owner_type == OwnerType.USER, Address.owner_id == user.id, Address.kind == AddressKind.PERMANENT)
        )
        if not perm:
            raise DomainError("NO_PERMANENT_ADDRESS", "Save the permanent address first", 409)
        values = {c: getattr(perm, c) for c in values}
    row = await db.scalar(select(Address).where(Address.owner_type == OwnerType.USER, Address.owner_id == user.id, Address.kind == kind))
    if row:
        for k, v in values.items():
            setattr(row, k, v)
    else:
        row = Address(owner_type=OwnerType.USER, owner_id=user.id, kind=kind, **values)
        db.add(row)
    await db.flush()
    return row


# ---------- contact verification ----------
async def confirm_mobile_change(db: AsyncSession, user: User, new_mobile: str, otp: str) -> None:
    if await db.scalar(select(User.id).where(User.mobile == new_mobile, User.id != user.id)):
        raise Conflict("MOBILE_EXISTS", "Mobile already in use")
    await auth_svc.verify_otp(db, new_mobile, OtpPurpose.VERIFY_MOBILE, otp)
    user.mobile, user.mobile_verified = new_mobile, True


async def confirm_email(db: AsyncSession, user: User, email: str, otp: str) -> None:
    if await db.scalar(select(User.id).where(User.email == email, User.id != user.id)):
        raise Conflict("EMAIL_EXISTS", "Email already in use")
    await auth_svc.verify_otp(db, email, OtpPurpose.VERIFY_EMAIL, otp)
    user.email, user.email_verified = email, True


# ---------- bank ----------
async def add_bank(db: AsyncSession, user: User, d: BankIn) -> BankAccount:
    dup = await db.scalar(select(BankAccount.id).where(BankAccount.user_id == user.id, BankAccount.account_number == d.account_number))
    if dup:
        raise Conflict("BANK_EXISTS", "Account already added")
    has_any = await db.scalar(select(BankAccount.id).where(BankAccount.user_id == user.id).limit(1))
    acc = BankAccount(user_id=user.id, is_primary=not has_any, **d.model_dump())  # first account becomes primary
    db.add(acc)
    await db.flush()
    return acc


async def _own_bank(db: AsyncSession, user: User, bank_id: int) -> BankAccount:
    acc = await db.scalar(select(BankAccount).where(BankAccount.id == bank_id, BankAccount.user_id == user.id))
    if not acc:
        raise NotFound("Bank account")
    return acc


async def make_primary(db: AsyncSession, user: User, bank_id: int) -> BankAccount:
    acc = await _own_bank(db, user, bank_id)
    if not acc.is_verified:
        raise DomainError("BANK_NOT_VERIFIED", "Verify the account before making it primary", 409)
    await db.execute(update(BankAccount).where(BankAccount.user_id == user.id).values(is_primary=False))
    acc.is_primary = True
    return acc


async def verify_bank(db: AsyncSession, user: User, bank_id: int) -> BankAccount:
    acc = await _own_bank(db, user, bank_id)
    acc.is_verified = True  # penny-drop provider is an adapter (integrations/bank_verify.py); stubbed here
    return acc


async def delete_bank(db: AsyncSession, user: User, bank_id: int) -> None:
    acc = await _own_bank(db, user, bank_id)
    others = (await db.scalars(select(BankAccount).where(BankAccount.user_id == user.id, BankAccount.id != bank_id))).all()
    if acc.is_primary and others:
        raise DomainError("PRIMARY_BANK", "Make another account primary before deleting this one", 409)
    await db.delete(acc)


# ---------- preferences (replace-all semantics) ----------
async def get_prefs(db: AsyncSession, owner: OwnerType, owner_id: int) -> PreferenceIO:
    cids = (
        await db.scalars(select(CommodityLink.commodity_id).where(CommodityLink.owner_type == owner, CommodityLink.owner_id == owner_id))
    ).all()
    locs = (
        await db.scalars(
            select(Address).where(Address.owner_type == owner, Address.owner_id == owner_id, Address.kind == AddressKind.PREFERRED)
        )
    ).all()
    return PreferenceIO(commodity_ids=list(cids), locations=[{"state_id": a.state_id, "apmc_id": a.apmc_id} for a in locs])


async def set_prefs(db: AsyncSession, owner: OwnerType, owner_id: int, d: PreferenceIO) -> PreferenceIO:
    await db.execute(delete(CommodityLink).where(CommodityLink.owner_type == owner, CommodityLink.owner_id == owner_id))
    await db.execute(
        delete(Address).where(Address.owner_type == owner, Address.owner_id == owner_id, Address.kind == AddressKind.PREFERRED)
    )
    for cid in dict.fromkeys(d.commodity_ids):  # de-dupe, keep order
        db.add(CommodityLink(owner_type=owner, owner_id=owner_id, commodity_id=cid))
    for loc in {(x.state_id, x.apmc_id) for x in d.locations}:
        db.add(Address(owner_type=owner, owner_id=owner_id, kind=AddressKind.PREFERRED, state_id=loc[0], apmc_id=loc[1]))
    await db.flush()
    return d


# ---------- trade licences ----------
def licence_status(expires_on: date) -> LicenseStatus:
    return LicenseStatus.EXPIRED if expires_on < date.today() else LicenseStatus.ACTIVE


async def save_licence(db: AsyncSession, buyer: Buyer, d: LicenseIn, lic: TradeLicense | None = None) -> TradeLicense:
    if d.expires_on < d.issued_on:
        raise DomainError("INVALID_DATES", "Expiry must be on/after issue date", 422)
    dup = await db.scalar(
        select(TradeLicense.id).where(
            TradeLicense.buyer_id == buyer.id, TradeLicense.number == d.number, TradeLicense.id != (lic.id if lic else 0)
        )
    )
    if dup:
        raise Conflict("LICENSE_EXISTS", "Licence number already added")
    data = d.model_dump(exclude={"attachment_ids"})
    if lic:
        for k, v in data.items():
            setattr(lic, k, v)
    else:
        lic = TradeLicense(buyer_id=buyer.id, **data)
        db.add(lic)
    lic.status = licence_status(d.expires_on)
    await db.flush()
    if d.attachment_ids:
        await link_attachments(db, d.attachment_ids, OwnerType.LICENSE, lic.id, "licence")
    return lic


async def link_attachments(db: AsyncSession, ids: list[int], owner: OwnerType, owner_id: int, kind: str) -> None:
    await db.execute(
        update(Attachment)
        .where(Attachment.id.in_(ids), Attachment.owner_id.is_(None))
        .values(owner_type=owner, owner_id=owner_id, kind=kind)
    )


# ---------- account deletion ----------
async def delete_account(db: AsyncSession, user: User, otp: str) -> None:
    await auth_svc.verify_otp(db, user.mobile, OtpPurpose.DELETE_ACCOUNT, otp)
    seller = await db.scalar(select(Seller).where(Seller.user_id == user.id))
    if seller:
        live = await db.scalar(
            select(Lot.id).where(Lot.seller_id == seller.id, Lot.status.in_([LotStatus.ACTIVE, LotStatus.AUCTIONED])).limit(1)
        )
        if live:
            raise DomainError("ACCOUNT_HAS_OPEN_OBLIGATIONS", "Cancel or finish active lots first", 409)
    user.deleted_at = datetime.now(timezone.utc)
    await db.execute(
        update(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None)).values(revoked_at=user.deleted_at)
    )
