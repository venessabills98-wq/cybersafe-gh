import re
import html
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.deps import get_db
from app.schemas.message import (
    AnalyzeRequest, AnalyzeResponse, IndicatorResponse,
    AnalyzeRequestV2, AnalyzeResponseV2, EnhancedIndicatorResponse,
    SenderAnalysisResponse, GhanaPatternResponse,
)
from app.services.analysis_service import analyze_message, analyze_message_v2
from app.models.message import AnalyzedMessage
from app.models.indicator import DetectedIndicator

router = APIRouter()

def sanitize_input(text: str) -> str:
    """Strip HTML tags, script content, and potentially dangerous content."""
    # Remove null bytes
    text = text.replace('\x00', '')
    # Decode HTML entities first
    text = html.unescape(text)
    # Remove script blocks (with content) first
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Then remove remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """Analyze a suspicious message for scam indicators."""
    # Sanitize input
    clean_message = sanitize_input(request.message)
    if not clean_message:
        raise HTTPException(status_code=400, detail="Message is empty after sanitization")

    # Run analysis
    result = analyze_message(clean_message)

    # Save to database
    try:
        db_message = AnalyzedMessage(
            message_text=clean_message,
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            scam_category=result["scam_category"],
            explanation=result["explanation"],
        )
        db.add(db_message)
        db.flush()

        for indicator in result["indicators"]:
            db_indicator = DetectedIndicator(
                message_id=db_message.id,
                indicator_name=indicator["name"],
                indicator_score=indicator["score"],
            )
            db.add(db_indicator)

        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save analysis results")

    return AnalyzeResponse(
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        scam_category=result["scam_category"],
        indicators=[IndicatorResponse(name=i["name"], score=i["score"]) for i in result["indicators"]],
        explanation=result["explanation"],
        advice=result["advice"],
    )


@router.post("/analyze/v2", response_model=AnalyzeResponseV2)
def analyze_v2(request: AnalyzeRequestV2, db: Session = Depends(get_db)):
    """Enhanced analysis with confidence scoring, sender verification, and Ghana-specific patterns."""
    clean_message = sanitize_input(request.message)
    if not clean_message:
        raise HTTPException(status_code=400, detail="Message is empty after sanitization")

    result = analyze_message_v2(
        text=clean_message,
        sender_info=request.sender_info,
        message_type=request.message_type,
    )

    # Save to database
    try:
        db_message = AnalyzedMessage(
            message_text=clean_message,
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            scam_category=result["scam_category"],
            explanation=result["explanation"],
            confidence=result["confidence"],
            sender_info=request.sender_info,
            message_type=result["message_type"],
            source_type="text",
        )
        db.add(db_message)
        db.flush()

        for indicator in result["indicators"]:
            db_indicator = DetectedIndicator(
                message_id=db_message.id,
                indicator_name=indicator["name"],
                indicator_score=indicator["score"],
            )
            db.add(db_indicator)

        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save analysis results")

    return AnalyzeResponseV2(
        message_text=result["message_text"],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        scam_category=result["scam_category"],
        indicators=[
            EnhancedIndicatorResponse(name=i["name"], score=i["score"], detail=i["detail"])
            for i in result["indicators"]
        ],
        explanation=result["explanation"],
        advice=result["advice"],
        confidence=result["confidence"],
        confidence_label=result["confidence_label"],
        sender_analysis=SenderAnalysisResponse(**result["sender_analysis"]),
        ghana_patterns=[GhanaPatternResponse(**p) for p in result["ghana_patterns"]],
        message_type=result["message_type"],
    )
