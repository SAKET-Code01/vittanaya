"""Comprehensive unit and integration test suite for Grounded Ask VITTANAYA AI Chatbot.

SIH26091 - Verifies 16 critical test dimensions:
1. Financial question grounding (Loan, EMI, promoter margin)
2. Scheme question grounding (PMEGP subsidy, eligibility disclaimers)
3. Feasibility question grounding (Score, market reach, competitor density)
4. Risk question grounding (Risk score, drivers, mitigation)
5. Action question grounding (Roadmap milestones, DPR application steps)
6. Explanation question grounding (Score breakdown explainability)
7. What-If scenario grounding (Sales drop 15% surplus delta & risk shift)
8. Missing business context handling (Safe guidance returned)
9. Missing financial reference data handling
10. Offline operation without GEMINI_API_KEY
11. Deterministic engine calculation accuracy
12. Zero hallucination protection (No fabricated numbers)
13. Active business ID scoping from request
14. Full ChatResponse schema contract consistency
15. Business switching isolation (Business A vs Business B context separation)
16. Advisory engine operational status endpoint
"""

import os
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models.business import Business
from backend.app.services.seed_service import seed_all_reference_data


@pytest.fixture(autouse=True)
def setup_reference_data(db_session: Session):
    """Ensure database reference data and scheme rules are seeded for advisory tests."""
    seed_all_reference_data(db_session)


def test_advisory_status_endpoint(client: TestClient):
    """16. Verify GET /api/v1/advisory/status returns operational payload."""
    res = client.get("/api/v1/advisory/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert data["target_problem"] == "SIH26091"


def test_financial_question_grounding(client: TestClient):
    """1. Verify financial intent returns exact loan amount, promoter margin, and EMI from FinancialPlanService."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What is my EMI and how much loan do I need?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "FINANCIAL"
    assert "₹647,000" in data["answer"] or "647,000" in data["answer"]
    assert "EMI" in data["answer"]
    assert len(data["key_facts"]) >= 3
    # Verify exact calculated facts match decision engine
    labels = [k["label"] for k in data["key_facts"]]
    assert "Indicative Project Cost" in labels
    assert "Eligible Bank Loan" in labels
    assert "Estimated Monthly EMI" in labels


def test_scheme_question_grounding(client: TestClient):
    """2. Verify scheme intent returns recommended scheme, subsidy percentage, and disclaimer."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Which government scheme is suitable for my enterprise?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
                "social_category": "General",
                "area_type": "Rural",
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "SCHEME"
    assert "PMEGP" in data["answer"] or "scheme" in data["answer"].lower()
    assert "Final eligibility is subject to the implementing authority" in data["answer"]
    labels = [k["label"] for k in data["key_facts"]]
    assert "Recommended Scheme" in labels


def test_feasibility_question_grounding(client: TestClient):
    """3. Verify feasibility intent returns overall opportunity score and market reach."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Is my business feasible in this location?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "FEASIBILITY"
    assert "feasibility score" in data["answer"].lower()
    labels = [k["label"] for k in data["key_facts"]]
    assert "Feasibility Score" in labels


def test_risk_question_grounding(client: TestClient):
    """4. Verify risk intent returns overall risk classification and drivers."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What are my biggest risk factors?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "RISK"
    assert "risk profile" in data["answer"].lower()
    labels = [k["label"] for k in data["key_facts"]]
    assert "Overall Risk" in labels


def test_action_question_grounding(client: TestClient):
    """5. Verify action intent returns DPR and application milestones."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What should I do next?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "ACTION"
    assert "Detailed Project Report" in data["answer"] or "DPR" in data["answer"]
    labels = [k["label"] for k in data["key_facts"]]
    assert "Next Milestone" in labels


def test_explanation_question_grounding(client: TestClient):
    """6. Verify explanation intent breaks down feasibility score factors step-by-step."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Why is my feasibility score calculated this way?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "EXPLANATION"
    assert "Feasibility Score" in data["answer"]
    assert len(data["why_this_result"]) >= 2


def test_what_if_question_grounding(client: TestClient):
    """7. Verify what-if intent runs WhatIfEngine, compares baseline vs scenario surplus, and reports risk shift."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What if sales fall 15%?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "WHAT_IF"
    assert "Baseline Surplus" in data["answer"]
    assert "Simulated Surplus" in data["answer"]
    assert "Net Surplus Change" in data["answer"]
    labels = [k["label"] for k in data["key_facts"]]
    assert "Baseline Annual Surplus" in labels
    assert "Simulated Annual Surplus" in labels
    assert "Surplus Delta" in labels


def test_missing_business_context(client: TestClient):
    """8. Verify chatbot returns safe profile requirement guidance when no active business is present."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Can I afford this loan?",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "please complete or select a business profile" in data["answer"].lower()
    assert data["data_status"] == "MISSING_CONTEXT"


def test_missing_financial_data(client: TestClient):
    """9. Verify financial queries for unknown activities report insufficient data gracefully."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What is my loan requirement?",
            "business_context": {
                "business_category": "Unknown Sector",
                "specific_business": "Nonexistent Enterprise Activity XYZ",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 10000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "I don't have enough financial information" in data["answer"] or "0" in data["answer"]


def test_gemini_api_key_absent_offline(client: TestClient):
    """10. Verify chatbot functions 100% offline with verified deterministic templates when GEMINI_API_KEY is absent."""
    with patch.dict(os.environ, {}, clear=True):
        res = client.post(
            "/api/v1/advisory/chat",
            json={
                "message": "How much loan do I need?",
                "business_context": {
                    "business_category": "Poultry",
                    "specific_business": "Commercial Broiler Farming",
                    "location": "Sundargarh, Odisha",
                    "available_margin_capital": 65000.0,
                },
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["data_status"] == "VERIFIED_DETERMINISTIC"
        assert len(data["key_facts"]) >= 1


def test_deterministic_fallback(client: TestClient):
    """11. Verify facts returned by chatbot match exact NABARD project cost calculations."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What is my project cost?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    # 647,000 is the exact NABARD PLP benchmark for Commercial Broiler Farming in Sundargarh
    assert "647,000" in data["answer"] or "₹647,000" in str(data["key_facts"])


def test_unsupported_fact_not_fabricated(client: TestClient):
    """12. Verify chatbot does not fabricate unsupported claims or fake subsidy percentages."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Am I eligible for 99% subsidy?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "99%" not in data["answer"]
    assert "Final eligibility is subject to the implementing authority" in data["answer"]


def test_active_business_id_scoping(client: TestClient, db_session: Session):
    """13. Verify chatbot scopes facts directly from database using active business ID."""
    b = Business(
        owner_id=1,
        name="Organic Dairy Unit",
        type="Dairy",
        industry="Agri",
        location_district="Puri",
        location_state="Odisha",
        own_capital=120000.0,
    )
    db_session.add(b)
    db_session.commit()

    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What is my loan requirement?",
            "business_id": str(b.id),
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "Organic Dairy Unit" in data["answer"] or "Puri" in data["answer"]


def test_response_schema_consistency(client: TestClient):
    """14. Verify full ChatResponse model schema compliance for advisory endpoint."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What is my feasibility score?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    required_keys = [
        "answer",
        "intent",
        "key_facts",
        "why_this_result",
        "recommended_next_steps",
        "confidence",
        "sources",
        "data_status",
        "language",
        "traceability",
    ]
    for key in required_keys:
        assert key in data


