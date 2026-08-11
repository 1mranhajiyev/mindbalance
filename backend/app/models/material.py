from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Material(Base):
    __tablename__ = "materials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    psychologist_id = Column(UUID(as_uuid=True), ForeignKey("psychologist_profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String, nullable=True)
    type = Column(String, nullable=False)  # pdf, audio, video, worksheet, card
    category = Column(String, nullable=True)  # CBT, schema_therapy, grounding...
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PatientMaterial(Base):
    __tablename__ = "patient_materials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    material_id = Column(UUID(as_uuid=True), ForeignKey("materials.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)
