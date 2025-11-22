"""Utility helpers for generating OTPs."""
import secrets


def generate_numeric_otp(length: int = 6) -> str:
    """Return a zero-padded numeric OTP of a given length."""
    if length <= 0:
        raise ValueError("OTP length must be positive")

    digits = [str(secrets.randbelow(10)) for _ in range(length)]
    return "".join(digits)

