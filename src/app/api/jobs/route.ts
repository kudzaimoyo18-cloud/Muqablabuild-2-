import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = request.nextUrl

  const cursor = searchParams.get('cursor')
  const limit = Math.min(Number(searchParams.get('limit') || '10'), 20)
  const skills = searchParams.get('skills')?.split(',').filter(Boolean) || []
  const location = searchParams.get('location')
  const remote = searchParams.get('remote') === 'true'

  let query = supabase
    .from('job_postings')
    .select(`
      id,
      title,
      title_ar,
      salary_min,
      salary_max,
      currency,
      location,
      remote_allowed,
      required_skills,
      created_at,
      employer_profiles!inner (
        company_name
      ),
      videos!job_postings_video_jd_id_fkey (
        cf_playback_id,
        thumbnail_url,
        duration_secs
      )
    `)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  if (remote) {
    query = query.eq('remote_allowed', true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const jobs = (data || []).map((job: any) => ({
    id: job.id,
    title: job.title,
    titleAr: job.title_ar,
    companyName: job.employer_profiles?.company_name || 'Unknown',
    companyLogo: null,
    location: job.location,
    remoteAllowed: job.remote_allowed,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    currency: job.currency,
    requiredSkills: job.required_skills || [],
    videoJd: job.videos
      ? {
          cfPlaybackId: job.videos.cf_playback_id,
          thumbnailUrl: job.videos.thumbnail_url,
          durationSecs: job.videos.duration_secs,
        }
      : null,
    matchScore: null,
    createdAt: job.created_at,
  }))

  const nextCursor = jobs.length === limit ? jobs[jobs.length - 1]?.createdAt : null

  return NextResponse.json({ jobs, nextCursor })
}
