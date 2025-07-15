from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from pyapp.db.base import Base
import enum


class ContentType(str, enum.Enum):
    url = "url"
    pdf = "pdf"


class LibraryItem(Base):
    __tablename__ = "library_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    url_or_path = Column(String, nullable=False)

    content_type = Column(Enum(ContentType, name="content_type_enum"), nullable=False, default=ContentType.url)
    title = Column(String, nullable=True)

    summary = Column(Text, nullable=True)
    flashcards = Column(JSONB, nullable=True)
    mcqs = Column(JSONB, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User", back_populates="library_items")

    generated_contents = relationship(
        "GeneratedContent",
        back_populates="library_item",
        cascade="all, delete-orphan"
    )

    chat_history = relationship("ChatHistory", back_populates="library_item", cascade="all, delete-orphan")

