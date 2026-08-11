from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class TherapyNote(Base):
    __tablename__ = "therapy_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    psychologist_id = Column(UUID(as_uuid=True), ForeignKey("psychologist_profiles.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey("therapy_sessions.id"), nullable=True)
    main_topic = Column(Text, nullable=True)
    observations = Column(Text, nullable=True)
    method_used = Column(String, nullable=True)
    next_session_plan = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    psychologist = relationship("PsychologistProfile", back_populates="notes")
    session = relationship("TherapySession", back_populates="notes")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    emotion = Column(String, nullable=True)
    event = Column(Text, nullable=True)
    thought = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    is_private = Column(String, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("PatientProfile", back_populates="journal_entries")
