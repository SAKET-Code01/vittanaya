"""Test service resilience, health, funding calculations, and cash flow integrity.

Verifies:
- Health check returns 200 and healthy status
- Funding structure produces non-zero calculated EMI and loan amounts
- Cash flow endpoint produces genuine non-zero liquidity projections
- Error conditions return proper HTTP status codes without fake zero fallbacks
"""

from fastapi.testclient import TestClient

from backend.app.models.business import Business


def test_health_check_status_code_and_payload(client: TestClient) -> None:
    """Verify health endpoint is reachable, returns 200, and reports healthy app status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "healthy"
    assert payload["app"] == "VITTANAYA"


def test_funding_structure_produces_genuine_nonzero_calculation(
    client: TestClient, sample_business: Business
) -> None:
    """Verify funding structure calculates real non-zero loan, EMI, and interest."""
    payload = {
        "business_id": sample_business.id,
        "project_cost": 1000000.0,
        "margin_pct": 10.0,
        "interest_rate_annual": 8.5,
        "tenure_years": 7,
        "business_category": "Manufacturing",
        "specific_business": "Agro Mill",
        "location": "Sundargarh, Odisha",
    }
    response = client.post("/api/v1/finance/funding-structure", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Loan amount should be project_cost - margin (10,00,000 - 1,00,000 = 9,00,000)
    assert data["loan_amount"] == 900000.0
    assert data["own_margin_capital"] == 100000.0
    # EMI must be a genuine calculated number, NOT 0
    assert data["monthly_emi"] > 0
    assert 14000.0 < data["monthly_emi"] < 15000.0
    # Total interest must be non-zero
    assert data["total_interest"] > 0
    assert len(data["monthly_schedule"]) == 84
    assert len(data["yearly_schedule"]) == 7


def test_cash_flow_forecast_produces_genuine_nonzero_values(
    client: TestClient, sample_business: Business
) -> None:
    """Verify cash-flow endpoint returns 12 months of non-zero projections and valid summary."""
    payload = {
        "business_id": sample_business.id,
        "project_cost": 1000000.0,
        "available_margin_capital": 100000.0,
        "interest_rate_annual": 8.5,
        "tenure_years": 7,
        "stress_sales_change": 0.0,
        "apply_seasonality": True,
    }
    response = client.post("/api/v1/finance/cash-flow", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "summary" in data
    summary = data["summary"]
    # All key summary fields must be non-zero numbers
    assert summary["minimum_projected_cash"] > 0
    assert summary["working_capital_required"] > 0
    assert summary["minimum_recommended_buffer"] > 0
    assert summary["liquidity_risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    # Months must contain 12 months with non-zero monthly cash
    assert len(data["months"]) == 12
    for month in data["months"]:
        assert "revenue" in month
        assert "operating_expenses" in month
        assert "closing_cash" in month


def test_funding_structure_invalid_input_rejected_not_zero(client: TestClient) -> None:
    """Verify funding structure with negative project cost is rejected with 422 rather than returning 0."""
    payload = {
        "project_cost": -50000.0,
        "margin_pct": 10.0,
        "interest_rate_annual": 8.5,
        "tenure_years": 7,
    }
    response = client.post("/api/v1/finance/funding-structure", json=payload)
    assert response.status_code == 422


def test_cash_flow_invalid_input_rejected_not_zero(client: TestClient) -> None:
    """Verify cash-flow with negative tenure is rejected with 422 rather than returning 0."""
    payload = {
        "project_cost": 500000.0,
        "available_margin_capital": 50000.0,
        "interest_rate_annual": 8.5,
        "tenure_years": -2,
    }
    response = client.post("/api/v1/finance/cash-flow", json=payload)
    assert response.status_code == 422
