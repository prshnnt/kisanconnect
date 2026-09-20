from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.core.errors import DomainError
from app.db.session import get_db
from app.models import User
from app.models.enums import OtpPurpose
from app.schemas.auth import LoginIn, MeOut, OtpOut, OtpRequest, PasswordChangeIn, RefreshIn, RegisterIn, TokenOut
from app.schemas.common import Msg
from app.schemas.profile import OtpVerify
from app.services import auth as svc
from app.services import profile as profile_svc

router = APIRouter(prefix="/auth", tags=["A. Auth"])


@router.post("/register/request-otp", response_model=OtpOut)
async def register_otp(b: OtpRequest, db: AsyncSession = Depends(get_db)):
    return OtpOut(debug_otp=await svc.send_otp(db, b.mobile, OtpPurpose.REGISTER))


@router.post("/register", response_model=TokenOut, status_code=201)
async def register(b: RegisterIn, db: AsyncSession = Depends(get_db)):
    return await svc.register(db, b)


@router.post("/login/request-otp", response_model=OtpOut)
async def login_otp(b: OtpRequest, db: AsyncSession = Depends(get_db)):
    return OtpOut(debug_otp=await svc.send_otp(db, b.mobile, OtpPurpose.LOGIN))


@router.post("/login", response_model=TokenOut)
async def login(b: LoginIn, db: AsyncSession = Depends(get_db)):
    if not (b.password or b.otp):
        raise DomainError("MISSING_CREDENTIAL", "Provide password or otp", 422)
    return await svc.login(db, b)


@router.post("/refresh", response_model=TokenOut)
async def refresh(b: RefreshIn, db: AsyncSession = Depends(get_db)):
    return await svc.refresh(db, b.refresh_token)


@router.post("/logout", response_model=Msg)
async def logout(b: RefreshIn, db: AsyncSession = Depends(get_db)):
    await svc.logout(db, b.refresh_token)
    return Msg()


@router.get("/me", response_model=MeOut)
async def me(user: User = Depends(current_user)):
    return user


@router.post("/password/change", response_model=Msg)
async def change_password(b: PasswordChangeIn, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    await svc.change_password(db, user, b.current_password, b.new_password, b.confirm_password)
    return Msg(message="Password changed")


@router.post("/account/delete/request-otp", response_model=OtpOut)
async def delete_otp(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    return OtpOut(debug_otp=await svc.send_otp(db, user.mobile, OtpPurpose.DELETE_ACCOUNT))


@router.post("/account/delete/confirm", response_model=Msg)
async def delete_confirm(b: OtpVerify, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    await profile_svc.delete_account(db, user, b.otp)
    return Msg(message="Account deleted")
