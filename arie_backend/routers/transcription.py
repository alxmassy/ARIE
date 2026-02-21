"""
Transcription Router — Accepts audio uploads and returns text via Gemini.

Uses Gemini's multimodal audio input to transcribe recordings in any language.
"""

import os
import logging
import tempfile

from fastapi import APIRouter, File, UploadFile, Query
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

client = genai.Client(api_key=GEMINI_API_KEY)

router = APIRouter(prefix="/api", tags=["Transcription"])


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    lang: str = Query("en", pattern="^(en|hi)$"),
):
    """
    Accept an audio file and return transcribed text using Gemini.

    Query params:
        lang: "en" for English, "hi" for Hindi/Hinglish
    """
    audio_bytes = await audio.read()

    if not audio_bytes or len(audio_bytes) < 100:
        return {"text": "", "error": "Audio too short"}

    # Determine MIME type from upload
    content_type = audio.content_type or "audio/webm"

    lang_hint = "Hindi or Hinglish" if lang == "hi" else "English"

    try:
        result = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Content(
                    parts=[
                        types.Part.from_bytes(
                            data=audio_bytes,
                            mime_type=content_type,
                        ),
                        types.Part.from_text(
                            text=f"Transcribe this audio recording exactly as spoken. "
                            f"The speaker is likely using {lang_hint}. "
                            f"Return ONLY the transcribed text, nothing else. "
                            f"If there is no speech or the audio is unclear, return an empty string."
                        ),
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                temperature=0.1,
            ),
        )

        transcript = result.text.strip() if result.text else ""
        return {"text": transcript}

    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        return {"text": "", "error": str(e)}
