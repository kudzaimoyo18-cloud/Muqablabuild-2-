"""Whisper large-v3 client for Arabic+English transcription."""
import httpx

# In production: use OpenAI Whisper API or self-hosted faster-whisper
WHISPER_API_URL = "https://api.openai.com/v1/audio/transcriptions"


async def transcribe_video(cf_uid: str, language_hint: str = "auto") -> dict:
    """Download video from CF Stream and transcribe with Whisper.

    In production:
    1. Fetch video URL from CF Stream API
    2. Download audio track
    3. Run Whisper large-v3 (supports Arabic + English code-switching)
    4. Return transcript with word-level timings
    """
    # Placeholder implementation
    return {
        "video_id": cf_uid,
        "language_detected": language_hint if language_hint != "auto" else "en",
        "transcript_en": "Placeholder transcript - Whisper integration pending",
        "transcript_ar": None,
        "word_timings": [],
    }
