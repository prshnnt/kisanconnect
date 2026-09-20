from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1 import ws
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.errors import install_handlers
from app.db.session import engine

app = FastAPI(title="KisanConnect API", version="1.0.0")
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
