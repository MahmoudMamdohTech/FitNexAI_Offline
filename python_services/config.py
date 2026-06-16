"""
FitNex AI — Centralised Configuration
All settings come from environment variables via pydantic-settings.
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # database (Supabase PostgreSQL)
    DATABASE_URL: str

    # JWT auth
    JWT_SECRET: str = "fitnex-super-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 72  # 3 days

    # CORS
    ALLOWED_ORIGINS: str = "*"

    # SMTP (Gmail for now)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""   # Gmail App Password
    SMTP_FROM_EMAIL: str = ""

    # frontend URL (for email links)
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
