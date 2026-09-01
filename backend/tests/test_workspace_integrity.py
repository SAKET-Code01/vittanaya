"""Unit & Integration tests for Active Business & Workspace Integrity (SIH26091 - Phase A Step 2).

Tests:
1. Missing business profile returns HTTP 404 NOT FOUND across runtime endpoints.
2. Valid business creation & retrieval succeeds with active business scoping.
3. Task ownership validation returns HTTP 400 when task does not belong to specified business.
4. Action plan task persistence survives business queries.
5. DPR export enforces valid business ID and matches active business metadata.
6. Advisory chatbot requires active business context and avoids inventing defaults.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models.action_plan import ActionPlanTask
from backend.app.models.business import Business
from backend.app.services.seed_service import seed_all_reference_data


@pytest.fixture(autouse=True)
def setup_reference_data(db_session: Session):
    """Seed reference tables for all tests in this module."""
    seed_all_reference_data(db_session)


def test_missing_business_returns_404(client: TestClient):
    """Verify runtime-critical endpoints return HTTP 404 for non-existent business IDs."""
    invalid_id = 99999

    # GET /business?business_id=99999
    res = client.get(f"/api/v1/business?business_id={invalid_id}")
    assert res.status_code == 404

    # GET /dashboard/summary?business_id=99999
    res = client.get(f"/api/v1/dashboard/summary?business_id={invalid_id}")
    assert res.status_code == 404

    # GET /finance/transactions?business_id=99999
    res = client.get(f"/api/v1/finance/transactions?business_id={invalid_id}")
    assert res.status_code == 404

    # GET /action-plan/99999
    res = client.get(f"/api/v1/action-plan/{invalid_id}")
    assert res.status_code == 404


def test_valid_business_creation_and_isolation(client: TestClient, db_session: Session):
    """Verify creating distinct businesses isolates action plan tasks and profiles."""
    # Create Business A
    res_a = client.post(
        "/api/v1/business",
        json={
            "owner_id": 1,
            "name": "Maa Tarini Broiler Unit",
            "type": "Poultry",
            "industry": "Agri-Processing",
            "location_district": "Sundargarh",
            "location_state": "Odisha",
            "own_capital": 65000.0,
        },
    )
    assert res_a.status_code == 201
    biz_a = res_a.json()
    biz_a_id = biz_a["id"]

    # Create Business B
    res_b = client.post(
        "/api/v1/business",
        json={
            "owner_id": 1,
            "name": "Kalinga Rice Mill",
            "type": "Food Processing",
            "industry": "Agri-Industry",
            "location_district": "Puri",
            "location_state": "Odisha",
            "own_capital": 250000.0,
        },
    )
    assert res_b.status_code == 201
    biz_b = res_b.json()
    biz_b_id = biz_b["id"]

    assert biz_a_id != biz_b_id

    # Retrieve Action Plan for Business A
    ap_a = client.get(f"/api/v1/action-plan/{biz_a_id}")
    assert ap_a.status_code == 200
    tasks_a = ap_a.json()["tasks"]
    assert len(tasks_a) > 0
    assert all(t["business_id"] == biz_a_id for t in tasks_a)

    # Retrieve Action Plan for Business B
    ap_b = client.get(f"/api/v1/action-plan/{biz_b_id}")
    assert ap_b.status_code == 200
    tasks_b = ap_b.json()["tasks"]
    assert len(tasks_b) > 0
    assert all(t["business_id"] == biz_b_id for t in tasks_b)

    # Cross-check: No tasks leaked between business A and business B
    task_a_ids = {t["id"] for t in tasks_a}
    task_b_ids = {t["id"] for t in tasks_b}
    assert task_a_ids.isdisjoint(task_b_ids)


def test_task_ownership_validation(client: TestClient, db_session: Session):
    """Verify updating task status checks business ownership and rejects cross-business updates."""
    # Seed Business 1 & Task
    b1 = Business(owner_id=1, name="Biz 1", type="Poultry", industry="Agri", location_district="Puri", location_state="Odisha")
    b2 = Business(owner_id=1, name="Biz 2", type="Retail", industry="Services", location_district="Cuttack", location_state="Odisha")
    db_session.add_all([b1, b2])
    db_session.commit()

    t1 = ActionPlanTask(business_id=b1.id, phase="Phase 1", title="Task B1", status="pending")
    db_session.add(t1)
    db_session.commit()

    # Valid task update for correct business
    res = client.patch(f"/api/v1/action-plan/tasks/{t1.id}?business_id={b1.id}", json={"status": "completed"})
    assert res.status_code == 200
    assert res.json()["status"] == "completed"

    # Cross-business task update attempt should be rejected with 400 Bad Request
    res_invalid = client.patch(f"/api/v1/action-plan/tasks/{t1.id}?business_id={b2.id}", json={"status": "pending"})
    assert res_invalid.status_code == 400
    assert "does not belong to business ID" in res_invalid.json()["detail"]


def test_dpr_export_business_validation(client: TestClient, db_session: Session):
    """Verify DPR export requires valid business ID in database."""
    # Attempt DPR export with non-existent business ID
    res = client.post(
        "/api/v1/action-plan/export-dpr",
        json={
            "business_id": 88888,
            "business_name": "Ghost Enterprise",
            "indicative_project_cost": 500000.0,
        },
    )
    assert res.status_code == 404

    # Create valid business and perform DPR export
    b = Business(owner_id=1, name="Odisha Handicrafts", type="Handicraft", industry="Crafts", location_district="Raghurajpur", location_state="Odisha")
    db_session.add(b)
    db_session.commit()

    res_valid = client.post(
        "/api/v1/action-plan/export-dpr",
        json={
            "business_id": b.id,
            "business_name": b.name,
            "business_category": "Handicraft",
            "location": "Raghurajpur, Odisha",
            "indicative_project_cost": 300000.0,
            "own_margin_capital": 30000.0,
            "eligible_loan_amount": 270000.0,
            "scheme_name": "PMEGP",
        },
    )
    assert res_valid.status_code == 200
    dpr_data = res_valid.json()
    assert dpr_data["project_cost"] == 300000.0
    assert dpr_data["dpr_content"]["metadata"]["business_name"] == "Odisha Handicrafts"


def test_advisory_chat_requires_business_context(client: TestClient):
    """Verify advisory chatbot requires active business context and returns safe guidance when missing."""
    res_no_ctx = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What subsidy is available for my business?",
        },
    )
    assert res_no_ctx.status_code == 200
    data = res_no_ctx.json()
    assert "complete or select a business profile" in data["answer"]
    assert data["key_facts"][0]["label"] == "Profile Status"

    # With valid business context
    res_with_ctx = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What subsidy is available for my poultry farm in Sundargarh?",
            "business_context": {
                "business_category": "Poultry",
                "specific_business": "Commercial Broiler Farming",
                "location": "Sundargarh, Odisha",
                "available_margin_capital": 65000.0,
            },
        },
    )
    assert res_with_ctx.status_code == 200
    data_ctx = res_with_ctx.json()
    assert "PMEGP" in data_ctx["answer"] or "subsidy" in data_ctx["answer"].lower()
