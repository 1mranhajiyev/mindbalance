from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class TherapySession(Base):
    __tablename__ = "therapy_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    psychologist_id = Column(UUID(as_uuid=True), ForeignKey("psychologist_profiles.id"), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=50)
    format = Column(String, default="online")  # online, offline
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled, no_show
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    price = Column(Integer, nullable=True)
    is_paid = Column(Boolean, default=False)
    webrtc_room_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("PatientProfile", back_populates="sessions")
    psychologist = relationship("PsychologistProfile", back_populates="sessions")
    notes = relationship("TherapyNote", back_populates="session")
