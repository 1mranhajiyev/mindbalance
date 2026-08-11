from sqlalchemy import Column, String, Integer, Date, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    birth_date = Column(Date, nullable=True)
    therapy_start_date = Column(Date, nullable=True)
    initial_reason = Column(Text, nullable=True)
    initial_expectations = Column(Text, nullable=True)

    user = relationship("User", back_populates="patient_profile")
    psychologist_id = Column(UUID(as_uuid=True), ForeignKey("psychologist_profiles.id"), nullable=True)
    psychologist = relationship("PsychologistProfile", back_populates="patients")
    checkins = relationship("CheckIn", back_populates="patient")
    goals = relationship("Goal", back_populates="patient")
    sessions = relationship("TherapySession", back_populates="patient")
    tasks = relationship("Task", back_populates="patient")
    journal_entries = relationship("JournalEntry", back_populates="patient")


class PsychologistProfile(Base):
    __tablename__ = "psychologist_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    license_number = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    session_price = Column(Integer, nullable=True)

    user = relationship("User", back_populates="psychologist_profile")
    patients = relationship("PatientProfile", back_populates="psychologist")
    sessions = relationship("TherapySession", back_populates="psychologist")
    notes = relationship("TherapyNote", back_populates="psychologist")
