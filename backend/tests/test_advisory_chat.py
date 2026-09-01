"""Unit and integration tests for Ask VITTANAYA Grounded Chatbot API (/api/v1/advisory/chat).

SIH26091 - Testing chat endpoints, query intents, grounded decision engine facts,
language parameters, safety, and offline fallback synthesis.
"""

import os
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.services.seed_service import seed_all_reference_data


def test_chat_endpoint_valid_question(client: TestClient, db_session: Session):
    """Test POST /api/v1/advisory/chat with a valid entrepreneur question."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Can I afford this business?",
            "language": "English",
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
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 20
    assert data["intent"] in ["FINANCIAL", "GENERAL"]
    assert "key_facts" in data
    assert len(data["key_facts"]) >= 1
    assert "sources" in data
    assert data["confidence"] == "HIGH"
    assert data["data_status"] == "VERIFIED_DETERMINISTIC"
    assert "traceability" in data


def test_chat_endpoint_empty_message(client: TestClient):
    """Test POST /api/v1/advisory/chat with an empty message string (validation failure)."""
    response = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "",
            "language": "English",
        },
    )
    assert response.status_code == 422


def test_chat_endpoint_financial_intent(client: TestClient, db_session: Session):
    """Test POST /api/v1/advisory/chat with financial & credit gap intent."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What is my total financing requirement and margin gap?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 50000.0,
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "FINANCIAL"
    labels = [kf["label"] for kf in data["key_facts"]]
    assert "Indicative Project Cost" in labels
    assert "Financing Gap" in labels


def test_chat_endpoint_scheme_intent(client: TestClient, db_session: Session):
    """Test POST /api/v1/advisory/chat with scheme & subsidy matching intent."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "How do I apply for the PMEGP subsidy?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "SCHEME"
    assert "PMEGP" in data["answer"] or "subsidy" in data["answer"].lower()


def test_chat_endpoint_risk_intent(client: TestClient, db_session: Session):
    """Test POST /api/v1/advisory/chat with risk advisory intent."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What is my biggest risk factor?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "RISK"
    labels = [kf["label"] for kf in data["key_facts"]]
    assert "Overall Risk" in labels


def test_chat_endpoint_feasibility_intent(client: TestClient, db_session: Session):
    """Test POST /api/v1/advisory/chat with market feasibility intent."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Is this business viable in my district?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "FEASIBILITY"
    labels = [kf["label"] for kf in data["key_facts"]]
    assert "Feasibility Score" in labels


def test_chat_endpoint_language_parameter(client: TestClient, db_session: Session):
    """Test POST /api/v1/advisory/chat respecting language parameter."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What are the scheme benefits?",
            "language": "हिन्दी (Hindi)",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "हिन्दी (Hindi)"


def test_chat_endpoint_offline_fallback(client: TestClient, db_session: Session):
    """Verify chatbot works 100% offline when GEMINI_API_KEY is not set."""
    seed_all_reference_data(db_session)
    with patch.dict(os.environ, {}, clear=True):
        response = client.post(
            "/api/v1/advisory/chat",
            json={
                "message": "What should I do next?",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["data_status"] == "VERIFIED_DETERMINISTIC"
        assert len(data["recommended_next_steps"]) >= 1


def test_chat_endpoint_missing_business_context(client: TestClient, db_session: Session):
    """Test POST /api/v1/advisory/chat without business_context payload."""
    seed_all_reference_data(db_session)
    response = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Hello, explain my feasibility score.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
