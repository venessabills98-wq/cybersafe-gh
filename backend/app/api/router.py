from fastapi import APIRouter
from app.api.analyze import router as analyze_router
from app.api.dashboard import router as dashboard_router
from app.api.ocr import router as ocr_router
from app.api.reports import router as reports_router
from app.api.admin import router as admin_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(analyze_router, tags=["Analysis"])
api_router.include_router(dashboard_router, tags=["Dashboard"])
api_router.include_router(ocr_router, tags=["OCR"])
api_router.include_router(reports_router, tags=["Community"])
api_router.include_router(admin_router, tags=["Admin"])
