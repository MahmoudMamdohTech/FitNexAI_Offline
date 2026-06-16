"""
Auth schemas — request / response models for signup, login, token.
"""

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password (min 6 chars)")


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email")
    password: str = Field(..., min_length=1, description="Account password")


class VerifyRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email")
    code: str = Field(..., description="6-digit verification code")


class ResendOtpRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email")


class ResetPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email")
    token: str = Field(..., description="Reset token from email")
    new_password: str = Field(..., min_length=6, max_length=128, description="New password")


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    goal: str | None = None
    weight: float | None = None
    height: float | None = None
    age: int | None = None
    gender: str | None = None
    activity_level: str | None = None
    is_setup_completed: bool = False
    vegetarian: bool = False
    vegan: bool = False
    is_verified: bool = False


class AuthResponse(BaseModel):
    status: str = "success"
    token: str
    user: UserResponse


class SignupResponse(BaseModel):
    status: str = "success"
    user_id: int
    email: str


class VerifyResponse(BaseModel):
    status: str = "success"
    token: str
    user: UserResponse