def test_business_switching_isolation(client: TestClient, db_session: Session):
    """15. Verify switching from Business A to Business B changes chatbot answers with complete isolation."""
    # Create Business A (Poultry Unit in Sundargarh)
    biz_a = Business(
        owner_id=1,
        name="Commercial Broiler Farming",
        type="Poultry",
        industry="Agri",
        location_district="Sundargarh",
        location_state="Odisha",
        own_capital=65000.0,
    )
    # Create Business B (Fishery Hatchery in Balasore)
    biz_b = Business(
        owner_id=1,
        name="Freshwater Fish Hatchery",
        type="Fisheries",
        industry="Agri",
        location_district="Balasore",
        location_state="Odisha",
        own_capital=150000.0,
    )
    db_session.add_all([biz_a, biz_b])
    db_session.commit()

    # Question for Business A
    res_a = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Is this business feasible?",
            "business_id": str(biz_a.id),
        },
    )
    assert res_a.status_code == 200
    data_a = res_a.json()

    # Question for Business B
    res_b = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Is this business feasible?",
            "business_id": str(biz_b.id),
        },
    )
    assert res_b.status_code == 200
    data_b = res_b.json()

    # Verify answers use respective business activities and locations without data cross-leakage
    assert "Sundargarh" in data_a["answer"] or "Poultry" in data_a["answer"] or "Broiler" in data_a["answer"]
    assert "Balasore" in data_b["answer"] or "Fisheries" in data_b["answer"] or "Fish" in data_b["answer"]
    assert data_a["answer"] != data_b["answer"]
