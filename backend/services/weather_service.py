"""
Smart Agriculture Assistant
Weather API Service
"""

import aiohttp
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from config import settings


logger = logging.getLogger(__name__)


class WeatherService:
    """
    Service for fetching weather data from OpenWeatherMap API.
    Provides current weather, forecasts, and agriculture-specific alerts.
    """

    def __init__(self):
        self.api_key = settings.weather_api_key
        self.base_url = settings.weather_api_url
        self.default_location = "Gujarat, India"

    async def get_current_weather(self, location: str = None) -> Dict[str, Any]:
        """
        Fetch current weather for a location.
        Returns simulated data if API key not configured.
        """
        location = location or self.default_location

        if not self.api_key:
            logger.info("Weather API key not configured. Returning simulated data.")
            return self._get_simulated_weather(location)

        try:
            async with aiohttp.ClientSession() as session:
                # Geocoding API to get coordinates
                geo_url = f"http://api.openweathermap.org/geo/1.0/direct"
                params = {
                    "q": location,
                    "limit": 1,
                    "appid": self.api_key
                }

                async with session.get(geo_url, params=params) as response:
                    if response.status != 200:
                        return self._get_simulated_weather(location)

                    geo_data = await response.json()
                    if not geo_data:
                        return self._get_simulated_weather(location)

                    lat = geo_data[0]["lat"]
                    lon = geo_data[0]["lon"]

                # Get current weather
                weather_url = f"{self.base_url}/weather"
                params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": self.api_key,
                    "units": "metric"
                }

                async with session.get(weather_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_weather_response(data, location)
                    else:
                        return self._get_simulated_weather(location)

        except Exception as e:
            logger.error(f"Weather API error: {e}")
            return self._get_simulated_weather(location)

    async def get_forecast(self, location: str = None, days: int = 5) -> Dict[str, Any]:
        """
        Fetch 5-day weather forecast.
        """
        location = location or self.default_location

        if not self.api_key:
            return self._get_simulated_forecast(location, days)

        try:
            async with aiohttp.ClientSession() as session:
                # Geocoding
                geo_url = "http://api.openweathermap.org/geo/1.0/direct"
                params = {"q": location, "limit": 1, "appid": self.api_key}

                async with session.get(geo_url, params=params) as response:
                    if response.status != 200:
                        return self._get_simulated_forecast(location, days)

                    geo_data = await response.json()
                    if not geo_data:
                        return self._get_simulated_forecast(location, days)

                    lat = geo_data[0]["lat"]
                    lon = geo_data[0]["lon"]

                # Forecast API
                forecast_url = f"{self.base_url}/forecast"
                params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": self.api_key,
                    "units": "metric",
                    "cnt": days * 8  # 8 readings per day (3-hour intervals)
                }

                async with session.get(forecast_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_forecast_response(data, location)
                    else:
                        return self._get_simulated_forecast(location, days)

        except Exception as e:
            logger.error(f"Forecast API error: {e}")
            return self._get_simulated_forecast(location, days)

    def generate_agriculture_alerts(self, weather_data: Dict[str, Any]) -> list:
        """
        Generate agriculture-specific alerts based on weather conditions.
        """
        alerts = []

        current = weather_data.get("current", {})

        # Heavy rain alert
        if current.get("rain_chance", 0) > 70:
            alerts.append({
                "alert_type": "rain",
                "title": "Heavy Rain Expected",
                "message": f"Expected rainfall: 40-60mm. High probability of rain.",
                "action": "Delay irrigation for 2 days. Check drainage systems.",
                "severity": "medium"
            })

        # High temperature alert
        if current.get("temp", 0) > 35:
            alerts.append({
                "alert_type": "heat",
                "title": "High Temperature Alert",
                "message": f"Temperature may reach {int(current['temp'])}°C in the afternoon.",
                "action": "Irrigate early morning or evening. Monitor soil moisture closely.",
                "severity": "medium"
            })

        # Wind alert
        if current.get("wind_speed", 0) > 20:
            alerts.append({
                "alert_type": "wind",
                "title": "Moderate Winds Expected",
                "message": f"Wind speeds of {int(current['wind_speed'])} km/h expected.",
                "action": "Avoid pesticide spraying. Wait for wind to settle.",
                "severity": "low"
            })

        return alerts

    def _parse_weather_response(self, data: Dict, location: str) -> Dict[str, Any]:
        """Parse OpenWeatherMap response into our format."""
        return {
            "location": location,
            "current": {
                "temp": data["main"]["temp"],
                "feels_like": data["main"]["feels_like"],
                "humidity": data["main"]["humidity"],
                "wind_speed": data["wind"]["speed"],
                "rain_chance": int(data.get("pop", 0) * 100) if "pop" in data else 20,
                "uv_index": 6,  # Requires separate UV API call
                "description": data["weather"][0]["description"].title(),
                "icon": self._map_weather_icon(data["weather"][0]["icon"])
            },
            "fetched_at": datetime.now().isoformat()
        }

    def _parse_forecast_response(self, data: Dict, location: str) -> Dict[str, Any]:
        """Parse forecast response into daily summaries."""
        # Group by day and create daily summaries
        daily_forecasts = []
        seen_dates = set()

        for item in data["list"]:
            date = datetime.fromtimestamp(item["dt"]).strftime("%Y-%m-%d")

            if date not in seen_dates:
                seen_dates.add(date)
                daily_forecasts.append({
                    "day": datetime.fromtimestamp(item["dt"]).strftime("%A"),
                    "date": datetime.fromtimestamp(item["dt"]).strftime("%b %d"),
                    "temp_high": item["main"]["temp_max"],
                    "temp_low": item["main"]["temp_min"],
                    "icon": self._map_weather_icon(item["weather"][0]["icon"]),
                    "description": item["weather"][0]["description"].title(),
                    "humidity": item["main"]["humidity"],
                    "wind_speed": item["wind"]["speed"]
                })

            if len(daily_forecasts) >= 5:
                break

        return {
            "location": location,
            "forecast": daily_forecasts,
            "fetched_at": datetime.now().isoformat()
        }

    def _map_weather_icon(self, owm_icon: str) -> str:
        """Map OpenWeatherMap icon codes to our icon names."""
        icon_map = {
            "01d": "sun",
            "01n": "moon",
            "02d": "cloud-sun",
            "02n": "cloud-moon",
            "03d": "cloud",
            "03n": "cloud",
            "04d": "cloud",
            "04n": "cloud",
            "09d": "cloud-showers-heavy",
            "09n": "cloud-showers-heavy",
            "10d": "cloud-sun-rain",
            "10n": "cloud-moon-rain",
            "11d": "cloud-bolt",
            "11n": "cloud-bolt",
            "13d": "snowflake",
            "13n": "snowflake",
            "50d": "smog",
            "50n": "smog"
        }
        return icon_map.get(owm_icon, "cloud")

    def _get_simulated_weather(self, location: str) -> Dict[str, Any]:
        """Generate simulated weather data for testing."""
        return {
            "location": location,
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
            "fetched_at": datetime.now().isoformat()
        }

    def _get_simulated_forecast(self, location: str, days: int) -> Dict[str, Any]:
        """Generate simulated forecast data."""
        base_date = datetime.now()
        forecast = []

        for i in range(days):
            date = base_date + timedelta(days=i)
            forecast.append({
                "day": date.strftime("%A") if i > 0 else "Today",
                "date": date.strftime("%b %d"),
                "temp_high": 30 + i % 3,
                "temp_low": 24 + i % 2,
                "icon": "cloud-sun" if i % 2 == 0 else "cloud-showers-heavy",
                "description": "Partly Cloudy" if i % 2 == 0 else "Heavy Rain",
                "humidity": 60 + (i * 5),
                "wind_speed": 10 + i
            })

        return {
            "location": location,
            "forecast": forecast,
            "fetched_at": datetime.now().isoformat()
        }


# Singleton instance
weather_service = WeatherService()
