from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.deps import get_db
from app.schemas.report import (
    CreateReportRequest, ReportResponse, ReportListResponse,
    VoteRequest, VoteResponse, CommunityStats,
)
from app.services.report_service import (
    create_report, get_reports, get_report_by_id,
    vote_on_report, get_community_stats,
)

router = APIRouter()


@router.post("/reports", response_model=ReportResponse)
def submit_report(request: CreateReportRequest, db: Session = Depends(get_db)):
    """Submit a community scam report."""
    try:
        report = create_report(db, request.model_dump())
        return ReportResponse(
            id=str(report.id),
            reporter_name=report.reporter_name,
            message_text=report.message_text,
            message_type=report.message_type,
            sender_info=report.sender_info,
            scam_category=report.scam_category,
            description=report.description,
            auto_risk_score=report.auto_risk_score,
            auto_risk_level=report.auto_risk_level,
            auto_scam_category=report.auto_scam_category,
            auto_confidence=report.auto_confidence,
            status=report.status,
            upvote_count=report.upvote_count or 0,
            downvote_count=report.downvote_count or 0,
            view_count=report.view_count or 0,
            created_at=report.created_at,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create report: {str(e)}")


@router.get("/reports", response_model=ReportListResponse)
def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    category: str = Query(None),
    sort_by: str = Query("newest"),
    session_id: str = Query(None),
    db: Session = Depends(get_db),
):
    """List approved community reports with pagination and filters."""
    result = get_reports(
        db, page=page, page_size=page_size,
        category=category, sort_by=sort_by,
        status_filter="approved", session_id=session_id,
    )
    return ReportListResponse(**result)


@router.get("/reports/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: str,
    session_id: str = Query(None),
    db: Session = Depends(get_db),
):
    """Get a single report by ID."""
    report = get_report_by_id(db, report_id, session_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportResponse(**report)


@router.post("/reports/{report_id}/vote", response_model=VoteResponse)
def vote(report_id: str, request: VoteRequest, db: Session = Depends(get_db)):
    """Vote on a community report."""
    try:
        result = vote_on_report(db, report_id, request.session_id, request.vote_type)
        return VoteResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/community/stats", response_model=CommunityStats)
def community_stats(db: Session = Depends(get_db)):
    """Get community statistics."""
    return CommunityStats(**get_community_stats(db))
