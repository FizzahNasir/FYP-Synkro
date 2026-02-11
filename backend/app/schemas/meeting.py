"""Pydantic schemas for Meeting model"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class ActionItemBase(BaseModel):
    """Base action item schema"""
    description: str
    assignee_mentioned: Optional[str] = None
    deadline_mentioned: Optional[datetime] = None
    confidence_score: float = Field(ge=0.0, le=1.0)


class ActionItemResponse(ActionItemBase):
    """Schema for action item response"""
    id: str
    status: str
    task_id: Optional[str] = None
    meeting_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MeetingBase(BaseModel):
    """Base meeting schema"""
    title: str = Field(..., min_length=1, max_length=500)
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=0)


class MeetingCreate(MeetingBase):
    """Schema for creating a meeting"""
    pass


class MeetingUpdate(BaseModel):
    """Schema for updating a meeting"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=0)


class MeetingResponse(MeetingBase):
    """Schema for meeting response"""
    id: str
    recording_url: Optional[str] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    status: str
    team_id: str
    created_by_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    action_items: List[ActionItemResponse] = []

    model_config = {"from_attributes": True}


class MeetingUploadResponse(BaseModel):
    """Schema for meeting upload response"""
    id: str
    title: str
    status: str
    message: str
