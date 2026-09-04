"""
Application configuration loaded from environment variables.

All secrets must come from .env files — never hardcoded in source.
"""

from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- Application ---
    APP_NAME: str = "VITTANAYA"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # --- Database ---
    DATABASE_URL: str = "sqlite:///./vittanaya.db"

    # --- External AI Provider (Groq API) ---
    GROQ_API_KEY: str | None = None
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GEMINI_API_KEY: str | None = None  # Deprecated legacy key

    # --- Security ---
    SECRET_KEY: str = "CHANGE-THIS-IN-PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return origins or ["http://localhost:3000", "http://localhost:5173"]

    # --- Paths ---
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        """Enforce PostgreSQL and production security constraints."""
        if self.ENVIRONMENT.lower() == "production":
            normalized_db = self.DATABASE_URL.lower()
            if normalized_db.startswith("sqlite") or "vittanaya.db" in normalized_db:
                raise ValueError(
                    "Production environment requires a valid PostgreSQL DATABASE_URL. "
                    "SQLite is strictly prohibited in production."
                )
        return self

    model_config = {
        "env_file": [".env", str(Path(__file__).resolve().parent.parent.parent / ".env")],
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


# Singleton instance
settings = Settings()
