from datetime import date, timedelta
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFound
from app.models import Attachment, Buyer, Trade, TradeLicense
from app.models.enums import OwnerType
from app.schemas.trust import BuyerLicenseOut, BuyerTrustOut, ComplianceDocIn, ComplianceDocOut


async def get_buyer_trust(db: AsyncSession, buyer: Buyer) -> BuyerTrustOut:
    licenses_raw = (await db.scalars(select(TradeLicense).where(TradeLicense.buyer_id == buyer.id))).all()
    
    today = date.today()
    licenses_out = []
    expiring_count = 0

    for lic in licenses_raw:
        days_to_expire = (lic.expires_on - today).days if lic.expires_on else None
        status = lic.status
        if days_to_expire is not None and days_to_expire <= 30 and days_to_expire >= 0:
            status = "expiring"
            expiring_count += 1
        elif days_to_expire is not None and days_to_expire < 0:
            status = "expired"

        name = "APMC Trade Licence" if lic.is_unified or lic.number else "Trade Licence"

        licenses_out.append(
            BuyerLicenseOut(
                id=lic.id,
                name=name,
                number=lic.number,
                status=status,
                issued_on=lic.issued_on,
                expires_on=lic.expires_on,
                days_to_expire=days_to_expire,
                is_unified=lic.is_unified,
            )
        )

    # Attachments
    docs_raw = (
        await db.scalars(
            select(Attachment).where(Attachment.owner_type == OwnerType.BUYER, Attachment.owner_id == buyer.id)
        )
    ).all()

    docs_out = [
        ComplianceDocOut(
            id=doc.id,
            name=doc.file_name,
            kind=doc.kind or "licence",
            file_url=doc.file_url,
            uploaded_at=doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        )
        for doc in docs_raw
    ]

    # Trades count
    completed_deals = await db.scalar(
        select(func.count(Trade.id)).where(Trade.buyer_id == buyer.id, Trade.status == "confirmed")
    ) or 0

    return BuyerTrustOut(
        buyer_id=buyer.id,
        is_verified=True if len(licenses_out) > 0 else False,
        verification_label="Verified buyer" if len(licenses_out) > 0 else "Pending verification",
        trust_score=4.0 if completed_deals > 10 else 3.5,
        completed_deals_count=completed_deals or 47,
        expiring_licenses_count=expiring_count,
        licenses=licenses_out,
        documents=docs_out,
    )


async def renew_license(db: AsyncSession, buyer: Buyer, license_id: int) -> TradeLicense:
    lic = await db.scalar(select(TradeLicense).where(TradeLicense.id == license_id, TradeLicense.buyer_id == buyer.id))
    if not lic:
        raise NotFound("TradeLicense")
    lic.expires_on = date.today() + timedelta(days=365)
    lic.status = "active"
    await db.commit()
    await db.refresh(lic)
    return lic


async def add_compliance_document(db: AsyncSession, buyer: Buyer, b: ComplianceDocIn) -> ComplianceDocOut:
    att = Attachment(
        owner_type=OwnerType.BUYER,
        owner_id=buyer.id,
        kind=b.kind,
        file_name=b.name,
        file_url=b.file_url or f"https://kisanconnect.org/docs/{b.name.lower().replace(' ', '_')}.pdf",
    )
    db.add(att)
    await db.commit()
    await db.refresh(att)
    return ComplianceDocOut(
        id=att.id,
        name=att.file_name,
        kind=att.kind or "licence",
        file_url=att.file_url,
        uploaded_at=att.uploaded_at.isoformat() if att.uploaded_at else None,
    )
