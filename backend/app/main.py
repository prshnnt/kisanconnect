import asyncio
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.api.v1 import ws
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.errors import install_handlers
from app.db.session import engine

logger = logging.getLogger(__name__)


async def _run_startup_ceda_sync():
    """Background startup task to sync CEDA Agmarknet data."""
    try:
        from app.services.ceda_ingestion import run_ceda_full_ingestion

        async_session = async_sessionmaker(engine, expire_on_commit=False)
        async with async_session() as db:
            logger.info("Executing startup CEDA Agmarknet price sync...")
            await run_ceda_full_ingestion(db, days_back=7)
    except Exception as exc:
        logger.error("Startup CEDA sync error: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if get_settings().ceda_sync_on_startup:
        asyncio.create_task(_run_startup_ceda_sync())
    yield


app = FastAPI(title="KisanConnect API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=get_settings().cors_origins, allow_methods=["*"], allow_headers=["*"])
install_handlers(app)
app.include_router(api_router, prefix="/api/v1")
app.include_router(ws.router)


@app.get("/health", tags=["ops"])
async def health():
    return {"status": "ok"}


@app.get("/ready", tags=["ops"])
async def ready():
    async with engine.connect() as c:
        await c.execute(text("select 1"))
    return {"status": "ready"}
