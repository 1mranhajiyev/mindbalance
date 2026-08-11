from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class TaskCreate(BaseModel):
    patient_id: UUID
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskComplete(BaseModel):
    patient_response: Optional[str] = None


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    is_completed: bool
    patient_response: Optional[str]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
