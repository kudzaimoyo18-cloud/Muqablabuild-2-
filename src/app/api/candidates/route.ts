import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const jobId = searchParams.get('jobId')
  const stage = searchParams.get('stage')
  const sortBy = searchParams.get('sortBy') || 'ai_score'
  const limit = Math.min(Number(searchParams.get('limit') || '20'), 50)

  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 })
  }

  // Verify employer owns this job
  const { data: employer } = await supabase
    .from('employer_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!employer) {
    return NextResponse.json({ error: 'Not an employer' }, { status: 403 })
  }

  const { data: job } = await supabase
    .from('job_postings')
    .select('id, anonymous_mode')
    .eq('id', jobId)
    .eq('employer_id', employer.id)
    .single()

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Fetch applications
  let query = supabase
    .from('applications')
    .select(`
      id,
      stage,
      ai_score,
      match_score,
      applied_at,
      cover_video_id,
      seeker_profiles (
        id,
        skills,
        experience_years,
        profiles (
          display_name,
          avatar_cf_uid
        )
      ),
      application_videos (
        video_id,
        videos (
          id, cf_uid, cf_playback_id, thumbnail_url, duration_secs
        )
      ),
      video_scores:videos!applications_cover_video_id_fkey (
        video_scores (
          confidence_score, sentiment_score, body_language_score,
          eye_contact_score, lighting_score, filler_word_rate, speech_pace_wpm, bias_flags
        )
      ),
      candidate_reviews (
        id, reviewer_id, rating, comment, created_at,
        profiles (display_name)
      )
    `)
    .eq('job_id', jobId)
    .limit(limit)

  if (stage) {
    query = query.eq('stage', stage)
  }

  // Sort
  const ascending = sortBy === 'applied_at'
  query = query.order(sortBy === 'match_score' ? 'match_score' : sortBy === 'applied_at' ? 'applied_at' : 'ai_score', {
    ascending,
    nullsFirst: false,
  })

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const candidates = (data || []).map((app: any) => ({
    applicationId: app.id,
    stage: app.stage,
    aiScore: app.ai_score,
    matchScore: app.match_score,
    appliedAt: app.applied_at,
    // Anonymous mode: strip identity
    seekerName: job.anonymous_mode ? null : app.seeker_profiles?.profiles?.display_name || null,
    seekerAvatar: job.anonymous_mode ? null : app.seeker_profiles?.profiles?.avatar_cf_uid || null,
    skills: app.seeker_profiles?.skills || [],
    experienceYears: app.seeker_profiles?.experience_years || 0,
    portfolioVideos: (app.application_videos || []).map((av: any) => ({
      videoId: av.video_id,
      cfPlaybackId: av.videos?.cf_playback_id,
      thumbnailUrl: av.videos?.thumbnail_url,
      durationSecs: av.videos?.duration_secs,
    })),
    coverVideo: null,
    scores: app.video_scores?.video_scores?.[0] || null,
    reviews: (app.candidate_reviews || []).map((r: any) => ({
      id: r.id,
      applicationId: app.id,
      reviewerId: r.reviewer_id,
      reviewerName: r.profiles?.display_name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
    })),
  }))

  return NextResponse.json({ candidates, total: candidates.length })
}
