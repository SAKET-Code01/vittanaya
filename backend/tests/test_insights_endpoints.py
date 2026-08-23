"""Integration tests for VITTANAYA Insights API Endpoints.

SIH26091 - Testing REST endpoints for project-cost, feasibility, scheme-match, risk-analysis, simulation, advisor, and analyze.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.services.seed_service import seed_all_reference_data


def test_api_project_cost_endpoint(client: TestClient, db_session: Session):
    """Test POST /api/v1/project-cost endpoint."""
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
    assert data["provenance_priority"] == "ODISHA_DISTRICT_PRIMARY"
    assert "traceability" in data


def test_api_feasibility_endpoint(client: TestClient, db_session: Session):
    """Test POST /api/v1/feasibility endpoint."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/feasibility",
        json={
            "business_category": "Poultry",
            "specific_business": "Commercial Broiler Farming",
            "location": "Odisha",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_data_sufficient"] is True
    assert data["overall_opportunity_score"] == 78.0


def test_api_scheme_match_endpoint(client: TestClient, db_session: Session):
    """Test POST /api/v1/scheme-match endpoint."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/scheme-match",
        json={
            "indicative_project_cost": 647000.0,
            "available_margin_capital": 65000.0,
            "business_category": "Poultry",
            "specific_business": "Commercial Broiler Farming",
            "location": "Odisha",
            "social_category": "General",
            "area_type": "Rural",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["eligible_schemes"]) >= 1
    assert data["best_recommendation"]["scheme_code"] == "PMEGP"


def test_api_risk_analysis_endpoint(client: TestClient, db_session: Session):
    """Test POST /api/v1/risk-analysis endpoint."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/risk-analysis",
        json={
            "business_category": "Poultry",
            "specific_business": "Commercial Broiler Farming",
            "indicative_project_cost": 647000.0,
            "available_margin_capital": 65000.0,
            "financing_requirement": 582000.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "overall_risk" in data
    assert "top_risks" in data


def test_api_simulation_endpoint(client: TestClient):
    """Test POST /api/v1/simulation endpoint."""
    response = client.post(
        "/api/v1/simulation",
        json={
            "baseline_project_cost": 647000.0,
            "baseline_available_margin": 65000.0,
            "baseline_sales_annual": 800000.0,
            "baseline_operating_cost_annual": 550000.0,
            "sales_change": -10.0,
            "cost_change": 5.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["isolated_scenario"] is True
    assert data["baseline"]["revenue"] == 800000.0
    assert data["simulated"]["revenue"] == 720000.0


def test_api_advisor_endpoint(client: TestClient):
    """Test POST /api/v1/advisor endpoint."""
    response = client.post(
        "/api/v1/advisor",
        json={
            "financial": {
                "indicative_project_cost": 647000.0,
                "available_margin_capital": 65000.0,
                "financing_requirement": 582000.0,
                "margin_pct": 10.05,
            }
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "recommended_next_steps" in data


def test_api_unified_insights_analyze_endpoint(client: TestClient, db_session: Session):
    """Test POST /api/v1/insights/analyze unified endpoint returning all 6 components."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/insights/analyze",
        json={
            "available_margin_capital": 65000.0,
            "business_category": "Poultry",
            "specific_business": "Commercial Broiler Farming",
            "location": "Sundargarh, Odisha",
            "scale": "1000 birds",
            "social_category": "General",
            "area_type": "Rural",
            "simulation_inputs": {
                "sales_change": -10.0,
                "cost_change": 5.0,
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "opportunity" in data
    assert "financial" in data
    assert "schemes" in data
    assert "risks" in data
    assert "what_if" in data
    assert "advisor" in data
    assert data["financial"]["indicative_project_cost"] == 647000.0
    assert data["financial"]["financing_requirement"] == 582000.0
    assert data["schemes"]["best_recommendation"]["scheme_code"] == "PMEGP"
