"""
Nutrition Router — /api/v1
KNN-based personalised meal-plan generation and plan persistence.
"""

import json
import logging
import math
import random
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_user
from models.user import User

logger = logging.getLogger("nutrition_service.nutrition")
router = APIRouter(tags=["Nutrition"])

# Traditional Egyptian food database curated for production
FOOD_DB = [
    # breakfast
    {"id": 1,  "name": "Ful Medames with Olive Oil & Baladi Bread", "meal_type": "breakfast",
     "calories": 420, "protein": 18, "carbs": 65, "fat": 12,
     "tags": ["vegan", "vegetarian", "high-fiber"], "allergens": ["gluten"]},
    {"id": 2,  "name": "Shakshuka (Eggs in Spiced Tomato Sauce)", "meal_type": "breakfast",
     "calories": 350, "protein": 22, "carbs": 18, "fat": 20,
     "tags": ["vegetarian", "low-carb"], "allergens": ["eggs"]},
    {"id": 3,  "name": "Taameya (Egyptian Falafel) with Salad", "meal_type": "breakfast",
     "calories": 450, "protein": 14, "carbs": 42, "fat": 24,
     "tags": ["vegan", "vegetarian"], "allergens": []},
    {"id": 4,  "name": "Labneh with Za'atar & Cucumber", "meal_type": "breakfast",
     "calories": 280, "protein": 12, "carbs": 10, "fat": 18,
     "tags": ["vegetarian", "low-carb"], "allergens": ["dairy"]},
    {"id": 5,  "name": "Belila (Whole Wheat with Hot Milk & Nuts)", "meal_type": "breakfast",
     "calories": 390, "protein": 15, "carbs": 55, "fat": 12,
     "tags": ["vegetarian"], "allergens": ["dairy", "gluten", "nuts"]},
    {"id": 6,  "name": "Feteer Meshaltet with Honey & White Cheese", "meal_type": "breakfast",
     "calories": 650, "protein": 12, "carbs": 60, "fat": 38,
     "tags": ["vegetarian"], "allergens": ["dairy", "gluten"]},

    # lunch
    {"id": 10, "name": "Koshari Bowl (Lentils, Rice, Pasta, Chickpeas)", "meal_type": "lunch",
     "calories": 580, "protein": 18, "carbs": 95, "fat": 10,
     "tags": ["vegan", "vegetarian", "high-carb"], "allergens": ["gluten"]},
    {"id": 11, "name": "Chicken Shawarma with Garlic Sauce (Toum)", "meal_type": "lunch",
     "calories": 520, "protein": 42, "carbs": 35, "fat": 22,
     "tags": ["high-protein"], "allergens": ["gluten"]},
    {"id": 12, "name": "Bamia (Okra Stew) with Beef & Vermicelli Rice", "meal_type": "lunch",
     "calories": 550, "protein": 38, "carbs": 45, "fat": 20,
     "tags": ["high-protein"], "allergens": ["gluten"]},
    {"id": 13, "name": "Macarona Béchamel (Baked Pasta with Minced Beef)", "meal_type": "lunch",
     "calories": 680, "protein": 35, "carbs": 55, "fat": 32,
     "tags": ["high-protein"], "allergens": ["dairy", "gluten"]},
    {"id": 14, "name": "Hawawshi (Spiced Meat stuffed in Baladi Bread)", "meal_type": "lunch",
     "calories": 610, "protein": 32, "carbs": 45, "fat": 30,
     "tags": ["high-protein"], "allergens": ["gluten"]},
    {"id": 15, "name": "Fatteh with Lamb, Garlic Vinegar & Rice", "meal_type": "lunch",
     "calories": 720, "protein": 45, "carbs": 65, "fat": 28,
     "tags": ["high-protein"], "allergens": ["gluten", "dairy"]},

    # dinner
    {"id": 20, "name": "Molokhia with Grilled Chicken & White Rice", "meal_type": "dinner",
     "calories": 540, "protein": 46, "carbs": 48, "fat": 14,
     "tags": ["high-protein"], "allergens": []},
    {"id": 21, "name": "Grilled Kofta with Tahini & Egyptian Salad", "meal_type": "dinner",
     "calories": 590, "protein": 42, "carbs": 20, "fat": 35,
     "tags": ["high-protein", "low-carb"], "allergens": ["sesame"]},
    {"id": 22, "name": "Shish Tawook (Grilled Chicken Skewers) with Tabbouleh", "meal_type": "dinner",
     "calories": 450, "protein": 48, "carbs": 25, "fat": 15,
     "tags": ["high-protein", "low-carb"], "allergens": ["gluten"]},
    {"id": 23, "name": "Mahshi Waraq Enab (Stuffed Vine Leaves) with Yogurt", "meal_type": "dinner",
     "calories": 420, "protein": 12, "carbs": 65, "fat": 14,
     "tags": ["vegetarian"], "allergens": ["dairy"]},
    {"id": 24, "name": "Shorbet Ads (Yellow Lentil Soup) with Lemon", "meal_type": "dinner",
     "calories": 320, "protein": 18, "carbs": 50, "fat": 6,
     "tags": ["vegan", "vegetarian", "high-fiber"], "allergens": []},
    {"id": 25, "name": "Sayadeya Fish with Spiced Brown Rice", "meal_type": "dinner",
     "calories": 510, "protein": 40, "carbs": 55, "fat": 12,
     "tags": ["high-protein"], "allergens": ["fish"]},

    # snacks
    {"id": 30, "name": "Hummus with Cucumber & Carrot Sticks", "meal_type": "snack",
     "calories": 210, "protein": 8, "carbs": 20, "fat": 12,
     "tags": ["vegan", "vegetarian"], "allergens": ["sesame"]},
    {"id": 31, "name": "Medjool Dates with Almonds", "meal_type": "snack",
     "calories": 240, "protein": 5, "carbs": 35, "fat": 10,
     "tags": ["vegan", "vegetarian"], "allergens": ["nuts"]},
    {"id": 32, "name": "Termes (Lupini Beans) with Cumin & Lemon", "meal_type": "snack",
     "calories": 120, "protein": 12, "carbs": 14, "fat": 2,
     "tags": ["vegan", "vegetarian", "high-protein", "low-carb"], "allergens": []},
    {"id": 33, "name": "Watermelon with White Cheese (Gebna)", "meal_type": "snack",
     "calories": 180, "protein": 6, "carbs": 22, "fat": 8,
     "tags": ["vegetarian"], "allergens": ["dairy"]},
    {"id": 34, "name": "Roz Bel Laban (Egyptian Rice Pudding)", "meal_type": "snack",
     "calories": 290, "protein": 7, "carbs": 45, "fat": 8,
     "tags": ["vegetarian"], "allergens": ["dairy"]},
    {"id": 35, "name": "Basbousa Slice", "meal_type": "snack",
     "calories": 380, "protein": 4, "carbs": 60, "fat": 15,
     "tags": ["vegetarian"], "allergens": ["gluten", "dairy", "nuts"]},
]


