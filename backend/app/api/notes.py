from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_psychologist, require_patient
from app.models.user import User
from app.models.profile import PsychologistProfile, PatientProfile
from app.models.note import TherapyNote, JournalEntry
from app.schemas.note import NoteCreate, NoteResponse, JournalCreate, JournalResponse
from typing import List

router = APIRouter()


@router.post("/therapy", response_model=NoteResponse, status_code=201)
def create_note(body: NoteCreate, current_user: User = Depends(require_psychologist), db: Session = Depends(get_db)):
    psych = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    note = TherapyNote(psychologist_id=psych.id, **body.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.post("/journal", response_model=JournalResponse, status_code=201)
def create_journal(body: JournalCreate, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    entry = JournalEntry(patient_id=profile.id, **body.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/journal", response_model=List[JournalResponse])
def list_journal(current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    return db.query(JournalEntry).filter(JournalEntry.patient_id == profile.id).order_by(JournalEntry.created_at.desc()).all()
