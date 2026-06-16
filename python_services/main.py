"""
FitNex AI Backend API
Handles authentication, user profiles, AI meal generation, and real-time posture analysis.
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import create_tables

# routers
from routers import auth as auth_router
from routers import users as users_router
from routers import nutrition
from routers import gym as gym_router

# Gym camera router is optional — nutrition/auth still work if camera deps missing
analyze_router = None
analyze_import_error = None
try:
    from routers import analyze as analyze_module
    analyze_router = analyze_module.router
except Exception as exc:
    analyze_import_error = str(exc)

# logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("fitnex_ai")


# app lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FitNex AI Unified Service starting up …")

    # Warn if running with default dev JWT secret
    if settings.JWT_SECRET in ("fitnex-super-secret-change-in-production", "fitnex-dev-secret-key-change-me"):
        logger.warning(
            "JWT_SECRET is set to a default dev value! "
            "Change this immediately for production deployments."
        )

    # Create database tables (dev mode — use Alembic in production)
    await create_tables()
    logger.info("Database tables verified/created.")
    yield
    logger.info("FitNex AI Unified Service shutting down …")


# FastAPI app initialization
app = FastAPI(
    title="FitNex AI — Unified Backend",
    description=(
        "Full-stack API: auth, user profiles, AI nutrition, "
        "AI camera analysis, and workout tracking. "
        "Replaces the legacy PHP + FastAPI dual-backend."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

if analyze_import_error:
    logger.warning("Gym analyze router disabled: %s", analyze_import_error)

# CORS middleware
allowed_origins = (
    ["*"]
    if settings.ALLOWED_ORIGINS == "*"
    else [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount routers under /api/v1
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(users_router.router, prefix="/api/v1")
app.include_router(nutrition.router, prefix="/api/v1")
app.include_router(gym_router.router, prefix="/api/v1")

if analyze_router is not None:
    app.include_router(analyze_router, prefix="/api/v1")


# health check endpoint
@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "service": "fitnex_ai_unified",
        "version": "2.0.0",
        "gym_camera": "enabled" if analyze_router else "disabled",
    }