# pydantic schemas
class NutritionRequest(BaseModel):
    gender: str            = Field(..., description="male | female")
    age: int               = Field(..., ge=10, le=100)
    height_cm: float       = Field(..., ge=100, le=250)
    weight_kg: float       = Field(..., ge=30, le=300)
    goal: str              = Field(..., description="bulk | cut | maintain")
    activity_level: str    = Field("moderate", description="sedentary | light | moderate | active | very_active")
    dietary_preference: str = Field("none", description="none | vegetarian | vegan")
    favorite_foods: List[str] = Field(default_factory=list)
    disliked_foods: List[str] = Field(default_factory=list)
    allergies: List[str]   = Field(default_factory=list)

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v):
        if v.lower() not in ("male", "female"):
            raise ValueError("gender must be 'male' or 'female'")
        return v.lower()

    @field_validator("goal")
    @classmethod
    def validate_goal(cls, v):
        if v.lower() not in ("bulk", "cut", "maintain"):
            raise ValueError("goal must be 'bulk', 'cut', or 'maintain'")
        return v.lower()


class MealItem(BaseModel):
    meal: str
    calories: int
    protein: float
    carbs: float
    fats: float


class NutritionNeeds(BaseModel):
    bmr: float
    tdee: float
    daily_calories: int
    protein_g: int
    carb_g: int
    fat_g: int


