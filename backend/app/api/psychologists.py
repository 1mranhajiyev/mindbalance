from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_psychologist
from app.models.user import User
from app.models.profile import PsychologistProfile
from app.models.session import TherapySession
from app.models.task import Task
from sqlalchemy import func

router = APIRouter()


@router.get("/dashboard")
def psychologist_dashboard(current_user: User = Depends(require_psychologist), db: Session = Depends(get_db)):
    psych = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    active_patients = len(psych.patients)
    total_sessions = db.query(TherapySession).filter(TherapySession.psychologist_id == psych.id).count()
    pending_tasks = db.query(Task).filter(
        Task.psychologist_id == psych.id,
        Task.is_completed == False
    ).count()
    return {
        "active_patients": active_patients,
        "total_sessions": total_sessions,
        "pending_tasks": pending_tasks,
        "session_price": psych.session_price,
    }
