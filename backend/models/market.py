"""
Smart Agriculture Assistant
Market & Profit Models
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class PriceSource(str, Enum):
    GOVT_MANDI = "govt_mandi"
    PRIVATE_BUYER = "private_buyer"
    LOCAL_MARKET = "local_market"


class MarketPrice(BaseModel):
    """Market price for a crop"""

    crop_name: str
    price_per_quintal: float = Field(..., description="Price in INR per quintal")
    source: PriceSource
    source_name: str = Field(..., description="Name of mandi/buyer/market")
    location: Optional[str] = None
    last_updated: datetime = Field(default_factory=datetime.now)
    price_change: Optional[float] = Field(None, description="Change from previous day")

    class Config:
        json_schema_extra = {
            "example": {
                "crop_name": "Groundnut",
                "price_per_quintal": 5250.0,
                "source": "govt_mandi",
                "source_name": "Rajkot APMC",
                "location": "Rajkot, Gujarat",
                "last_updated": "2024-01-15T08:00:00",
                "price_change": 50.0
            }
        }


class PriceTrend(BaseModel):
    """7-day price trend"""

    crop_name: str
    prices: list[dict] = Field(..., description="List of {date, price} objects")
    trend: str = Field(..., description="upward, downward, stable")
    average_price: float
    min_price: float
    max_price: float


class ProfitCalculation(BaseModel):
    """Profit calculation request and result"""

    crop_name: str
    expected_yield_quintals: float
    selling_price_per_quintal: float
    cultivation_cost: float = Field(default=0)
    transportation_cost: float = Field(default=0)
    other_costs: float = Field(default=0)

    # Calculated results
    total_revenue: Optional[float] = None
    total_costs: Optional[float] = None
    net_profit: Optional[float] = None
    profit_margin_percent: Optional[float] = None
    recommendation: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "crop_name": "Groundnut",
                "expected_yield_quintals": 20.0,
                "selling_price_per_quintal": 5250.0,
                "cultivation_cost": 50000.0,
                "transportation_cost": 5000.0,
                "other_costs": 2000.0,
                "total_revenue": 105000.0,
                "total_costs": 57000.0,
                "net_profit": 48000.0,
                "profit_margin_percent": 45.7,
                "recommendation": "Selling to Government Mandi offers the best return."
            }
        }