class NutritionResponse(BaseModel):
    nutrition_needs: NutritionNeeds
    breakfast_options: List[MealItem]
    lunch_options: List[MealItem]
    dinner_options: List[MealItem]
    snack_options: List[MealItem]
    tips: List[str]


# calorie and macro calculation
ACTIVITY_MULTIPLIERS = {
    "sedentary":   1.2,
    "light":       1.375,
    "moderate":    1.55,
    "active":      1.725,
    "very_active": 1.9,
}

GOAL_ADJUSTMENTS = {"bulk": 400, "maintain": 0, "cut": -500}

GOAL_MACROS = {
    # (protein_pct, carb_pct, fat_pct) of total calories
    "bulk":     (0.30, 0.45, 0.25),
    "maintain": (0.30, 0.40, 0.30),
    "cut":      (0.40, 0.35, 0.25),
}


def _calculate_needs(req: NutritionRequest) -> NutritionNeeds:
    # Mifflin-St Jeor BMR
    if req.gender == "male":
        bmr = 10 * req.weight_kg + 6.25 * req.height_cm - 5 * req.age + 5
    else:
        bmr = 10 * req.weight_kg + 6.25 * req.height_cm - 5 * req.age - 161

    multiplier = ACTIVITY_MULTIPLIERS.get(req.activity_level, 1.55)
    tdee = bmr * multiplier
    daily_calories = tdee + GOAL_ADJUSTMENTS[req.goal]

    p_pct, c_pct, f_pct = GOAL_MACROS[req.goal]
    protein_g = math.ceil(daily_calories * p_pct / 4)
    carb_g    = math.ceil(daily_calories * c_pct / 4)
    fat_g     = math.ceil(daily_calories * f_pct / 9)

    return NutritionNeeds(
        bmr=round(bmr, 1),
        tdee=round(tdee, 1),
        daily_calories=int(daily_calories),
        protein_g=protein_g,
        carb_g=carb_g,
        fat_g=fat_g,
    )


# KNN-style meal scoring
def _score_food(food: dict, req: NutritionRequest, needs: NutritionNeeds) -> float:
    """Score a food item based on how well it matches user preferences."""
    score = 0.0
    name_lower = food["name"].lower()

    # favourite foods boost
    for fav in req.favorite_foods:
        if fav.lower() in name_lower:
            score += 50

    # disliked foods penalty
    for dis in req.disliked_foods:
        if dis.lower() in name_lower:
            score -= 100

    # dietary preference match
    if req.dietary_preference == "vegan" and "vegan" in food["tags"]:
        score += 20
    elif req.dietary_preference == "vegetarian" and "vegetarian" in food["tags"]:
        score += 20

    # goal alignment
    if req.goal == "cut":
        if food["calories"] < 400:
            score += 20
        if "low-carb" in food["tags"]:
            score += 15
        if "high-protein" in food["tags"]:
            score += 15
    elif req.goal == "bulk":
        if food["calories"] > 500:
            score += 20
        if "high-protein" in food["tags"]:
            score += 15
    else:
        if 350 <= food["calories"] <= 550:
            score += 15

    # small random noise for variety
    score += random.uniform(0, 5)

    return score


def _filter_and_rank(meal_type: str, req: NutritionRequest, needs: NutritionNeeds, n: int = 3) -> List[dict]:
    candidates = [f for f in FOOD_DB if f["meal_type"] == meal_type]

    # remove allergen conflicts
    user_allergies = {a.lower() for a in req.allergies}
    candidates = [f for f in candidates if not user_allergies.intersection({a.lower() for a in f["allergens"]})]

    # remove disliked foods
    disliked = [d.lower() for d in req.disliked_foods]
    def contains_disliked(food_name):
        name_l = food_name.lower()
        for d in disliked:
            if d in name_l:
                return True
        return False
        
    candidates_without_dislikes = [f for f in candidates if not contains_disliked(f["name"])]
    if candidates_without_dislikes:
        candidates = candidates_without_dislikes

    # dietary preference filter
    diet_candidates = candidates
    if req.dietary_preference == "vegan":
        diet_candidates = [f for f in candidates if "vegan" in f["tags"]]
    elif req.dietary_preference == "vegetarian":
        diet_candidates = [f for f in candidates if "vegetarian" in f["tags"]]
        
    if diet_candidates:
        candidates = diet_candidates

    if not candidates:
        candidates = [f for f in FOOD_DB if f["meal_type"] == meal_type]

    ranked = sorted(candidates, key=lambda f: _score_food(f, req, needs), reverse=True)
    return ranked[:n]


