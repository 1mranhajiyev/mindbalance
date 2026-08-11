from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_patient
from app.models.user import User
from app.models.profile import PatientProfile
from app.models.goal import Goal, GoalProgressLog
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse
from typing import List
from uuid import UUID

router = APIRouter()


@router.post("/", response_model=GoalResponse, status_code=201)
def create_goal(body: GoalCreate, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    goal = Goal(patient_id=profile.id, current_score=body.initial_score, **body.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.get("/", response_model=List[GoalResponse])
def list_goals(current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    return db.query(Goal).filter(Goal.patient_id == profile.id).all()


@router.patch("/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: UUID, body: GoalUpdate, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.patient_id == profile.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if body.current_score is not None:
        log = GoalProgressLog(goal_id=goal.id, score=body.current_score, note=body.note)
        db.add(log)
        goal.current_score = body.current_score
    if body.status:
        goal.status = body.status
    db.commit()
    db.refresh(goal)
    return goal
