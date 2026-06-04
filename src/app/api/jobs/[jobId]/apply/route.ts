import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { jobId } = await params

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { attachedVideoIds = [], coverVideoId, notes } = body

  // Get seeker profile
  const { data: seeker } = await supabase
    .from('seeker_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!seeker) {
    return NextResponse.json({ error: 'Seeker profile not found' }, { status: 404 })
  }

  // Check not already applied
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('seeker_id', seeker.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already applied' }, { status: 409 })
  }

  // Create application
  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      seeker_id: seeker.id,
      cover_video_id: coverVideoId || null,
      notes_by_seeker: notes || null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Attach videos
  if (attachedVideoIds.length > 0) {
    const videoInserts = attachedVideoIds.map((videoId: string) => ({
      application_id: application.id,
      video_id: videoId,
    }))
    await supabase.from('application_videos').insert(videoInserts)
  }

  // Notify employer
  const { data: job } = await supabase
    .from('job_postings')
    .select('employer_id, title, employer_profiles(profile_id)')
    .eq('id', jobId)
    .single()

  if (job?.employer_profiles) {
    const employerProfileId = (job.employer_profiles as any).profile_id
    await supabase.from('notifications').insert({
      user_id: employerProfileId,
      type: 'application_received',
      payload: {
        jobTitle: job.title,
        jobId,
        applicationId: application.id,
      },
    })
  }

  return NextResponse.json({ applicationId: application.id })
}