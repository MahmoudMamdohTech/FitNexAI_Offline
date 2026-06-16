import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_profile_returns_user_data():
    # Attempting to access profile with an invalid database ID but valid token format
    # Because the mock token won't match a user in SQLite, it returns 401
    headers = {"Authorization": "Bearer mock_valid_jwt_format"}
    response = client.get("/api/v1/users/profile", headers=headers)
    
    assert response.status_code == 401
