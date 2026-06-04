# Muqabla — مقابلة

**Video-first hiring platform for the Gulf region.**

Muqabla replaces the traditional resume-based job application with short video pitches. Job seekers record skill videos and swipe through jobs like TikTok. Employers get an AI-powered HR dashboard that ranks candidates by video analysis — not just keywords on a PDF.

---

## Why Muqabla Exists

The Gulf hiring market (UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman) is booming — Vision 2030, Emiratization quotas, massive private sector growth. But hiring tools are stuck in 2010:

- **Bayt.com, GulfTalent, LinkedIn** are resume walls. Personality, communication, and culture fit — the things that actually matter for hospitality, retail, and customer-facing roles — are invisible.
- **TikTok penetration in the Gulf is 70%+.** People already know how to make short videos. Zero behavior change needed.
- **Arabic+English code-switching** is standard in Gulf workplaces. No existing hiring AI handles this well.
- **Unconscious bias** in hiring is a real problem. Anonymous mode lets employers evaluate talent before seeing names or nationalities.

Muqabla fixes all of this.

---

## What Job Seekers Get

### TikTok-Style Job Feed
Swipe vertically through job listings. Each card shows the company name, role, location, salary range, required skills, and a match percentage. Jobs with video descriptions from the employer play inline.

### Video Portfolio
Instead of a resume, seekers build a portfolio of short videos (15 seconds to 3 minutes). Each video is tagged with skills — "React Development," "Team Leadership," "Arabic Communication." When applying, seekers pick which videos match the job's requirements.

### Smart Recording
The built-in recorder includes:
- **Guided prompts** — "Tell us about yourself," "Walk us through a recent project," "Why are you looking for a new opportunity?" Prompts appear in both English and Arabic.
- **AI coaching** (coming) — Real-time tips on lighting, speaking pace, filler words, and eye contact while recording.

### One-Tap Apply
See a job you like? Tap "Apply with Video," select the relevant videos from your portfolio, add an optional note, and submit. The employer gets your video pitch immediately — no cover letter needed.

### Application Tracking
Track every application's status: Applied → Under Review → Shortlisted → Interview → Offer. Real-time notifications when your status changes.

---

## What Employers Get

### HR Dashboard
A clean desktop interface showing:
- Open roles count
- Total applications received
- Applications pending review
- Shortlisted candidates
- Recent application feed with AI scores

### Job Posting with Video JD
Post jobs with a video job description — candidates see your company culture, not just bullet points. Each posting includes:
- Title (English + Arabic)
- Description
- Required skills (tag selector)
- Location (Gulf cities)
- Salary range (AED, SAR, QAR, KWD, BHD, OMR)
- Remote toggle
- **Anonymous Mode** toggle

### Anonymous Mode
When enabled, candidate names, photos, and nationalities are hidden during review. Employers evaluate purely on video content, skills, and AI scores. Identity is revealed only after shortlisting. This directly addresses Gulf-region diversity mandates and reduces unconscious bias.

### AI-Ranked Candidate Queue
Every application video is analyzed by the ML engine. Candidates are ranked by a composite AI score based on:
- **Skill match** — How well the candidate's skills align with the job requirements (NLP + vector similarity)
- **Confidence** — Voice pattern analysis for confidence and clarity
- **Sentiment** — Positivity, enthusiasm, anxiety markers
- **Body language** — Eye contact, posture, gestures (via MediaPipe)
- **Video quality** — Lighting, audio clarity, framing

Employers see the top candidates first. No more scrolling through 200 identical resumes.

### Team Collaboration
Multiple HR team members can:
- Rate candidates (1-5 stars)
- Leave comments on video applications
- Shortlist candidates
- See each other's ratings and notes in real time

### Hiring Pipeline (Kanban)
Drag-and-drop kanban board with six stages:
1. **Applied** — New applications land here
2. **Reviewed** — HR has watched the video
3. **Shortlisted** — Candidate is a strong fit
4. **Interview** — Scheduled for live interview
5. **Offer** — Offer extended
6. **Rejected** — Not moving forward

Moving a candidate to a new stage automatically notifies them.

---

## ML Engine

The machine learning backend (FastAPI/Python) processes every uploaded video through a pipeline:

### Speech-to-Text
- **Whisper large-v3** for transcription
- Handles Arabic, English, and Arabic-English code-switching (common in Gulf workplaces)
- Word-level timing for filler word detection

### Sentiment & Confidence Analysis
- **CAMeL-Lab Arabic BERT** for Arabic-specific sentiment (outperforms multilingual models on Gulf dialect)
- Detects confidence, positivity, and anxiety markers from speech patterns

### Body Language Analysis
- **MediaPipe Pose + Face Mesh** extracts:
  - Eye contact percentage
  - Posture score
  - Head movement stability
  - Gesture frequency
- Runs server-side on extracted frames — no GPU required for basic analysis

### Skill Matching
- **multilingual-e5-large** generates embeddings for both job requirements and candidate skills
- Cosine similarity via **pgvector** in Postgres
- Also extracts skills mentioned in video transcripts that the candidate didn't explicitly list

### Composite Scoring
Weighted formula combining all signals:
| Signal | Weight |
|--------|--------|
| Skill match | 30% |
| Confidence | 25% |
| Body language | 20% |
| Sentiment | 15% |
| Video quality | 10% |

### Bias Detection
Flags patterns in reviewer behavior — if a reviewer consistently rates candidates from certain demographics lower, the system surfaces this for awareness.

