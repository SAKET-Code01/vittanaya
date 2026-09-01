"""API Endpoints for Administrative Location Search & Hierarchy.

SIH26091 - Local Government Directory (LGD) Location Database API.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.location import LocationRef

router = APIRouter(prefix="/locations", tags=["Administrative Locations"])


class LocationSchema(BaseModel):
    """Location item schema."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    state_code: str
    state_name: str
    district_name: str
    block_name: str
    panchayat_or_village: str
    pincode: Optional[str] = None
    lgd_code: Optional[str] = None


class LocationHierarchyResponse(BaseModel):
    """Location hierarchy schema."""

    districts: List[str]
    blocks: List[str]
    villages: List[str]


@router.get(
    "/search",
    response_model=List[LocationSchema],
    status_code=status.HTTP_200_OK,
    summary="Search Administrative Locations",
)
def search_locations(
    q: str = Query(..., min_length=2, description="Search query for village, block, or district"),
    db: Session = Depends(get_db),
) -> List[LocationSchema]:
    """Search location database by village, block, or district name."""
    term = f"%{q.strip()}%"
    results = (
        db.query(LocationRef)
        .filter(
            (LocationRef.panchayat_or_village.ilike(term))
            | (LocationRef.block_name.ilike(term))
            | (LocationRef.district_name.ilike(term))
        )
        .limit(20)
        .all()
    )
    return [LocationSchema.model_validate(loc) for loc in results]


@router.get(
    "/hierarchy",
    response_model=LocationHierarchyResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Location Administrative Hierarchy",
)
def get_location_hierarchy(
    state_code: str = Query("OD", description="State code (e.g. 'OD')"),
    district: Optional[str] = Query(None, description="Optional district name filter"),
    db: Session = Depends(get_db),
) -> LocationHierarchyResponse:
    """Retrieve list of districts, blocks, and villages for location dropdowns."""
    query = db.query(LocationRef).filter(LocationRef.state_code == state_code)

    districts = [r[0] for r in query.with_entities(LocationRef.district_name).distinct().all()]

    if district:
        query = query.filter(LocationRef.district_name.ilike(district.strip()))

    blocks = [r[0] for r in query.with_entities(LocationRef.block_name).distinct().all()]
    villages = [r[0] for r in query.with_entities(LocationRef.panchayat_or_village).distinct().all()]

    return LocationHierarchyResponse(
        districts=sorted(districts),
        blocks=sorted(blocks),
        villages=sorted(villages),
    )
