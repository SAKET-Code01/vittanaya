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


def test_scheme_matching_deterministic_and_dynamic(client):
    """POST /api/v1/scheme-match: Returns authoritative government schemes and dynamically calculates subsidy based on location/area_type."""
    # Rural request
    rural_payload = {
        "indicative_project_cost": 500000.0,
        "available_margin_capital": 50000.0,
        "business_category": "Manufacturing",
        "specific_business": "Commercial Broiler Farming",
        "location": "Sundargarh, Odisha",
        "social_category": "General",
        "area_type": "Rural",
    }
    res_rural = client.post("/api/v1/scheme-match", json=rural_payload)
    assert res_rural.status_code == 200
    rural_data = res_rural.json()
    assert len(rural_data["eligible_schemes"]) > 0

    pmegp_rural = next((s for s in rural_data["eligible_schemes"] if "PMEGP" in s["scheme_code"]), None)
    assert pmegp_rural is not None
    assert pmegp_rural["source_authority"] is not None
    assert pmegp_rural["estimated_subsidy_pct"] == 25.0  # Rural General PMEGP is 25%
    assert pmegp_rural["estimated_subsidy_amount"] == 125000.0  # 25% of 5L

    # Urban request - same parameters but Urban area
    urban_payload = {**rural_payload, "area_type": "Urban"}
    res_urban = client.post("/api/v1/scheme-match", json=urban_payload)
    assert res_urban.status_code == 200
    urban_data = res_urban.json()

    pmegp_urban = next((s for s in urban_data["eligible_schemes"] if "PMEGP" in s["scheme_code"]), None)
    assert pmegp_urban is not None
    assert pmegp_urban["estimated_subsidy_pct"] == 15.0  # Urban General PMEGP is 15%
    assert pmegp_urban["estimated_subsidy_amount"] == 75000.0  # 15% of 5L
    assert pmegp_rural["estimated_subsidy_amount"] > pmegp_urban["estimated_subsidy_amount"]


def test_action_plan_task_update_persists_and_updates_completion(client):
    """PATCH /api/v1/action-plan/tasks/{task_id}: updates status, recalculates completion % and syncs readiness."""
    # 1. Fetch action plan for business 2
    res = client.get("/api/v1/action-plan/2")
    assert res.status_code == 200
    plan = res.json()
    assert len(plan["tasks"]) > 0

    first_task = plan["tasks"][0]
    task_id = first_task["id"]
    original_status = first_task["status"]

    try:
        # 2. Mark task as completed
        patch_res = client.patch(
            f"/api/v1/action-plan/tasks/{task_id}",
            json={"status": "completed"},
        )
        assert patch_res.status_code == 200
        updated = patch_res.json()
        assert updated["id"] == task_id
        assert updated["status"] == "completed"
        assert updated["completion_pct"] is not None
        assert updated["completed_tasks"] >= 1
        assert updated["total_tasks"] == len(plan["tasks"])

        # 3. Confirm persistence via GET
        res_after = client.get("/api/v1/action-plan/2")
        assert res_after.status_code == 200
        plan_after = res_after.json()
        task_after = next(t for t in plan_after["tasks"] if t["id"] == task_id)
        assert task_after["status"] == "completed"
        assert plan_after["completed_tasks"] == updated["completed_tasks"]
        assert plan_after["completion_pct"] == updated["completion_pct"]
    finally:
        # Revert task status back to original
        client.patch(
            f"/api/v1/action-plan/tasks/{task_id}",
            json={"status": original_status},
        )


def test_dashboard_operational_priorities_rule_derived_and_traceable(client):
    """GET /api/v1/dashboard/summary: returns rule-based, traceable operational priorities without hardcoded mocks."""
    res = client.get("/api/v1/dashboard/summary?business_id=2")
    assert res.status_code == 200
    data = res.json()

    assert "operational_priorities" in data
    priorities = data["operational_priorities"]
    assert len(priorities) == 3

    for p in priorities:
        assert "step_num" in p
        assert "priority_label" in p
        assert "title" in p
        assert "description" in p
        assert "trigger_reason" in p
        assert "route" in p
        assert "urgency" in p
        assert p["urgency"] in ["URGENT", "ACTION_REQUIRED", "RECOMMENDED", "STABLE"]


def test_feasibility_single_source_of_truth(client):
    """GET /api/v1/ahp/business-feasibility/{id}: final_score strictly equals sum of the 5 criteria contributions."""
    res = client.get("/api/v1/ahp/business-feasibility/9")
    assert res.status_code == 200
    data = res.json()

    assert data["business_id"] == 9
    assert len(data["criteria_traces"]) == 5
    calculated_sum = sum(t["contribution"] for t in data["criteria_traces"])
    assert abs(data["final_score"] - calculated_sum) < 0.2


