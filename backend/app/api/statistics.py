from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.session import TherapySession
from app.models.profile import PatientProfile
from app.models.onboarding import PsychologistRequest

router = APIRouter()


@router.get("")
def get_statistics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Psixoloqun statistikası"""
    if current_user.role != UserRole.psychologist:
        return {"error": "Only for psychologists"}

    psych_profile = db.query(PatientProfile).filter(
        PatientProfile.user_id == current_user.id
    ).first()

    total_sessions = db.query(func.count(TherapySession.id)).filter(
        TherapySession.psychologist_id == current_user.id
    ).scalar() or 0

    completed_sessions = db.query(func.count(TherapySession.id)).filter(
        TherapySession.psychologist_id == current_user.id,
        TherapySession.status == "completed"
    ).scalar() or 0

    total_patients = db.query(func.count(PsychologistRequest.id)).filter(
        PsychologistRequest.psychologist_id == current_user.id,
        PsychologistRequest.status == "accepted"
    ).scalar() or 0

    return {
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "total_patients": total_patients,
    }
