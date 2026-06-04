from pydantic import BaseModel

class SkillMatchInput(BaseModel):
    seeker_skills: list[str]
    job_skills: list[str]
    transcript: str = ""

class SkillMatchResult(BaseModel):
    match_score: float
    matched_skills: list[str]
    missing_skills: list[str]

class EmbedRequest(BaseModel):
    text: str
    language: str = "en"

class EmbedResult(BaseModel):
    embedding: list[float]
