import uuid
from sqlalchemy import Column, Text, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class CommunityReport(Base):
    __tablename__ = "community_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_name = Column(String(100), nullable=True)
    reporter_session_id = Column(String(64), nullable=False)
    message_text = Column(Text, nullable=False)
    message_type = Column(String(20), default="sms")
    sender_info = Column(String(200), nullable=True)
    scam_category = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)

    # Auto-analysis results
    auto_risk_score = Column(Integer, nullable=True)
    auto_risk_level = Column(String(20), nullable=True)
    auto_scam_category = Column(String(50), nullable=True)
    auto_confidence = Column(Integer, nullable=True)

    # Moderation
    status = Column(String(20), default="pending")  # pending, approved, rejected, flagged
    moderation_note = Column(Text, nullable=True)
    moderated_by = Column(String(36), nullable=True)  # Supabase user UUID
    moderated_at = Column(DateTime(timezone=True), nullable=True)

    # Engagement
    upvote_count = Column(Integer, default=0)
    downvote_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    votes = relationship("ReportVote", back_populates="report", cascade="all, delete-orphan")
