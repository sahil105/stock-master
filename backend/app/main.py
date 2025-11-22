"""FastAPI application for OTP workflows."""
from datetime import datetime, timedelta
import logging

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, constr
from sqlalchemy.orm import Session

from .config import get_settings
from .database import Base, engine, get_db
from .email_service import send_otp_email
from .models import OTP
from .otp_generator import generate_numeric_otp

logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(
    title="OTP Authentication API",
    description="Minimal FastAPI service to issue and verify email-based OTPs.",
    version="1.0.0",
)


class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: constr(min_length=settings.OTP_LENGTH, max_length=settings.OTP_LENGTH)


class GenericResponse(BaseModel):
    success: bool
    message: str


@app.on_event("startup")
def prepare_database() -> None:
    """Create tables and log the current configuration."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified and ready.")


@app.post("/send-otp", response_model=GenericResponse)
def send_otp(request: SendOTPRequest, db: Session = Depends(get_db)) -> GenericResponse:
    """Generate, persist, and email an OTP to the user."""
    otp_code = generate_numeric_otp(settings.OTP_LENGTH)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)

    db.query(OTP).filter(OTP.email == request.email).delete(synchronize_session=False)
    otp_record = OTP(email=request.email, otp=otp_code, expires_at=expires_at)
    db.add(otp_record)
    db.commit()
    db.refresh(otp_record)

    try:
        send_otp_email(request.email, otp_code, settings.OTP_EXPIRY_MINUTES)
    except Exception:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(
            status_code=500, detail="Unable to deliver OTP email at this time."
        )

    return GenericResponse(success=True, message="OTP sent")


@app.post("/verify-otp", response_model=GenericResponse)
def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)) -> GenericResponse:
    """Validate the OTP and ensure it has not expired."""
    otp_record = (
        db.query(OTP)
        .filter(OTP.email == request.email)
        .order_by(OTP.created_at.desc())
        .first()
    )

    if not otp_record or otp_record.otp != request.otp:
        return GenericResponse(success=False, message="Invalid or expired OTP")

    if otp_record.expires_at < datetime.utcnow():
        db.delete(otp_record)
        db.commit()
        return GenericResponse(success=False, message="Invalid or expired OTP")

    db.delete(otp_record)
    db.commit()
    return GenericResponse(success=True, message="OTP verified")

