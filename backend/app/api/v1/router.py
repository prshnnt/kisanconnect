from fastapi import APIRouter

from app.api.v1 import admin, agents, auction, auth, buyer, chatbot, farmer, lookups, lots, mandis, market_prices, marketplace, profile, provider, trade

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
    market_prices.router,
    admin.router,
    buyer.router,
    farmer.router,
    provider.router,
):
    api_router.include_router(r)

