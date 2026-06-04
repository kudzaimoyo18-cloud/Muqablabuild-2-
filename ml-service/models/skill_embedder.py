"""Skill embedding using multilingual-e5-large."""
from typing import Optional


async def embed_text(text: str, language: str = "en") -> list[float]:
    """Generate 1536-dim embedding for skill text.

    In production:
    - Use intfloat/multilingual-e5-large (Arabic+English)
    - Or OpenAI text-embedding-ada-002 as fallback
    - Cache embeddings for common skills
    """
    # Placeholder: return zero vector
    return [0.0] * 1536


async def compute_skill_match(
    seeker_skills: list[str],
    job_skills: list[str],
    transcript: str = "",
) -> dict:
    """Match seeker skills against job requirements.

    In production:
    1. Embed seeker skills as single vector
    2. Embed job requirements as single vector
    3. Compute cosine similarity
    4. Also extract skills mentioned in transcript
    5. Compute matched vs missing skills
    """
    seeker_set = set(s.lower() for s in seeker_skills)
    job_set = set(s.lower() for s in job_skills)

    matched = seeker_set & job_set
    missing = job_set - seeker_set

    match_score = (len(matched) / max(len(job_set), 1)) * 100

    return {
        "match_score": round(match_score, 2),
        "matched_skills": list(matched),
        "missing_skills": list(missing),
    }
