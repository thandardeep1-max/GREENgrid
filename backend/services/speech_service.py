"""
Smart Agriculture Assistant
Google Cloud Speech Integration Service
"""

import logging
import base64
from typing import Optional, Dict, Any

from config import settings


logger = logging.getLogger(__name__)


class SpeechService:
    """
    Service for Speech-to-Text and Text-to-Speech using Google Cloud.
    Supports Hindi and English languages.
    """

    def __init__(self):
        self.project_id = settings.google_cloud_project_id
        self.credentials_path = settings.google_credentials_path
        self.speech_client = None
        self.tts_client = None

        # Language codes
        self.languages = {
            "en": "en-IN",  # English (India)
            "hi": "hi-IN"   # Hindi (India)
        }

    def initialize(self):
        """Initialize Google Cloud clients."""
        if not self.credentials_path:
            logger.warning("Google Cloud credentials not configured. Speech features will be limited.")
            return False

        try:
            from google.cloud import speech_v1
            from google.cloud import texttospeech_v1

            self.speech_client = speech_v1.SpeechClient()
            self.tts_client = texttospeech_v1.TextToSpeechClient()

            logger.info("Google Cloud Speech clients initialized")
            return True

        except ImportError:
            logger.warning("Google Cloud libraries not installed. Install with: pip install google-cloud-speech google-cloud-texttospeech")
            return False
        except Exception as e:
            logger.error(f"Failed to initialize Google Cloud clients: {e}")
            return False

    async def transcribe_audio(
        self,
        audio_content: bytes,
        language: str = "hi",
        sample_rate: int = 16000
    ) -> Dict[str, Any]:
        """
        Convert speech to text using Google Cloud Speech-to-Text.

        Args:
            audio_content: Raw audio bytes (WAV/FLAC/MP3)
            language: Language code ('en' or 'hi')
            sample_rate: Audio sample rate in Hz

        Returns:
            Dictionary with transcript and confidence
        """
        if not self.speech_client:
            return self._get_simulated_transcript(language)

        try:
            from google.cloud import speech_v1

            # Configure recognition
            config = speech_v1.RecognitionConfig(
                encoding=speech_v1.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=sample_rate,
                language_code=self.languages.get(language, "hi-IN"),
                enable_automatic_punctuation=True,
                model="default"
            )

            # Perform transcription
            response = self.speech_client.recognize(
                config=config,
                audio={"content": audio_content}
            )

            # Extract results
            if response.results:
                alternative = response.results[0].alternatives[0]
                return {
                    "transcript": alternative.transcript,
                    "confidence": alternative.confidence,
                    "language": language,
                    "success": True
                }

            return {
                "transcript": "",
                "confidence": 0,
                "language": language,
                "success": False,
                "error": "No speech detected"
            }

        except Exception as e:
            logger.error(f"Speech transcription error: {e}")
            return {
                "transcript": "",
                "confidence": 0,
                "language": language,
                "success": False,
                "error": str(e)
            }

    async def synthesize_speech(
        self,
        text: str,
        language: str = "hi",
        gender: str = "female"
    ) -> bytes:
        """
        Convert text to speech using Google Cloud Text-to-Speech.

        Args:
            text: Text to convert to speech
            language: Language code ('en' or 'hi')
            gender: Voice gender ('male' or 'female')

        Returns:
            Audio content as bytes (MP3)
        """
        if not self.tts_client:
            return self._get_simulated_speech(text)

        try:
            from google.cloud import texttospeech_v1

            # Select voice
            voice_name = "hi-IN-Wavenet-A" if language == "hi" else "en-IN-Wavenet-A"
            ssml_gender = (
                texttospeech_v1.SsmlVoiceGender.FEMALE
                if gender == "female"
                else texttospeech_v1.SsmlVoiceGender.MALE
            )

            # Configure synthesis
            synthesis_input = texttospeech_v1.SynthesisInput(text=text)
            voice = texttospeech_v1.VoiceSelectionParams(
                language_code=self.languages.get(language, "hi-IN"),
                name=voice_name,
                ssml_gender=ssml_gender
            )
            audio_config = texttospeech_v1.AudioConfig(
                audio_encoding=texttospeech_v1.AudioEncoding.MP3
            )

            # Generate speech
            response = self.tts_client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )

            return response.audio_content

        except Exception as e:
            logger.error(f"Speech synthesis error: {e}")
            return b""

    def _get_simulated_transcript(self, language: str) -> Dict[str, Any]:
        """Generate simulated transcript for testing."""
        simulated_responses = {
            "hi": [
                "आज मौसम कैसा है",
                "मिट्टी जांचें",
                "फसल सिफारिश दिखाओ",
                "कैलेंडर खोलो"
            ],
            "en": [
                "How is the weather today",
                "Test soil",
                "Show crop recommendations",
                "Open calendar"
            ]
        }

        import random
        transcripts = simulated_responses.get(language, simulated_responses["hi"])

        return {
            "transcript": random.choice(transcripts),
            "confidence": random.uniform(0.85, 0.98),
            "language": language,
            "success": True,
            "simulated": True
        }

    def _get_simulated_speech(self, text: str) -> bytes:
        """Return placeholder for simulated speech."""
        logger.info(f"[Simulated TTS] Would speak: {text}")
        return b"SIMULATED_AUDIO"

    def process_voice_command(self, transcript: str) -> Dict[str, Any]:
        """
        Process voice command and return appropriate action.
        Supports Hindi and English commands.
        """
        transcript_lower = transcript.lower()

        # Command patterns
        commands = {
            # Hindi commands
            "मिट्टी": {"action": "navigate", "page": "soil-testing.html"},
            "फसल": {"action": "navigate", "page": "crop-recommendation.html"},
            "कैलेंडर": {"action": "navigate", "page": "crop-calendar.html"},
            "मौसम": {"action": "navigate", "page": "weather.html"},
            "रोग": {"action": "navigate", "page": "disease-detection.html"},
            "बाजार": {"action": "navigate", "page": "market-profit.html"},
            "होम": {"action": "navigate", "page": "index.html"},

            # English commands
            "soil": {"action": "navigate", "page": "soil-testing.html"},
            "crop": {"action": "navigate", "page": "crop-recommendation.html"},
            "calendar": {"action": "navigate", "page": "crop-calendar.html"},
            "weather": {"action": "navigate", "page": "weather.html"},
            "disease": {"action": "navigate", "page": "disease-detection.html"},
            "market": {"action": "navigate", "page": "market-profit.html"},
            "home": {"action": "navigate", "page": "index.html"}
        }

        # Find matching command
        for keyword, action in commands.items():
            if keyword in transcript_lower:
                return {
                    "success": True,
                    "transcript": transcript,
                    "action": action
                }

        return {
            "success": False,
            "transcript": transcript,
            "action": {"action": "unknown", "message": "Command not recognized. Please try again."},
            "suggestions": [
                "मिट्टी जांचें (Test soil)",
                "फसल सिफारिश (Crop recommendation)",
                "मौसम देखें (Check weather)",
                "कैलेंडर खोलें (Open calendar)"
            ]
        }


# Singleton instance
speech_service = SpeechService()
