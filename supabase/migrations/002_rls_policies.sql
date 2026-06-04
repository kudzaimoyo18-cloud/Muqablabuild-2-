-- RLS Policies
alter table public.profiles enable row level security;
alter table public.seeker_profiles enable row level security;
alter table public.employer_profiles enable row level security;
alter table public.team_members enable row level security;
alter table public.videos enable row level security;
alter table public.job_postings enable row level security;
alter table public.portfolio_videos enable row level security;
alter table public.applications enable row level security;
alter table public.application_videos enable row level security;
alter table public.video_scores enable row level security;
alter table public.candidate_reviews enable row level security;
alter table public.shortlists enable row level security;
alter table public.notifications enable row level security;
alter table public.recording_prompts enable row level security;

-- Profiles: own row read/write
create policy "profiles_own_select" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_own_update" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_own_insert" on public.profiles
  for insert with check (auth.uid() = id);

-- Profiles: employers can read seeker profiles
create policy "profiles_employer_read_seekers" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'employer'
    )
  );

-- Seeker profiles
create policy "seeker_profiles_own" on public.seeker_profiles
  for all using (profile_id = auth.uid());

create policy "seeker_profiles_employer_read" on public.seeker_profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'employer'
    )
  );

-- Employer profiles
create policy "employer_profiles_own" on public.employer_profiles
  for all using (profile_id = auth.uid());

create policy "employer_profiles_public_read" on public.employer_profiles
  for select using (true);

-- Team members
create policy "team_members_employer_manage" on public.team_members
  for all using (
    exists (
      select 1 from public.employer_profiles ep
      where ep.id = employer_id and ep.profile_id = auth.uid()
    )
  );

create policy "team_members_own_read" on public.team_members
  for select using (profile_id = auth.uid());

-- Videos: owner full access
create policy "videos_owner" on public.videos
  for all using (owner_id = auth.uid());

-- Videos: employers can read application videos for their jobs
create policy "videos_employer_read" on public.videos
  for select using (
    exists (
      select 1 from public.application_videos av
      join public.applications a on a.id = av.application_id
      join public.job_postings j on j.id = a.job_id
      join public.employer_profiles ep on ep.id = j.employer_id
      where av.video_id = public.videos.id
        and ep.profile_id = auth.uid()
    )
  );

-- Videos: public video JDs
create policy "videos_public_jd" on public.videos
  for select using (
    exists (
      select 1 from public.job_postings jp
      where jp.video_jd_id = public.videos.id and jp.active = true
    )
  );

-- Job postings: employers manage own
create policy "jobs_employer_manage" on public.job_postings
  for all using (
    exists (
      select 1 from public.employer_profiles ep
      where ep.id = employer_id and ep.profile_id = auth.uid()
    )
  );

-- Job postings: all authenticated read active
create policy "jobs_public_read" on public.job_postings
  for select using (active = true);

-- Portfolio videos: seeker manages own
create policy "portfolio_seeker_own" on public.portfolio_videos
  for all using (
    exists (
      select 1 from public.seeker_profiles sp
      where sp.id = seeker_id and sp.profile_id = auth.uid()
    )
  );

-- Portfolio videos: employers can read
create policy "portfolio_employer_read" on public.portfolio_videos
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'employer'
    )
  );

-- Applications: seeker owns
create policy "applications_seeker_own" on public.applications
  for all using (
    exists (
      select 1 from public.seeker_profiles sp
      where sp.id = seeker_id and sp.profile_id = auth.uid()
    )
  );

-- Applications: employer of that job reads
create policy "applications_employer_read" on public.applications
  for select using (
    exists (
      select 1 from public.job_postings j
      join public.employer_profiles ep on ep.id = j.employer_id
      where j.id = job_id and ep.profile_id = auth.uid()
    )
  );

-- Application videos: same as applications
create policy "app_videos_seeker" on public.application_videos
  for all using (
    exists (
      select 1 from public.applications a
      join public.seeker_profiles sp on sp.id = a.seeker_id
      where a.id = application_id and sp.profile_id = auth.uid()
    )
  );

create policy "app_videos_employer_read" on public.application_videos
  for select using (
    exists (
      select 1 from public.applications a
      join public.job_postings j on j.id = a.job_id
      join public.employer_profiles ep on ep.id = j.employer_id
      where a.id = application_id and ep.profile_id = auth.uid()
    )
  );

-- Video scores: seeker reads own
create policy "scores_seeker_own" on public.video_scores
  for select using (
    exists (
      select 1 from public.videos v
      where v.id = video_id and v.owner_id = auth.uid()
    )
  );

-- Video scores: employer reads for their job applications
create policy "scores_employer_read" on public.video_scores
  for select using (
    exists (
      select 1 from public.application_videos av
      join public.applications a on a.id = av.application_id
      join public.job_postings j on j.id = a.job_id
      join public.employer_profiles ep on ep.id = j.employer_id
      where av.video_id = video_id and ep.profile_id = auth.uid()
    )
  );

-- Candidate reviews: employer team manages
create policy "reviews_employer_manage" on public.candidate_reviews
  for all using (reviewer_id = auth.uid());

create policy "reviews_team_read" on public.candidate_reviews
  for select using (
    exists (
      select 1 from public.applications a
      join public.job_postings j on j.id = a.job_id
      join public.employer_profiles ep on ep.id = j.employer_id
      join public.team_members tm on tm.employer_id = ep.id
      where a.id = application_id and tm.profile_id = auth.uid()
    )
  );

-- Shortlists
create policy "shortlists_employer_manage" on public.shortlists
  for all using (shortlisted_by = auth.uid());

-- Notifications: own only
create policy "notifications_own" on public.notifications
  for all using (user_id = auth.uid());

-- Recording prompts: public read
create policy "prompts_public_read" on public.recording_prompts
  for select using (active = true);

-- Realtime publications
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.applications;
alter publication supabase_realtime add table public.candidate_reviews;
