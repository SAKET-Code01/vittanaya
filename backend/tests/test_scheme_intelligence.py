"""Integration and unit tests for VITTANAYA Government Scheme Intelligence Engine.

SIH26091 - Testing deterministic scheme matching, verified scheme dataset,
and GET /api/v1/schemes/match endpoint.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.engines.scheme_engine import SchemeEngine
from backend.app.repositories.scheme_repository import SchemeRepository
from backend.app.services.seed_service import seed_all_reference_data


def test_verified_scheme_database_completeness(db_session: Session):
    """Test that all required schemes (PMEGP, MUDRA, CGTMSE, AIF, MSME) exist in verified database."""
    repo = SchemeRepository(db_session)
    schemes = repo.get_all_schemes()
    assert len(schemes) >= 8

    codes = [s["scheme_code"] for s in schemes]
    assert "PMEGP" in codes
    assert "MUDRA_TARUN" in codes
    assert "MUDRA_KISHOR" in codes
    assert "MUDRA_SHISHU" in codes
    assert "CGTMSE" in codes
    assert "AIF" in codes
    assert "MSME_CHAMPIONS" in codes
    assert "PM_FME" in codes

    for s in schemes:
        assert s["scheme_name"]
        assert s["source_authority"]
        assert int(str(s["source_year"])[:4]) >= 2020
        assert s["official_source_url"].startswith("http")
        assert len(s["required_documents"]) > 0


def test_dairy_sundargarh_20_lakh_scheme_match(db_session: Session):
    """Test target requirement: Dairy business + Sundargarh + ₹20 lakh investment returns PMEGP and MUDRA related schemes."""
    seed_all_reference_data(db_session)
    engine = SchemeEngine(db_session)

    response = engine.match_schemes(
        indicative_project_cost=2000000.0,
        available_margin_capital=200000.0,
        business_category="Dairy",
        specific_business="Commercial Dairy Farming",
        location="Sundargarh, Odisha",
        social_category="General",
        area_type="Rural",
    )

    assert response.total_matched > 0
    assert response.eligible_count > 0
    assert len(response.ranked_schemes) > 0

    ranked_codes = [s.scheme_code for s in response.ranked_schemes if s.is_eligible]

    # Must return PMEGP and MUDRA (specifically MUDRA Tarun / Tarun Plus which covers up to 20 lakhs)
    assert "PMEGP" in ranked_codes
    assert "MUDRA_TARUN" in ranked_codes
    assert "AIF" in ranked_codes  # Agri-Infrastructure Fund also covers dairy chilling/processing
    assert "CGTMSE" in ranked_codes

    # Verify structured fields
    pmegp = next(s for s in response.ranked_schemes if s.scheme_code == "PMEGP")
    assert pmegp.is_eligible is True
    assert pmegp.match_percentage >= 90
    assert pmegp.eligibility_reason != ""
    assert "35%" in pmegp.benefit or "subsidy" in pmegp.benefit.lower()
    assert pmegp.subsidy_loan_type != ""
    assert len(pmegp.required_documents) > 0
    assert pmegp.official_source != ""

    mudra = next(s for s in response.ranked_schemes if s.scheme_code == "MUDRA_TARUN")
    assert mudra.is_eligible is True
    assert mudra.match_percentage >= 80
    assert mudra.collateral_required is False
    assert "collateral-free" in mudra.benefit.lower()
    assert len(mudra.required_documents) > 0


def test_api_get_schemes_match_endpoint(client: TestClient, db_session: Session):
    """Test GET /api/v1/schemes/match endpoint with Dairy business + Sundargarh + ₹20 lakh."""
    seed_all_reference_data(db_session)

    response = client.get(
        "/api/v1/schemes/match",
        params={
            "business_type": "Dairy",
            "location": "Sundargarh, Odisha",
            "investment": 2000000.0,
            "own_capital": 200000.0,
            "beneficiary_category": "General",
            "area_classification": "Rural",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert "ranked_schemes" in data
    assert "total_matched" in data
    assert "eligible_count" in data
    assert data["total_matched"] >= 5

    ranked = data["ranked_schemes"]
    assert len(ranked) >= 5

    eligible_codes = [s["scheme_code"] for s in ranked if s["is_eligible"]]
    assert "PMEGP" in eligible_codes
    assert "MUDRA_TARUN" in eligible_codes

    for s in ranked:
        assert "match_percentage" in s
        assert "eligibility_reason" in s
        assert "benefit" in s
        assert "subsidy_loan_type" in s
        assert "required_documents" in s
        assert "official_source" in s
        assert isinstance(s["required_documents"], list)
        assert len(s["required_documents"]) > 0


def test_api_post_schemes_match_endpoint(client: TestClient, db_session: Session):
    """Test POST /api/v1/schemes/match alternative."""
    seed_all_reference_data(db_session)

    response = client.post(
        "/api/v1/schemes/match",
        json={
            "indicative_project_cost": 2000000.0,
            "available_margin_capital": 200000.0,
            "business_category": "Dairy",
            "specific_business": "Commercial Dairy",
            "location": "Sundargarh, Odisha",
            "social_category": "General",
            "area_type": "Rural",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["eligible_count"] > 0
    assert any(s["scheme_code"] == "PMEGP" for s in data["ranked_schemes"])
