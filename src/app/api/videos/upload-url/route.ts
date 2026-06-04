import { createClient } from '@/lib/supabase/server'
import { getDirectUploadUrl } from '@/lib/cloudflare/stream'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { videoType = 'portfolio', language = 'en' } = body

  try {
    const { uploadURL, uid: cfUid } = await getDirectUploadUrl(180)

    // Create video record in DB
    const { data: video, error } = await supabase
      .from('videos')
      .insert({
        owner_id: user.id,
        cf_uid: cfUid,
        video_type: videoType,
        status: 'pending',
        language,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      uploadUrl: uploadURL,
      cfUid,
      videoId: video.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
