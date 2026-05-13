from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.deps import get_db
from app.core.auth import get_current_admin
from app.schemas.admin import ModerateReportRequest, AdminDashboardStats
from app.schemas.report import ReportListResponse
from app.services.admin_service import moderate_report, get_admin_dashboard_stats
from app.services.report_service import get_reports

router = APIRouter()


@router.get("/admin/dashboard", response_model=AdminDashboardStats)
def admin_dashboard(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    """Get admin dashboard statistics."""
    return AdminDashboardStats(**get_admin_dashboard_stats(db))


@router.get("/admin/reports", response_model=ReportListResponse)
def admin_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    sort_by: str = Query("newest"),
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    """List all reports for admin moderation."""
    result = get_reports(
        db, page=page, page_size=page_size,
        sort_by=sort_by, status_filter=status,
    )
    return ReportListResponse(**result)


@router.put("/admin/reports/{report_id}/moderate")
def moderate(
    report_id: str,
    request: ModerateReportRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    """Moderate a community report (approve/reject/flag)."""
    try:
        result = moderate_report(
            db, report_id, admin["id"],
            status=request.status,
            note=request.moderation_note,
            risk_score=request.risk_score,
            risk_level=request.risk_level,
            scam_category=request.scam_category,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
