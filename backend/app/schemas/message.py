from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class AnalyzeRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000, description="The suspicious message to analyze")

class IndicatorResponse(BaseModel):
    name: str
    score: int

class AnalyzeResponse(BaseModel):
    risk_score: int
    risk_level: str
    scam_category: str
    indicators: List[IndicatorResponse]
    explanation: str
    advice: List[str]

class DashboardStats(BaseModel):
    total_messages: int
    high_risk_percentage: float
    category_distribution: Dict[str, int]
    risk_level_distribution: Dict[str, int]
    common_keywords: List[str]
    recent_analyses: Optional[List[dict]] = None


# --- V2 Schemas ---

class AnalyzeRequestV2(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000, description="The suspicious message to analyze")
    sender_info: Optional[str] = Field(None, max_length=200, description="Sender phone/email/name")
    message_type: Optional[str] = Field("sms", description="Type: sms, email, whatsapp")

class EnhancedIndicatorResponse(BaseModel):
    name: str
    score: int
    detail: str

class SenderAnalysisResponse(BaseModel):
    sender_type: str
    is_suspicious: bool
    reason: str
    known_entity: Optional[str] = None

class GhanaPatternResponse(BaseModel):
    name: str
    category: str
    score: int
    explanation: str

class AnalyzeResponseV2(BaseModel):
    message_text: str
    risk_score: int
    risk_level: str
    scam_category: str
    indicators: List[EnhancedIndicatorResponse]
    explanation: str
    advice: List[str]
    confidence: int
    confidence_label: str
    sender_analysis: SenderAnalysisResponse
    ghana_patterns: List[GhanaPatternResponse]
    message_type: str

class OCRResult(BaseModel):
    extracted_text: str
    confidence: float
    word_count: int

class ScreenshotAnalyzeResponse(BaseModel):
    ocr_result: OCRResult
    analysis: AnalyzeResponseV2
