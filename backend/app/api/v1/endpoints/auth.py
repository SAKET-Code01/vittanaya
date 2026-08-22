"""Authentication endpoint contract placeholder for Phase 1."""

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/status", summary="Auth Status")
def auth_status() -> dict[str, str]:
    """Provides authentication status information for Phase 1."""
    return {
        "status": "foundation_ready",
        "auth_enabled": "false",
        "message": "Authentication layer will be implemented in future phase.",
    }
