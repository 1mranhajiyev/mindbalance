import uuid
from sqlalchemy import Column, String, Integer, Text, Date, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class PsychologistProfile(Base):
    __tablename__ = "psychologist_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    license_number = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    session_price = Column(Integer, nullable=True)

    user = relationship("User", foreign_keys=[user_id])


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    psychologist_id = Column(UUID(as_uuid=True), ForeignKey("psychologist_profiles.id"), nullable=True)
    age = Column(Integer, nullable=True)
    birth_date = Column(Date, nullable=True)
    therapy_start_date = Column(Date, nullable=True)
    initial_reason = Column(Text, nullable=True)
    initial_expectations = Column(Text, nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    psychologist = relationship("PsychologistProfile", foreign_keys=[psychologist_id])
