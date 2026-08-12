from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.session import TherapySession
from app.models.profile import PatientProfile, PsychologistProfile

router = APIRouter()


class SessionCreate(BaseModel):
    patient_id: str
    scheduled_at: datetime
    duration_minutes: int = 50
    format: str = "online"
    price: Optional[int] = None


@router.get("")
def list_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.patient:
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if not profile:
            return []
        sessions = db.query(TherapySession).filter(TherapySession.patient_id == profile.id).all()
    else:
        profile = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
        if not profile:
            return []
        sessions = db.query(TherapySession).filter(TherapySession.psychologist_id == profile.id).all()
    return [{
        "id": str(s.id),
        "scheduled_at": s.scheduled_at,
        "duration_minutes": s.duration_minutes,
        "format": s.format,
        "status": s.status,
        "price": s.price,
        "is_paid": s.is_paid,
        "webrtc_room_id": s.webrtc_room_id,
    } for s in sessions]


@router.post("", status_code=201)
def create_session(body: SessionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.psychologist:
        raise HTTPException(403, "Only psychologists can create sessions")
    psych = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    session = TherapySession(
        id=uuid.uuid4(),
        patient_id=body.patient_id,
        psychologist_id=psych.id,
        scheduled_at=body.scheduled_at,
        duration_minutes=body.duration_minutes,
        format=body.format,
        price=body.price or psych.session_price,
        webrtc_room_id=str(uuid.uuid4()),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": str(session.id), "webrtc_room_id": session.webrtc_room_id}
