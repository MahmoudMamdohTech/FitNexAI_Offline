import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint_returns_service_info():
    """The /health endpoint should confirm the service is running."""
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "fitnex_ai_unified"
    assert data["version"] == "2.0.0"


def test_cors_allows_frontend_origin():
    """CORS preflight from the React frontend should be accepted."""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, Authorization"
    }
    response = client.options("/api/v1/auth/login", headers=headers)

    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
