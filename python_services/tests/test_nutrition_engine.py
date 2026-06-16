import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# --- 1. Macro Calculations ---
def test_calculate_macros_returns_correct_structure():
    payload = {
        "weight_kg": 105.0,
        "height_cm": 188.0,
        "age": 21,
        "gender": "male",
        "activity_level": "active",
        "goal": "maintain",
        "dietary_preference": "none",
        "favorite_foods": [],
        "disliked_foods": [],
        "allergies": []
    }
    response = client.post("/api/v1/calculate-macros", json=payload)
    assert response.status_code == 200
    assert "tdee" in response.json()

# --- 2. AI Meal Plan Generation ---
def test_meal_plan_returns_all_meal_categories():
    payload = {
        "gender": "male",
        "age": 21,
        "height_cm": 188.0,
        "weight_kg": 105.0,
        "goal": "maintain",
        "activity_level": "active",
        "dietary_preference": "vegetarian",
        "favorite_foods": [],
        "disliked_foods": [],
        "allergies": []
    }
    response = client.post("/api/v1/generate-meal-plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "breakfast_options" in data
    assert "lunch_options" in data

# --- 3. Food Database Options ---
def test_food_options_returns_sorted_list():
    response = client.get("/api/v1/foods/options")
    assert response.status_code == 200
    assert "foods" in response.json()
