from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class AudioChunkInput(BaseModel):
    audio_b64: str
    session_id: str


class CoachingResponse(BaseModel):
    filler_words: list[dict] = []
    speech_pace_wpm: int = 0
    pace_advice: str | None = None
    filler_word_rate: float = 0.0


class FrameInput(BaseModel):
    frame_b64: str


class FrameResponse(BaseModel):
    lighting_score: float = 0.0
    eye_contact_score: float = 0.0
    lighting_advice: str | None = None


@router.post("/coach/audio-chunk", response_model=CoachingResponse)
async def coach_audio(input: AudioChunkInput):
    """Real-time audio coaching: detect filler words and pace."""
    # Placeholder - real impl uses streaming Whisper
    return CoachingResponse(
        filler_words=[],
        speech_pace_wpm=120,
        pace_advice=None,
        filler_word_rate=0.0,
    )


@router.post("/coach/frame", response_model=FrameResponse)
async def coach_frame(input: FrameInput):
    """Real-time frame analysis: lighting and eye contact."""
    # Placeholder - real impl uses MediaPipe
    return FrameResponse(
        lighting_score=75.0,
        eye_contact_score=80.0,
        lighting_advice=None,
    )
