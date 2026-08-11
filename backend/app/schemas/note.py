from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class NoteCreate(BaseModel):
    patient_id: UUID
    session_id: Optional[UUID] = None
    main_topic: Optional[str] = None
    observations: Optional[str] = None
    method_used: Optional[str] = None
    next_session_plan: Optional[str] = None


class NoteResponse(BaseModel):
    id: UUID
    main_topic: Optional[str]
    observations: Optional[str]
    method_used: Optional[str]
    next_session_plan: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class JournalCreate(BaseModel):
    emotion: Optional[str] = None
    event: Optional[str] = None
    thought: Optional[str] = None
    content: str
    is_private: bool = True


class JournalResponse(BaseModel):
    id: UUID
    emotion: Optional[str]
    event: Optional[str]
    thought: Optional[str]
    content: str
    is_private: bool
    created_at: datetime

    class Config:
        from_attributes = True
