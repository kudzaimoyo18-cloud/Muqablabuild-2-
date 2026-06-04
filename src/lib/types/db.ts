/**
 * Raw Supabase row types (snake_case) for direct query results.
 * Use these in pages/components that query Supabase directly.
 * Domain types (camelCase) are for API responses and inter-component props.
 */

export interface DbVideo {
  id: string
  owner_id: string
  cf_uid: string
  cf_playback_id: string | null
  video_type: string
  status: string
  duration_secs: number | null
  thumbnail_url: string | null
  quality_score: number | null
  language: string
  transcript: string | null
  transcript_ar: string | null
  created_at: string
}

export interface DbPortfolioVideo {
  id: string
  seeker_id: string
  video_id: string
  title: string
  skill_tags: string[]
  sort_order: number
  created_at: string
  video: DbVideo
}

export interface DbProfile {
  id: string
  role: string
  display_name: string
  headline: string | null
  location: string | null
  preferred_lang: string
  avatar_cf_uid: string | null
  created_at: string
  updated_at: string
}

export interface DbSeekerProfile {
  id: string
  profile_id: string
  skills: string[]
  experience_years: number
  desired_roles: string[]
  desired_salary_min: number | null
  desired_salary_max: number | null
  currency: string
  open_to_work: boolean
}
