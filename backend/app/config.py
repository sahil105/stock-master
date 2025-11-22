# This file defines application settings and reads environment configuration.
from functools import lru_cache
from typing import Optional

from pydantic import EmailStr  # type: ignore[import]
from pydantic_settings import BaseSettings
from urllib.parse import quote_plus


class Settings(BaseSettings):
    EMAIL_ADDRESS: EmailStr
    EMAIL_PASSWORD: str
    EMAIL_SMTP_SERVER: str = "smtp.gmail.com"
    EMAIL_SMTP_PORT: int = 465
    OTP_LENGTH: int = 6
    OTP_EXPIRY_MINUTES: int = 5
    DATABASE_URL: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: int = 3306
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_NAME: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


    @property
    def resolved_database_url(self) -> str:
        """Return the SQLAlchemy URL, preferring `DATABASE_URL` but falling back to separated fields."""
        if self.DATABASE_URL:
            return self.DATABASE_URL

        missing = [
            name
            for name in ("DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME")
            if getattr(self, name) in (None, "")
        ]
        if missing:
            raise ValueError(
                "Database configuration is incomplete: "
                + ", ".join(missing)
            )
        password = quote_plus(self.DB_PASSWORD)
        return (
            f"mysql+pymysql://{self.DB_USER}:{password}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