### Real-Time AI Coaching (Coming)
During recording, the app streams audio chunks and video frames to the ML service for instant feedback:
- Filler word alerts
- Pace meter (too fast / too slow)
- Lighting quality indicator
- Eye contact reminder

---

## Technical Architecture

### Frontend
- **Next.js 15** (App Router) with **Turbopack**
- **Tailwind CSS** for styling
- **Framer Motion** for animations (feed swipe, nav cursor, page transitions)
- **Zustand** for client state (feed position, notifications, application form)
- Route groups: `(auth)`, `(seeker)`, `(employer)`, `admin`
- Mobile-first PWA for seekers, desktop-first for employers

### Backend
- **Supabase** (Postgres 17 + Auth + Realtime + Edge Functions)
- 13 database tables with Row Level Security
- **pgvector** extension for semantic skill matching
- Realtime subscriptions for notifications, application updates, team comments
- Database trigger auto-creates profile on signup (handles both email and OAuth)

### Video Infrastructure
- **Cloudflare Stream** for video upload, processing, and adaptive playback
- Direct browser-to-Cloudflare upload (no bandwidth through Vercel)
- Signed URLs for secure playback
- Webhook pipeline: CF Stream → Next.js webhook → Trigger.dev job → ML analysis

### ML Service
- **FastAPI** (Python) deployed separately
- Endpoints: `/transcribe`, `/analyze`, `/match`, `/composite-score`, `/coach/*`
- Pydantic schemas for all request/response contracts
- Stateless — scales horizontally

### Authentication
- **Email/password** signup with role selection (seeker or employer)
- **Google OAuth** (configured and working)
- **LinkedIn OIDC** (configured, needs LinkedIn app credentials)
- Database trigger creates profile from provider metadata on first login
- Auth callback routes users by role: seekers → feed, employers → dashboard

### Deployment
- **Vercel** for the Next.js app (auto-deploys from GitHub)
- **Supabase** cloud for database (Mumbai region — closest to Gulf)
- **Cloudflare** global CDN for video delivery
- ML service needs separate hosting (Railway, Fly.io, or GPU cloud)

---

## Internationalization

- **English + Arabic** translations for all UI text
- RTL layout support via CSS `dir` attribute
- Arabic placeholder text in forms (job titles, recording prompts)
- Gulf-specific content: cities (Dubai, Riyadh, Doha, etc.), currencies (AED, SAR, QAR), industries (Hospitality, F&B, Oil & Gas)

---

## Database Schema (13 Tables)

| Table | Purpose |
|-------|---------|
| `profiles` | User identity (extends Supabase auth) |
| `seeker_profiles` | Skills, experience, salary preferences, skill embeddings |
| `employer_profiles` | Company name, industry, size, verification |
| `team_members` | HR team membership per employer |
| `videos` | All uploaded videos (Cloudflare Stream UIDs) |
| `job_postings` | Job listings with embeddings, anonymous mode flag |
| `portfolio_videos` | Seeker skill video portfolio |
| `applications` | Job applications with AI/match scores |
| `application_videos` | Videos attached to applications |
| `video_scores` | ML analysis results per video |
| `candidate_reviews` | Employer ratings and comments |
| `shortlists` | Shortlisted candidates |
| `notifications` | Real-time notification queue |
| `recording_prompts` | Guided prompts for video recording (EN + AR) |

All tables have Row Level Security. Seekers see their own data. Employers see applications for their jobs. Anonymous mode enforced at the database query level, not the frontend.

---

## Project Structure

```
muqabla/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, register, onboarding
│   │   ├── (seeker)/        # Feed, record, apply, profile, applications
│   │   ├── (employer)/      # Dashboard, jobs, pipeline, team
│   │   └── api/             # 6 API routes
│   ├── components/
│   │   ├── seeker/          # VideoRecorder, feed components
│   │   ├── employer/        # Dashboard, pipeline, candidates
│   │   └── shared/          # Button, Badge, Modal, Video player
│   └── lib/
│       ├── supabase/        # Client, server, middleware
│       ├── cloudflare/      # Stream API wrapper
│       ├── stores/          # Zustand (feed, notifications, application)
│       ├── types/           # Domain types, DB types, ML types
│       ├── i18n/            # EN + AR translations
│       └── utils/           # Format, video helpers
├── ml-service/              # FastAPI Python ML backend
│   ├── routers/             # transcription, scoring, matching, coaching
│   ├── models/              # Whisper, sentiment, body language, embeddings
│   └── schemas/             # Pydantic request/response models
├── supabase/
│   └── migrations/          # SQL schema + RLS policies
└── vercel.json              # Deployment config
```

---

## Live URLs

| Service | URL |
|---------|-----|
| App | https://muqabla-v2.vercel.app |
| GitHub | https://github.com/kudzaimoyo18-cloud/Muqablabuild-2- |
| Supabase | https://supabase.com/dashboard/project/ishlbtmyyocqlsqhidvj |

---

## What's Next

- [ ] Cloudflare Stream account setup for real video uploads
- [ ] Deploy ML service to Railway/Fly.io
- [ ] Wire Trigger.dev for async video processing pipeline
- [ ] Real-time AI coaching during recording
- [ ] Employer analytics (time-to-hire, diversity metrics, funnel charts)
- [ ] PWA manifest + service worker for mobile install
- [ ] LinkedIn OAuth credentials
- [ ] Custom domain
- [ ] Seed demo data for investor demos
