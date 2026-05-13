from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.report import CommunityReport
from app.models.message import AnalyzedMessage


def moderate_report(
    db: Session,
    report_id: str,
    admin_id: str,
    status: str,
    note: str = None,
    risk_score: int = None,
    risk_level: str = None,
    scam_category: str = None,
) -> dict:
    """Moderate a community report with optional risk overrides."""
    report = db.query(CommunityReport).filter(CommunityReport.id == report_id).first()
    if not report:
        raise ValueError("Report not found")

    report.status = status
    report.moderation_note = note
    report.moderated_by = admin_id
    report.moderated_at = datetime.now(timezone.utc)

    if risk_score is not None:
        report.auto_risk_score = risk_score
    if risk_level is not None:
        report.auto_risk_level = risk_level
    if scam_category is not None:
        report.auto_scam_category = scam_category

    db.commit()
    db.refresh(report)

    return {
        "id": str(report.id),
        "status": report.status,
        "moderation_note": report.moderation_note,
        "moderated_at": report.moderated_at,
        "auto_risk_score": report.auto_risk_score,
        "auto_risk_level": report.auto_risk_level,
        "auto_scam_category": report.auto_scam_category,
    }


def get_admin_dashboard_stats(db: Session) -> dict:
    """Get admin dashboard statistics."""
    total_reports = db.query(func.count(CommunityReport.id)).scalar() or 0
    pending = db.query(func.count(CommunityReport.id)).filter(
        CommunityReport.status == "pending"
    ).scalar() or 0
    approved = db.query(func.count(CommunityReport.id)).filter(
        CommunityReport.status == "approved"
    ).scalar() or 0
    rejected = db.query(func.count(CommunityReport.id)).filter(
        CommunityReport.status == "rejected"
    ).scalar() or 0
    flagged = db.query(func.count(CommunityReport.id)).filter(
        CommunityReport.status == "flagged"
    ).scalar() or 0

    total_analyses = db.query(func.count(AnalyzedMessage.id)).scalar() or 0

    avg_confidence = db.query(func.avg(AnalyzedMessage.confidence)).filter(
        AnalyzedMessage.confidence.isnot(None)
    ).scalar()

    screenshot_count = db.query(func.count(AnalyzedMessage.id)).filter(
        AnalyzedMessage.source_type == "screenshot"
    ).scalar() or 0

    return {
        "total_reports": total_reports,
        "pending_reports": pending,
        "approved_reports": approved,
        "rejected_reports": rejected,
        "flagged_reports": flagged,
        "total_analyses": total_analyses,
        "avg_confidence": round(avg_confidence, 1) if avg_confidence else None,
        "screenshot_count": screenshot_count,
    }
