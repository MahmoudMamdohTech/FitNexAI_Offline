"""
Schemas for creating and viewing user profiles.
"""

from typing import Optional

from pydantic import BaseModel, Field


class SetupRequest(BaseModel):
    """Onboarding setup — saves profile fields to the user record."""
    age: int = Field(..., ge=10, le=100)
    gender: str = Field(..., description="male | female")
    weight: float = Field(..., ge=20, le=400, description="Weight in kg")
    height: float = Field(..., ge=80, le=280, description="Height in cm")
    activity_level: str = Field("moderate", description="sedentary | light | moderate | active | very_active")
    goal: str = Field(..., description="bulk | cut | maintain")
    vegetarian: bool = False
    vegan: bool = False


class ProfileResponse(BaseModel):
    id: int
    full_name: str
    email: str
    goal: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    is_setup_completed: bool = False
    vegetarian: bool = False
    vegan: bool = False