def _to_meal_item(food: dict) -> MealItem:
    return MealItem(
        meal=food["name"],
        calories=food["calories"],
        protein=food["protein"],
        carbs=food["carbs"],
        fats=food["fat"],
    )


def _generate_tips(req: NutritionRequest, needs: NutritionNeeds) -> List[str]:
    tips = []
    if req.goal == "bulk":
        tips += [
            f"Target {needs.daily_calories} kcal/day — eat in a ~400 kcal surplus.",
            "Prioritise protein at every meal to support muscle growth.",
            "Don't skip carbs — they fuel your workouts and recovery.",
        ]
    elif req.goal == "cut":
        tips += [
            f"Target {needs.daily_calories} kcal/day — stay in a moderate deficit.",
            "High protein (≥40 %) helps preserve muscle while cutting.",
            "Eat high-volume, low-calorie foods (vegetables, lean meats) to stay full.",
        ]
    else:
        tips += [
            f"Maintain {needs.daily_calories} kcal/day for body-weight stability.",
            "Balance macros: ~30 % protein, 40 % carbs, 30 % fat.",
            "Stay consistent — results come from long-term adherence.",
        ]
    tips.append("Drink at least 2–3 litres of water daily.")
    return tips


# endpoints
@router.post("/generate-meal-plan", response_model=NutritionResponse)
async def generate_meal_plan(req: NutritionRequest):
    """Generate a personalised meal plan using KNN scoring."""
    try:
        needs = _calculate_needs(req)

        return NutritionResponse(
            nutrition_needs=needs,
            breakfast_options=[_to_meal_item(f) for f in _filter_and_rank("breakfast", req, needs)],
            lunch_options    =[_to_meal_item(f) for f in _filter_and_rank("lunch",     req, needs)],
            dinner_options   =[_to_meal_item(f) for f in _filter_and_rank("dinner",    req, needs)],
            snack_options    =[_to_meal_item(f) for f in _filter_and_rank("snack",     req, needs)],
            tips=_generate_tips(req, needs),
        )
    except Exception as exc:
        logger.exception("Meal plan generation failed")
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/calculate-macros", response_model=NutritionNeeds)
async def calculate_macros(req: NutritionRequest):
    """Return only the macro calculation without full meal plan."""
    return _calculate_needs(req)


@router.get("/foods/options")
async def get_food_options():
    """Return base ingredients for the frontend food picker."""
    ingredients = [
        "Chicken", "Beef", "Salmon", "Shrimp", "Turkey", "Fish", 
        "Eggs", "Tofu", "Rice", "Quinoa", "Oats", "Pasta", 
        "Lentils", "Chickpea", "Broccoli", "Zucchini", "Sweet Potato", 
        "Avocado", "Yogurt", "Nuts", "Berries", 
        "Ful", "Taameya", "Molokhia", "Kofta", "Shawarma", "Koshari",
        "Hummus", "Bread", "Cheese"
    ]
    return {"foods": sorted(ingredients)}


# plan persistence (save/get)
class SavePlanRequest(BaseModel):
    plan: dict


@router.post("/plan")
async def save_plan(
    req: SavePlanRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save generated nutrition plan to the user record."""
    try:
        user.nutrition_plan = json.dumps(req.plan)
        await db.commit()
        return {"status": "success"}
    except Exception as exc:
        logger.exception("Failed to save plan")
        raise HTTPException(status_code=500, detail="Failed to save plan")


@router.get("/plan")
async def get_plan(user: User = Depends(get_current_user)):
    """Retrieve saved nutrition plan for the authenticated user."""
    if not user.nutrition_plan:
        return {"status": "success", "plan": None}

    try:
        plan = json.loads(user.nutrition_plan)
        return {"status": "success", "plan": plan}
    except Exception:
        logger.exception("Failed to parse saved plan")
        return {"status": "success", "plan": None}
