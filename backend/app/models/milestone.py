from sqlalchemy import Column, String, Date, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class TherapyMilestone(Base):
    __tablename__ = "therapy_milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    milestone_date = Column(Date, nullable=False)
    created_by = Column(String, default="psychologist")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PatientAchievement(Base):
    __tablename__ = "patient_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TherapyLearning(Base):
    __tablename__ = "therapy_learnings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
