"""Health check endpoint."""

from fastapi import APIRouter

from backend.app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Service Health Check")
def get_health() -> dict[str, str]:
    """Verify backend API operational health and application version."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@router.get(
    "/health/db",
    summary="Database Connectivity Health Check",
    response_model=None,
)
def get_db_health():
    """Safely verify database connection health without exposing credentials."""
    from fastapi.responses import JSONResponse
    from sqlalchemy import text
    from sqlalchemy.orm import Session

    from backend.app.core.database import engine
    from backend.app.core.logging import logger

    try:
        with Session(engine) as db:
            db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        logger.error(f"Database health probe failed: {exc}")
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": "unreachable"},
        )
