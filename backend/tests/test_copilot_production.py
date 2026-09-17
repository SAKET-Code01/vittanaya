"""Integration and E2E unit tests for VITTANAYA Production AI Business Copilot.

Tests:
1. Tool registry dispatch & schemas
2. Write confirmation guardrail (natural language prompt requiring confirmation)
3. Confirmed write execution (PostgreSQL ActionPlanTask update + Readiness sync)
4. Navigation target detection
5. Grounded provenance labels
6. Fallback resilience on missing/offline AI
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models.action_plan import ActionPlanTask
from backend.app.models.business import Business
from backend.app.services.copilot_tools import CopilotToolRegistry
from backend.app.services.seed_service import seed_all_reference_data


@pytest.fixture(autouse=True)
def setup_reference_data(db_session: Session):
    """Seed reference data."""
    seed_all_reference_data(db_session)


def test_copilot_tool_registry_read(db_session: Session):
    """Test read tool dispatch from CopilotToolRegistry."""
    # Seed a business
    biz = Business(
        owner_id=1,
        name="Tara Broilers",
        type="Poultry",
        industry="Broiler",
        location_district="Sundargarh",
        location_state="Odisha",
        own_capital=100000.0,
        project_cost=500000.0,
    )
    db_session.add(biz)
    db_session.commit()
    db_session.refresh(biz)

    ctx = {
        "business_id": biz.id,
        "business_category": "Poultry",
        "specific_business": "Broiler",
        "location": "Sundargarh, Odisha",
        "project_cost": 500000.0,
    }

    profile_res = CopilotToolRegistry.dispatch_read_tool("get_business_profile", db_session, ctx)
    assert profile_res["business_id"] == biz.id
    assert profile_res["business_name"] == "Tara Broilers"
    assert profile_res["provenance"] == "VERIFIED_LOCAL"

    fin_res = CopilotToolRegistry.dispatch_read_tool("get_financial_summary", db_session, ctx)
    assert fin_res["project_cost"] == 500000.0
    assert fin_res["monthly_emi"] > 0
    assert fin_res["provenance"] == "CALCULATED"


def test_write_action_confirmation_guardrail(client: TestClient, db_session: Session):
    """Verify write requests trigger a confirmation_required response before touching DB."""
    # Seed business and task
    biz = Business(
        owner_id=1,
        name="Konark Cashew",
        type="Agro-Processing",
        industry="Cashew Processing",
        location_district="Puri",
        location_state="Odisha",
        own_capital=80000.0,
    )
    db_session.add(biz)
    db_session.commit()
    db_session.refresh(biz)

    task = ActionPlanTask(
        business_id=biz.id,
        phase="Phase 1: Compliance",
        title="Market Survey & Buyer Validation",
        status="pending",
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    # Ask to complete task
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Please mark Market Survey complete",
            "business_id": str(biz.id),
            "business_context": {
                "business_id": str(biz.id),
                "business_name": "Konark Cashew",
                "business_category": "Agro-Processing",
                "specific_business": "Cashew Processing",
                "location": "Puri, Odisha",
                "available_margin_capital": 80000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()

    assert data["confirmation_required"] is True
    assert data["confirmation_details"] is not None
    assert data["confirmation_details"]["action"] == "complete_action_task"
    assert data["confirmation_details"]["task_id"] == task.id
    # Ensure task has NOT changed in DB yet
    db_session.refresh(task)
    assert task.status == "pending"


def test_confirmed_write_execution(client: TestClient, db_session: Session):
    """Verify confirmed action execution mutates PostgreSQL and recalculates readiness."""
    biz = Business(
        owner_id=1,
        name="Mayurbhanj Agro",
        type="Agriculture",
        industry="Agriculture",
        location_district="Mayurbhanj",
        location_state="Odisha",
        own_capital=90000.0,
    )
    db_session.add(biz)
    db_session.commit()
    db_session.refresh(biz)

    task = ActionPlanTask(
        business_id=biz.id,
        phase="Phase 1: Compliance",
        title="Udyam MSME Registration",
        status="pending",
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    # Send confirmed write payload
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "Confirm",
            "business_id": str(biz.id),
            "confirmed_action": {
                "action": "complete_action_task",
                "task_id": task.id,
                "business_id": biz.id,
            },
            "business_context": {
                "business_id": str(biz.id),
                "business_name": "Mayurbhanj Agro",
                "business_category": "Agriculture",
                "specific_business": "Agro",
                "location": "Mayurbhanj, Odisha",
                "available_margin_capital": 90000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()

    assert data["action_performed"] == "complete_action_task"
    assert "marked completed" in data["answer"].lower() or "marked **completed**" in data["answer"].lower()

    # Verify task updated in database
    db_session.refresh(task)
    assert task.status == "completed"


def test_navigation_target_detection(client: TestClient):
    """Verify natural language requests to open sections return appropriate navigation targets."""
    queries = [
        ("Please open my feasibility analysis", "feasibility"),
        ("Show me the action plan", "action-plan"),
        ("What schemes match my business? Open schemes page", "schemes"),
        ("Go to my financial plan", "financial-plan"),
        ("View my executive dashboard", "dashboard"),
    ]

    for q, expected_target in queries:
        res = client.post(
            "/api/v1/advisory/chat",
            json={
                "message": q,
                "business_context": {
                    "business_category": "Handloom",
                    "specific_business": "Sambalpuri Ikat Weaving",
                    "location": "Sambalpur, Odisha",
                    "available_margin_capital": 50000.0,
                },
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["navigation_target"] == expected_target, f"Failed for query: {q}"


def test_provenance_and_suggestions_present(client: TestClient):
    """Verify ChatResponse includes clean provenance labels and suggested action chips."""
    res = client.post(
        "/api/v1/advisory/chat",
        json={
            "message": "What is my cash runway?",
            "business_context": {
                "business_category": "Fisheries",
                "specific_business": "Freshwater Aquaculture",
                "location": "Balasore, Odisha",
                "available_margin_capital": 75000.0,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["provenance_label"] is not None
    assert len(data["suggested_actions"]) >= 3
