# Muqabla — Video-First Hiring Platform

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Fill in Supabase, Cloudflare, and ML service credentials

# Run development server
npm run dev

# Run ML service (separate terminal)
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 App Router + Tailwind CSS + Framer Motion
- **Backend**: Supabase (Postgres + Auth + Realtime + Edge Functions + pgvector)
- **Video**: Cloudflare Stream (upload, processing, adaptive playback)
- **ML**: FastAPI Python service (Whisper, CAMeL-BERT, MediaPipe, multilingual-e5)
- **Queue**: Trigger.dev (async video processing pipeline)
- **Hosting**: Vercel (web) + separate ML service host

### Route Groups
- `(auth)` — Login, register, onboarding
- `(seeker)` — Mobile-first: feed, record, apply, profile, applications
- `(employer)` — Desktop-first: dashboard, jobs, pipeline, team, analytics

### Database
- Schema in `supabase/migrations/001_initial_schema.sql`
- RLS policies in `supabase/migrations/002_rls_policies.sql`
- Anonymous mode enforced at DB level via RLS, not application code
- pgvector for semantic skill matching

### Video Pipeline
```
Record → CF Stream direct upload → Webhook → Trigger.dev job →
  Step 1: Whisper transcription (Arabic+English)
  Step 2: Sentiment + body language analysis
  Step 3: Skill matching + composite scoring
  Step 4: Realtime notification
```

### ML Service (`ml-service/`)
- FastAPI at `http://localhost:8000`
- Models are stub implementations — wire up real models before production
- Endpoints: `/api/v1/transcribe`, `/analyze`, `/match`, `/composite-score`, `/coach/*`

## Key Conventions

### Gulf Region Context
- Arabic + English bilingual (translations in `src/lib/i18n/`)
- RTL support via `dir` attribute on `<html>`
- Gulf currencies: AED, SAR, QAR, KWD, BHD, OMR
- Gulf cities in location dropdowns

### Anonymous Mode
- Per-job toggle (`job_postings.anonymous_mode`)
- Candidate identity fields masked by Candidates API, not frontend
- Revealed after shortlisting stage

### State Management
- Zustand stores in `src/lib/stores/`
- Server state via Supabase client queries
- URL state for filters and pagination

### File Organization
- Feature-based: `components/seeker/`, `components/employer/`, `components/shared/`
- API routes mirror the data model
- Types in `src/lib/types/domain.ts` and `ml.ts`

## Environment Variables

See `.env.local.example` for all required variables.

**Critical**: Never commit `.env.local` — it contains API keys.

## TODO (Production Readiness)

- [ ] Wire real Whisper model in `ml-service/models/whisper_client.py`
- [ ] Wire real CAMeL-BERT in `ml-service/models/sentiment.py`
- [ ] Wire real MediaPipe in `ml-service/models/body_language.py`
- [ ] Wire real embeddings in `ml-service/models/skill_embedder.py`
- [ ] Set up Trigger.dev jobs (`src/lib/trigger/jobs/`)
- [ ] Implement real-time AI coaching WebSocket
- [ ] Add Supabase Edge Functions for vector search
- [ ] PWA manifest and service worker
- [ ] Employer analytics charts
- [ ] Rate limiting on API routes
- [ ] CF Stream webhook signature verification
- [ ] Content Security Policy headers
