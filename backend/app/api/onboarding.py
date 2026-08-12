from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.core.database import get_db
from app.core.deps import get_current_user, require_psychologist
from app.models.user import User
from app.models.profile import PsychologistProfile, PatientProfile
from app.models.onboarding import InitialAssessment, PsychologistRequest

router = APIRouter()


# ─── Schemas ──────────────────────────────────────────────

class AssessmentCreate(BaseModel):
    therapy_reason: Optional[str] = None
    main_concern: Optional[str] = None
    desired_change: Optional[str] = None
    therapy_expectation: Optional[str] = None
    life_difficulties: Optional[str] = None
    anxiety_score: Optional[float] = None
    self_confidence_score: Optional[float] = None
    stress_score: Optional[float] = None
    relationships_score: Optional[float] = None
    boundaries_score: Optional[float] = None


class PsychologistPublic(BaseModel):
    id: str
    full_name: str
    specialization: Optional[str]
    bio: Optional[str]
    session_price: Optional[int]
    experience_years: Optional[int]
    languages: Optional[str]


class RequestCreate(BaseModel):
    psychologist_id: str
    message: Optional[str] = None


class RequestRespond(BaseModel):
    status: str  # accepted | rejected


# ─── Endpoints ───────────────────────────────────────────

@router.get("/status")
def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Pasiyentin onboarding vəziyyətini qaytar"""
    profile = db.query(PatientProfile).filter(
        PatientProfile.user_id == current_user.id
    ).first()
    assessment = db.query(InitialAssessment).filter(
        InitialAssessment.patient_id == current_user.id
    ).first()
    return {
        "onboarding_status": profile.onboarding_status if profile else "not_started",
        "has_assessment": assessment is not None,
        "has_psychologist": profile.psychologist_id is not None if profile else False,
    }


@router.post("/assessment")
def save_assessment(
    data: AssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """İlkin qiymətləndirməni saxla"""
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Yalnız pasiyentlər üçün")

    existing = db.query(InitialAssessment).filter(
        InitialAssessment.patient_id == current_user.id
    ).first()

    if existing:
        for k, v in data.dict(exclude_none=True).items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        assessment = existing
    else:
        assessment = InitialAssessment(
            patient_id=current_user.id,
            **data.dict(exclude_none=True)
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

    # Onboarding statusunu yenilə
    profile = db.query(PatientProfile).filter(
        PatientProfile.user_id == current_user.id
    ).first()
    if profile and profile.onboarding_status == "not_started":
        profile.onboarding_status = "assessment_done"
        db.commit()

    return {"success": True, "status": "assessment_done"}


@router.get("/assessment")
def get_assessment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mövcud qiymətləndirməni qaytar"""
    assessment = db.query(InitialAssessment).filter(
        InitialAssessment.patient_id == current_user.id
    ).first()
    if not assessment:
        return None
    return {
        "therapy_reason": assessment.therapy_reason,
        "main_concern": assessment.main_concern,
        "desired_change": assessment.desired_change,
        "therapy_expectation": assessment.therapy_expectation,
        "life_difficulties": assessment.life_difficulties,
        "anxiety_score": assessment.anxiety_score,
        "self_confidence_score": assessment.self_confidence_score,
        "stress_score": assessment.stress_score,
        "relationships_score": assessment.relationships_score,
        "boundaries_score": assessment.boundaries_score,
    }


@router.get("/psychologists")
def list_psychologists(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mövcud psixoloqların siyahısını qaytar (pasiyent üçün)"""
    profiles = db.query(PsychologistProfile).filter(
        PsychologistProfile.is_accepting_patients == True
    ).all()
    result = []
    for p in profiles:
        result.append({
            "id": str(p.id),
            "full_name": p.user.full_name if p.user else "—",
            "specialization": p.specialization,
            "bio": p.bio,
            "session_price": p.session_price,
            "experience_years": p.experience_years,
            "languages": p.languages,
        })
    return result


@router.post("/request")
def send_request(
    data: RequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Psixoloqa müraciət göndər"""
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Yalnız pasiyentlər üçün")

    # Mövcud pending müraciəti yoxla
    existing = db.query(PsychologistRequest).filter(
        PsychologistRequest.patient_id == current_user.id,
        PsychologistRequest.status == "pending"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Artıq gözləmədə müraciətiniz var")

    req = PsychologistRequest(
        patient_id=current_user.id,
        psychologist_id=data.psychologist_id,
        message=data.message,
        status="pending"
    )
    db.add(req)

    # Onboarding statusunu yenilə
    profile = db.query(PatientProfile).filter(
        PatientProfile.user_id == current_user.id
    ).first()
    if profile:
        profile.onboarding_status = "psychologist_selected"
    db.commit()

    return {"success": True, "status": "psychologist_selected"}


@router.get("/my-request")
def get_my_request(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Pasiyentin son müraciətinin statusunu qaytar"""
    req = db.query(PsychologistRequest).filter(
        PsychologistRequest.patient_id == current_user.id
    ).order_by(PsychologistRequest.created_at.desc()).first()
    if not req:
        return None
    return {
        "id": str(req.id),
        "psychologist_id": str(req.psychologist_id),
        "status": req.status,
        "message": req.message,
        "created_at": req.created_at,
    }


@router.get("/pending-requests")
def get_pending_requests(
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    """Psixoloqa gələn müraciətlər"""
    profile = db.query(PsychologistProfile).filter(
        PsychologistProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil tapılmadı")

    requests = db.query(PsychologistRequest).filter(
        PsychologistRequest.psychologist_id == profile.id,
        PsychologistRequest.status == "pending"
    ).all()
    result = []
    for r in requests:
        result.append({
            "id": str(r.id),
            "patient_name": r.patient.full_name if r.patient else "—",
            "patient_id": str(r.patient_id),
            "message": r.message,
            "created_at": r.created_at,
        })
    return result


@router.post("/respond/{request_id}")
def respond_to_request(
    request_id: str,
    data: RequestRespond,
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    """Psixoloq müraciətə cavab verir"""
    from uuid import UUID as PyUUID
    profile = db.query(PsychologistProfile).filter(
        PsychologistProfile.user_id == current_user.id
    ).first()
    req = db.query(PsychologistRequest).filter(
        PsychologistRequest.id == PyUUID(request_id),
        PsychologistRequest.psychologist_id == profile.id
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Müraciət tapılmadı")

    req.status = data.status
    req.responded_at = datetime.utcnow()

    if data.status == "accepted":
        patient_profile = db.query(PatientProfile).filter(
            PatientProfile.user_id == req.patient_id
        ).first()
        if patient_profile:
            patient_profile.psychologist_id = profile.id
            patient_profile.onboarding_status = "completed"

    db.commit()
    return {"success": True, "status": data.status}
