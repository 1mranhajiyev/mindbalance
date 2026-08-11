from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from app.core.database import get_db
from app.core.deps import require_psychologist, require_patient, get_current_user
from app.models.user import User
from app.models.profile import PsychologistProfile, PatientProfile
from app.models.session import TherapySession
from app.schemas.session import SessionCreate, SessionUpdate, SessionResponse
from typing import List
from uuid import UUID, uuid4

router = APIRouter()


@router.post("/", response_model=SessionResponse, status_code=201)
def create_session(body: SessionCreate, current_user: User = Depends(require_psychologist), db: DBSession = Depends(get_db)):
    psych = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    session = TherapySession(
        psychologist_id=psych.id,
        patient_id=body.patient_id,
        scheduled_at=body.scheduled_at,
        duration_minutes=body.duration_minutes,
        format=body.format,
        price=body.price,
        webrtc_room_id=str(uuid4())
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/", response_model=List[SessionResponse])
def list_sessions(current_user: User = Depends(get_current_user), db: DBSession = Depends(get_db)):
    if current_user.role == "psychologist":
        psych = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
        return db.query(TherapySession).filter(TherapySession.psychologist_id == psych.id).order_by(TherapySession.scheduled_at).all()
    else:
        patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        return db.query(TherapySession).filter(TherapySession.patient_id == patient.id).order_by(TherapySession.scheduled_at).all()


@router.patch("/{session_id}", response_model=SessionResponse)
def update_session(session_id: UUID, body: SessionUpdate, current_user: User = Depends(require_psychologist), db: DBSession = Depends(get_db)):
    psych = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    session = db.query(TherapySession).filter(TherapySession.id == session_id, TherapySession.psychologist_id == psych.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(session, field, value)
    db.commit()
    db.refresh(session)
    return session
