from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class CheckInCreate(BaseModel):
    emotion: str
    intensity: int = Field(..., ge=0, le=10)
    cause: Optional[str] = None
    note: Optional[str] = None
    checkin_type: str = "daily"
    session_id: Optional[UUID] = None


class CheckInResponse(BaseModel):
    id: UUID
    emotion: str
    intensity: int
    cause: Optional[str]
    note: Optional[str]
    checkin_type: str
    created_at: datetime

    class Config:
        from_attributes = True
