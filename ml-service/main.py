from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import transcription, scoring, matching, coaching

app = FastAPI(
    title="Muqabla ML Service",
    description="Video analysis, transcription, and scoring for Muqabla hiring platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcription.router, prefix="/api/v1", tags=["transcription"])
app.include_router(scoring.router, prefix="/api/v1", tags=["scoring"])
app.include_router(matching.router, prefix="/api/v1", tags=["matching"])
app.include_router(coaching.router, prefix="/api/v1", tags=["coaching"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "muqabla-ml"}
