"""API Endpoints for Business Readiness & Requirement Tracking.

SIH26091 - Business Readiness Engine & Statutory Verification Tracking.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.readiness import (
    BusinessReadinessResponse,
    BusinessRequirementSchema,
    RequirementUpdateSchema,
)
from backend.app.services.readiness_service import ReadinessService

router = APIRouter(prefix="/readiness", tags=["Business Readiness"])


@router.get(
    "/{business_id}",
    response_model=BusinessReadinessResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Business Readiness Evaluation",
)
def get_business_readiness(
    business_id: int,
    db: Session = Depends(get_db),
) -> BusinessReadinessResponse:
    """Retrieve authoritative live readiness score, category breakdowns, and compliance items."""
    service = ReadinessService(db)
    res = service.evaluate_readiness(business_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {business_id} not found",
        )
    return res


@router.get(
    "/{business_id}/requirements",
    response_model=List[BusinessRequirementSchema],
    status_code=status.HTTP_200_OK,
    summary="List All Resolved Requirements for Business",
)
def list_requirements(
    business_id: int,
    db: Session = Depends(get_db),
) -> List[BusinessRequirementSchema]:
    """List full tailored statutory and operational requirements for enterprise."""
    service = ReadinessService(db)
    res = service.evaluate_readiness(business_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {business_id} not found",
        )
    return res.requirements


@router.patch(
    "/{business_id}/requirements/{requirement_id}",
    response_model=BusinessReadinessResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Requirement Status & Recalculate Readiness",
)
def update_requirement(
    business_id: int,
    requirement_id: str,
    payload: RequirementUpdateSchema,
    db: Session = Depends(get_db),
) -> BusinessReadinessResponse:
    """Update requirement completion state, synchronize linked Action Plan tasks, and return fresh readiness."""
    service = ReadinessService(db)
    updated = service.update_requirement_status(
        business_id=business_id,
        requirement_id=requirement_id,
        new_status=payload.status or "completed",
        submission_status=payload.submission_status,
        verification_status=payload.verification_status,
        notes=payload.notes,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requirement '{requirement_id}' for business #{business_id} not found",
        )
    return service.evaluate_readiness(business_id)  # type: ignore
