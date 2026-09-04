"""Tests for Phase 1 Dynamic Dashboard Grounding & Data Authenticity (SIH26091).

Verifies that new business dashboard endpoints return dynamic, database-grounded
metrics without hardcoded 84/100, hardcoded 40% readiness, or fixed 25% subsidies.
"""

from decimal import Decimal
import pytest
from fastapi.testclient import TestClient

from backend.app.core.database import SessionLocal
from backend.app.models.business import Business
from backend.app.services.business_feasibility_service import BusinessFeasibilityService
from backend.app.services.readiness_service import ReadinessService
from backend.app.engines.scheme_engine import SchemeEngine
from backend.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_new_business_feasibility_authoritative(client, db):
    """Business 9 (new_idea stage) has an authoritative AHP score distinct from 84/100."""
    res = client.get("/api/v1/ahp/business-feasibility/9")
    assert res.status_code == 200
    data = res.json()

    assert data["business_id"] == 9
    assert data["final_score"] is not None
    # Must NOT equal hardcoded 84.0
    assert data["final_score"] != 84.0
    assert 30.0 <= data["final_score"] <= 45.0
    assert len(data["criteria_traces"]) == 5


def test_changing_own_capital_changes_feasibility_output(db):
    """Reactivity test: Modifying own_capital changes the financial score and final feasibility."""
    svc = BusinessFeasibilityService(db)
    
    # Baseline for business 7
    biz = db.query(Business).filter(Business.id == 7).first()
    assert biz is not None
    initial_capital = biz.own_capital
    
    score_initial = svc.compute(7).final_score

    # Mutate own_capital
    try:
        biz.own_capital = Decimal("500000.00")  # Increase capital from 1L to 5L
        db.commit()

        score_updated = svc.compute(7).final_score
        assert score_updated != score_initial
        assert score_updated > score_initial  # Higher capital ratio yields higher financial score
    finally:
        biz.own_capital = initial_capital
        db.commit()


def test_scheme_matching_changes_with_category_and_location(client):
    """Deterministic scheme matching gives distinct subsidies for General vs SC/ST and Rural vs Urban."""
    # Special category rural
    res_special = client.post(
        "/api/v1/scheme-match",
        json={
            "indicative_project_cost": 1000000.0,
            "available_margin_capital": 100000.0,
            "business_category": "Manufacturing",
            "specific_business": "Paper Plate Making",
            "location": "Sundargarh",
            "social_category": "SC",
            "area_type": "Rural",
        },
    )
    assert res_special.status_code == 200
    data_special = res_special.json()
    pmegp_special = next(
        (s for s in data_special["eligible_schemes"] if "PMEGP" in s["scheme_code"]), None
    )
    assert pmegp_special is not None
    assert pmegp_special["estimated_subsidy_pct"] == 35.0

    # General category urban
    res_gen_urban = client.post(
        "/api/v1/scheme-match",
        json={
            "indicative_project_cost": 1000000.0,
            "available_margin_capital": 100000.0,
            "business_category": "Manufacturing",
            "specific_business": "Paper Plate Making",
            "location": "Bhubaneswar",
            "social_category": "General",
            "area_type": "Urban",
        },
    )
    assert res_gen_urban.status_code == 200
    data_gen_urban = res_gen_urban.json()
    pmegp_gen_urban = next(
        (s for s in data_gen_urban["eligible_schemes"] if "PMEGP" in s["scheme_code"]), None
    )
    assert pmegp_gen_urban is not None
    assert pmegp_gen_urban["estimated_subsidy_pct"] == 15.0


def test_business_readiness_returns_dynamic_metrics(client):
    """GET /api/v1/readiness/{business_id} returns live requirements and dynamic readiness."""
    res = client.get("/api/v1/readiness/2")
    assert res.status_code == 200
    data = res.json()

    assert data["business_id"] == 2
    assert "readiness_score" in data
    assert "readiness_label" in data
    assert "requirements" in data
    assert len(data["requirements"]) > 0
    # Label reflects the actual percentage
    expected_pct = int(round(data["readiness_score"]))
    assert f"{expected_pct}%" in data["readiness_label"]


def test_established_business_health_score_authoritative(client):
    """GET /api/v1/dashboard/summary returns authoritative Business Health Index and operating metrics."""
    res = client.get("/api/v1/dashboard/summary?business_id=2")
    assert res.status_code == 200
    data = res.json()

    assert data["business_id"] == 2
    assert "health_score" in data
    assert 0 <= data["health_score"] <= 100
    assert "health_status" in data
    assert data["health_status"] in [
        "HEALTHY & OPTIMIZED",
        "STABLE & GROWING",
        "MONITOR / VULNERABLE",
        "CRITICAL CASH STRESS",
    ]
    assert "working_capital_ratio" in data
    assert "ebitda_margin" in data
    assert "runway_months" in data
    assert "monthly_revenue" in data
    assert "operating_profit" in data
    assert data["data_provenance"]["source_type"] == "CALCULATED"


def test_changing_expenses_changes_established_health_score(db, client):
    """Reactivity test: Modifying expenses updates the runway, operating profit, and Health Index."""
    biz = db.query(Business).filter(Business.id == 2).first()
    assert biz is not None
    initial_expenses = biz.monthly_expense_estimate

    try:
        # Get baseline summary
        res1 = client.get("/api/v1/dashboard/summary?business_id=2")
        assert res1.status_code == 200
        base_summary = res1.json()

        # Increase expenses significantly
        biz.monthly_expense_estimate = Decimal("800000.00")
        db.commit()

        res2 = client.get("/api/v1/dashboard/summary?business_id=2")
        assert res2.status_code == 200
        new_summary = res2.json()

        # Higher expenses must reduce operating profit and reduce runway
        assert float(new_summary["operating_profit"]) <= float(base_summary["operating_profit"])
        assert new_summary["runway_days"] < base_summary["runway_days"]
    finally:
        biz.monthly_expense_estimate = initial_expenses
        db.commit()
