from pydantic import BaseModel, Field
from typing import Optional


class ModerateReportRequest(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected|flagged)$")
    moderation_note: Optional[str] = Field(None, max_length=500)
    risk_score: Optional[int] = Field(None, ge=0, le=100)
    risk_level: Optional[str] = Field(None, pattern="^(Low|Medium|High|Critical)$")
    scam_category: Optional[str] = Field(None, max_length=50)


class AdminDashboardStats(BaseModel):
    total_reports: int
    pending_reports: int
    approved_reports: int
    rejected_reports: int
    flagged_reports: int
    total_analyses: int
    avg_confidence: Optional[float] = None
    screenshot_count: int
