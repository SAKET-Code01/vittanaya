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

    # 3. Test market map endpoint
    m_res = client.get("/api/v1/locations/market-map?location=Kuarmunda&district=Sundargarh&category=Transport%20%26%20Logistics&radius_km=15")
    assert m_res.status_code == 200
    m_data = m_res.json()
    assert m_data["location_name"] == "Kuarmunda"
    assert m_data["district_name"] == "Sundargarh"
    assert m_data["category"] == "Transport & Logistics"
    assert len(m_data["pois"]) >= 1
    assert "demand_index" in m_data
    assert "source_authority" in m_data

    # 4. Test radius filtering on market map
    r_res = client.get("/api/v1/locations/market-map?location=Kuarmunda&district=Sundargarh&radius_km=5")
    assert r_res.status_code == 200
    r_data = r_res.json()
    assert all(poi["distance_km"] <= 5.0 for poi in r_data["pois"])

