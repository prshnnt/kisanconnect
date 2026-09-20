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
    debug_otp: bool = False  # returns the OTP in API responses. Development only
    cors_origins: list[str] = ["*"]

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
