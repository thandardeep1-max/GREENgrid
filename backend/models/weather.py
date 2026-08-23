"""
Smart Agriculture Assistant
Weather Data Models
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class AlertType(str, Enum):
    RAIN = "rain"
    HEAT = "heat"
    WIND = "wind"
    FROST = "frost"
    STORM = "storm"


class WeatherCondition(BaseModel):
    """Current weather conditions"""

    temp: float = Field(..., description="Temperature in Celsius")
    feels_like: float
    humidity: int = Field(..., ge=0, le=100, description="Humidity percentage")
    wind_speed: float = Field(..., description="Wind speed in km/h")
    rain_chance: int = Field(..., ge=0, le=100, description="Rain probability")
    uv_index: int = Field(..., ge=0, le=15)
    description: str
    icon: str

    class Config:
        json_schema_extra = {
            "example": {
                "temp": 32.0,
                "feels_like": 35.0,
                "humidity": 65,
                "wind_speed": 12.0,
                "rain_chance": 20,
                "uv_index": 6,
                "description": "Partly Cloudy",
                "icon": "cloud-sun"
            }
        }


class ForecastDay(BaseModel):
    """Single day forecast"""

    day: str
    date: str
    temp_high: float
    temp_low: float
    icon: str
    description: str
    humidity: int
    wind_speed: float
    rain_probability: Optional[int] = None


class WeatherAlert(BaseModel):
    """Agriculture-specific weather alert"""

    alert_type: AlertType
    title: str
    message: str
    action: str = Field(..., description="Recommended action for farmers")
    severity: str = Field(..., description="low, medium, high")
    valid_until: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "alert_type": "rain",
                "title": "Heavy Rain Expected Tomorrow",
                "message": "Expected rainfall: 40-60mm over 24 hours",
                "action": "Delay irrigation for 2 days. Check drainage systems.",
                "severity": "medium",
                "valid_until": "2024-01-16T18:00:00"
            }
        }


class WeatherData(BaseModel):
    """Complete weather data response"""

    location: str
    current: WeatherCondition
    forecast: list[ForecastDay] = []
    alerts: list[WeatherAlert] = []
    crop_impact: dict = Field(default_factory=dict, description="Impact on active crops")
    fetched_at: datetime = Field(default_factory=datetime.now)

    class Config:
        json_schema_extra = {
            "example": {
                "location": "Rajkot, Gujarat",
                "current": {
                    "temp": 32.0,
                    "feels_like": 35.0,
                    "humidity": 65,
                    "wind_speed": 12.0,
                    "rain_chance": 20,
                    "uv_index": 6,
                    "description": "Partly Cloudy",
                    "icon": "cloud-sun"
                },
                "forecast": [],
                "alerts": [],
                "crop_impact": {
                    "groundnut": "favorable",
                    "cotton": "moderate"
                }
            }
        }
