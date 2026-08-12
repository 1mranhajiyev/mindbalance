import uuid
import enum
from sqlalchemy import Column, String, Integer, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class OnboardingStatus(str, enum.Enum):
    not_started = "not_started"
    assessment_done = "assessment_done"
    psychologist_selected = "psychologist_selected"
    completed = "completed"


class InitialAssessment(Base):
    """Pasiyentin ilkin qiymətləndirməsi"""
    __tablename__ = "initial_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    # Açıq sual cavabları
    therapy_reason = Column(Text, nullable=True)          # Nə üçün terapiyaya başlamısan?
    main_concern = Column(Text, nullable=True)            # Hazırda səni ən çox narahat edən?
    desired_change = Column(Text, nullable=True)          # Nəyin dəyişməsini istəyirsən?
    therapy_expectation = Column(Text, nullable=True)     # Terapiyadan gözləntin nədir?
    life_difficulties = Column(Text, nullable=True)       # Hansı sahələrdə çətinlik var?

    # Şkala qiymətləndirmələri (0-10)
    anxiety_score = Column(Float, nullable=True)          # Narahatlıq
    self_confidence_score = Column(Float, nullable=True)  # Özünəinam
    stress_score = Column(Float, nullable=True)           # Stress
    relationships_score = Column(Float, nullable=True)    # Münasibətlər
    boundaries_score = Column(Float, nullable=True)       # Sərhəd qoymaq

    # Əlavə şkalalar (JSONB) - gələcək genişləndirmə üçün
    extra_scores = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    patient = relationship("User", foreign_keys=[patient_id])


class PsychologistRequest(Base):
    """Pasiyentin psixoloqa göndərdiyi müraciət"""
    __tablename__ = "psychologist_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    psychologist_id = Column(UUID(as_uuid=True), ForeignKey("psychologist_profiles.id"), nullable=False)
    status = Column(String, default="pending")  # pending | accepted | rejected
    message = Column(Text, nullable=True)  # Pasiyentin mesajı
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    responded_at = Column(DateTime(timezone=True), nullable=True)

    patient = relationship("User", foreign_keys=[patient_id])
    psychologist = relationship("PsychologistProfile", foreign_keys=[psychologist_id])
