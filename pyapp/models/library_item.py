from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
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
    
    # ✅ Enum stored as string (no custom PostgreSQL ENUM type)
    content_type = Column(Enum(ContentType), nullable=False, default=ContentType.url)
    
    title = Column(String, nullable=True)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)

    user = relationship("User", back_populates="library_items")

    generated_contents = relationship(
    "GeneratedContent",
    back_populates="library_item",
    cascade="all, delete-orphan"
)
