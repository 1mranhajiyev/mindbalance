from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class SessionCreate(BaseModel):
    patient_id: UUID
    scheduled_at: datetime
    duration_minutes: int = 50
    format: str = "online"
    price: Optional[int] = None


class SessionUpdate(BaseModel):
    status: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    is_paid: Optional[bool] = None


class SessionResponse(BaseModel):
    id: UUID
    scheduled_at: datetime
    duration_minutes: int
    format: str
    status: str
    is_paid: bool
    webrtc_room_id: Optional[str]
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
