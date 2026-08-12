from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
from app.core.database import get_db
from app.core.deps import require_patient
from app.models.user import User
from app.models.checkin import CheckIn
from app.models.profile import PatientProfile

router = APIRouter()


class CheckInCreate(BaseModel):
    emotion: str
    intensity: int
    cause: Optional[str] = None
    checkin_type: str = "daily"


@router.post("", status_code=201)
def create_checkin(body: CheckInCreate, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    ci = CheckIn(id=uuid.uuid4(), patient_id=profile.id, **body.model_dump())
    db.add(ci)
    db.commit()
    return {"id": str(ci.id)}


@router.get("")
def list_checkins(current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    items = db.query(CheckIn).filter(CheckIn.patient_id == profile.id).order_by(CheckIn.created_at.desc()).limit(60).all()
    return [{"id": str(c.id), "emotion": c.emotion, "intensity": c.intensity, "cause": c.cause, "created_at": c.created_at} for c in items]
