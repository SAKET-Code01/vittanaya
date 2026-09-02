"""Business profile endpoints with strict active business resolution & validation."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.business import BusinessCreate, BusinessResponse, BusinessUpdate
from backend.app.services.business_service import BusinessService

router = APIRouter(prefix="/business", tags=["Business Profile"])


@router.get("/list", response_model=list[BusinessResponse], summary="List All Business Profiles")
def list_businesses(
    db: Session = Depends(get_db),
) -> list[BusinessResponse]:
    """List all business profiles in the active workspace."""
    service = BusinessService(db)
    return service.list_businesses(limit=50)  # type: ignore


@router.get("", response_model=BusinessResponse, summary="Get Business Profile by ID")
def get_business(
    business_id: int = Query(..., description="ID of the business to retrieve"),
    db: Session = Depends(get_db),
) -> BusinessResponse:
    """Retrieve details for a specific rural micro-enterprise profile by explicit ID."""
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


@router.patch("/{business_id}", response_model=BusinessResponse, summary="Update Business Profile by Path")
@router.put("/{business_id}", response_model=BusinessResponse, summary="Update Business Profile by Path")
def update_business(
    business_id: int,
    data: BusinessUpdate,
    db: Session = Depends(get_db),
) -> BusinessResponse:
    """Update editable fields on a rural micro-enterprise profile by explicit ID."""
    service = BusinessService(db)
    updated = service.update_business(business_id, data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {business_id} not found",
        )
    return updated  # type: ignore


@router.patch("", response_model=BusinessResponse, summary="Update Business Profile by Query")
@router.put("", response_model=BusinessResponse, summary="Update Business Profile by Query")
def update_business_query(
    data: BusinessUpdate,
    business_id: int = Query(..., description="ID of the business to update"),
    db: Session = Depends(get_db),
) -> BusinessResponse:
    """Update editable fields on a rural micro-enterprise profile by query parameter ID."""
    return update_business(business_id=business_id, data=data, db=db)

