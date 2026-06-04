import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { applicationId } = await params

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { stage } = await request.json()

  const validStages = ['applied', 'reviewed', 'shortlisted', 'interview', 'offer', 'rejected']
  if (!validStages.includes(stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
  }

  // Verify employer owns this application's job
  const { data: app } = await supabase
    .from('applications')
    .select('id, seeker_id, job_postings!inner(employer_id, title, employer_profiles!inner(profile_id))')
    .eq('id', applicationId)
    .single()

  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const employerProfileId = (app as any).job_postings?.employer_profiles?.profile_id
  if (employerProfileId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update stage
  const { error } = await supabase
    .from('applications')
    .update({
      stage,
      reviewed_at: stage !== 'applied' ? new Date().toISOString() : null,
    })
    .eq('id', applicationId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notify seeker
  const { data: seekerProfile } = await supabase
    .from('seeker_profiles')
    .select('profile_id')
    .eq('id', (app as any).seeker_id)
    .single()

  if (seekerProfile) {
    await supabase.from('notifications').insert({
      user_id: seekerProfile.profile_id,
      type: 'stage_changed',
      payload: {
        jobTitle: (app as any).job_postings?.title,
        applicationId,
        newStage: stage,
      },
    })
  }

  return NextResponse.json({ success: true })
}