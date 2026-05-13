from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.deps import get_db
from app.schemas.message import DashboardStats
from app.models.message import AnalyzedMessage
from app.models.indicator import DetectedIndicator

router = APIRouter()

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard analytics statistics."""
    try:
        # Total messages
        total_messages = db.query(func.count(AnalyzedMessage.id)).scalar() or 0

        # High risk percentage (High + Critical)
        high_risk_count = db.query(func.count(AnalyzedMessage.id)).filter(
            AnalyzedMessage.risk_level.in_(["High", "Critical"])
        ).scalar() or 0
        high_risk_percentage = round((high_risk_count / total_messages * 100) if total_messages > 0 else 0, 1)

        # Category distribution
        category_rows = db.query(
            AnalyzedMessage.scam_category,
            func.count(AnalyzedMessage.id)
        ).group_by(AnalyzedMessage.scam_category).all()
        category_distribution = {row[0]: row[1] for row in category_rows}

        # Risk level distribution
        risk_rows = db.query(
            AnalyzedMessage.risk_level,
            func.count(AnalyzedMessage.id)
        ).group_by(AnalyzedMessage.risk_level).all()
        risk_level_distribution = {row[0]: row[1] for row in risk_rows}

        # Common keywords from indicators
        keyword_rows = db.query(
            DetectedIndicator.indicator_name,
            func.count(DetectedIndicator.id)
        ).group_by(DetectedIndicator.indicator_name).order_by(
            func.count(DetectedIndicator.id).desc()
        ).limit(10).all()
        common_keywords = [row[0] for row in keyword_rows]

        # Recent analyses (last 10)
        recent = db.query(AnalyzedMessage).order_by(
            AnalyzedMessage.created_at.desc()
        ).limit(10).all()
        recent_analyses = [
            {
                "id": str(msg.id),
                "message_preview": msg.message_text[:100] + "..." if len(msg.message_text) > 100 else msg.message_text,
                "risk_score": msg.risk_score,
                "risk_level": msg.risk_level,
                "scam_category": msg.scam_category,
                "created_at": msg.created_at.isoformat() if msg.created_at else None,
            }
            for msg in recent
        ]

        return DashboardStats(
            total_messages=total_messages,
            high_risk_percentage=high_risk_percentage,
            category_distribution=category_distribution,
            risk_level_distribution=risk_level_distribution,
            common_keywords=common_keywords,
            recent_analyses=recent_analyses,
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve dashboard statistics")
