"""
Smart Agriculture Assistant
Arduino Serial Communication Service
"""

import serial
import serial.tools.list_ports
import asyncio
import json
import logging
from typing import Optional, Dict, Any
from datetime import datetime

from config import settings


logger = logging.getLogger(__name__)


class ArduinoService:
    """
    Service for communicating with Arduino via serial port.
    Handles soil sensor data reading and parsing.
    """

    def __init__(self):
        self.serial_connection: Optional[serial.Serial] = None
        self.is_connected = False
        self.port = settings.arduino_port
        self.baud_rate = settings.arduino_baud_rate
        self.timeout = settings.arduino_timeout

    async def connect(self) -> bool:
        """
        Establish serial connection with Arduino.
        Returns True if successful.
        """
        if not settings.arduino_enabled:
            logger.info("Arduino disabled in settings. Using simulated data.")
            return False

        try:
            # List available ports
            available_ports = [port.device for port in serial.tools.list_ports.comports()]
            logger.info(f"Available ports: {available_ports}")

            # Check if configured port exists
            if self.port not in available_ports:
                logger.warning(f"Port {self.port} not found. Available: {available_ports}")
                # Try to auto-detect
                for port in available_ports:
                    if "USB" in port or "ACM" in port or "COM" in port:
                        self.port = port
                        logger.info(f"Auto-detected port: {self.port}")
                        break

            # Open connection
            self.serial_connection = serial.Serial(
                port=self.port,
                baudrate=self.baud_rate,
                timeout=self.timeout
            )

            # Wait for Arduino to reset
            await asyncio.sleep(2)

            self.is_connected = True
            logger.info(f"Connected to Arduino on {self.port}")
            return True

        except serial.SerialException as e:
            logger.error(f"Failed to connect to Arduino: {e}")
            self.is_connected = False
            return False

    def disconnect(self):
        """Close serial connection."""
        if self.serial_connection and self.serial_connection.is_open:
            self.serial_connection.close()
            self.is_connected = False
            logger.info("Disconnected from Arduino")

    async def read_sensor_data(self) -> Dict[str, Any]:
        """
        Read soil sensor data from Arduino.
        Returns parsed JSON data or simulated data if not connected.
        """
        if not self.is_connected or not self.serial_connection:
            return self._get_simulated_data()

        try:
            # Send request command
            self.serial_connection.write(b"READ\n")
            await asyncio.sleep(0.5)

            # Read response
            if self.serial_connection.in_waiting > 0:
                raw_data = self.serial_connection.readline().decode('utf-8').strip()

                # Parse JSON from Arduino
                data = json.loads(raw_data)
                data["timestamp"] = datetime.now().isoformat()
                data["sensor_id"] = "arduino_01"

                logger.debug(f"Sensor data: {data}")
                return data
            else:
                logger.warning("No data received from Arduino")
                return self._get_simulated_data()

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Arduino data: {e}")
            return self._get_simulated_data()
        except Exception as e:
            logger.error(f"Error reading from Arduino: {e}")
            return self._get_simulated_data()

    def _get_simulated_data(self) -> Dict[str, Any]:
        """
        Generate simulated sensor data for testing/demo.
        Used when Arduino is not connected.
        """
        import random

        return {
            "ph": round(random.uniform(6.0, 7.5), 1),
            "moisture": round(random.uniform(35, 65), 1),
            "temperature": round(random.uniform(25, 35), 1),
            "nitrogen": random.randint(25, 45),
            "phosphorus": random.randint(20, 35),
            "potassium": random.randint(30, 50),
            "timestamp": datetime.now().isoformat(),
            "sensor_id": "simulated_01"
        }

    async def send_command(self, command: str) -> str:
        """
        Send a command to Arduino and get response.
        """
        if not self.is_connected or not self.serial_connection:
            return "ERROR: Arduino not connected"

        try:
            self.serial_connection.write(f"{command}\n".encode())
            await asyncio.sleep(0.5)

            if self.serial_connection.in_waiting > 0:
                response = self.serial_connection.readline().decode('utf-8').strip()
                return response
            return "OK"

        except Exception as e:
            logger.error(f"Error sending command: {e}")
            return f"ERROR: {str(e)}"

    def get_status(self) -> Dict[str, Any]:
        """Get Arduino connection status."""
        return {
            "connected": self.is_connected,
            "port": self.port if self.is_connected else None,
            "baud_rate": self.baud_rate,
            "simulated_mode": not self.is_connected
        }


# Singleton instance
arduino_service = ArduinoService()
