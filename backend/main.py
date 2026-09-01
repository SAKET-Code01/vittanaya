"""Main FastAPI Application Entrypoint."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Normalize FastAPI HTTPExceptions into predictable JSON error contract."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail if isinstance(exc.detail, (str, list, dict)) else str(exc.detail),
            "status_code": exc.status_code,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    """Format Pydantic 422 validation errors into human-readable detail strings."""
    errors = exc.errors()
    formatted_detail = ", ".join(
        [f"{'.'.join(str(loc) for loc in err.get('loc', []))}: {err.get('msg', 'invalid')}" for err in errors]
    )
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({
            "detail": f"Validation Error: {formatted_detail}",
            "status_code": 422,
            "errors": errors,
        }),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc: Exception):
    """Catch unhandled server errors without exposing raw internal tracebacks."""
    logger.error(f"Unhandled server exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred while processing your request. Please try again later.",
            "status_code": 500,
        },
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
