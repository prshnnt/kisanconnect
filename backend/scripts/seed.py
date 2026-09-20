"""Load reference data + demo users so a fresh database is usable. Safe to re-run (idempotent).

    python -m scripts.seed
Demo password for every user: Passw0rd1   (change or delete these users before going live)
"""
import asyncio

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import Apmc, BagType, Buyer, Commodity, CommissionAgent, District, Seller, State, User, Variety
from app.models.services import ServiceProvider

STATES = {"Uttar Pradesh": "UP", "Madhya Pradesh": "MP", "Maharashtra": "MH", "Bihar": "BR", "Punjab": "PB"}
APMCS = {"UP": ["Farrukhabad", "Jhansi", "Agra", "Bareilly"], "MP": ["Indore"], "MH": ["Amravati"], "BR": ["Nalanda"], "PB": ["Ludhiana"]}
COMMODITIES = {"WHEAT": ["Sharbati", "Lokwan"], "PADDY": ["Basmati", "Sona Masuri"], "MAIZE": ["Local"], "ONION": ["Red", "White"],
               "RAGI": ["Indaf-5"], "GROUNDNUT": ["TMV-7"], "CUMIN": ["RZ-223"], "AJWAIN": []}
BAGS = [("Jute", 1.0), ("HDPE", 0.5), ("Gunny", 0.7)]
DEMO = [("9000000001", "Demo Seller", ["seller"]), ("9000000002", "Demo Buyer", ["buyer"]),
        ("9000000003", "Demo Provider", ["service_provider"]), ("9000000009", "Demo Admin", ["admin"])]


async def get_or_create(db, model, defaults=None, **where):
    obj = await db.scalar(select(model).filter_by(**where))
    if not obj:
        obj = model(**where, **(defaults or {}))
        db.add(obj)
        await db.flush()
    return obj


async def main() -> None:
    async with SessionLocal() as db:
        for name, code in STATES.items():
            state = await get_or_create(db, State, {"code": code}, name=name)
            await get_or_create(db, District, state_id=state.id, name=f"{name} Central")
            for apmc in APMCS.get(code, []):
                await get_or_create(db, Apmc, state_id=state.id, name=apmc)
        for name, varieties in COMMODITIES.items():
            c = await get_or_create(db, Commodity, name=name)
            for v in varieties:
                await get_or_create(db, Variety, commodity_id=c.id, name=v)
        for name, kg in BAGS:
            await get_or_create(db, BagType, {"weight_kg": kg}, name=name)
        jhansi = await db.scalar(select(Apmc).where(Apmc.name == "Jhansi"))
        await get_or_create(db, CommissionAgent, {"agent_name": "Ram Prasad"}, apmc_id=jhansi.id, firm_name="Ram & Sons")

        for mobile, name, roles in DEMO:
            if await db.scalar(select(User.id).where(User.mobile == mobile)):
                continue
            u = User(mobile=mobile, first_name=name, roles=roles, mobile_verified=True, password_hash=hash_password("Passw0rd1"))
            db.add(u)
            await db.flush()
            if "seller" in roles: db.add(Seller(user_id=u.id))
            if "buyer" in roles: db.add(Buyer(user_id=u.id))
            if "service_provider" in roles: db.add(ServiceProvider(user_id=u.id))
        await db.commit()
    print("seeded: states, APMCs, commodities, varieties, bag types, 1 commission agent, 4 demo users")


if __name__ == "__main__":
    asyncio.run(main())
