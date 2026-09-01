"""Unit & Integration tests for API Reliability + UX Hardening (SIH26091 - Phase A Step 4).

Tests covering:
1. API 404 error mapping and predictable JSON detail contract.
2. API 422 validation error formatting.
3. API 500 unhandled exception contract.
4. Missing active business response handling.
5. Scheme match endpoint resilience & structured response.
6. Feasibility analysis endpoint resilience & structured response.
7. Duplicate task status action prevention logic.
8. Safe financial response normalization.
9. Advisory chat fallback on missing/invalid context.
"""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models.business import Business
from backend.app.schemas.financial_plan import FundingStructureRequest
from backend.app.services.financial_plan_service import FinancialPlanService
from backend.app.services.seed_service import seed_all_reference_data


@pytest.fixture(autouse=True)
def setup_test_data(db_session: Session):
    """Seed reference libraries and default user for tests."""
    seed_all_reference_data(db_session)


def test_api_404_error_contract(client: TestClient):
    """Verify 404 responses return normalized JSON error contract with detail string."""
    res = client.get("/api/v1/business?business_id=999999")
    assert res.status_code == 404
    data = res.json()
    assert "detail" in data
    assert data["status_code"] == 404
    assert isinstance(data["detail"], str)


def test_api_422_validation_error_contract(client: TestClient):
    """Verify 422 validation errors return formatted detail strings."""
    res = client.post(
        "/api/v1/finance/receivables?business_id=1",
        json={
            "debtor_name": "Test Debtor",
            "amount": -5000.0,
            "due_date": "2026-09-30",
        },
    )
    assert res.status_code == 422
    data = res.json()
    assert "detail" in data
    assert data["status_code"] == 422


def test_api_500_server_error_contract():
    """Verify unhandled exceptions return 500 without exposing raw stack traces."""
    from backend.main import app
    local_client = TestClient(app, raise_server_exceptions=False)
    with patch("backend.app.repositories.business_repository.BusinessRepository.get_by_id", side_effect=RuntimeError("Internal Engine Failure")):
        res = local_client.get("/api/v1/business?business_id=1")
        assert res.status_code == 500
        data = res.json()
        assert "detail" in data
        assert "server error" in data["detail"].lower()


def test_missing_active_business_handling(client: TestClient):
    """Verify queries for missing business return clean 404 error rather than crash."""
    res = client.get("/api/v1/action-plan/88888")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_empty_scheme_match_result(client: TestClient):
    """Verify scheme matching handles queries cleanly with structured response."""
    res = client.post(
        "/api/v1/scheme-match",
        json={
            "indicative_project_cost": 647000.0,
            "available_margin_capital": 65000.0,
            "business_category": "Poultry",
            "specific_business": "Commercial Broiler Farming",
            "location": "Sundargarh, Odisha",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "eligible_schemes" in data
    assert len(data["eligible_schemes"]) >= 1


def test_empty_feasibility_analysis_result(client: TestClient):
    """Verify unified insights returns structured result for verified business category."""
    res = client.post(
        "/api/v1/feasibility",
        json={
            "available_margin_capital": 65000.0,
            "business_category": "Poultry",
            "specific_business": "Commercial Broiler Farming",
            "location": "Sundargarh, Odisha",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "is_data_sufficient" in data
    assert "overall_opportunity_score" in data


def test_duplicate_task_action_prevention(client: TestClient, db_session: Session):
    """Verify updating a task status twice maintains consistent completed state."""
    b = Business(owner_id=1, name="Poultry Unit", type="Poultry", industry="Agri", location_district="Puri", location_state="Odisha")
    db_session.add(b)
    db_session.commit()

    # Get action plan tasks
    res = client.get(f"/api/v1/action-plan/{b.id}")
    assert res.status_code == 200
    task_id = res.json()["tasks"][0]["id"]

    # First update to completed
    res1 = client.patch(f"/api/v1/action-plan/tasks/{task_id}?business_id={b.id}", json={"status": "completed"})
    assert res1.status_code == 200
    assert res1.json()["status"] == "completed"

    # Second identical update to completed
    res2 = client.patch(f"/api/v1/action-plan/tasks/{task_id}?business_id={b.id}", json={"status": "completed"})
    assert res2.status_code == 200
    assert res2.json()["status"] == "completed"


def test_safe_financial_response_normalization():
    """Verify FinancialPlanService normalizes zero interest rate and bounds checking safely."""
    req_zero_rate = FundingStructureRequest(
        project_cost=500000.0,
        margin_pct=10.0,
        interest_rate_annual=0.0,
        tenure_years=5,
    )
    res_zero_rate = FinancialPlanService.calculate_funding_structure(req_zero_rate)
    assert res_zero_rate.monthly_emi == 7500.0  # 450,000 / 60 months
    assert res_zero_rate.total_interest == 0.0
    assert res_zero_rate.yearly_schedule[-1].closing_balance == 0.0

    # 100% margin capital test (no loan)
    req_full_margin = FundingStructureRequest(
        project_cost=200000.0,
        margin_pct=100.0,
        interest_rate_annual=9.5,
        tenure_years=3,
    )
    res_full_margin = FinancialPlanService.calculate_funding_structure(req_full_margin)
    assert res_full_margin.loan_amount == 0.0
    assert res_full_margin.monthly_emi == 0.0
    assert res_full_margin.total_interest == 0.0


def test_advisory_failure_handling_missing_context(client: TestClient):
    """Verify advisory chatbot returns safe guidance when required context is missing."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What is my feasibility score?",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "complete or select a business profile" in data["answer"]
    assert data["confidence"] == "HIGH"
    assert len(data["recommended_next_steps"]) >= 1
