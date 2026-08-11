from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_patient, get_current_user
from app.models.user import User
from app.models.profile import PatientProfile
from app.models.checkin import CheckIn
from app.schemas.checkin import CheckInCreate, CheckInResponse
from typing import List

router = APIRouter()


@router.post("/", response_model=CheckInResponse, status_code=201)
def create_checkin(body: CheckInCreate, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    checkin = CheckIn(patient_id=profile.id, **body.model_dump())
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    return checkin


@router.get("/", response_model=List[CheckInResponse])
def list_checkins(current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    return db.query(CheckIn).filter(CheckIn.patient_id == profile.id).order_by(CheckIn.created_at.desc()).all()
