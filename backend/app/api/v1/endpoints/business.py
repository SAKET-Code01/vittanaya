"""Business profile endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.business import BusinessCreate, BusinessResponse, BusinessUpdate
from backend.app.services.business_service import BusinessService

router = APIRouter(prefix="/business", tags=["Business Profile"])


@router.get("", response_model=BusinessResponse, summary="Get Business Profile")
def get_business(
    business_id: int = Query(1, description="ID of the business to retrieve"),
    db: Session = Depends(get_db),
) -> BusinessResponse:
    """Retrieve details for a specific rural micro-enterprise profile."""
    service = BusinessService(db)
    biz = service.get_business(business_id)
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {business_id} not found",
        )
    return biz  # type: ignore


@router.post(
    "",
    response_model=BusinessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Business Profile",
)
def create_business(
    data: BusinessCreate,
    db: Session = Depends(get_db),
) -> BusinessResponse:
    """Create a new business profile."""
    service = BusinessService(db)
    return service.create_business(data)  # type: ignore


@router.patch("", response_model=BusinessResponse, summary="Update Business Profile")
def update_business(
    data: BusinessUpdate,
    business_id: int = Query(1, description="ID of the business to update"),
    db: Session = Depends(get_db),
) -> BusinessResponse:
    """Update editable fields on a rural micro-enterprise profile."""
    service = BusinessService(db)
    updated = service.update_business(business_id, data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {business_id} not found",
        )
    return updated  # type: ignore
