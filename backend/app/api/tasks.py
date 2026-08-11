from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_psychologist, require_patient, get_current_user
from app.models.user import User
from app.models.profile import PsychologistProfile, PatientProfile
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskComplete, TaskResponse
from typing import List
from uuid import UUID
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(body: TaskCreate, current_user: User = Depends(require_psychologist), db: Session = Depends(get_db)):
    psych = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    task = Task(psychologist_id=psych.id, **body.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/", response_model=List[TaskResponse])
def list_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "patient":
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        return db.query(Task).filter(Task.patient_id == profile.id).all()
    psych = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    return db.query(Task).filter(Task.psychologist_id == psych.id).all()


@router.post("/{task_id}/complete", response_model=TaskResponse)
def complete_task(task_id: UUID, body: TaskComplete, current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    task = db.query(Task).filter(Task.id == task_id, Task.patient_id == profile.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.is_completed = True
    task.patient_response = body.patient_response
    task.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task
