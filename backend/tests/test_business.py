"""Test business profile retrieval, creation, and updating."""

from fastapi.testclient import TestClient

from backend.app.models.business import Business
from backend.app.models.user import User


def test_get_business_success(client: TestClient, sample_business: Business) -> None:
    """Verify retrieving an existing business profile."""
    response = client.get(f"/api/v1/business?business_id={sample_business.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_business.id
    assert data["name"] == "Lakshmi Handlooms & Terracotta"
    assert data["location_district"] == "Puri"


def test_get_business_not_found(client: TestClient) -> None:
    """Verify 404 response when querying non-existent business."""
    response = client.get("/api/v1/business?business_id=99999")
    assert response.status_code == 404


def test_create_business(client: TestClient, sample_user: User) -> None:
    """Verify creating a new rural micro-enterprise profile."""
    payload = {
        "owner_id": sample_user.id,
        "name": "Bhubaneswar Bamboo Crafts",
        "type": "Handicraft",
        "industry": "Wood & Bamboo",
        "location_village": "Sundarpada",
        "location_district": "Khurda",
        "location_state": "Odisha",
        "location_pin": "751002",
        "monthly_revenue_estimate": "35000.00",
        "monthly_expense_estimate": "20000.00",
    }
    response = client.post("/api/v1/business", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Bhubaneswar Bamboo Crafts"
    assert data["owner_id"] == sample_user.id


def test_patch_business(client: TestClient, sample_business: Business) -> None:
    """Verify updating fields on an existing business profile."""
    patch_payload = {
        "monthly_revenue_estimate": "55000.00",
        "location_village": "Sundargram West",
    }
    response = client.patch(
        f"/api/v1/business?business_id={sample_business.id}",
        json=patch_payload,
    )
    assert response.status_code == 200
    data = response.json()
    assert float(data["monthly_revenue_estimate"]) == 55000.00
    assert data["location_village"] == "Sundargram West"
