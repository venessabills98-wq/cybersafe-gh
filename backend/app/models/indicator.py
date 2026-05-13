import uuid
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base

class DetectedIndicator(Base):
    __tablename__ = "detected_indicators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("analyzed_messages.id"), nullable=False)
    indicator_name = Column(String(100), nullable=False)
    indicator_score = Column(Integer, nullable=False)

    message = relationship("AnalyzedMessage", back_populates="indicators")
