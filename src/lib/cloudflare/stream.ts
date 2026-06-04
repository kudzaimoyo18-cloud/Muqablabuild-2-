interface UploadUrlResponse {
  uploadURL: string
  uid: string
}

interface StreamVideoDetails {
  uid: string
  status: { state: string }
  playback: { hls: string; dash: string }
  thumbnail: string
  duration: number
}

const CF_API_BASE = 'https://api.cloudflare.com/client/v4'

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

export async function getDirectUploadUrl(maxDurationSeconds = 180): Promise<UploadUrlResponse> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
  const res = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/stream/direct_upload`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        maxDurationSeconds,
        requireSignedURLs: true,
      }),
    }
  )

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`CF Stream upload URL failed: ${error}`)
  }

  const data = await res.json()
  return data.result as UploadUrlResponse
}

export async function getVideoDetails(videoUid: string): Promise<StreamVideoDetails> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
  const res = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/stream/${videoUid}`,
    { headers: getHeaders() }
  )

  if (!res.ok) {
    throw new Error(`CF Stream get video failed: ${res.statusText}`)
  }

  const data = await res.json()
  return data.result as StreamVideoDetails
}

export async function deleteVideo(videoUid: string): Promise<void> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
  const res = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/stream/${videoUid}`,
    { method: 'DELETE', headers: getHeaders() }
  )

  if (!res.ok) {
    throw new Error(`CF Stream delete failed: ${res.statusText}`)
  }
}
