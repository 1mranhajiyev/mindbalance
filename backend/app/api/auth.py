from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, decode_token,
    generate_totp_secret, get_totp_uri, verify_totp
)
from app.core.deps import get_current_user
from app.models.user import User
from app.models.profile import PatientProfile, PsychologistProfile
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse,
    TOTPSetupResponse, TOTPVerifyRequest, RefreshRequest
)

router = APIRouter()


@router.post("/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        full_name=body.full_name,
        email=body.email,
        phone=body.phone,
        hashed_password=hash_password(body.password),
        role=body.role
    )
    db.add(user)
    db.flush()
    if body.role == "patient":
        db.add(PatientProfile(user_id=user.id))
    else:
        db.add(PsychologistProfile(user_id=user.id))
    db.commit()
    return {"message": "Registration successful", "user_id": str(user.id)}


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.totp_enabled:
        if not body.totp_code or not verify_totp(user.totp_secret, body.totp_code):
            raise HTTPException(status_code=401, detail="Invalid 2FA code")
    token_data = {"sub": str(user.id), "role": user.role}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data)
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(body: RefreshRequest):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    token_data = {"sub": payload["sub"], "role": payload["role"]}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data)
    )


@router.post("/2fa/setup", response_model=TOTPSetupResponse)
def setup_2fa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    secret = generate_totp_secret()
    current_user.totp_secret = secret
    db.commit()
    return TOTPSetupResponse(secret=secret, uri=get_totp_uri(secret, current_user.email))


@router.post("/2fa/verify")
def verify_2fa(body: TOTPVerifyRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA not set up")
    if not verify_totp(current_user.totp_secret, body.code):
        raise HTTPException(status_code=400, detail="Invalid code")
    current_user.totp_enabled = True
    db.commit()
    return {"message": "2FA enabled successfully"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "totp_enabled": current_user.totp_enabled
    }
