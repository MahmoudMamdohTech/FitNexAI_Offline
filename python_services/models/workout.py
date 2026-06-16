"""
Workout ORM model — records completed exercise sessions.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, func, Index
from sqlalchemy.orm import relationship

from database import Base


class Workout(Base):
    __tablename__ = "workouts"
    __table_args__ = (Index("idx_user_created", "user_id", "created_at"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise = Column(String(100), nullable=False)
    reps = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    duration_seconds = Column(Integer, default=0)
    calories_burned = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="workouts")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "exercise": self.exercise,
            "reps": self.reps,
            "score": self.score,
            "duration_seconds": self.duration_seconds,
            "calories_burned": self.calories_burned,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
