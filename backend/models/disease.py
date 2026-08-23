"""
Smart Agriculture Assistant
Plant Disease Detection API
"""

import os
import json
import base64
import time

import numpy as np
import tensorflow as tf

from PIL import Image
from io import BytesIO

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ------------------------------------------------------------
# IMPORTANT:
# Change this path if your Model folder is somewhere else.
#
# Expected structure:
#
# GreenGrid/
# ├── Model/
# │   └── Plant_Disease/
# │       ├── plant_disease_model.keras
# │       └── class_names.json
# │
# └── <this Python file>
# ------------------------------------------------------------

MODEL_PATH = os.path.join(
    BASE_DIR,
    "Model",
    "Plant_Disease",
    "plant_disease_model.keras"
)

CLASS_NAMES_PATH = os.path.join(
    BASE_DIR,
    "Model",
    "Plant_Disease",
    "class_names.json"
)

IMG_SIZE = (224, 224)


# ============================================================
# SEVERITY
# ============================================================

class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# ============================================================
# REQUEST MODEL
# ============================================================

class DiseaseDetectionRequest(BaseModel):
    """Request for disease detection"""

    image_base64: str = Field(
        ...,
        description="Base64 encoded image"
    )

    crop_type: Optional[str] = Field(
        None,
        description="Type of crop"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "image_base64": "data:image/jpeg;base64,/9j/4AAQ...",
                "crop_type": "tomato"
            }
        }


# ============================================================
# RESPONSE MODEL
# ============================================================

class DiseaseDetectionResult(BaseModel):
    """Disease detection result"""

    disease_name: str

    scientific_name: Optional[str] = None

    confidence: float = Field(
        ...,
        ge=0,
        le=100,
        description="Confidence percentage"
    )

    severity: Severity

    affected_part: Optional[str] = None

    description: str

    symptoms: list[str] = []

    causes: list[str] = []

    treatment_steps: list[str] = []

    recommended_products: list[str] = []

    prevention_tips: list[str] = []

    detected_at: datetime = Field(
        default_factory=datetime.now
    )

    processing_time_ms: Optional[int] = None


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="GreenGrid Plant Disease Detection API",
    description="AI-powered plant disease detection using MobileNetV2",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# LOAD MODEL
# ============================================================

print("\n==============================================")
print("     GREEN GRID DISEASE DETECTION API")
print("==============================================")

print("\nLoading model...")

if not os.path.exists(MODEL_PATH):

    print("ERROR: Model not found!")
    print("Expected location:")
    print(MODEL_PATH)

    model = None

else:

    model = tf.keras.models.load_model(
        MODEL_PATH
    )

    print("Model loaded successfully!")


# ============================================================
# LOAD CLASS NAMES
# ============================================================

if not os.path.exists(CLASS_NAMES_PATH):

    print("ERROR: class_names.json not found!")
    print("Expected location:")
    print(CLASS_NAMES_PATH)

    class_names = []

else:

    with open(CLASS_NAMES_PATH, "r") as f:

        class_names = json.load(f)

    print(
        f"Loaded {len(class_names)} disease classes."
    )


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def decode_base64_image(image_base64: str):

    """
    Converts a Base64 image into a PIL image.
    Supports:
    data:image/jpeg;base64,...
    data:image/png;base64,...
    """

    try:

        # Remove data URL prefix if present

        if "," in image_base64:

            image_base64 = image_base64.split(
                ",",
                1
            )[1]

        image_bytes = base64.b64decode(
            image_base64
        )

        image = Image.open(
            BytesIO(image_bytes)
        )

        return image.convert("RGB")

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Invalid image data: {str(e)}"
        )


def format_prediction(predicted_class):

    """
    Converts:

    Tomato___Early_blight

    into:

    Tomato
    Early blight
    """

    if "___" in predicted_class:

        crop, disease = predicted_class.split(
            "___",
            1
        )

    else:

        crop = "Unknown"
        disease = predicted_class


    crop = crop.replace(
        "_",
        " "
    )

    disease = disease.replace(
        "_",
        " "
    )

    crop = " ".join(
        crop.split()
    )

    disease = " ".join(
        disease.split()
    )

    return crop, disease


