"""
Gym Router — /api/v1/gym
Workout persistence (save + history).
"""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from models.workout import Workout
from schemas.gym import SaveWorkoutRequest, WorkoutResponse

logger = logging.getLogger("fitnex.gym")
router = APIRouter(prefix="/gym", tags=["Gym"])


@router.post("/workout", response_model=WorkoutResponse, status_code=201)
async def save_workout(
    req: SaveWorkoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save a completed workout session. user_id comes from JWT."""
    workout = Workout(
        user_id=user.id,
        exercise=req.exercise.strip(),
        reps=req.reps,
        score=req.score,
        duration_seconds=req.duration_seconds,
        calories_burned=req.calories_burned,
    )
    db.add(workout)
    await db.commit()
    await db.refresh(workout)

    logger.info(
        "Workout saved: user_id=%d exercise=%s reps=%d",
        user.id, req.exercise, req.reps,
    )
    return WorkoutResponse(**workout.to_dict())


@router.get("/history", response_model=List[WorkoutResponse])
async def get_workout_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Get workout history for the authenticated user with pagination."""
    result = await db.execute(
        select(Workout)
        .where(Workout.user_id == user.id)
        .order_by(Workout.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    workouts = result.scalars().all()
    return [WorkoutResponse(**w.to_dict()) for w in workouts]
