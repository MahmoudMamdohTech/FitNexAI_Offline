import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Get Supported Exercises
def test_ai_exercises_returns_list():
    response = client.get("/api/v1/exercises")
    assert response.status_code == 200
    assert "Squat" in str(response.json())

# Valid Frame Analysis
def test_analyze_valid_frame_returns_reps():
    payload = {
        "session_id": "test_valid_frame",
        "exercise": "Squat",
        "frame_b64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    assert "reps" in response.json()

# Corrupt Frame Handling
def test_analyze_rejects_corrupt_image():
    payload = {
        "session_id": "test_bad_frame",
        "exercise": "Squat",
        "frame_b64": "INVALID_IMAGE_DATA_!@#$"
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 400

# Unsupported Exercise Handling
def test_analyze_rejects_unsupported_exercise():
    payload = {
        "session_id": "test_unsupported",
        "exercise": "Jumping Jacks",
        "frame_b64": "dummy_b64_data"
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 422

# Session Memory Management
def test_reset_session_clears_memory():
    payload = {"session_id": "test_memory_wipe"}
    response = client.post("/api/v1/reset-session", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
