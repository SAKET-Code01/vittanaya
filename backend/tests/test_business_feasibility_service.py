"""Integration and unit tests for BusinessFeasibilityService (SIH26091).

Tests:
1. Single authoritative business feasibility calculation for Business 7.
2. Separation of market benchmark (88.0) from AHP-weighted final feasibility score (~52.0).
3. Chatbot FEASIBILITY and EXPLANATION queries return identical authoritative final_score.
4. Reactivity: modifying business data (e.g. own_capital) recalculates financial raw score and final score.
5. Missing business ID returns 404.
6. AHP consistency check (CR < 0.10).
"""

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


def test_business_feasibility_endpoint_business_7(client):
    """GET /api/v1/ahp/business-feasibility/7 returns real business derived scores."""
    res = client.get("/api/v1/ahp/business-feasibility/7")
    assert res.status_code == 200
    data = res.json()

    assert data["business_id"] == 7
    assert data["business_name"] == "Maa Tarini Agro Mills"
    assert data["business_category"] == "Dairy & Livestock"

    # 1. Market benchmark (88.0) is strictly distinct from AHP-weighted final score (52.03)
    assert data["market_benchmark_score"] == 88.0
    assert data["final_score"] != data["market_benchmark_score"]
    assert 51.0 <= data["final_score"] <= 53.0  # Exactly 52.03

    # 2. Check 5 criteria traces are present and mathematically exact
    crit_map = {c["criterion"]: c for c in data["criteria_traces"]}
    assert len(crit_map) == 5
    assert set(crit_map.keys()) == {"market", "financial", "location", "competition", "risk"}

    # Market: 88.0/100 -> (88.0/100)*30 = 26.40
    assert crit_map["market"]["raw_score"] == 88.0
    assert crit_map["market"]["maximum_points"] == 30
    assert crit_map["market"]["contribution"] == 26.40

    # Financial: 10.0/100 -> (10.0/100)*25 = 2.50
    assert crit_map["financial"]["raw_score"] == 10.0
    assert crit_map["financial"]["maximum_points"] == 25
    assert crit_map["financial"]["contribution"] == 2.50

    # Location: 70.0/100 -> (70.0/100)*15 = 10.50
    assert crit_map["location"]["raw_score"] == 70.0
    assert crit_map["location"]["maximum_points"] == 15
    assert crit_map["location"]["contribution"] == 10.50

    # Competition: 50.0/100 -> (50.0/100)*15 = 7.50
    assert crit_map["competition"]["raw_score"] == 50.0
    assert crit_map["competition"]["maximum_points"] == 15
    assert crit_map["competition"]["contribution"] == 7.50

    # Risk: 34.2/100 -> (34.2/100)*15 = 5.13
    assert crit_map["risk"]["raw_score"] == 34.20
    assert crit_map["risk"]["maximum_points"] == 15
    assert crit_map["risk"]["contribution"] == 5.13

    # Sum of contributions == final_score
    calculated_sum = sum(c["contribution"] for c in data["criteria_traces"])
    assert round(calculated_sum, 2) == round(data["final_score"], 2)
    assert round(data["final_score"], 2) == 52.03

    # Consistency
    assert data["ahp_cr"] < 0.10
    assert data["ahp_is_consistent"] is True


def test_chatbot_feasibility_lineage_alignment(client):
    """Chatbot FEASIBILITY and EXPLANATION queries return the exact same score as the API endpoint."""
    # 1. Fetch authoritative score from backend endpoint
    res = client.get("/api/v1/ahp/business-feasibility/7")
    assert res.status_code == 200
    auth_score = res.json()["final_score"]
    rounded_score_str = f"{auth_score:.0f}"

    # 2. Query Chatbot for Feasibility
    chat_res = client.post(
        "/api/v1/advisory/chat",
        json={"message": "What is my feasibility score?", "business_id": 7},
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert rounded_score_str in chat_data["answer"]

    # 3. Query Chatbot for Explanation ('Why')
    why_res = client.post(
        "/api/v1/advisory/chat",
        json={"message": "Why is my feasibility score this value?", "business_id": 7},
    )
    assert why_res.status_code == 200
    why_data = why_res.json()
    assert rounded_score_str in why_data["answer"]


def test_business_data_change_reactivity(db, client):
    """Mutating business own_capital changes the financial raw score and final feasibility score."""
    svc = BusinessFeasibilityService(db)
    b = db.query(Business).filter(Business.id == 7).first()
    original_capital = b.own_capital

    try:
        # Before change
        before_res = svc.compute(7)
        before_fin_raw = before_res.raw_scores["financial"]
        before_final = before_res.final_score

        # Increase own_capital from 100,000 to 400,000
        b.own_capital = 400000.00
        db.commit()

        # After change
        after_res = svc.compute(7)
        after_fin_raw = after_res.raw_scores["financial"]
        after_final = after_res.final_score

        assert after_fin_raw > before_fin_raw
        assert after_final > before_final
        assert round(after_final - before_final, 2) > 0.0

    finally:
        # Restore original state
        b.own_capital = original_capital
        db.commit()


def test_nonexistent_business_id_404(client):
    """Requesting feasibility for non-existent business returns 404."""
    res = client.get("/api/v1/ahp/business-feasibility/99999")
    assert res.status_code == 404
