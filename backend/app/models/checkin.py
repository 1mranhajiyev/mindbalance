from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    emotion = Column(String, nullable=False)  # narahat, kədərli, xoşbəxt...
    intensity = Column(Integer, nullable=False)  # 0-10
    cause = Column(Text, nullable=True)
    note = Column(Text, nullable=True)
    checkin_type = Column(String, default="daily")  # daily, pre_session, post_session
    session_id = Column(UUID(as_uuid=True), ForeignKey("therapy_sessions.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("PatientProfile", back_populates="checkins")
