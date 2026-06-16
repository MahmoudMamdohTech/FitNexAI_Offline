from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SaveWorkoutRequest(BaseModel):
    exercise: str
    reps: int
    score: float = 0.0
    duration_seconds: int = 0
    calories_burned: float = 0.0

class WorkoutResponse(BaseModel):
    id: int
    exercise: str
    reps: int
    score: float
    duration_seconds: int
    calories_burned: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
