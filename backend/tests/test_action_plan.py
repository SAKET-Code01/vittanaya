"""Unit and API Tests for Action Plan & Bankable DPR Endpoints."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.main import app

client = TestClient(app)


def test_get_action_plan_tasks(db_session: Session):
    """Test retrieving action plan tasks for enterprise."""
    response = client.get("/api/v1/action-plan/1")
    assert response.status_code == 200
    data = response.json()
    assert data["business_id"] == 1
    assert data["total_tasks"] >= 5
    assert "tasks" in data
    assert len(data["tasks"]) >= 5


def test_update_action_plan_task_status(db_session: Session):
    """Test updating status of a roadmap task."""
    # First ensure tasks exist
    client.get("/api/v1/action-plan/1")

    # Update task 1 status to completed
    patch_res = client.patch(
        "/api/v1/action-plan/tasks/1",
        json={"status": "completed"},
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["id"] == 1
    assert updated["status"] == "completed"


def test_export_dpr_document(db_session: Session):
    """Test compiling bankable Detailed Project Report (DPR)."""
    payload = {
        "business_id": 1,
        "business_name": "Sundargarh Poultry Farm",
        "business_category": "Poultry",
        "location": "Sundargarh, Odisha",
        "indicative_project_cost": 647000.0,
        "own_margin_capital": 65000.0,
        "eligible_loan_amount": 355550.0,
        "estimated_subsidy_amount": 226450.0,
        "scheme_name": "PMEGP (Rural Special)",
    }

    res = client.post("/api/v1/action-plan/export-dpr", json=payload)
    assert res.status_code == 200
    dpr = res.json()
    assert dpr["project_cost"] == 647000.0
    assert dpr["own_margin"] == 65000.0
    assert "Sundargarh Poultry Farm" in dpr["summary"]
    assert "dpr_content" in dpr

    doc_id = dpr["dpr_id"]
    html_res = client.get(f"/api/v1/action-plan/dpr-html/{doc_id}")
    assert html_res.status_code == 200
    assert "Detailed Project Report" in html_res.text
    assert "Sundargarh Poultry Farm" in html_res.text
