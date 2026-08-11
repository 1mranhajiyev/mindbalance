from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("therapy_sessions.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False)
    psychologist_id = Column(UUID(as_uuid=True), ForeignKey("psychologist_profiles.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String, default="AZN")
    status = Column(String, default="pending")  # pending, paid, refunded, cancelled
    payment_method = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True, unique=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
