"""
Smart Agriculture Assistant
Disease Detection Models
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class DiseaseDetectionRequest(BaseModel):
    """Request for disease detection"""

    image_base64: str = Field(..., description="Base64 encoded image")
    crop_type: Optional[str] = Field(None, description="Type of crop (for better accuracy)")

    class Config:
        json_schema_extra = {
            "example": {
                "image_base64": "data:image/jpeg;base64,/9j/4AAQ...",
                "crop_type": "groundnut"
            }
        }


class DiseaseDetectionResult(BaseModel):
    """Disease detection result"""

    disease_name: str
    scientific_name: Optional[str] = None
    confidence: float = Field(..., ge=0, le=100, description="Confidence percentage")
    severity: Severity
    affected_part: Optional[str] = Field(None, description="Part of plant affected")

    # Detailed information
    description: str
    symptoms: list[str] = []
    causes: list[str] = []

    # Treatment & Prevention
    treatment_steps: list[str] = []
    recommended_products: list[str] = []
    prevention_tips: list[str] = []

    # Metadata
    detected_at: datetime = Field(default_factory=datetime.now)
    processing_time_ms: Optional[int] = None

    class Config:
        json_schema_extra = {
            "example": {
                "disease_name": "Leaf Spot Disease",
                "scientific_name": "Cercospora arachidicola",
                "confidence": 92.5,
                "severity": "high",
                "affected_part": "Leaves",
                "description": "Leaf spot is a fungal disease that causes circular brown spots on leaves.",
                "symptoms": [
                    "Circular brown spots on leaves",
                    "Yellowing around spots",
                    "Premature leaf drop"
                ],
                "causes": [
                    "Fungal infection (Cercospora)",
                    "High humidity",
                    "Poor air circulation"
                ],
                "treatment_steps": [
                    "Remove infected leaves",
                    "Apply Mancozeb or Chlorothalonil fungicide",
                    "Improve air circulation"
                ],
                "recommended_products": [
                    "Mancozeb 75% WP",
                    "Chlorothalonil",
                    "Copper oxychloride"
                ],
                "prevention_tips": [
                    "Use disease-resistant varieties",
                    "Practice crop rotation",
                    "Avoid overhead irrigation"
                ],
                "processing_time_ms": 1250
            }
        }
