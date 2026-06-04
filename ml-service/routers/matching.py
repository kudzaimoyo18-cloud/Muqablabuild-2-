from fastapi import APIRouter, HTTPException
from schemas.matching import SkillMatchInput, SkillMatchResult, EmbedRequest, EmbedResult
from models.skill_embedder import embed_text, compute_skill_match

router = APIRouter()


@router.post("/match", response_model=SkillMatchResult)
async def match_skills(input: SkillMatchInput):
    """Match seeker skills against job requirements using embeddings."""
    try:
        result = await compute_skill_match(
            input.seeker_skills, input.job_skills, input.transcript
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/embed-skills", response_model=EmbedResult)
async def embed_skills(input: EmbedRequest):
    """Generate skill embedding vector for pgvector storage."""
    try:
        embedding = await embed_text(input.text, input.language)
        return EmbedResult(embedding=embedding)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
