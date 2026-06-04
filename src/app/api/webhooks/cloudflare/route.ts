import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify webhook signature
  const webhookSecret = process.env.CLOUDFLARE_WEBHOOK_SECRET
  const signature = request.headers.get('Webhook-Signature')

  if (webhookSecret && signature !== webhookSecret) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const payload = await request.json()
  const { uid, status, duration, playback } = payload

  if (!uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
  }

  const supabase = await createClient()

  if (status?.state === 'ready') {
    // Update video record
    await supabase
      .from('videos')
      .update({
        status: 'processing',
        cf_playback_id: playback?.hls || null,
        duration_secs: Math.round(duration || 0),
        thumbnail_url: `https://customer-${process.env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`,
      })
      .eq('cf_uid', uid)

    // TODO: Trigger ML processing via Trigger.dev
    // await processVideoTask.trigger({ videoId, cfUid: uid, ... })
  }

  if (status?.state === 'error') {
    await supabase
      .from('videos')
      .update({ status: 'failed' })
      .eq('cf_uid', uid)
  }

  return NextResponse.json({ received: true })
}
