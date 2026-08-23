"""
Smart Agriculture Assistant
ML Service for Disease Detection
"""

import base64
import io
import logging
import random
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image
    import numpy as np
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    logging.warning("PIL/NumPy not installed. ML features will use simulated results.")


logger = logging.getLogger(__name__)


class MLService:
    """
    Service for plant disease detection using ML models.
    Currently uses simulated results. Can be extended with TensorFlow/PyTorch.
    """

    def __init__(self):
        self.model_path = Path(__file__).parent.parent / "ml-models" / "disease_model"
        self.model = None
        self.class_names = [
            "Leaf Spot Disease",
            "Early Blight",
            "Late Blight",
            "Powdery Mildew",
            "Root Rot",
            "Yellow Leaf Curl",
            "Bacterial Leaf Blight",
            "Healthy"
        ]

        # Disease database
        self.disease_db = self._load_disease_database()

    def load_model(self):
        """
        Load the trained disease detection model.
        Override this method when integrating TensorFlow/PyTorch.
        """
        if not ML_AVAILABLE:
            logger.warning("ML libraries not available. Using simulated mode.")
            return False

        # TODO: Load actual model
        # Example for TensorFlow:
        # import tensorflow as tf
        # self.model = tf.keras.models.load_model(str(self.model_path))

        logger.info("ML model loaded (simulated mode)")
        return True

    async def detect_disease(self, image_base64: str, crop_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Detect plant disease from base64 encoded image.
        Returns disease detection result.
        """
        start_time = datetime.now()

        try:
            # Decode image
            image_data = self._decode_base64_image(image_base64)

            if image_data is None:
                return self._get_error_result("Invalid image format")

            # Process image (placeholder for actual ML inference)
            # In production, this would run through the actual model
            if ML_AVAILABLE:
                image = Image.open(io.BytesIO(image_data))
                # Preprocess and run inference here
                pass

            # Get simulated or real prediction
            result = self._get_simulated_prediction(crop_type)

            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            result["processing_time_ms"] = int(processing_time)

            return result

        except Exception as e:
            logger.error(f"Disease detection error: {e}")
            return self._get_error_result(str(e))

    def _decode_base64_image(self, base64_string: str) -> Optional[bytes]:
        """Decode base64 image string to bytes."""
        try:
            # Remove data URL prefix if present
            if "base64," in base64_string:
                base64_string = base64_string.split("base64,")[1]

            return base64.b64decode(base64_string)
        except Exception as e:
            logger.error(f"Failed to decode base64: {e}")
            return None

    def _get_simulated_prediction(self, crop_type: Optional[str] = None) -> Dict[str, Any]:
        """Generate simulated disease detection result."""
        # Simulate confidence and disease selection
        is_healthy = random.random() > 0.7  # 30% chance of detecting disease

        if is_healthy:
            return {
                "disease_name": "Healthy",
                "scientific_name": None,
                "confidence": round(random.uniform(85, 95), 1),
                "severity": "low",
                "affected_part": None,
                "description": "The plant appears to be healthy with no visible signs of disease.",
                "symptoms": [],
                "causes": [],
                "treatment_steps": ["Continue regular maintenance and monitoring"],
                "recommended_products": [],
                "prevention_tips": [
                    "Maintain proper irrigation schedule",
                    "Monitor for pests regularly",
                    "Apply balanced fertilizers"
                ],
                "detected_at": datetime.now().isoformat()
            }

        # Select a random disease
        disease_name = random.choice(self.disease_db["diseases"])
        disease_info = self.disease_db["details"].get(disease_name, {})

        return {
            "disease_name": disease_name,
            "scientific_name": disease_info.get("scientific_name"),
            "confidence": round(random.uniform(75, 95), 1),
            "severity": random.choice(["low", "medium", "high"]),
            "affected_part": disease_info.get("affected_part", "Leaves"),
            "description": disease_info.get("description", "A plant disease detected in the image."),
            "symptoms": disease_info.get("symptoms", []),
            "causes": disease_info.get("causes", []),
            "treatment_steps": disease_info.get("treatment", []),
            "recommended_products": disease_info.get("products", []),
            "prevention_tips": disease_info.get("prevention", []),
            "detected_at": datetime.now().isoformat()
        }

    def _get_error_result(self, error_message: str) -> Dict[str, Any]:
        """Return error result."""
        return {
            "disease_name": "Detection Failed",
            "confidence": 0,
            "severity": "low",
            "description": f"Unable to analyze image: {error_message}",
            "symptoms": [],
            "causes": [],
            "treatment_steps": ["Please try again with a clearer image"],
            "recommended_products": [],
            "prevention_tips": [],
            "detected_at": datetime.now().isoformat()
        }

    def _load_disease_database(self) -> Dict[str, Any]:
        """Load disease information database."""
        return {
            "diseases": [
                "Leaf Spot Disease",
                "Early Blight",
                "Late Blight",
                "Powdery Mildew",
                "Root Rot"
            ],
            "details": {
                "Leaf Spot Disease": {
                    "scientific_name": "Cercospora arachidicola",
                    "affected_part": "Leaves",
                    "description": "Leaf spot is a fungal disease that causes circular brown spots on leaves. It spreads through water splashing and can significantly reduce yield if not treated early.",
                    "symptoms": [
                        "Circular brown spots on leaves",
                        "Yellowing around the spots",
                        "Spots may merge forming larger dead areas",
                        "Premature leaf drop"
                    ],
                    "causes": [
                        "Fungal infection (Cercospora species)",
                        "High humidity conditions",
                        "Poor air circulation",
                        "Infected plant debris"
                    ],
                    "treatment": [
                        "Remove and destroy infected leaves",
                        "Apply Mancozeb or Chlorothalonil-based fungicide",
                        "Improve air circulation around plants",
                        "Avoid overhead irrigation"
                    ],
                    "products": [
                        "Mancozeb 75% WP",
                        "Chlorothalonil",
                        "Copper oxychloride"
                    ],
                    "prevention": [
                        "Use disease-resistant varieties",
                        "Practice crop rotation every 2-3 years",
                        "Remove plant debris after harvest",
                        "Ensure proper plant spacing"
                    ]
                },
                "Early Blight": {
                    "scientific_name": "Alternaria solani",
                    "affected_part": "Leaves and stems",
                    "description": "Early blight causes dark, concentric rings on lower leaves. Common in warm, humid conditions.",
                    "symptoms": [
                        "Dark brown spots with concentric rings",
                        "Yellowing of affected leaves",
                        "Stem lesions",
                        "Fruit rot in severe cases"
                    ],
                    "causes": [
                        "Fungal infection (Alternaria species)",
                        "Warm, humid weather",
                        "Stressed plants",
                        "Poor nutrition"
                    ],
                    "treatment": [
                        "Remove infected plant material",
                        "Apply copper-based fungicide",
                        "Ensure adequate nutrition",
                        "Mulch to prevent spore splash"
                    ],
                    "products": [
                        "Copper fungicide",
                        "Mancozeb",
                        "Chlorothalonil"
                    ],
                    "prevention": [
                        "Maintain plant vigor with proper fertilization",
                        "Water at base, avoid wetting foliage",
                        "Rotate crops",
                        "Use clean seed and transplants"
                    ]
                },
                "Powdery Mildew": {
                    "scientific_name": "Erysiphe species",
                    "affected_part": "Leaves and stems",
                    "description": "White powdery growth on leaves and stems. Reduces photosynthesis and weakens plants.",
                    "symptoms": [
                        "White powdery coating on leaves",
                        "Yellowing and browning of leaves",
                        "Stunted growth",
                        "Distorted new growth"
                    ],
                    "causes": [
                        "Fungal infection",
                        "High humidity with dry leaves",
                        "Poor air circulation",
                        "Crowded plantings"
                    ],
                    "treatment": [
                        "Apply sulfur-based fungicide",
                        "Remove heavily infected leaves",
                        "Improve air circulation",
                        "Spray neem oil solution"
                    ],
                    "products": [
                        "Sulfur dust",
                        "Neem oil",
                        "Potassium bicarbonate"
                    ],
                    "prevention": [
                        "Plant resistant varieties",
                        "Ensure good spacing between plants",
                        "Avoid overhead watering",
                        "Remove weeds that can harbor fungus"
                    ]
                },
                "Root Rot": {
                    "scientific_name": "Phytophthora species",
                    "affected_part": "Roots and lower stem",
                    "description": "Root rot causes decay of roots due to fungal infection, often from overwatering or poor drainage.",
                    "symptoms": [
                        "Yellowing and wilting leaves",
                        "Stunted growth",
                        "Soft, brown roots",
                        "Plant easily pulled from soil"
                    ],
                    "causes": [
                        "Waterlogged soil",
                        "Poor drainage",
                        "Fungal pathogens",
                        "Overwatering"
                    ],
                    "treatment": [
                        "Improve drainage immediately",
                        "Reduce watering frequency",
                        "Apply fungicide to soil",
                        "Remove severely affected plants"
                    ],
                    "products": [
                        "Metalaxyl",
                        "Fosetyl-Al",
                        "Trichoderma-based biofungicide"
                    ],
                    "prevention": [
                        "Ensure proper drainage",
                        "Use raised beds if needed",
                        "Avoid overwatering",
                        "Practice crop rotation"
                    ]
                }
            }
        }


# Singleton instance
ml_service = MLService()
