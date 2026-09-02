"""API Endpoints for VITTANAYA Intelligence Components.

SIH26091 - Insights Backend Services:
- Local Opportunity / Feasibility
- Financial Gap / Structuring
- Scheme Match
- Risk Advisory
- What-If Simulation
- AI Business Advisor
- Unified Analysis
"""

from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.engines.ai_advisor import AIBusinessAdvisor
from backend.app.engines.cost_engine import ProjectCostEngine
from backend.app.engines.feasibility_engine import FeasibilityEngine
from backend.app.engines.financial_engine import FinancialEngine
from backend.app.engines.risk_engine import RiskEngine
from backend.app.engines.scheme_engine import SchemeEngine
from backend.app.engines.whatif_engine import WhatIfEngine
from backend.app.schemas.insights import (
    AdvisorRequest,
    AdvisorResponse,
    FeasibilityRequest,
    FeasibilityResponse,
    ProjectCostRequest,
    ProjectCostResponse,
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    SchemeMatchRequest,
    SchemeMatchResponse,
    SimulationRequest,
    SimulationResponse,
    UnifiedInsightsRequest,
    UnifiedInsightsResponse,
)

router = APIRouter(tags=["VITTANAYA Insights & Intelligence"])


@router.post(
    "/project-cost",
    response_model=ProjectCostResponse,
    status_code=status.HTTP_200_OK,
    summary="Project Cost Lookup Engine",
)
def get_project_cost(
    payload: ProjectCostRequest,
    db: Session = Depends(get_db),
) -> ProjectCostResponse:
    """Lookup official indicative project cost using Odisha-first priority hierarchy."""
    engine = ProjectCostEngine(db)
    return engine.get_indicative_cost(
        business_activity=payload.business_activity,
        business_category=payload.business_category,
        location=payload.location,
        scale=payload.scale,
        business_name=payload.business_name,
        business_id=payload.business_id,
    )


def _disambiguate_activity_and_category(
    db: Session,
    business_id: Optional[int] = None,
    business_name: Optional[str] = None,
    business_activity: Optional[str] = None,
    business_category: Optional[str] = None,
) -> tuple[str, str]:
    """Resolve authoritative activity and sector category, preventing entity names as activities."""
    from backend.app.models.business import Business

    db_biz = None
    if business_id:
        db_biz = db.query(Business).filter(Business.id == business_id).first()
    elif business_name:
        db_biz = db.query(Business).filter(Business.name.ilike(business_name.strip())).first()
    elif business_activity:
        db_biz = db.query(Business).filter(Business.name.ilike(business_activity.strip())).first()

    activity = business_activity
    category = business_category

    if db_biz:
        if not category or category.lower() in ("general", "retail"):
            category = db_biz.category or db_biz.type or category
        if (
            not activity
            or activity.strip().lower() == db_biz.name.strip().lower()
            or activity.strip().lower() in ("general enterprise", "enterprise", "retail")
        ):
            activity = db_biz.industry or db_biz.category or activity

    clean_activity = activity.strip() if activity else "General Enterprise"
    clean_category = category.strip() if category else "General"
    return clean_activity, clean_category


@router.post(
    "/feasibility",
    response_model=FeasibilityResponse,
    status_code=status.HTTP_200_OK,
    summary="Local Opportunity & Feasibility Engine",
)
def analyze_feasibility(
    payload: FeasibilityRequest,
    db: Session = Depends(get_db),
) -> FeasibilityResponse:
    """Evaluate market reach, opportunity, competition, pricing, threats, and SWOT."""
    clean_activity, clean_category = _disambiguate_activity_and_category(
        db,
        business_id=payload.business_id,
        business_name=payload.business_name,
        business_activity=payload.specific_business,
        business_category=payload.business_category,
    )
    engine = FeasibilityEngine(db)
    return engine.evaluate_feasibility(
        business_category=clean_category,
        specific_business=clean_activity,
        location=payload.location,
        scale=payload.scale,
    )


@router.post(
    "/scheme-match",
    response_model=SchemeMatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Deterministic Scheme Match Engine",
)
def match_schemes(
    payload: SchemeMatchRequest,
    db: Session = Depends(get_db),
) -> SchemeMatchResponse:
    """Match government credit & subsidy schemes against project parameters."""
    clean_activity, clean_category = _disambiguate_activity_and_category(
        db,
        business_id=payload.business_id,
        business_name=payload.business_name,
        business_activity=payload.specific_business,
        business_category=payload.business_category,
    )
    engine = SchemeEngine(db)
    return engine.match_schemes(
        indicative_project_cost=payload.indicative_project_cost,
        available_margin_capital=payload.available_margin_capital,
        business_category=clean_category,
        specific_business=clean_activity,
        location=payload.location,
        social_category=payload.social_category,
        area_type=payload.area_type,
    )


@router.post(
    "/risk-analysis",
    response_model=RiskAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Risk Advisory Engine",
)
def analyze_risks(
    payload: RiskAnalysisRequest,
    db: Session = Depends(get_db),
) -> RiskAnalysisResponse:
    """Calculate market, competition, operational, seasonality, and financial risk dimensions."""
    clean_activity, clean_category = _disambiguate_activity_and_category(
        db,
        business_id=payload.business_id,
        business_name=payload.business_name,
        business_activity=payload.specific_business,
        business_category=payload.business_category,
    )
    engine = RiskEngine(db)
    return engine.analyze_risks(
        business_category=clean_category,
        specific_business=clean_activity,
        indicative_project_cost=payload.indicative_project_cost,
        available_margin_capital=payload.available_margin_capital,
        financing_requirement=payload.financing_requirement,
        location=payload.location,
        seasonality_factor=payload.seasonality_factor,
    )


