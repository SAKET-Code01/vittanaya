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
    assert data["health"] == "/health"


def test_platform_health_check_endpoint(client: TestClient) -> None:
    """Verify GET /health returns status 200 and ok status for Render probe."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_database_health_check_endpoint(client: TestClient) -> None:
    """Verify GET /health/db and /api/v1/health/db safely verify DB connectivity."""
    res_root = client.get("/health/db")
    assert res_root.status_code == 200
    assert res_root.json() == {"status": "ok", "database": "connected"}

    res_v1 = client.get("/api/v1/health/db")
    assert res_v1.status_code == 200
    assert res_v1.json() == {"status": "ok", "database": "connected"}


def test_advisory_status_endpoint(client: TestClient) -> None:
    """Verify GET /api/v1/advisory/status returns safe foundation state."""
    response = client.get("/api/v1/advisory/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["foundation_ready", "operational"]
    assert data["target_problem"] == "SIH26091"
