-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- Enums
create type user_role as enum ('seeker', 'employer', 'admin');
create type application_stage as enum (
  'applied', 'reviewed', 'shortlisted', 'interview', 'offer', 'rejected'
);
create type video_status as enum ('pending', 'processing', 'ready', 'failed');
create type video_type as enum ('job_description', 'portfolio', 'application');

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         user_role not null,
  display_name text not null,
  headline     text,
  location     text,
  preferred_lang text default 'en' check (preferred_lang in ('en', 'ar')),
  avatar_cf_uid text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Seeker profiles
create table public.seeker_profiles (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  skills          text[] default '{}',
  experience_years int default 0,
  desired_roles   text[] default '{}',
  desired_salary_min numeric,
  desired_salary_max numeric,
  currency        text default 'AED',
  open_to_work    boolean default true,
  skill_embedding vector(1536),
  unique(profile_id)
);

-- Employer profiles
create table public.employer_profiles (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  company_name    text not null,
  company_size    text,
  industry        text,
  verified        boolean default false,
  unique(profile_id)
);

-- Team members
create table public.team_members (
  id               uuid primary key default uuid_generate_v4(),
  employer_id      uuid not null references public.employer_profiles(id) on delete cascade,
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  role_in_team     text default 'reviewer',
  created_at       timestamptz default now(),
  unique(employer_id, profile_id)
);

-- Videos
create table public.videos (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  cf_uid          text not null unique,
  cf_playback_id  text,
  video_type      video_type not null,
  status          video_status default 'pending',
  duration_secs   int,
  thumbnail_url   text,
  quality_score   numeric(4,2),
  language        text default 'en',
  transcript      text,
  transcript_ar   text,
  created_at      timestamptz default now()
);

-- Job postings
create table public.job_postings (
  id                uuid primary key default uuid_generate_v4(),
  employer_id       uuid not null references public.employer_profiles(id) on delete cascade,
  title             text not null,
  title_ar          text,
  description       text,
  description_ar    text,
  video_jd_id       uuid references public.videos(id),
  required_skills   text[] default '{}',
  salary_min        numeric,
  salary_max        numeric,
  currency          text default 'AED',
  location          text,
  remote_allowed    boolean default false,
  anonymous_mode    boolean default false,
  active            boolean default true,
  job_embedding     vector(1536),
  application_count int default 0,
  created_at        timestamptz default now(),
  expires_at        timestamptz
);

-- Portfolio videos
create table public.portfolio_videos (
  id          uuid primary key default uuid_generate_v4(),
  seeker_id   uuid not null references public.seeker_profiles(id) on delete cascade,
  video_id    uuid not null references public.videos(id),
  title       text not null,
  skill_tags  text[] default '{}',
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- Applications
create table public.applications (
  id               uuid primary key default uuid_generate_v4(),
  job_id           uuid not null references public.job_postings(id) on delete cascade,
  seeker_id        uuid not null references public.seeker_profiles(id),
  stage            application_stage default 'applied',
  ai_score         numeric(5,2),
  match_score      numeric(5,2),
  cover_video_id   uuid references public.videos(id),
  notes_by_seeker  text,
  applied_at       timestamptz default now(),
  reviewed_at      timestamptz,
  unique(job_id, seeker_id)
);

-- Application videos
create table public.application_videos (
  id             uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.applications(id) on delete cascade,
  video_id       uuid not null references public.videos(id),
  added_at       timestamptz default now()
);

-- ML scoring results
create table public.video_scores (
  id                uuid primary key default uuid_generate_v4(),
  video_id          uuid not null references public.videos(id) on delete cascade unique,
  confidence_score  numeric(4,2),
  sentiment_score   numeric(4,2),
  body_language_score numeric(4,2),
  filler_word_rate  numeric(5,4),
  speech_pace_wpm   int,
  eye_contact_score numeric(4,2),
  lighting_score    numeric(4,2),
  bias_flags        jsonb default '[]',
  scored_at         timestamptz default now()
);

-- Employer ratings & comments
create table public.candidate_reviews (
  id             uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.applications(id) on delete cascade,
  reviewer_id    uuid not null references public.profiles(id),
  rating         int check (rating between 1 and 5),
  comment        text,
  created_at     timestamptz default now(),
  unique(application_id, reviewer_id)
);

-- Shortlists
create table public.shortlists (
  id             uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.applications(id) on delete cascade,
  shortlisted_by uuid not null references public.profiles(id),
  created_at     timestamptz default now(),
  unique(application_id, shortlisted_by)
);

-- Notifications
create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null,
  payload     jsonb default '{}',
  read        boolean default false,
  created_at  timestamptz default now()
);

-- Recording prompts
create table public.recording_prompts (
  id          uuid primary key default uuid_generate_v4(),
  category    text not null,
  text_en     text not null,
  text_ar     text not null,
  duration_hint_secs int default 60,
  active      boolean default true
);

-- Indexes
create index idx_jobs_active on public.job_postings(active, created_at desc);
create index idx_jobs_employer on public.job_postings(employer_id);
create index idx_applications_job on public.applications(job_id, ai_score desc nulls last);
create index idx_applications_seeker on public.applications(seeker_id);
create index idx_videos_owner on public.videos(owner_id);
create index idx_notifications_user on public.notifications(user_id, read, created_at desc);
create index idx_portfolio_seeker on public.portfolio_videos(seeker_id);

-- Vector similarity function
create or replace function match_seekers_to_job(
  query_embedding vector(1536),
  job_id uuid,
  match_count int default 20
) returns table (seeker_id uuid, similarity float)
language plpgsql as $$
begin
  return query
  select sp.id, 1 - (sp.skill_embedding <=> query_embedding) as similarity
  from seeker_profiles sp
  join applications a on a.seeker_id = sp.id
  where a.job_id = match_seekers_to_job.job_id
    and sp.skill_embedding is not null
  order by similarity desc
  limit match_count;
end;
$$;

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

-- Increment application count
create or replace function increment_application_count()
returns trigger as $$
begin
  update public.job_postings
  set application_count = application_count + 1
  where id = new.job_id;
  return new;
end;
$$ language plpgsql;

create trigger applications_count_trigger
  after insert on public.applications
  for each row execute function increment_application_count();
