"""Unit and API Tests for Action Plan & Bankable DPR Endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models.business import Business
from backend.app.services.seed_service import seed_all_reference_data


@pytest.fixture(autouse=True)
def setup_test_db(db_session: Session):
    """Seed reference tables and default user for tests."""
    seed_all_reference_data(db_session)


@pytest.fixture
def sample_biz(db_session: Session) -> Business:
    """Create a sample business for testing."""
    biz = db_session.query(Business).filter(Business.id == 1).first()
    if not biz:
        biz = Business(
            id=1,
            owner_id=1,
            name="Sundargarh Poultry Farm",
            type="Poultry",
            industry="Agri-Processing",
            location_district="Sundargarh",
            location_state="Odisha",
            own_capital=65000.0,
        )
        db_session.add(biz)
        db_session.commit()
        db_session.refresh(biz)
    return biz


def test_get_action_plan_tasks(client: TestClient, db_session: Session, sample_biz: Business):
    """Test retrieving action plan tasks for enterprise."""
    response = client.get(f"/api/v1/action-plan/{sample_biz.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["business_id"] == sample_biz.id
    assert data["total_tasks"] >= 5
    assert "tasks" in data
    assert len(data["tasks"]) >= 5


def test_update_action_plan_task_status(client: TestClient, db_session: Session, sample_biz: Business):
    """Test updating status of a roadmap task."""
    # First ensure tasks exist
    res = client.get(f"/api/v1/action-plan/{sample_biz.id}")
    task_id = res.json()["tasks"][0]["id"]

    # Update task status to completed
    patch_res = client.patch(
        f"/api/v1/action-plan/tasks/{task_id}",
        json={"status": "completed"},
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["id"] == task_id
    assert updated["status"] == "completed"


def test_export_dpr_document(client: TestClient, db_session: Session, sample_biz: Business):
    """Test compiling bankable Detailed Project Report (DPR)."""
    payload = {
        "business_id": sample_biz.id,
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
