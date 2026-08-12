from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_psychologist
from app.models.user import User
from app.models.profile import PatientProfile

router = APIRouter()


@router.get("")
def list_patients(
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    profiles = db.query(PatientProfile).filter(
        PatientProfile.psychologist_id == _get_psych_profile_id(current_user, db)
    ).all()
    result = []
    for p in profiles:
        result.append({
            "id": str(p.id),
            "full_name": p.user.full_name,
            "email": p.user.email,
            "therapy_start_date": p.therapy_start_date,
        })
    return result


@router.get("/me")
def my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        return {}
    return {
        "id": str(profile.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "age": profile.age,
        "therapy_start_date": profile.therapy_start_date,
        "initial_reason": profile.initial_reason,
    }


def _get_psych_profile_id(user: User, db: Session):
    from app.models.profile import PsychologistProfile
    p = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == user.id).first()
    return p.id if p else None
