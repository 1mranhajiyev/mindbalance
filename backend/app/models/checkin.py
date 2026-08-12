import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    emotion = Column(String, nullable=False)
    intensity = Column(Integer, nullable=False)
    cause = Column(Text, nullable=True)
    note = Column(Text, nullable=True)
    checkin_type = Column(String, default="daily")
    session_id = Column(UUID(as_uuid=True), ForeignKey("therapy_sessions.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
