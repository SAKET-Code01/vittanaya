"""Unit and API Tests for Location Search & Hierarchy Endpoints."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.services.seed_service import seed_locations
from backend.main import app

client = TestClient(app)


def test_location_search_and_hierarchy(db_session: Session):
    """Test location search and administrative hierarchy endpoints."""
    # Seed location dataset
    seed_locations(db_session)

    # 1. Test search query
    res = client.get("/api/v1/locations/search?q=Jatni")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["district_name"] == "Khordha"
    assert data[0]["block_name"] == "Jatni"

    # 2. Test hierarchy endpoint
    h_res = client.get("/api/v1/locations/hierarchy?state_code=OD&district=Khordha")
    assert h_res.status_code == 200
    h_data = h_res.json()
    assert "Khordha" in h_data["districts"]
    assert "Jatni" in h_data["blocks"]
    assert "Retang" in h_data["villages"]
