from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_psychologist, require_patient
from app.models.user import User
from app.models.profile import PsychologistProfile, PatientProfile
from typing import List

router = APIRouter()


@router.get("/")
def list_my_patients(current_user: User = Depends(require_psychologist), db: Session = Depends(get_db)):
    psych = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    patients = db.query(PatientProfile).filter(PatientProfile.psychologist_id == psych.id).all()
    return [
        {
            "id": str(p.id),
            "user_id": str(p.user_id),
            "full_name": p.user.full_name,
            "email": p.user.email,
            "therapy_start_date": p.therapy_start_date,
        }
        for p in patients
    ]


@router.get("/me")
def my_profile(current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    return {
        "id": str(profile.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "therapy_start_date": profile.therapy_start_date,
        "initial_reason": profile.initial_reason,
    }
