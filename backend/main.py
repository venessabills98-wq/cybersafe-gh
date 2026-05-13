import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, inspect
from app.core.config import settings
from app.database.session import Base, engine
from app.models import AnalyzedMessage, DetectedIndicator, CommunityReport, ReportVote
from app.api.router import api_router


def _migrate_columns():
    """Add any missing columns to existing tables (simple migration)."""
    expected = {
        "analyzed_messages": {
            "confidence": "INTEGER",
            "sender_info": "VARCHAR(200)",
            "message_type": "VARCHAR(20)",
            "source_type": "VARCHAR(20)",
            "original_image_hash": "VARCHAR(64)",
            "screenshot_url": "TEXT",
        },
        "community_reports": {
            "moderated_by": "VARCHAR(36)",
        },
    }
    inspector = inspect(engine)
    with engine.connect() as conn:
        for table, columns in expected.items():
            if not inspector.has_table(table):
                continue
            existing = {c["name"] for c in inspector.get_columns(table)}
            for col_name, col_type in columns.items():
                if col_name not in existing:
                    conn.execute(text(
                        f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}"
                    ))
        conn.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.to_thread(Base.metadata.create_all, bind=engine)
    await asyncio.to_thread(_migrate_columns)
    yield

app = FastAPI(
    title="CyberSafe GH API",
    description="AI-powered scam and phishing detection platform for Ghana",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router)

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "CyberSafe GH API", "version": "2.0.0"}
