from fastapi import APIRouter, HTTPException
from schemas.video import VideoInput, TranscriptionResult
from models.whisper_client import transcribe_video

router = APIRouter()


@router.post("/transcribe", response_model=TranscriptionResult)
async def transcribe(input: VideoInput):
    """Transcribe video audio using Whisper large-v3.
    Supports Arabic, English, and code-switching."""
    try:
        result = await transcribe_video(input.cf_uid, input.language_hint)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
