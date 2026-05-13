from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.report import CommunityReport
from app.models.vote import ReportVote
from app.services.analysis_service import analyze_message_v2


def create_report(db: Session, data: dict) -> CommunityReport:
    """Create a community report with auto-analysis."""
    # Run auto-analysis
    analysis = analyze_message_v2(
        text=data["message_text"],
        sender_info=data.get("sender_info"),
        message_type=data.get("message_type", "sms"),
    )

    report = CommunityReport(
        reporter_name=data.get("reporter_name"),
        reporter_session_id=data["session_id"],
        message_text=data["message_text"],
        message_type=data.get("message_type", "sms"),
        sender_info=data.get("sender_info"),
        scam_category=data.get("scam_category"),
        description=data.get("description"),
        auto_risk_score=analysis["risk_score"],
        auto_risk_level=analysis["risk_level"],
        auto_scam_category=analysis["scam_category"],
        auto_confidence=analysis["confidence"],
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_reports(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    category: Optional[str] = None,
    sort_by: str = "newest",
    status_filter: str = "approved",
    session_id: Optional[str] = None,
) -> dict:
    """Get paginated community reports with optional filters."""
    query = db.query(CommunityReport)

    if status_filter:
        query = query.filter(CommunityReport.status == status_filter)

    if category:
        query = query.filter(
            (CommunityReport.scam_category == category) |
            (CommunityReport.auto_scam_category == category)
        )

    total = query.count()

    if sort_by == "newest":
        query = query.order_by(desc(CommunityReport.created_at))
    elif sort_by == "most_voted":
        query = query.order_by(desc(CommunityReport.upvote_count))
    elif sort_by == "highest_risk":
        query = query.order_by(desc(CommunityReport.auto_risk_score))

    reports = query.offset((page - 1) * page_size).limit(page_size).all()

    # Get user votes if session_id provided
    report_list = []
    for r in reports:
        report_dict = {
            "id": str(r.id),
            "reporter_name": r.reporter_name,
            "message_text": r.message_text,
            "message_type": r.message_type,
            "sender_info": r.sender_info,
            "scam_category": r.scam_category,
            "description": r.description,
            "auto_risk_score": r.auto_risk_score,
            "auto_risk_level": r.auto_risk_level,
            "auto_scam_category": r.auto_scam_category,
            "auto_confidence": r.auto_confidence,
            "status": r.status,
            "upvote_count": r.upvote_count,
            "downvote_count": r.downvote_count,
            "view_count": r.view_count,
            "created_at": r.created_at,
            "user_vote": None,
        }
        if session_id:
            vote = db.query(ReportVote).filter(
                ReportVote.report_id == r.id,
                ReportVote.session_id == session_id,
            ).first()
            if vote:
                report_dict["user_vote"] = vote.vote_type
        report_list.append(report_dict)

    return {
        "reports": report_list,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


def get_report_by_id(db: Session, report_id: str, session_id: Optional[str] = None) -> Optional[dict]:
    """Get a single report by ID."""
    report = db.query(CommunityReport).filter(CommunityReport.id == report_id).first()
    if not report:
        return None

    # Increment view count
    report.view_count = (report.view_count or 0) + 1
    db.commit()

    result = {
        "id": str(report.id),
        "reporter_name": report.reporter_name,
        "message_text": report.message_text,
        "message_type": report.message_type,
        "sender_info": report.sender_info,
        "scam_category": report.scam_category,
        "description": report.description,
        "auto_risk_score": report.auto_risk_score,
        "auto_risk_level": report.auto_risk_level,
        "auto_scam_category": report.auto_scam_category,
        "auto_confidence": report.auto_confidence,
        "status": report.status,
        "upvote_count": report.upvote_count,
        "downvote_count": report.downvote_count,
        "view_count": report.view_count,
        "created_at": report.created_at,
        "user_vote": None,
    }
    if session_id:
        vote = db.query(ReportVote).filter(
            ReportVote.report_id == report.id,
            ReportVote.session_id == session_id,
        ).first()
        if vote:
            result["user_vote"] = vote.vote_type

    return result


def vote_on_report(db: Session, report_id: str, session_id: str, vote_type: str) -> dict:
    """Vote on a report. Toggles vote if same type, switches if different."""
    report = db.query(CommunityReport).filter(CommunityReport.id == report_id).first()
    if not report:
        raise ValueError("Report not found")

    existing = db.query(ReportVote).filter(
        ReportVote.report_id == report.id,
        ReportVote.session_id == session_id,
    ).first()

    if existing:
        if existing.vote_type == vote_type:
            # Toggle off
            if vote_type == "up":
                report.upvote_count = max(0, (report.upvote_count or 0) - 1)
            else:
                report.downvote_count = max(0, (report.downvote_count or 0) - 1)
            db.delete(existing)
            db.commit()
            return {
                "vote_type": None,
                "upvote_count": report.upvote_count,
                "downvote_count": report.downvote_count,
            }
        else:
            # Switch vote
            if existing.vote_type == "up":
                report.upvote_count = max(0, (report.upvote_count or 0) - 1)
                report.downvote_count = (report.downvote_count or 0) + 1
            else:
                report.downvote_count = max(0, (report.downvote_count or 0) - 1)
                report.upvote_count = (report.upvote_count or 0) + 1
            existing.vote_type = vote_type
            db.commit()
            return {
                "vote_type": vote_type,
                "upvote_count": report.upvote_count,
                "downvote_count": report.downvote_count,
            }
    else:
        # New vote
        new_vote = ReportVote(
            report_id=report.id,
            session_id=session_id,
            vote_type=vote_type,
        )
        db.add(new_vote)
        if vote_type == "up":
            report.upvote_count = (report.upvote_count or 0) + 1
        else:
            report.downvote_count = (report.downvote_count or 0) + 1
        db.commit()
        return {
            "vote_type": vote_type,
            "upvote_count": report.upvote_count,
            "downvote_count": report.downvote_count,
        }


def get_community_stats(db: Session) -> dict:
    """Get community statistics."""
    total = db.query(func.count(CommunityReport.id)).scalar() or 0
    approved = db.query(func.count(CommunityReport.id)).filter(
        CommunityReport.status == "approved"
    ).scalar() or 0

    # Top categories
    categories = db.query(
        CommunityReport.auto_scam_category,
        func.count(CommunityReport.id),
    ).filter(
        CommunityReport.status == "approved",
        CommunityReport.auto_scam_category.isnot(None),
    ).group_by(CommunityReport.auto_scam_category).all()

    top_categories = {cat: count for cat, count in categories}

    # Recent reports (last 7 days)
    from datetime import datetime, timedelta, timezone
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent = db.query(func.count(CommunityReport.id)).filter(
        CommunityReport.created_at >= week_ago
    ).scalar() or 0

    return {
        "total_reports": total,
        "approved_reports": approved,
        "top_categories": top_categories,
        "recent_reports_count": recent,
    }
