"""
Smart Agriculture Assistant
Soil Data Models
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class SoilType(str, Enum):
    LOAMY = "loamy"
    CLAY = "clay"
    SANDY = "sandy"
    SILT = "silt"
    PEAT = "peat"


class FertilityLevel(str, Enum):
    HIGH = "high"
    MODERATE = "moderate"
    LOW = "low"


class SoilReading(BaseModel):
    """Real-time soil sensor reading"""

    ph: float = Field(..., ge=0, le=14, description="Soil pH level (0-14)")
    moisture: float = Field(..., ge=0, le=100, description="Moisture percentage (0-100%)")
    temperature: float = Field(..., ge=-10, le=60, description="Temperature in Celsius")
    nitrogen: int = Field(..., ge=0, le=100, description="Nitrogen level (mg/kg)")
    phosphorus: int = Field(..., ge=0, le=100, description="Phosphorus level (mg/kg)")
    potassium: int = Field(..., ge=0, le=100, description="Potassium level (mg/kg)")
    timestamp: datetime = Field(default_factory=datetime.now)
    sensor_id: Optional[str] = "arduino_01"

    class Config:
        json_schema_extra = {
            "example": {
                "ph": 6.5,
                "moisture": 45.0,
                "temperature": 28.5,
                "nitrogen": 35,
                "phosphorus": 28,
                "potassium": 42,
                "timestamp": "2024-01-15T10:30:00",
                "sensor_id": "arduino_01"
            }
        }


class SoilReport(BaseModel):
    """Complete soil health report"""

    soil_type: SoilType
    fertility: FertilityLevel
    drainage: str = Field(..., description="Drainage quality")
    organic_matter: str = Field(..., description="Organic matter level")
    recommended_crops: list[str] = Field(..., description="List of recommended crops")
    readings: SoilReading
    generated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        json_schema_extra = {
            "example": {
                "soil_type": "loamy",
                "fertility": "moderate",
                "drainage": "Good",
                "organic_matter": "Moderate",
                "recommended_crops": ["Groundnut", "Cotton", "Wheat"],
                "readings": {
                    "ph": 6.5,
                    "moisture": 45.0,
                    "temperature": 28.5,
                    "nitrogen": 35,
                    "phosphorus": 28,
                    "potassium": 42
                },
                "generated_at": "2024-01-15T10:30:00"
            }
        }
