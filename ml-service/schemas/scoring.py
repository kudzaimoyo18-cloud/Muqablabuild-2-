from pydantic import BaseModel

class BiasFlag(BaseModel):
    type: str
    severity: str
    offset_secs: float

class VideoAnalysisInput(BaseModel):
    cf_uid: str
    transcript: str
    word_timings: list = []

class VideoAnalysisResult(BaseModel):
    video_id: str
    quality_score: float
    confidence_score: float
    sentiment_score: float
    body_language_score: float
    eye_contact_score: float
    lighting_score: float
    speech_pace_wpm: int
    filler_word_rate: float
    bias_flags: list[BiasFlag] = []
    transcript: str
    transcript_ar: str | None = None

class CompositeScoreInput(BaseModel):
    application_id: str
    video_scores: VideoAnalysisResult
    match_score: float

class CompositeScore(BaseModel):
    application_id: str
    ai_score: float
    breakdown: dict
