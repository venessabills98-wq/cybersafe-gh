import uuid
from sqlalchemy import Column, Text, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base

class AnalyzedMessage(Base):
    __tablename__ = "analyzed_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_text = Column(Text, nullable=False)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(20), nullable=False)
    scam_category = Column(String(50), nullable=False)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # V2 fields (nullable for backward compatibility)
    confidence = Column(Integer, nullable=True)
    sender_info = Column(String(200), nullable=True)
    message_type = Column(String(20), nullable=True)
    source_type = Column(String(20), nullable=True)  # text, screenshot
    original_image_hash = Column(String(64), nullable=True)  # SHA-256 for dedup
    screenshot_url = Column(Text, nullable=True)  # Supabase Storage URL

    indicators = relationship("DetectedIndicator", back_populates="message", cascade="all, delete-orphan")
