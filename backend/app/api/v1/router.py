from fastapi import APIRouter

from app.api.v1 import agents, auction, auth, chatbot, lookups, lots, mandis, marketplace, profile, trade

api_router = APIRouter()
for r in (
    auth.router,
    profile.router,
    lookups.router,
    lookups.uploads,
    lots.router,
    auction.router,
    trade.router,
    marketplace.router,
    mandis.router,
    agents.router,
    chatbot.router,
):
    api_router.include_router(r)
