"""
User ORM model — PostgreSQL + SQLAlchemy 2.x.
"""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)  # bcrypt hash

    # profile (set during onboarding)
    goal = Column(String(50), nullable=True)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    activity_level = Column(String(50), nullable=True)

    # flags
    is_setup_completed = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    vegetarian = Column(Boolean, default=False, nullable=False)
    vegan = Column(Boolean, default=False, nullable=False)

    # OTP verification
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)

    # password reset
    reset_token = Column(String(255), nullable=True)  # stored as SHA-256 hash
    reset_expiry = Column(DateTime(timezone=True), nullable=True)

    # nutrition plan (JSON text)
    nutrition_plan = Column(Text, nullable=True)

    # timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # relationships
    workouts = relationship("Workout", back_populates="user", lazy="selectin")

    def to_dict(self, include_plan: bool = False) -> dict:
        """Convert to API-safe dictionary (never includes password)."""
        data = {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "goal": self.goal,
            "weight": self.weight,
            "height": self.height,
            "age": self.age,
            "gender": self.gender,
            "activity_level": self.activity_level,
            "is_setup_completed": self.is_setup_completed,
            "is_verified": self.is_verified,
            "vegetarian": self.vegetarian,
            "vegan": self.vegan,
        }
        if include_plan:
            data["nutrition_plan"] = self.nutrition_plan
        return data
