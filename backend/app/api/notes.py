from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
from app.core.database import get_db
from app.core.deps import get_current_user, require_psychologist, require_patient
from app.models.user import User
from app.models.note import TherapyNote, JournalEntry
from app.models.profile import PatientProfile, PsychologistProfile

router = APIRouter()


class NoteCreate(BaseModel):
    patient_id: str
    session_id: Optional[str] = None
    main_topic: Optional[str] = None
    observations: Optional[str] = None
    method_used: Optional[str] = None
    next_session_plan: Optional[str] = None


class JournalCreate(BaseModel):
    content: str
    emotion: Optional[str] = None
    event: Optional[str] = None
    thought: Optional[str] = None
    is_private: bool = True


@router.post("/therapy")
def create_therapy_note(body: NoteCreate, current_user: User = Depends(require_psychologist), db: Session = Depends(get_db)):
    profile = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    note = TherapyNote(id=uuid.uuid4(), psychologist_id=profile.id, **body.model_dump())
    db.add(note)
    db.commit()
    return {"id": str(note.id)}


@router.get("/journal")
def list_journal(current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    entries = db.query(JournalEntry).filter(JournalEntry.patient_id == profile.id).order_by(JournalEntry.created_at.desc()).limit(50).all()
    return [{
        "id": str(e.id), "content": e.content, "emotion": e.emotion,
        "event": e.event, "is_private": e.is_private, "created_at": e.created_at
    } for e in entries]


@router.post("/journal", status_code=201)
def create_journal(body: JournalCreate, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    entry = JournalEntry(id=uuid.uuid4(), patient_id=profile.id, **body.model_dump())
    db.add(entry)
    db.commit()
    return {"id": str(entry.id)}
