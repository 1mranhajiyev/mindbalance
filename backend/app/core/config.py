from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://mindbalance:mindbalance_secret@localhost:5432/mindbalance_db"
    SECRET_KEY: str = "change_this_secret_key_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    TOTP_ISSUER: str = "MindBalance"

    class Config:
        env_file = ".env"


settings = Settings()
