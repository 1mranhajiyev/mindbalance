from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from app.core.database import get_db
from app.core.deps import get_current_user, require_psychologist
from app.models.user import User, UserRole
from app.models.task import Task
from app.models.profile import PatientProfile, PsychologistProfile

router = APIRouter()


class TaskCreate(BaseModel):
    patient_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None


@router.get("")
def list_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.patient:
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        tasks = db.query(Task).filter(Task.patient_id == profile.id).all()
    else:
        profile = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
        tasks = db.query(Task).filter(Task.psychologist_id == profile.id).all()
    return [{
        "id": str(t.id), "title": t.title, "description": t.description,
        "due_date": t.due_date, "is_completed": t.is_completed
    } for t in tasks]


@router.post("", status_code=201)
def create_task(body: TaskCreate, current_user: User = Depends(require_psychologist), db: Session = Depends(get_db)):
    profile = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    task = Task(id=uuid.uuid4(), psychologist_id=profile.id, **body.model_dump())
    db.add(task)
    db.commit()
    return {"id": str(task.id)}


@router.post("/{task_id}/complete")
def complete_task(task_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    task.is_completed = True
    task.completed_at = datetime.utcnow()
    db.commit()
    return {"message": "Task completed"}
