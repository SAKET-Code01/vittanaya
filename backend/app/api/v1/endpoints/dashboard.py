"""Dashboard summary endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.dashboard import DashboardSummaryResponse
from backend.app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/summary", response_model=DashboardSummaryResponse, summary="Get Dashboard Financial Summary"
)
def get_dashboard_summary(
    business_id: int = Query(1, description="ID of the business for dashboard calculations"),
    db: Session = Depends(get_db),
) -> DashboardSummaryResponse:
    """Calculates and aggregates current financial summary from transactions and obligations."""
    service = DashboardService(db)
    summary = service.get_summary(business_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {business_id} not found",
        )
    return summary
