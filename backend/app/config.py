"""ProfitPilot - Application Configuration"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # AI Provider
    ai_provider: str = "gemini"
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-flash-latest"
    openai_api_key: Optional[str] = None
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"

    # Database
    database_url: str = "sqlite:///./business_brain.db"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Store
    store_name: str = "ProfitPilot Hub"
    default_delivery_fee: float = 30.0
    currency_symbol: str = "₹"

    class Config:
        env_file = ("../.env", ".env")
        env_file_encoding = "utf-8"


import os
if os.environ.get("STORE_NAME") in ("Kirana Decision Hub", None):
    os.environ["STORE_NAME"] = "ProfitPilot Hub"

settings = Settings()
