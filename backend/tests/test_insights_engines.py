"""Unit tests for VITTANAYA Intelligence Engines.

SIH26091 - Testing deterministic cost, financial, scheme, feasibility, risk, what-if, and advisor logic.
"""

import pytest
from sqlalchemy.orm import Session

from backend.app.engines.ai_advisor import AIBusinessAdvisor
from backend.app.engines.cost_engine import ProjectCostEngine
from backend.app.engines.feasibility_engine import FeasibilityEngine
from backend.app.engines.financial_engine import FinancialEngine
from backend.app.engines.risk_engine import RiskEngine
from backend.app.engines.scheme_engine import SchemeEngine
from backend.app.engines.whatif_engine import WhatIfEngine
from backend.app.services.seed_service import seed_all_reference_data


@pytest.fixture(autouse=True)
def seed_test_db(db_session: Session):
    """Seed reference cost library and scheme rules for testing."""
    seed_all_reference_data(db_session)


def test_project_cost_engine_odisha_primary(db_session: Session):
    """Test cost lookup returns ODISHA_DISTRICT_PRIMARY priority for poultry."""
    engine = ProjectCostEngine(db_session)
    res = engine.get_indicative_cost(
        business_activity="Commercial Broiler Farming",
        business_category="Poultry",
        location="Sundargarh, Odisha",
        scale="1000 birds",
    )
    assert res.indicative_project_cost == 647000.0
    assert res.provenance_priority == "ODISHA_DISTRICT_PRIMARY"
    assert res.source_authority == "NABARD"
    assert "NABARD" in res.traceability.source_authority


def test_financial_engine_gap_calculation(db_session: Session):
    """Test financing_requirement = indicative_project_cost - available_margin_capital."""
    engine = FinancialEngine(db_session)
    res = engine.analyze_financial_gap(
        available_margin_capital=65000.0,
        business_category="Poultry",
        specific_business="Commercial Broiler Farming",
        location="Odisha",
    )
    assert res.indicative_project_cost == 647000.0
    assert res.available_margin_capital == 65000.0
    assert res.financing_requirement == 582000.0
    assert res.margin_pct == pytest.approx(10.05, abs=0.1)
    assert res.has_margin_shortfall is False


def test_scheme_engine_matching(db_session: Session):
    """Test scheme matching logic for PMEGP and MUDRA schemes."""
    engine = SchemeEngine(db_session)
    res = engine.match_schemes(
        indicative_project_cost=647000.0,
        available_margin_capital=65000.0,
        business_category="Poultry",
        specific_business="Commercial Broiler Farming",
        social_category="General",
        area_type="Rural",
    )
    assert len(res.eligible_schemes) >= 1
    pmegp = next((s for s in res.eligible_schemes if s.scheme_code == "PMEGP"), None)
    assert pmegp is not None
    assert pmegp.estimated_subsidy_pct == 25.0
    assert pmegp.estimated_subsidy_amount == pytest.approx(161750.0, abs=1.0)


def test_feasibility_engine_data_insufficient(db_session: Session):
    """Test non-fabrication policy returns 'Data insufficient' when data is missing."""
    engine = FeasibilityEngine(db_session)
    res = engine.evaluate_feasibility(
        business_category="Unknown Novel Industry",
        specific_business="Quantum Computing Hub",
    )
    assert res.is_data_sufficient is False
    assert res.market_reach == "Data insufficient"
    assert res.opportunity == "Data insufficient"
    assert res.pricing == "Data insufficient"


def test_feasibility_engine_verified_benchmark(db_session: Session):
    """Test feasibility engine for verified poultry benchmark."""
    engine = FeasibilityEngine(db_session)
    res = engine.evaluate_feasibility(
        business_category="Poultry",
        specific_business="Commercial Broiler Farming",
    )
    assert res.is_data_sufficient is True
    assert "Block" in res.market_reach
    assert res.overall_opportunity_score == 78.0


def test_risk_engine_dimensions(db_session: Session):
    """Test multi-dimensional risk advisory calculations."""
    engine = RiskEngine(db_session)
    res = engine.analyze_risks(
        business_category="Poultry",
        specific_business="Commercial Broiler Farming",
        indicative_project_cost=647000.0,
        available_margin_capital=65000.0,
        financing_requirement=582000.0,
    )
    assert res.overall_risk in ["Low", "Medium", "High"]
    assert res.seasonality_risk == "High"
    assert len(res.top_risks) <= 3
    assert len(res.reasons) >= 1


def test_whatif_engine_isolated_simulation():
    """Test isolated What-If scenario simulation without baseline mutation."""
    engine = WhatIfEngine()
    res = engine.simulate(
        baseline_project_cost=647000.0,
        baseline_available_margin=65000.0,
        baseline_sales_annual=800000.0,
        baseline_operating_cost_annual=550000.0,
        sales_change=-10.0,
        cost_change=5.0,
    )
    assert res.isolated_scenario is True
    assert res.baseline.revenue == 800000.0
    assert res.baseline.operating_cost == 550000.0
    assert res.simulated.revenue == 720000.0
    assert res.simulated.operating_cost == 577500.0
    assert res.variance["surplus_diff"] == (720000.0 - 577500.0) - (800000.0 - 550000.0)


def test_ai_advisor_synthesis():
    """Test zero-hallucination AI advisor synthesis."""
    advisor = AIBusinessAdvisor()
    res = advisor.generate_advice(
        financial={
            "indicative_project_cost": 647000.0,
            "available_margin_capital": 65000.0,
            "financing_requirement": 582000.0,
            "margin_pct": 10.05,
            "has_margin_shortfall": False,
            "margin_shortfall_amount": 0.0,
        },
        schemes={
            "best_recommendation": {
                "scheme_name": "PMEGP",
                "estimated_subsidy_amount": 161750.0,
                "estimated_subsidy_pct": 25.0,
                "eligible_loan_amount": 420250.0,
                "source_authority": "KVIC",
            },
            "eligible_schemes": [{}],
        },
    )
    assert "647,000" in res.summary
    assert "PMEGP" in res.summary
    assert len(res.why_this_result) >= 1
    assert len(res.recommended_next_steps) >= 1