def predict_disease(image):

    """
    Runs the trained MobileNetV2 model.
    """

    if model is None:

        raise HTTPException(
            status_code=500,
            detail="Disease detection model is not loaded."
        )


    # Resize

    image = image.resize(
        IMG_SIZE
    )


    # Convert to NumPy

    image_array = np.array(
        image,
        dtype=np.float32
    )


    # Add batch dimension

    image_array = np.expand_dims(
        image_array,
        axis=0
    )


    # Prediction

    predictions = model.predict(
        image_array,
        verbose=0
    )


    # Highest probability

    predicted_index = int(
        np.argmax(
            predictions[0]
        )
    )


    predicted_class = class_names[
        predicted_index
    ]


    confidence = (
        float(
            predictions[0][predicted_index]
        )
        * 100
    )


    crop, disease = format_prediction(
        predicted_class
    )


    return crop, disease, confidence


# ============================================================
# DISEASE INFORMATION
# ============================================================

def get_disease_information(
    crop,
    disease
):

    """
    Basic information layer.

    The ML model identifies the disease.
    This function provides additional information
    that can later be expanded into a complete
    agriculture knowledge base.
    """

    disease_lower = disease.lower()


    # --------------------------------------------------------
    # Powdery mildew
    # --------------------------------------------------------

    if "powdery mildew" in disease_lower:

        return {
            "severity": Severity.MEDIUM,

            "affected_part": "Leaves",

            "description":
                "A fungal disease that produces white "
                "powdery growth on the surface of leaves.",

            "symptoms": [
                "White powdery patches on leaves",
                "Leaf yellowing",
                "Reduced plant growth"
            ],

            "causes": [
                "Fungal infection",
                "High humidity",
                "Poor air circulation"
            ],

            "treatment_steps": [
                "Remove heavily infected leaves",
                "Improve air circulation",
                "Use an appropriate fungicide according "
                "to local agricultural guidance"
            ],

            "recommended_products": [],

            "prevention_tips": [
                "Maintain proper spacing between plants",
                "Avoid excessive humidity",
                "Remove infected plant material"
            ]
        }


    # --------------------------------------------------------
    # Generic fallback
    # --------------------------------------------------------

    return {

        "severity": Severity.MEDIUM,

        "affected_part": "Leaves",

        "description":
            f"The model detected {disease} in {crop}. "
            "Further field inspection is recommended "
            "to confirm the diagnosis.",

        "symptoms": [],

        "causes": [],

        "treatment_steps": [
            "Inspect the affected plant carefully",
            "Remove severely damaged plant material",
            "Consult local agricultural guidance "
            "before applying treatment"
        ],

        "recommended_products": [],

        "prevention_tips": [
            "Maintain good field hygiene",
            "Monitor plants regularly",
            "Avoid excessive moisture on foliage"
        ]
    }


# ============================================================
# API ROUTES
# ============================================================

@app.get("/")
def home():

    return {
        "status": "online",
        "service": "GreenGrid Plant Disease Detection",
        "model": "MobileNetV2",
        "classes": len(class_names)
    }


# ------------------------------------------------------------
# Health
# ------------------------------------------------------------

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "classes": len(class_names)
    }


# ------------------------------------------------------------
# PREDICT
# ------------------------------------------------------------

@app.post(
    "/predict",
    response_model=DiseaseDetectionResult
)
def detect_disease(
    request: DiseaseDetectionRequest
):

    start_time = time.time()


    # Decode image

    image = decode_base64_image(
        request.image_base64
    )


    # Predict

    crop, disease, confidence = predict_disease(
        image
    )


    # Disease information

    information = get_disease_information(
        crop,
        disease
    )


    # Processing time

    processing_time = int(
        (time.time() - start_time)
        * 1000
    )


    # Final response

    result = DiseaseDetectionResult(

        disease_name=disease,

        confidence=round(
            confidence,
            2
        ),

        severity=information["severity"],

        affected_part=information[
            "affected_part"
        ],

        description=information[
            "description"
        ],

        symptoms=information[
            "symptoms"
        ],

        causes=information[
            "causes"
        ],

        treatment_steps=information[
            "treatment_steps"
        ],

        recommended_products=information[
            "recommended_products"
        ],

        prevention_tips=information[
            "prevention_tips"
        ],

        processing_time_ms=processing_time
    )


    return result


# ============================================================
# RUN DIRECTLY
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )
