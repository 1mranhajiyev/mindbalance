import uuid
from sqlalchemy import Column, String, Integer, Text, Date, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PsychologistProfile(Base):
    __tablename__ = "psychologist_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    license_number = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    session_price = Column(Integer, nullable=True)
    experience_years = Column(Integer, nullable=True)
    languages = Column(String, nullable=True)  # "az,en,ru"
    is_accepting_patients = Column(Boolean, default=True)

    user = relationship("User", foreign_keys=[user_id])


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    psychologist_id = Column(UUID(as_uuid=True), ForeignKey("psychologist_profiles.id"), nullable=True)
    age = Column(Integer, nullable=True)
    birth_date = Column(Date, nullable=True)
    therapy_start_date = Column(Date, nullable=True)
    # Onboarding vəziyyəti: not_started | assessment_done | psychologist_selected | completed
    onboarding_status = Column(String, default="not_started", nullable=False)

    user = relationship("User", foreign_keys=[user_id])
    psychologist = relationship("PsychologistProfile", foreign_keys=[psychologist_id])
