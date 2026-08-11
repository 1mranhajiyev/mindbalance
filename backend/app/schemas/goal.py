from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    initial_score: int = Field(..., ge=0, le=10)
    target_score: int = Field(..., ge=0, le=10)


class GoalUpdate(BaseModel):
    current_score: Optional[int] = Field(None, ge=0, le=10)
    status: Optional[str] = None
    note: Optional[str] = None


class GoalResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    initial_score: int
    current_score: int
    target_score: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
