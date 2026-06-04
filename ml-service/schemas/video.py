from pydantic import BaseModel

class VideoInput(BaseModel):
    cf_uid: str
    language_hint: str = "auto"

class WordTiming(BaseModel):
    word: str
    start_secs: float
    end_secs: float
    confidence: float

class TranscriptionResult(BaseModel):
    video_id: str
    language_detected: str
    transcript_en: str
    transcript_ar: str | None = None
    word_timings: list[WordTiming] = []
