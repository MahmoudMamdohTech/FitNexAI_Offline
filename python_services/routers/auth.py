"""
Auth Router — /api/v1/auth
Signup, login, OTP verification, password reset.
"""

import logging
import hashlib
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from schemas.auth import (
    AuthResponse,
    LoginRequest,
    ResendOtpRequest,
    SignupRequest,
    SignupResponse,
    UserResponse,
    VerifyRequest,
    VerifyResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from services.auth_service import create_access_token, hash_password, verify_password
from services.email_service import generate_otp, otp_expiry, send_otp_email, generate_secure_token, token_expiry, send_password_reset_email

logger = logging.getLogger("fitnex.auth")
router = APIRouter(prefix="/auth", tags=["Auth"])


# signup
@router.post("/signup", response_model=SignupResponse, status_code=201)
async def signup(req: SignupRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Register a new user and send OTP email. No JWT yet — must verify first."""
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    code = generate_otp()
    expires = otp_expiry()

    user = User(
        full_name=req.name.strip(),
        email=req.email.lower().strip(),
        password=hash_password(req.password),
        is_verified=False,
        otp_code=code,
        otp_expires_at=expires,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    background_tasks.add_task(send_otp_email, user.email, code)
    logger.info("User registered (unverified): id=%d email=%s", user.id, user.email)

    return SignupResponse(
        status="success",
        user_id=user.id,
        email=user.email,
    )


# verify OTP
@router.post("/verify-otp", response_model=VerifyResponse)
async def verify_otp(req: VerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify 6-digit OTP. On success returns JWT token."""
    result = await db.execute(
        select(User).where(User.email == req.email.lower().strip())
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email.",
        )

    if user.is_verified:
        token = create_access_token(user.id, user.email)
        return VerifyResponse(status="success", token=token, user=UserResponse(**user.to_dict()))

    if not user.otp_code or user.otp_code != req.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code.",
        )

    # check if OTP expired
    if user.otp_expires_at:
        now_utc = datetime.now(timezone.utc)
        expires_at = user.otp_expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if now_utc > expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired. Please request a new one.",
            )

    # mark verified and clear OTP
    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id, user.email)
    logger.info("User verified: id=%d email=%s", user.id, user.email)

    return VerifyResponse(
        status="success",
        token=token,
        user=UserResponse(**user.to_dict()),
    )


# resend OTP
@router.post("/resend-otp", status_code=200)
async def resend_otp(req: ResendOtpRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Generate and resend a fresh OTP."""
    result = await db.execute(
        select(User).where(User.email == req.email.lower().strip())
    )
    user = result.scalar_one_or_none()

    if not user or user.is_verified:
        return {"status": "ok", "detail": "If the email is valid, a code was sent."}

    code = generate_otp()
    user.otp_code = code
    user.otp_expires_at = otp_expiry()
    await db.commit()

    background_tasks.add_task(send_otp_email, user.email, code)
    logger.info("OTP resent for user id=%d", user.id)
    return {"status": "ok", "detail": "If the email is valid, a code was sent."}


# forgot password
@router.post("/forgot-password", status_code=200)
async def forgot_password(req: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.email == req.email.lower().strip())
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # return success anyway to prevent email enumeration
        return {"status": "ok", "detail": "If the email is valid, a reset link was sent."}
        
    raw_token = generate_secure_token()
    user.reset_token = hashlib.sha256(raw_token.encode()).hexdigest()
    user.reset_expiry = token_expiry()
    await db.commit()
    
    background_tasks.add_task(send_password_reset_email, user.email, raw_token)
    logger.info("Password reset email sent for user id=%d", user.id)
    return {"status": "ok", "detail": "If the email is valid, a reset link was sent."}


# reset password
@router.post("/reset-password", status_code=200)
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.email == req.email.lower().strip())
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request.")
        
    hashed_req_token = hashlib.sha256(req.token.encode()).hexdigest()
    if not user.reset_token or user.reset_token != hashed_req_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")
        
    if user.reset_expiry:
        now_utc = datetime.now(timezone.utc)
        expires_at = user.reset_expiry
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if now_utc > expires_at:
            raise HTTPException(status_code=400, detail="Reset link has expired.")
            
    user.password = hash_password(req.new_password)
    user.reset_token = None
    user.reset_expiry = None
    await db.commit()
    
    logger.info("Password reset successfully for user id=%d", user.id)
    return {"status": "ok", "detail": "Password has been successfully reset."}


# login
@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with email + password. Blocks if email not verified."""
    result = await db.execute(
        select(User).where(User.email == req.email.lower().strip())
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in.",
        )

    token = create_access_token(user.id, user.email)
    logger.info("User logged in: id=%d", user.id)

    return AuthResponse(
        status="success",
        token=token,
        user=UserResponse(**user.to_dict()),
    )


# get current user (token verification)
@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    """Verify JWT and return user profile. Used to rehydrate sessions."""
    return UserResponse(**user.to_dict())
