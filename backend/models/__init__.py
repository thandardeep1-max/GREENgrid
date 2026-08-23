"""
Smart Agriculture Assistant
Data Models - Pydantic Schemas
"""

from .soil import SoilReading, SoilReport
from .crop import CropRecommendation, CropRequest
from .weather import WeatherData, WeatherAlert
from .disease import DiseaseDetectionRequest, DiseaseDetectionResult
from .market import MarketPrice, ProfitCalculation


__all__ = [
    "SoilReading",
    "SoilReport",
    "CropRecommendation",
    "CropRequest",
    "WeatherData",
    "WeatherAlert",
    "DiseaseDetectionRequest",
    "DiseaseDetectionResult",
    "MarketPrice",
    "ProfitCalculation",
]
