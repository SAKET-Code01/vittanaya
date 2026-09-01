"""Business profile endpoints with strict active business resolution & validation."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.business import BusinessCreate, BusinessResponse, BusinessUpdate
from backend.app.services.business_service import BusinessService

router = APIRouter(prefix="/business", tags=["Business Profile"])


@router.get("", response_model=BusinessResponse, summary="Get Business Profile")
def get_business(
    business_id: Optional[int] = Query(None, description="ID of the business to retrieve"),
    db: Session = Depends(get_db),
) -> BusinessResponse:
    """Retrieve details for a specific rural micro-enterprise profile."""
    service = BusinessService(db)
    if business_id is not None:
        biz = service.get_business(business_id)
        if not biz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Business with ID {business_id} not found",
            )
        return biz  # type: ignore

    # Fallback to first existing business if no ID explicitly provided
    businesses = service.list_businesses(limit=1)
    if not businesses:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business profile found in active workspace",
        )
    return businesses[0]  # type: ignore


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
    business_id: Optional[int] = Query(None, description="ID of the business to update"),
    db: Session = Depends(get_db),
) -> BusinessResponse:
    """Update editable fields on a rural micro-enterprise profile."""
    service = BusinessService(db)
    target_id = business_id
    if target_id is None:
        businesses = service.list_businesses(limit=1)
        if not businesses:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No business profile exists to update",
            )
        target_id = businesses[0].id

    updated = service.update_business(target_id, data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {target_id} not found",
        )
    return updated  # type: ignore
