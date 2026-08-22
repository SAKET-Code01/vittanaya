"""Advisory status and recommendations placeholder endpoints."""

from fastapi import APIRouter

from backend.app.services.advisory_service import AdvisoryService

router = APIRouter(prefix="/advisory", tags=["Business Advisory"])


@router.get("/status", summary="Advisory Engine Status")
def get_advisory_status() -> dict[str, str]:
    """Returns safe advisory status without fabricated AI advice in Phase 1 foundation."""
    return AdvisoryService.get_status()
