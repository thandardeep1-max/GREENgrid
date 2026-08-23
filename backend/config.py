"""
Smart Agriculture Assistant
Configuration & Environment Variables
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)


class Settings(BaseSettings):
    """Application Settings"""

    # API Configuration
    app_name: str = "GREENgrid API"
    app_version: str = "1.0.0"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: list = ["http://localhost:5500", "http://127.0.0.1:5500", "*"]

    # Arduino Configuration
    arduino_port: str = "COM3"  # Windows: COM3, Linux: /dev/ttyUSB0
    arduino_baud_rate: int = 9600
    arduino_timeout: int = 2
    arduino_enabled: bool = True

    # Google Cloud
    google_cloud_project_id: str = ""
    google_credentials_path: str = ""

    # Weather API (OpenWeatherMap)
    weather_api_key: str = ""
    weather_api_url: str = "https://api.openweathermap.org/data/2.5"

    # Database (Optional)
    database_url: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


# Create settings instance
settings = Settings()
