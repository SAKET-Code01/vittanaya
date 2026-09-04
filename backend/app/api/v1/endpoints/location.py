"""API Endpoints for Administrative Location Search & Hierarchy.

SIH26091 - Local Government Directory (LGD) Location Database API.
"""

from typing import Dict, List, Optional

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


class MarketPoiSchema(BaseModel):
    """Market map point of interest schema."""

    id: str
    name: str
    type: str
    type_label: str
    distance_km: float
    pos_2d: Dict[str, int]
    height_3d: int
    color: str
    badge_bg: str
    dot_color: str
    demand_score: str
    impact: str
    details: str


class MarketMapResponse(BaseModel):
    """Market map 2D/3D response schema."""

    location_name: str
    district_name: str
    state_name: str
    category: str
    catchment_radius_km: int
    demand_index: float
    is_local_verified: bool
    source_authority: str
    market_reach_description: str
    opportunity_summary: str
    pois: List[MarketPoiSchema]


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


@router.get(
    "/market-map",
    response_model=MarketMapResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Hyperlocal 2D/3D Market Map POIs & Spatial Intelligence",
)
def get_market_map(
    location: Optional[str] = Query(None, description="Village or location name e.g. Kuarmunda"),
    district: Optional[str] = Query(None, description="District name e.g. Sundargarh"),
    category: Optional[str] = Query(None, description="Business sector category e.g. Transport & Logistics"),
    radius_km: int = Query(15, ge=1, le=50, description="Catchment radius filter in km"),
    business_id: Optional[int] = Query(None, description="Optional active business ID"),
    db: Session = Depends(get_db),
) -> MarketMapResponse:
    """Retrieve category-aware Points of Interest (POIs) and market intelligence for 2D/3D map."""
    from backend.app.models.market_data import LocalMarketData
    from backend.app.services.reference_data_service import ReferenceDataService

    loc_name = (location or "Kuarmunda").split(",")[0].strip()
    dist_name = (district or "Sundargarh").strip()
    cat_name = (category or "Transport & Logistics").strip()

    district_profile = ReferenceDataService.get_district_profile(dist_name)

    # Search local market dataset table
    market_rec = (
        db.query(LocalMarketData)
        .filter(LocalMarketData.district_name.ilike(f"%{dist_name}%"))
        .first()
    )

    is_local_verified = False
    source_auth = "NABARD Odisha PLP 2025-26"
    market_reach = f"Verified commercial transport & procurement routes in {dist_name}"
    opp_summary = f"Strong regional demand momentum for {cat_name} in {dist_name} catchment"
    demand_idx = district_profile.get("demand_index", 82.0)

    if market_rec:
        is_local_verified = True
        source_auth = market_rec.source_authority or source_auth
        market_reach = market_rec.market_reach_description or market_reach
        opp_summary = market_rec.opportunity_summary or opp_summary
        demand_idx = market_rec.base_score or demand_idx

    cat_lower = cat_name.lower()

    if "dairy" in cat_lower or "milk" in cat_lower:
        base_pois = [
            {
                "id": "poi-1",
                "name": f"{dist_name} Milk Union Center",
                "type": "industrial",
                "type_label": "Milk Procurement Center",
                "distance_km": 2.5,
                "pos_2d": {"x": 100, "y": 75},
                "height_3d": 34,
                "color": "#10B981",
                "badge_bg": "bg-emerald-900/90 text-emerald-100 border-emerald-400/50 shadow-emerald-950/50",
                "dot_color": "bg-emerald-400",
                "demand_score": "94/100",
                "impact": "High Impact",
                "details": f"Primary dairy collection hub in {dist_name} with daily liquid milk off-take guarantees.",
            },
            {
                "id": "poi-2",
                "name": "Chilling & Bulk Storage Depot",
                "type": "logistics",
                "type_label": "Cold Chain Logistics",
                "distance_km": 7.8,
                "pos_2d": {"x": 350, "y": 80},
                "height_3d": 42,
                "color": "#3B82F6",
                "badge_bg": "bg-blue-900/90 text-blue-100 border-blue-400/50 shadow-blue-950/50",
                "dot_color": "bg-blue-400",
                "demand_score": "90/100",
                "impact": "High Impact",
                "details": "Bulk milk chilling unit preserving raw milk quality for regional cooperative routes.",
            },
            {
                "id": "poi-3",
                "name": f"{loc_name} Sweet Stalls & Dairy Belt",
                "type": "demand",
                "type_label": "High Demand Zone",
                "distance_km": 3.1,
                "pos_2d": {"x": 80, "y": 225},
                "height_3d": 28,
                "color": "#F43F5E",
                "badge_bg": "bg-rose-900/90 text-rose-100 border-rose-400/50 shadow-rose-950/50",
                "dot_color": "bg-rose-400",
                "demand_score": "96/100",
                "impact": "Critical Impact",
                "details": "Dense retail cluster of sweet shops & tea vendors requiring fresh daily unadulterated milk.",
            },
            {
                "id": "poi-4",
                "name": "Cattle Feed & Vet Station",
                "type": "transport",
                "type_label": "Agri Support",
                "distance_km": 4.2,
                "pos_2d": {"x": 360, "y": 180},
                "height_3d": 38,
                "color": "#F97316",
                "badge_bg": "bg-orange-900/90 text-orange-100 border-orange-400/50 shadow-orange-950/50",
                "dot_color": "bg-orange-400",
                "demand_score": "85/100",
                "impact": "Favorable",
                "details": "Subsidized cattle feed distribution center and emergency AI/veterinary health services.",
            },
            {
                "id": "poi-5",
                "name": f"{loc_name} Town Market",
                "type": "demand",
                "type_label": "Commercial Market",
                "distance_km": 1.2,
                "pos_2d": {"x": 225, "y": 245},
                "height_3d": 26,
                "color": "#0EA5E9",
                "badge_bg": "bg-sky-900/90 text-sky-100 border-sky-400/50 shadow-sky-950/50",
                "dot_color": "bg-sky-400",
                "demand_score": "88/100",
                "impact": "Medium Impact",
                "details": "Core local retail & weekly haat ecosystem with 3,500+ daily footfalls.",
            },
            {
                "id": "poi-6",
                "name": "Highway Hotel & Catering Hub",
                "type": "demand",
                "type_label": "Institutional Demand",
                "distance_km": 9.5,
                "pos_2d": {"x": 390, "y": 260},
                "height_3d": 20,
                "color": "#8B5CF6",
                "badge_bg": "bg-purple-900/90 text-purple-100 border-purple-400/50 shadow-purple-950/50",
                "dot_color": "bg-purple-400",
                "demand_score": "92/100",
                "impact": "High Impact",
                "details": "Roadside eateries and hotels consuming bulk paneer, curd & butter.",
            },
        ]
    elif "agro" in cat_lower or "food" in cat_lower or "processing" in cat_lower:
        base_pois = [
            {
                "id": "poi-1",
                "name": f"{dist_name} Crop Mandi",
                "type": "industrial",
                "type_label": "Agri Mandi",
                "distance_km": 3.5,
                "pos_2d": {"x": 100, "y": 75},
                "height_3d": 34,
                "color": "#10B981",
                "badge_bg": "bg-emerald-900/90 text-emerald-100 border-emerald-400/50 shadow-emerald-950/50",
                "dot_color": "bg-emerald-400",
                "demand_score": "95/100",
                "impact": "High Impact",
                "details": "District agricultural produce market with high seasonal crop inflow.",
            },
            {
                "id": "poi-2",
                "name": "PM-FME Processing Hub",
                "type": "logistics",
                "type_label": "Processing Cluster",
                "distance_km": 6.2,
                "pos_2d": {"x": 350, "y": 80},
                "height_3d": 42,
                "color": "#3B82F6",
                "badge_bg": "bg-blue-900/90 text-blue-100 border-blue-400/50 shadow-blue-950/50",
                "dot_color": "bg-blue-400",
                "demand_score": "92/100",
                "impact": "High Impact",
                "details": "Government backed food testing, grading & retail packaging ecosystem.",
            },
            {
                "id": "poi-3",
                "name": "ORMAS SHG Retail Outlets",
                "type": "demand",
                "type_label": "High Demand Zone",
                "distance_km": 2.1,
                "pos_2d": {"x": 80, "y": 225},
                "height_3d": 28,
                "color": "#F43F5E",
                "badge_bg": "bg-rose-900/90 text-rose-100 border-rose-400/50 shadow-rose-950/50",
                "dot_color": "bg-rose-400",
                "demand_score": "89/100",
                "impact": "Critical Impact",
                "details": "Direct rural retail store network for packaged spices, flour & processed foods.",
            },
            {
                "id": "poi-4",
                "name": "Cold Storage & Warehouse Depot",
                "type": "logistics",
                "type_label": "Logistics Depot",
                "distance_km": 8.5,
                "pos_2d": {"x": 360, "y": 180},
                "height_3d": 38,
                "color": "#F97316",
                "badge_bg": "bg-orange-900/90 text-orange-100 border-orange-400/50 shadow-orange-950/50",
                "dot_color": "bg-orange-400",
                "demand_score": "91/100",
                "impact": "Favorable",
                "details": "Temperature controlled warehouse preventing post-harvest crop spoilage.",
            },
            {
                "id": "poi-5",
                "name": f"{loc_name} Town Market",
                "type": "demand",
                "type_label": "Commercial Market",
                "distance_km": 1.5,
                "pos_2d": {"x": 225, "y": 245},
                "height_3d": 26,
                "color": "#0EA5E9",
                "badge_bg": "bg-sky-900/90 text-sky-100 border-sky-400/50 shadow-sky-950/50",
                "dot_color": "bg-sky-400",
                "demand_score": "86/100",
                "impact": "Medium Impact",
                "details": "Core retail market hub with high consumer grocery & grain demand.",
            },
            {
                "id": "poi-6",
                "name": "Spices & Crop Assembly Center",
                "type": "industrial",
                "type_label": "Raw Crop Center",
                "distance_km": 12.0,
                "pos_2d": {"x": 390, "y": 260},
                "height_3d": 20,
                "color": "#8B5CF6",
                "badge_bg": "bg-purple-900/90 text-purple-100 border-purple-400/50 shadow-purple-950/50",
                "dot_color": "bg-purple-400",
                "demand_score": "86/100",
                "impact": "High Impact",
                "details": "Bulk farmer collection center for raw turmeric, ginger, and oilseeds.",
            },
        ]
    else:
        base_pois = [
            {
                "id": "poi-1",
                "name": f"{dist_name} Industrial Corridor",
                "type": "industrial",
                "type_label": "Industrial Cluster",
                "distance_km": 4.8,
                "pos_2d": {"x": 100, "y": 75},
                "height_3d": 34,
                "color": "#8B5CF6",
                "badge_bg": "bg-purple-900/90 text-purple-100 border-purple-400/50 shadow-purple-950/50",
                "dot_color": "bg-purple-400",
                "demand_score": "92/100",
                "impact": "High Impact",
                "details": f"Major manufacturing & fabrication hub in {dist_name} generating continuous B2B orders.",
            },
            {
                "id": "poi-2",
                "name": "District Freight Logistics Hub",
                "type": "logistics",
                "type_label": "Logistics Terminal",
                "distance_km": 8.2,
                "pos_2d": {"x": 350, "y": 80},
                "height_3d": 42,
                "color": "#3B82F6",
                "badge_bg": "bg-blue-900/90 text-blue-100 border-blue-400/50 shadow-blue-950/50",
                "dot_color": "bg-blue-400",
                "demand_score": "95/100",
                "impact": "High Impact",
                "details": "Central cargo transit & warehousing hub connecting arterial state corridors.",
            },
            {
                "id": "poi-3",
                "name": "Highway Commercial Depot",
                "type": "transport",
                "type_label": "Transport Hub",
                "distance_km": 3.2,
                "pos_2d": {"x": 80, "y": 225},
                "height_3d": 28,
                "color": "#F97316",
                "badge_bg": "bg-orange-900/90 text-orange-100 border-orange-400/50 shadow-orange-950/50",
                "dot_color": "bg-orange-400",
                "demand_score": "97/100",
                "impact": "Critical Impact",
                "details": "High-frequency vehicular transit junction with 24/7 fleet turnaround operations.",
            },
            {
                "id": "poi-4",
                "name": "High-Demand Commercial Zone",
                "type": "demand",
                "type_label": "High Demand Zone",
                "distance_km": 6.5,
                "pos_2d": {"x": 360, "y": 180},
                "height_3d": 48,
                "color": "#F43F5E",
                "badge_bg": "bg-rose-900/90 text-rose-100 border-rose-400/50 shadow-rose-950/50",
                "dot_color": "bg-rose-400",
                "demand_score": "90/100",
                "impact": "High Impact",
                "details": "Est. ₹38 Lakhs/month unfulfilled supply gap with strong local consumer purchasing capacity.",
            },
            {
                "id": "poi-5",
                "name": f"{loc_name} Town Market",
                "type": "demand",
                "type_label": "Commercial Market",
                "distance_km": 1.5,
                "pos_2d": {"x": 225, "y": 245},
                "height_3d": 26,
                "color": "#0EA5E9",
                "badge_bg": "bg-sky-900/90 text-sky-100 border-sky-400/50 shadow-sky-950/50",
                "dot_color": "bg-sky-400",
                "demand_score": "86/100",
                "impact": "Medium Impact",
                "details": "Core retail & weekly haat ecosystem with 3,800+ daily footfalls.",
            },
            {
                "id": "poi-6",
                "name": "Regional Agri Procurement Mandi",
                "type": "industrial",
                "type_label": "Agri Procurement",
                "distance_km": 11.8,
                "pos_2d": {"x": 390, "y": 260},
                "height_3d": 20,
                "color": "#10B981",
                "badge_bg": "bg-emerald-900/90 text-emerald-100 border-emerald-400/50 shadow-emerald-950/50",
                "dot_color": "bg-emerald-400",
                "demand_score": "88/100",
                "impact": "High Impact",
                "details": "Agricultural produce assembly & packaging center with high seasonal haulage volume.",
            },
        ]

    filtered_pois = [MarketPoiSchema(**p) for p in base_pois if p["distance_km"] <= float(radius_km)]

    return MarketMapResponse(
        location_name=loc_name,
        district_name=dist_name,
        state_name="Odisha",
        category=cat_name,
        catchment_radius_km=radius_km,
        demand_index=float(demand_idx),
        is_local_verified=is_local_verified,
        source_authority=source_auth,
        market_reach_description=market_reach,
        opportunity_summary=opp_summary,
        pois=filtered_pois,
    )

