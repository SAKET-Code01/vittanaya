"""Main FastAPI Application Entrypoint."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import backend.app.models  # noqa: F401 - Register all SQLAlchemy models
from backend.app.api.v1.router import api_v1_router
from backend.app.core.config import settings
from backend.app.core.database import Base, engine
from backend.app.core.logging import logger
from backend.app.services.seed_service import seed_all_reference_data


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager: create tables & seed reference data on startup."""
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized successfully.")

    logger.info("Seeding VITTANAYA reference libraries and scheme rules...")
    with Session(engine) as db:
        seed_all_reference_data(db)
    logger.info("Reference libraries seeded successfully.")
    yield
    logger.info("Application shutdown complete.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant "
        "for Rural Micro-Entrepreneurs (SIH26091)"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 Router
app.include_router(api_v1_router)


@app.get("/", tags=["Root"])
def root_redirect() -> dict[str, str]:
    """Root redirect endpoint pointing to API status and docs."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/v1/health",
    }
