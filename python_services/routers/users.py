"""
Users Router — /api/v1/users
Onboarding profile setup and profile retrieval.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from schemas.user import ProfileResponse, SetupRequest

logger = logging.getLogger("fitnex.users")
router = APIRouter(prefix="/users", tags=["Users"])

VALID_GENDERS = {"male", "female"}
VALID_GOALS = {"bulk", "cut", "maintain"}
VALID_ACTIVITY = {"sedentary", "light", "moderate", "active", "very_active"}


@router.post("/setup", response_model=ProfileResponse)
async def setup_profile(
    req: SetupRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save onboarding profile data. user_id comes from JWT."""
    gender = req.gender.lower().strip()
    if gender not in VALID_GENDERS:
        raise HTTPException(422, f"gender must be one of: {VALID_GENDERS}")

    goal = req.goal.lower().strip()
    if goal not in VALID_GOALS:
        raise HTTPException(422, f"goal must be one of: {VALID_GOALS}")

    activity = req.activity_level.lower().strip()
    if activity not in VALID_ACTIVITY:
        activity = "moderate"

    user.age = req.age
    user.gender = gender
    user.weight = req.weight
    user.height = req.height
    user.activity_level = activity
    user.goal = goal
    user.vegetarian = req.vegetarian
    user.vegan = req.vegan
    user.is_setup_completed = True

    await db.commit()
    await db.refresh(user)

    logger.info("Profile setup completed: user_id=%d", user.id)
    return ProfileResponse(**user.to_dict())


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user: User = Depends(get_current_user)):
    """Get the authenticated user's full profile."""
    return ProfileResponse(**user.to_dict())
