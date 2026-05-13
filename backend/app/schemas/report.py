from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class CreateReportRequest(BaseModel):
    message_text: str = Field(..., min_length=1, max_length=5000)
    message_type: str = Field(default="sms")
    sender_info: Optional[str] = Field(None, max_length=200)
    scam_category: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=2000)
    reporter_name: Optional[str] = Field(None, max_length=100)
    session_id: str = Field(..., min_length=1, max_length=64)


class ReportResponse(BaseModel):
    id: str
    reporter_name: Optional[str] = None
    message_text: str
    message_type: str
    sender_info: Optional[str] = None
    scam_category: Optional[str] = None
    description: Optional[str] = None
    auto_risk_score: Optional[int] = None
    auto_risk_level: Optional[str] = None
    auto_scam_category: Optional[str] = None
    auto_confidence: Optional[int] = None
    status: str
    upvote_count: int
    downvote_count: int
    view_count: int
    created_at: datetime
    user_vote: Optional[str] = None

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    reports: List[ReportResponse]
    total: int
    page: int
    page_size: int


class VoteRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=64)
    vote_type: str = Field(..., pattern="^(up|down)$")


class VoteResponse(BaseModel):
    vote_type: Optional[str] = None
    upvote_count: int
    downvote_count: int


class CommunityStats(BaseModel):
    total_reports: int
    approved_reports: int
    top_categories: dict
    recent_reports_count: int
