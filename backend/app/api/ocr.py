import uuid as uuid_mod
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.deps import get_db
from app.core.config import settings
from app.schemas.message import (
    ScreenshotAnalyzeResponse, OCRResult, AnalyzeResponseV2,
    EnhancedIndicatorResponse, SenderAnalysisResponse, GhanaPatternResponse,
)
from app.services.ocr_service import extract_text_from_image, compute_image_hash, validate_extracted_text
from app.services.analysis_service import analyze_message_v2
from app.services.storage_service import upload_screenshot
from app.models.message import AnalyzedMessage
from app.models.indicator import DetectedIndicator

router = APIRouter()

ALLOWED_TYPES = {"image/png", "image/jpeg", "image/webp"}
MAX_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@router.post("/analyze/screenshot", response_model=ScreenshotAnalyzeResponse)
async def analyze_screenshot(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a screenshot of a suspicious message for OCR extraction and analysis."""
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: PNG, JPEG, WebP",
        )

    # Read file bytes
    image_bytes = await file.read()

    # Validate file size
    if len(image_bytes) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    # Extract text via OCR
    try:
        ocr_data = extract_text_from_image(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"OCR processing failed: {str(e)}")

    # Validate extracted text
    if not validate_extracted_text(ocr_data["extracted_text"]):
        raise HTTPException(
            status_code=422,
            detail="Could not extract readable text from the image. Please try a clearer screenshot.",
        )

    # Analyze extracted text
    result = analyze_message_v2(
        text=ocr_data["extracted_text"],
        sender_info=None,
        message_type="sms",
    )

    # Compute image hash for dedup
    image_hash = compute_image_hash(image_bytes)

    # Upload screenshot to Supabase Storage
    ext = (file.filename or "image.png").rsplit(".", 1)[-1].lower() if file.filename else "png"
    storage_filename = f"{uuid_mod.uuid4()}.{ext}"
    screenshot_url = await upload_screenshot(image_bytes, storage_filename)

    # Save to database
    try:
        db_message = AnalyzedMessage(
            message_text=ocr_data["extracted_text"],
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            scam_category=result["scam_category"],
            explanation=result["explanation"],
            confidence=result["confidence"],
            message_type=result["message_type"],
            source_type="screenshot",
            original_image_hash=image_hash,
            screenshot_url=screenshot_url,
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

    return ScreenshotAnalyzeResponse(
        ocr_result=OCRResult(
            extracted_text=ocr_data["extracted_text"],
            confidence=ocr_data["confidence"],
            word_count=ocr_data["word_count"],
        ),
        analysis=AnalyzeResponseV2(
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
        ),
    )
