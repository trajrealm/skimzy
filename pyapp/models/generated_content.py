from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, DateTime, func
from sqlalchemy.orm import relationship
from pyapp.db.base import Base
import enum


class ContentFormat(str, enum.Enum):
    summary = "summary"
    flashcards = "flashcards"
    qa = "qa"


class GeneratedContent(Base):
    __tablename__ = "generated_contents"

    id = Column(Integer, primary_key=True, index=True)
    library_item_id = Column(Integer, ForeignKey("library_items.id", ondelete="CASCADE"), nullable=False)
    format = Column(Enum(ContentFormat, name="content_format_enum"), nullable=False)
    length = Column(String(20), nullable=True)  # e.g., short, medium, long (only used for summaries)
    content = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Optional: relationship back to the library item
    library_item = relationship("LibraryItem", back_populates="generated_contents")
