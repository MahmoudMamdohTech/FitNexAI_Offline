import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Signup Flow
def test_signup_creates_new_user():
    payload = {
        "name": "Mahmoud Tester",
        "email": "signup_test@fitnex.com",
        "password": "SecurePass123"
    }
    response = client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code == 201
    assert "user_id" in response.json()

def test_signup_rejects_duplicate_email():
    payload = {
        "name": "Duplicate User",
        "email": "signup_test@fitnex.com",
        "password": "AnotherPass456"
    }
    response = client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code == 409

# Login and Auth
def test_login_rejects_wrong_password():
    payload = {
        "email": "fake_user@fitnex.com",
        "password": "TotallyWrongPassword"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401

def test_login_rejects_empty_fields():
    payload = {
        "email": "",
        "password": ""
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 422

# JWT Route Protection
def test_profile_blocked_without_token():
    response = client.get("/api/v1/users/profile")
    assert response.status_code == 401

def test_profile_blocked_with_fake_token():
    headers = {"Authorization": "Bearer this.is.a.fake.token"}
    response = client.get("/api/v1/users/profile", headers=headers)
    assert response.status_code == 401
