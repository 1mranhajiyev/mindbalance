from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    initial_score = Column(Integer, nullable=False)  # 0-10
    current_score = Column(Integer, nullable=False)
    target_score = Column(Integer, nullable=False)
    status = Column(String, default="active")  # active, completed, paused
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("PatientProfile", back_populates="goals")
    progress_logs = relationship("GoalProgressLog", back_populates="goal")


class GoalProgressLog(Base):
    __tablename__ = "goal_progress_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"), nullable=False)
    score = Column(Integer, nullable=False)
    note = Column(Text, nullable=True)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    goal = relationship("Goal", back_populates="progress_logs")
