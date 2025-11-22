"""SQLAlchemy models used by the OTP service."""
from sqlalchemy import Column, DateTime, Integer, String, func

from .database import Base


class OTP(Base):
    """Represents a one-time password issued to an email address."""

    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(254), nullable=False, index=True)
    otp = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

