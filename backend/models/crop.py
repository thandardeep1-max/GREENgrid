"""
Smart Agriculture Assistant
Crop Data Models
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Season(str, Enum):
    KHARIF = "kharif"  # Monsoon crops (June-October)
    RABI = "rabi"      # Winter crops (October-March)
    ZAYAD = "zayad"    # Summer crops (March-June)


class WaterSource(str, Enum):
    CANAL = "canal"
    TUBEWELL = "tubewell"
    RIVER = "river"
    POND = "pond"
    RAINFED = "rainfed"


class WaterAvailability(str, Enum):
    ABUNDANT = "abundant"
    MODERATE = "moderate"
    SCARCE = "scarce"


class IrrigationType(str, Enum):
    DRIP = "drip"
    SPRINKLER = "sprinkler"
    FLOOD = "flood"
    RAINFED = "rainfed"


class CropRequest(BaseModel):
    """Input for crop recommendation"""

    state: str = Field(..., description="Indian state")
    district: Optional[str] = Field(None, description="District name")
    season: Season
    farm_size: float = Field(..., gt=0, description="Farm size in acres")
    soil_type: str = Field(..., description="Soil type")
    soil_ph: float = Field(..., ge=0, le=14, description="Soil pH")
    water_source: WaterSource
    water_availability: WaterAvailability
    irrigation_type: IrrigationType
    budget: Optional[float] = Field(None, description="Budget in INR")

    class Config:
        json_schema_extra = {
            "example": {
                "state": "Gujarat",
                "district": "Rajkot",
                "season": "kharif",
                "farm_size": 5.0,
                "soil_type": "loamy",
                "soil_ph": 6.5,
                "water_source": "tubewell",
                "water_availability": "moderate",
                "irrigation_type": "drip",
                "budget": 50000
            }
        }


class CropRecommendation(BaseModel):
    """Recommended crop with suitability score"""

    crop_name: str
    scientific_name: Optional[str] = None
    suitability: str = Field(..., description="High, Medium, Low")
    suitability_score: int = Field(..., ge=0, le=100)
    estimated_yield: Optional[str] = None
    duration_days: int = Field(..., description="Crop duration in days")
    water_requirement: str
    expected_profit_per_acre: Optional[float] = None
    tips: list[str] = []

    class Config:
        json_schema_extra = {
            "example": {
                "crop_name": "Groundnut",
                "scientific_name": "Arachis hypogaea",
                "suitability": "High",
                "suitability_score": 85,
                "estimated_yield": "15-20 quintals/acre",
                "duration_days": 120,
                "water_requirement": "Moderate",
                "expected_profit_per_acre": 25000,
                "tips": [
                    "Sow at 50cm row spacing",
                    "Apply Gypsum at flowering stage",
                    "Harvest when leaves turn yellow"
                ]
            }
        }
