"""Dashboard summary endpoints with business validation."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.dashboard import DashboardSummaryResponse
from backend.app.services.business_service import BusinessService
from backend.app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/summary", response_model=DashboardSummaryResponse, summary="Get Dashboard Financial Summary"
)
def get_dashboard_summary(
    business_id: Optional[int] = Query(None, description="ID of the business for dashboard calculations"),
    db: Session = Depends(get_db),
) -> DashboardSummaryResponse:
    """Calculates and aggregates current financial summary from transactions and obligations."""
    biz_service = BusinessService(db)
    target_id = business_id
    if target_id is not None:
        if not biz_service.get_business(target_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Business with ID {target_id} not found",
            )
    else:
        businesses = biz_service.list_businesses(limit=1)
        if not businesses:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No business profile exists for dashboard summary",
            )
        target_id = businesses[0].id

    service = DashboardService(db)
    summary = service.get_summary(target_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Financial summary for business ID {target_id} not found",
        )
    return summary
