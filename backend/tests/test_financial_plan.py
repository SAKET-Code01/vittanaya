"""Unit and integration tests for Financial Plan, Funding Structure & Amortization Engine.

SIH26091 - Testing reducing-balance loan calculations, zero interest, invalid inputs,
loan positivity invariants, schedule zero ending balance, and simulation endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy.orm import Session

from backend.app.schemas.financial_plan import FundingStructureRequest
from backend.app.services.financial_plan_service import FinancialPlanService
from backend.app.services.seed_service import seed_all_reference_data


def test_zero_interest_emi():
    """Verify zero-interest loan calculates EMI as principal / n_months correctly."""
    req = FundingStructureRequest(
        project_cost=100000.0,
        margin_pct=10.0,
        interest_rate_annual=0.0,
        tenure_years=5,
    )
    res = FinancialPlanService.calculate_funding_structure(req)
    assert res.loan_amount == 90000.0
    assert res.monthly_emi == 1500.0  # 90,000 / 60 months
    assert res.total_interest == 0.0
    assert res.total_payment == 90000.0
    assert len(res.yearly_schedule) == 5
    assert res.yearly_schedule[-1].closing_balance == 0.0


def test_normal_emi():
    """Verify standard reducing-balance loan calculation."""
    req = FundingStructureRequest(
        project_cost=1000000.0,
        margin_pct=10.0,
        interest_rate_annual=8.5,
        tenure_years=7,
    )
    res = FinancialPlanService.calculate_funding_structure(req)
    assert res.loan_amount == 900000.0
    assert res.monthly_emi > 0.0
    assert res.total_payment > res.loan_amount
    assert res.total_interest > 0.0
    assert len(res.yearly_schedule) == 7
    assert res.yearly_schedule[-1].closing_balance == 0.0


def test_invalid_tenure():
    """Verify invalid or 0 tenure rejected by schema validation and safely handled by service."""
    # Direct service safety check
    emi = FinancialPlanService.calculate_emi(loan_amount=500000.0, monthly_rate=0.085/12, n_months=0)
    assert emi == 0.0

    # API schema validation check
    with pytest.raises(ValidationError):
        FundingStructureRequest(
            project_cost=500000.0,
            margin_pct=10.0,
            interest_rate_annual=8.5,
            tenure_years=0,
        )


def test_invalid_rate():
    """Verify negative interest rate rejected by schema validation and safely handled by service."""
    # Direct service safety check clamps negative interest rate to 0.0% interest
    emi = FinancialPlanService.calculate_emi(loan_amount=500000.0, monthly_rate=-0.05, n_months=60)
    assert emi == 8333.33  # Clamped to 0% interest rate (500000 / 60)

    # API schema validation check
    with pytest.raises(ValidationError):
        FundingStructureRequest(
            project_cost=500000.0,
            margin_pct=10.0,
            interest_rate_annual=-5.0,
            tenure_years=5,
        )


def test_loan_never_negative():
    """Verify loan amount is never negative even if margin_pct is 100% or inputs are extreme."""
    req = FundingStructureRequest(
        project_cost=100000.0,
        margin_pct=100.0,
        interest_rate_annual=8.5,
        tenure_years=5,
    )
    res = FinancialPlanService.calculate_funding_structure(req)
    assert res.loan_amount == 0.0
    assert res.monthly_emi == 0.0
    assert res.total_payment == 0.0


def test_repayment_final_balance_zero():
    """Verify repayment schedule final closing balance reaches exactly 0.0."""
    req = FundingStructureRequest(
        project_cost=647000.0,
        margin_pct=10.0,
        interest_rate_annual=8.5,
        tenure_years=5,
    )
    res = FinancialPlanService.calculate_funding_structure(req)
    assert len(res.yearly_schedule) == 5
    assert len(res.monthly_schedule) == 60
    assert res.monthly_schedule[-1].closing_balance == 0.0
    assert res.yearly_schedule[-1].closing_balance == 0.0


def test_api_funding_structure_endpoint(client: TestClient):
    """Test POST /api/v1/finance/funding-structure endpoint."""
    response = client.post(
        "/api/v1/finance/funding-structure",
        json={
            "project_cost": 1000000.0,
            "margin_pct": 10.0,
            "interest_rate_annual": 8.5,
            "tenure_years": 7,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["loan_amount"] == 900000.0
    assert "monthly_emi" in data
    assert "yearly_schedule" in data
    assert len(data["yearly_schedule"]) == 7
    assert data["yearly_schedule"][-1]["closing_balance"] == 0.0


def test_stress_simulation_response_mapping(client: TestClient):
    """Test POST /api/v1/simulation response mapping."""
    response = client.post(
        "/api/v1/simulation",
        json={
            "baseline_project_cost": 1000000.0,
            "baseline_available_margin": 100000.0,
            "baseline_sales_annual": 1250000.0,
            "baseline_operating_cost_annual": 850000.0,
            "sales_change": -15.0,
            "cost_change": 10.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["isolated_scenario"] is True
    assert "baseline" in data
    assert "simulated" in data
    assert data["simulated"]["revenue"] < data["baseline"]["revenue"]


def test_project_cost_contract(client: TestClient, db_session: Session):
    """Test POST /api/v1/project-cost endpoint contract."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/project-cost",
        json={
            "business_activity": "Commercial Broiler Farming",
            "business_category": "Poultry",
            "location": "Sundargarh, Odisha",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["indicative_project_cost"] == 647000.0
    assert "traceability" in data
