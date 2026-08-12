from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    generate_totp_secret, verify_totp, get_totp_uri
)
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.profile import PatientProfile, PsychologistProfile

router = APIRouter()


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    totp_code: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(
        id=uuid.uuid4(),
        email=body.email,
        phone=body.phone,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    db.flush()
    if body.role == UserRole.patient:
        db.add(PatientProfile(id=uuid.uuid4(), user_id=user.id))
    else:
        db.add(PsychologistProfile(id=uuid.uuid4(), user_id=user.id))
    db.commit()
    return {"message": "User created"}


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    if not user.is_active:
        raise HTTPException(403, "Account disabled")
    if user.totp_enabled:
        if not body.totp_code:
            return {"requires_2fa": True}
        if not verify_totp(user.totp_secret, body.totp_code):
            raise HTTPException(401, "Invalid 2FA code")
    access = create_access_token({"sub": str(user.id), "role": user.role})
    refresh = create_refresh_token({"sub": str(user.id)})
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


@router.post("/refresh")
def refresh_token(body: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type")
        user = db.query(User).filter(User.id == payload["sub"]).first()
        if not user:
            raise HTTPException(401, "User not found")
    except Exception:
        raise HTTPException(401, "Invalid refresh token")
    access = create_access_token({"sub": str(user.id), "role": user.role})
    refresh = create_refresh_token({"sub": str(user.id)})
    return {"access_token": access, "refresh_token": refresh}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "totp_enabled": current_user.totp_enabled,
    }


@router.post("/2fa/setup")
def setup_2fa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    secret = generate_totp_secret()
    current_user.totp_secret = secret
    db.commit()
    return {"secret": secret, "uri": get_totp_uri(secret, current_user.email)}


@router.post("/2fa/verify")
def verify_2fa(code: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.totp_secret:
        raise HTTPException(400, "2FA not set up")
    if not verify_totp(current_user.totp_secret, code):
        raise HTTPException(400, "Invalid code")
    current_user.totp_enabled = True
    db.commit()
    return {"message": "2FA enabled"}
