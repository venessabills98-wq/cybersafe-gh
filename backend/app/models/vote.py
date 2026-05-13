import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class ReportVote(Base):
    __tablename__ = "report_votes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("community_reports.id"), nullable=False)
    session_id = Column(String(64), nullable=False)
    vote_type = Column(String(10), nullable=False)  # up, down
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("report_id", "session_id", name="uq_report_vote_session"),
    )

    report = relationship("CommunityReport", back_populates="votes")
