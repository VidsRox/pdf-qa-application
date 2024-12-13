from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    upload_date = Column(DateTime, default=datetime.utcnow)
    tags = Column(String, nullable=True)  # Tags for organization (e.g., "Work, Personal")
    category = Column(String, nullable=True)  # File category (e.g., "Work", "Study")
