"""Test health check and root redirect endpoints."""

from fastapi.testclient import TestClient


def test_health_check_endpoint(client: TestClient) -> None:
    """Verify GET /api/v1/health returns status 200 and healthy payload."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "VITTANAYA"
    assert "version" in data


def test_root_endpoint(client: TestClient) -> None:
    """Verify GET / returns application information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["health"] == "/api/v1/health"


def test_advisory_status_endpoint(client: TestClient) -> None:
    """Verify GET /api/v1/advisory/status returns safe foundation state."""
    response = client.get("/api/v1/advisory/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["foundation_ready", "operational"]
    assert data["target_problem"] == "SIH26091"
