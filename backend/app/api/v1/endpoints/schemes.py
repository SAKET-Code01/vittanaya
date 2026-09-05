"""API Endpoints for VITTANAYA Government Scheme Intelligence Engine.

SIH26091 - Verified Government Scheme Matching & Advisory Service:
- GET /api/v1/schemes/match
- Connects verified scheme repository, deterministic eligibility rules, and Groq advisory explanations.
"""


from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.engines.scheme_engine import SchemeEngine
from backend.app.schemas.insights import SchemeMatchRequest, SchemeMatchResponse

router = APIRouter(prefix="/schemes", tags=["Government Scheme Intelligence"])


@router.get(
    "/match",
    response_model=SchemeMatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Government Scheme Intelligence Match Engine",
    description="Deterministic government credit, subsidy, and loan guarantee scheme matching against verified scheme rules.",
)
def match_schemes_get(
    business_type: str = Query(..., description="Business type / activity (e.g. Dairy, Poultry, Manufacturing, Retail)"),
    location: str = Query("Odisha", description="Location / District (e.g. Sundargarh, Odisha)"),
    investment: float = Query(..., ge=0, description="Indicative investment / project cost in INR"),
    own_capital: float = Query(0.0, ge=0, description="Available own / starting margin capital in INR"),
    beneficiary_category: str = Query("General", description="Beneficiary social category: General, OBC, SC, ST, Women, Minority, Ex-Servicemen, PwD"),
    area_classification: str = Query("Rural", description="Area classification: Rural or Urban"),
    include_explanation: bool = Query(False, description="Optionally include Groq advisory explanation narrative"),
    db: Session = Depends(get_db),
) -> SchemeMatchResponse:
    """Evaluate deterministic eligibility for government schemes and return ranked matches."""
    engine = SchemeEngine(db)
    return engine.match_schemes(
        indicative_project_cost=investment,
        available_margin_capital=own_capital,
        business_category=business_type,
        specific_business=business_type,
        location=location,
        social_category=beneficiary_category,
        area_type=area_classification,
    )


@router.post(
    "/match",
    response_model=SchemeMatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Government Scheme Intelligence Match Engine (POST)",
    description="POST alternative accepting structured JSON payload for scheme matching.",
)
def match_schemes_post(
    payload: SchemeMatchRequest,
    db: Session = Depends(get_db),
) -> SchemeMatchResponse:
    """Evaluate deterministic eligibility for government schemes via POST body."""
    engine = SchemeEngine(db)
    return engine.match_schemes(
        indicative_project_cost=payload.indicative_project_cost,
        available_margin_capital=payload.available_margin_capital,
        business_category=payload.business_category,
        specific_business=payload.specific_business,
        location=payload.location,
        social_category=payload.social_category,
        area_type=payload.area_type,
    )