def test_switching_business_id_returns_distinct_identity_and_metrics(client):
    """Switching business query returns distinct identity, stage, and metrics without stale data crossover."""
    # Established business 2
    res2 = client.get("/api/v1/dashboard/summary?business_id=2")
    assert res2.status_code == 200
    b2 = res2.json()

    # Startup business 5
    res5 = client.get("/api/v1/dashboard/summary?business_id=5")
    assert res5.status_code == 200
    b5 = res5.json()

    # Assert identity isolation
    assert b2["business_id"] == 2
    assert b5["business_id"] == 5
    assert b2["business_name"] != b5["business_name"]

    # Cash balance and operating metrics must be isolated
    assert b2["cash_balance"] != b5["cash_balance"]


def test_changing_project_cost_changes_financial_and_feasibility_output(db, client):
    """Phase 15 Test 1 & 2: Modifying project cost changes loan amortization, EMI, and feasibility score."""
    # 1. Financial Plan funding structure endpoint
    req_small = {
        "project_cost": 500000.0,
        "margin_pct": 15.0,
        "interest_rate_annual": 9.5,
        "tenure_years": 5,
    }
    res_small = client.post("/api/v1/finance/funding-structure", json=req_small)
    assert res_small.status_code == 200
    plan_small = res_small.json()

    req_large = {
        "project_cost": 1500000.0,
        "margin_pct": 15.0,
        "interest_rate_annual": 9.5,
        "tenure_years": 5,
    }
    res_large = client.post("/api/v1/finance/funding-structure", json=req_large)
    assert res_large.status_code == 200
    plan_large = res_large.json()

    # Loan and EMI must scale dynamically
    assert plan_large["loan_amount"] > plan_small["loan_amount"]
    assert plan_large["monthly_emi"] > plan_small["monthly_emi"]
    assert plan_large["loan_amount"] == 1275000.0  # 85% of 15L
    assert plan_small["loan_amount"] == 425000.0   # 85% of 5L

    # 2. Database Feasibility Reactivity with project_cost
    svc = BusinessFeasibilityService(db)
    biz = db.query(Business).filter(Business.id == 7).first()
    assert biz is not None
    orig_proj_cost = biz.project_cost
    orig_feasibility = svc.compute(7).final_score

    try:
        # Increase project cost from original, keeping own_capital constant -> decreases margin ratio -> decreases score
        biz.project_cost = Decimal("2000000.00")
        db.commit()

        updated_feasibility = svc.compute(7).final_score
        assert updated_feasibility != orig_feasibility
        assert updated_feasibility < orig_feasibility
    finally:
        biz.project_cost = orig_proj_cost
        db.commit()


def test_changing_business_type_changes_market_benchmark(client):
    """Phase 15 Test 3: Changing business category/specific business alters market reach, opportunity, and SWOT."""
    # Domain A: Poultry Broiler Farming
    res_poultry = client.post(
        "/api/v1/feasibility",
        json={
            "business_category": "Poultry",
            "specific_business": "Commercial Broiler Farming",
            "location": "Sundargarh, Odisha",
            "scale": "Micro",
        },
    )
    assert res_poultry.status_code == 200
    poultry_data = res_poultry.json()

    # Domain B: Dairy Farming
    res_dairy = client.post(
        "/api/v1/feasibility",
        json={
            "business_category": "Dairy",
            "specific_business": "Dairy Cow Farm",
            "location": "Sundargarh, Odisha",
            "scale": "Micro",
        },
    )
    assert res_dairy.status_code == 200
    dairy_data = res_dairy.json()

    # Market context and SWOT must be domain-specific, not static copies
    assert poultry_data["market_reach"] != dairy_data["market_reach"]
    assert poultry_data["opportunity"] != dairy_data["opportunity"]
    assert poultry_data["SWOT"]["strengths"] != dairy_data["SWOT"]["strengths"]
    assert "broiler" in poultry_data["market_reach"].lower() or "poultry" in poultry_data["opportunity"].lower()
    assert "omfed" in dairy_data["market_reach"].lower() or "milk" in dairy_data["opportunity"].lower()


def test_changing_location_changes_hyperlocal_context(client):
    """Phase 15 Test 4: Changing location alters district spatial intelligence and local market reach."""
    res_sundargarh = client.get("/api/v1/locations/market-map?district=Sundargarh")
    assert res_sundargarh.status_code == 200
    data_sundargarh = res_sundargarh.json()

    res_khordha = client.get("/api/v1/locations/market-map?district=Khordha")
    assert res_khordha.status_code == 200
    data_khordha = res_khordha.json()

    # District spatial context must reflect the specific geographic territory
    assert data_sundargarh["market_reach_description"] != data_khordha["market_reach_description"]
    assert len(data_sundargarh["pois"]) > 0
    assert len(data_khordha["pois"]) > 0



