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
