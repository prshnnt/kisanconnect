from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/kisanconnect"
    redis_url: str = "redis://localhost:6379/0"
    env: str = "development"  # set ENV=production in deployments
    jwt_secret: str = "dev-only-insecure-secret-change-me-32b"
    jwt_algorithm: str = "HS256"
    access_minutes: int = 60
    refresh_days: int = 14
    otp_ttl_minutes: int = 5
    otp_max_attempts: int = 5
    max_failed_logins: int = 5
    lockout_minutes: int = 15
    admin_invite_code: str = ""
    cors_origins: list[str] = ["*"]

    # --- CEDA Agmarknet API Settings ---
    ceda_api_base_url: str = "https://api.ceda.ashoka.edu.in/v1"
    ceda_api_key: str = "d0a2c5f77ab5ea4c148d27d9ff2bad14f2cd61ea4d4edbf9be91b291c0f40c10"
    ceda_sync_on_startup: bool = False

    # --- Chatbot (talks to an Ollama-compatible server) ---
    ollama_base_url: str = "https://api.ollama.com"  # Ollama Cloud; point at http://localhost:11434 for a local server
    ollama_model: str = "gpt-oss:120b"
    ollama_api_key: str = ""  # optional bearer token, e.g. for Ollama Cloud (api.ollama.com)
    ollama_timeout_seconds: int = 60
    chat_system_prompt: str = (
        "You are the KisanConnect assistant, helping farmers (sellers) and buyers on an "
        "agricultural mandi marketplace. Answer questions about mandi prices, lots, auctions, "
        "trades, commission agents, and general farming/market queries clearly and concisely. "
        "If you don't know something specific to this account (like an order status), say so "
        "and suggest where in the app they can check. Keep answers short and simple."
    )
    chat_ttl_minutes: int = 30  # temp chat threads expire after this much inactivity
    chat_max_turns: int = 12  # user+assistant message pairs kept per thread before trimming

    @model_validator(mode="after")
    def _fail_closed_in_production(self):
        """Refuse to boot with insecure settings instead of quietly running exposed."""
        if self.env == "production":
            problems = []
            if self.jwt_secret.startswith("dev-only") or len(self.jwt_secret) < 32:
                problems.append("JWT_SECRET must be set to a random value of 32+ characters")
            if self.debug_otp:
                problems.append("DEBUG_OTP must be false")
            if "*" in self.cors_origins:
                problems.append("CORS_ORIGINS must not contain '*'")
            if problems:
                raise ValueError("Unsafe production configuration: " + "; ".join(problems))
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
