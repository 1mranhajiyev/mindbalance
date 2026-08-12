from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
from app.core.database import get_db
from app.core.deps import require_patient
from app.models.user import User
from app.models.goal import Goal, GoalProgressLog
from app.models.profile import PatientProfile

router = APIRouter()


class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    initial_score: int
    target_score: int


class ProgressUpdate(BaseModel):
    score: int
    note: Optional[str] = None


@router.get("")
def list_goals(current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    goals = db.query(Goal).filter(Goal.patient_id == profile.id).all()
    return [{
        "id": str(g.id), "title": g.title, "description": g.description,
        "initial_score": g.initial_score, "current_score": g.current_score,
        "target_score": g.target_score, "status": g.status
    } for g in goals]


@router.post("", status_code=201)
def create_goal(body: GoalCreate, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    goal = Goal(id=uuid.uuid4(), patient_id=profile.id, current_score=body.initial_score, **body.model_dump())
    db.add(goal)
    db.commit()
    return {"id": str(goal.id)}


@router.post("/{goal_id}/progress")
def log_progress(goal_id: str, body: ProgressUpdate, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(404, "Goal not found")
    goal.current_score = body.score
    log = GoalProgressLog(id=uuid.uuid4(), goal_id=goal.id, score=body.score, note=body.note)
    db.add(log)
    db.commit()
    return {"message": "Progress logged"}
