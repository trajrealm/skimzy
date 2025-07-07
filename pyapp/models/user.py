from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from pyapp.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships (to be defined later)
    library_items = relationship("LibraryItem", back_populates="owner", cascade="all, delete")