@router.post(
    "/simulation",
    response_model=SimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="What-If Isolated Scenario Engine",
)
def run_simulation(
    payload: SimulationRequest,
) -> SimulationResponse:
    """Recalculate isolated scenario under sales/cost/price/financing/demand parameter changes."""
    engine = WhatIfEngine()
    return engine.simulate(
        baseline_project_cost=payload.baseline_project_cost,
        baseline_available_margin=payload.baseline_available_margin,
        baseline_sales_annual=payload.baseline_sales_annual,
        baseline_operating_cost_annual=payload.baseline_operating_cost_annual,
        sales_change=payload.sales_change,
        cost_change=payload.cost_change,
        price_change=payload.price_change,
        financing_change=payload.financing_change,
        demand_change=payload.demand_change,
    )


@router.post(
    "/advisor",
    response_model=AdvisorResponse,
    status_code=status.HTTP_200_OK,
    summary="Zero-Hallucination AI Business Advisor",
)
def get_advice(
    payload: AdvisorRequest,
) -> AdvisorResponse:
    """Synthesize structured backend results into plain language explanations and next steps."""
    engine = AIBusinessAdvisor()
    return engine.generate_advice(
        opportunity=payload.opportunity,
        financial=payload.financial,
        schemes=payload.schemes,
        risks=payload.risks,
        what_if=payload.what_if,
    )


@router.post(
    "/insights/analyze",
    response_model=UnifiedInsightsResponse,
    status_code=status.HTTP_200_OK,
    summary="Unified Insights Analysis Endpoint",
)
@router.post(
    "/analyze",
    response_model=UnifiedInsightsResponse,
    status_code=status.HTTP_200_OK,
    summary="Unified Insights Analysis Endpoint Alias",
)
def analyze_all_insights(
    payload: UnifiedInsightsRequest,
    db: Session = Depends(get_db),
) -> UnifiedInsightsResponse:
    """Execute complete intelligence analysis pipeline returning all 6 components."""
    clean_activity, clean_category = _disambiguate_activity_and_category(
        db,
        business_id=payload.business_id,
        business_name=payload.business_name,
        business_activity=payload.business_activity or payload.specific_business,
        business_category=payload.business_category,
    )

    # 1. Financial Gap Analysis (includes Cost Engine)
    fin_engine = FinancialEngine(db)
    fin_res = fin_engine.analyze_financial_gap(
        available_margin_capital=payload.available_margin_capital,
        business_category=clean_category,
        specific_business=clean_activity,
        location=payload.location,
        scale=payload.scale,
        business_id=payload.business_id,
    )

    # 2. Local Opportunity / Feasibility Analysis
    feas_engine = FeasibilityEngine(db)
    feas_res = feas_engine.evaluate_feasibility(
        business_category=clean_category,
        specific_business=clean_activity,
        location=payload.location,
        scale=payload.scale,
    )

    # 3. Scheme Match Analysis
    scheme_engine = SchemeEngine(db)
    scheme_res = scheme_engine.match_schemes(
        indicative_project_cost=fin_res.indicative_project_cost,
        available_margin_capital=payload.available_margin_capital,
        business_category=clean_category,
        specific_business=clean_activity,
        location=payload.location,
        social_category=payload.social_category,
        area_type=payload.area_type,
    )

    # 4. Risk Advisory Analysis
    risk_engine = RiskEngine(db)
    risk_res = risk_engine.analyze_risks(
        business_category=clean_category,
        specific_business=clean_activity,
        indicative_project_cost=fin_res.indicative_project_cost,
        available_margin_capital=payload.available_margin_capital,
        financing_requirement=fin_res.financing_requirement,
        location=payload.location,
    )

    # 5. What-If Simulation Analysis
    sales_annual = payload.baseline_sales_annual or (fin_res.indicative_project_cost * 1.25)
    cost_annual = payload.baseline_operating_cost_annual or (fin_res.indicative_project_cost * 0.85)

    sim_inputs = payload.simulation_inputs or {}
    whatif_engine = WhatIfEngine()
    whatif_res = whatif_engine.simulate(
        baseline_project_cost=fin_res.indicative_project_cost,
        baseline_available_margin=payload.available_margin_capital,
        baseline_sales_annual=sales_annual,
        baseline_operating_cost_annual=cost_annual,
        sales_change=sim_inputs.get("sales_change", 0.0),
        cost_change=sim_inputs.get("cost_change", 0.0),
        price_change=sim_inputs.get("price_change", 0.0),
        financing_change=sim_inputs.get("financing_change", 0.0),
        demand_change=sim_inputs.get("demand_change", 0.0),
    )

    # 6. AI Advisor Synthesis
    advisor_engine = AIBusinessAdvisor()
    advisor_res = advisor_engine.generate_advice(
        opportunity=feas_res.model_dump(),
        financial=fin_res.model_dump(),
        schemes=scheme_res.model_dump(),
        risks=risk_res.model_dump(),
        what_if=whatif_res.model_dump(),
    )

    return UnifiedInsightsResponse(
        opportunity=feas_res,
        financial=fin_res,
        schemes=scheme_res,
        risks=risk_res,
        what_if=whatif_res,
        advisor=advisor_res,
    )
