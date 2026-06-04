from fastapi import APIRouter, HTTPException
from schemas.scoring import (
    VideoAnalysisInput,
    VideoAnalysisResult,
    CompositeScoreInput,
    CompositeScore,
)
from models.sentiment import analyze_sentiment
from models.body_language import analyze_body_language

router = APIRouter()

COMPOSITE_WEIGHTS = {
    "video_quality": 0.10,
    "confidence": 0.25,
    "sentiment": 0.15,
    "body_language": 0.20,
    "skill_match": 0.30,
}


@router.post("/analyze", response_model=VideoAnalysisResult)
async def analyze_video(input: VideoAnalysisInput):
    """Full video analysis: sentiment, body language, quality scoring."""
    try:
        sentiment = await analyze_sentiment(input.transcript)
        body = await analyze_body_language(input.cf_uid)

        # Compute filler words
        filler_words = ["um", "uh", "like", "you know", "basically", "actually"]
        words = input.transcript.lower().split()
        filler_count = sum(1 for w in words if w in filler_words)
        total_words = max(len(words), 1)
        filler_rate = filler_count / total_words

        # Speech pace (rough estimate)
        wpm = total_words  # Assumes ~1 min video; real impl uses word_timings

        return VideoAnalysisResult(
            video_id="",  # Set by caller
            quality_score=body.get("lighting_score", 70),
            confidence_score=sentiment.get("confidence", 70),
            sentiment_score=sentiment.get("positivity", 70),
            body_language_score=body.get("overall", 70),
            eye_contact_score=body.get("eye_contact", 70),
            lighting_score=body.get("lighting_score", 70),
            speech_pace_wpm=wpm,
            filler_word_rate=filler_rate,
            bias_flags=[],
            transcript=input.transcript,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/composite-score", response_model=CompositeScore)
async def composite_score(input: CompositeScoreInput):
    """Compute weighted composite score for ranking candidates."""
    scores = input.video_scores
    breakdown = {
        "video_quality": scores.quality_score,
        "confidence": scores.confidence_score,
        "sentiment": scores.sentiment_score,
        "body_language": scores.body_language_score,
        "skill_match": input.match_score,
    }

    ai_score = sum(
        breakdown[k] * COMPOSITE_WEIGHTS[k] for k in COMPOSITE_WEIGHTS
    )

    return CompositeScore(
        application_id=input.application_id,
        ai_score=round(ai_score, 2),
        breakdown=breakdown,
    )
