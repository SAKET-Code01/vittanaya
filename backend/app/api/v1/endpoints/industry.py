"""Endpoints for Industry-Adaptive Business Intelligence."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.industry import (
    IndustryAnalysisRequest,
    IndustryAnalysisResponse,
    IndustryTemplateResponse,
)
from backend.app.services.business_service import BusinessService
from backend.app.services.industry_service import IndustryService

router = APIRouter(prefix="/industry", tags=["Industry Intelligence"])


@router.get(
    "/templates",
    response_model=List[IndustryTemplateResponse],
    status_code=status.HTTP_200_OK,
    summary="List Supported Industry Configuration Templates",
)
def get_industry_templates() -> List[IndustryTemplateResponse]:
    """Retrieve supported industry input field specifications for progressive UI intake."""
    return IndustryService.get_templates()


@router.post(
    "/analyze",
    response_model=IndustryAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Industry-Specific Variables & Compute Sector KPIs",
)
def analyze_industry(
    data: IndustryAnalysisRequest,
    db: Session = Depends(get_db),
) -> IndustryAnalysisResponse:
    """Analyze industry-specific variables, compute sector KPIs, generate risk signals, and normalize revenue/expenses."""
    if data.business_id:
        biz_service = BusinessService(db)
        if not biz_service.get_business(data.business_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Business with ID {data.business_id} does not exist",
            )
    return IndustryService.analyze(data, db=db)
