"""Email helpers for delivering one-time passwords."""
import logging
import smtplib
from email.message import EmailMessage

from .config import get_settings

logger = logging.getLogger(__name__)


def send_otp_email(recipient: str, otp: str, expires_in_minutes: int) -> None:
    """Send the OTP and expiration details to the recipient email."""
    settings = get_settings()

    message = EmailMessage()
    message["Subject"] = "Your One-Time Password"
    message["From"] = settings.EMAIL_ADDRESS
    message["To"] = recipient
    message.set_content(
        f"Your OTP code is {otp}. "
        f"It expires in {expires_in_minutes} minutes. "
        "If you did not request this, please ignore this message."
    )

    try:
        with smtplib.SMTP_SSL(
            settings.EMAIL_SMTP_SERVER, settings.EMAIL_SMTP_PORT
        ) as smtp:
            smtp.login(settings.EMAIL_ADDRESS, settings.EMAIL_PASSWORD)
            smtp.send_message(message)
            logger.info("OTP email sent to %s", recipient)
    except Exception as exc:  # pragma: no cover - relies on external email server
        logger.exception("Failed to send OTP email: %s", exc)
        raise

