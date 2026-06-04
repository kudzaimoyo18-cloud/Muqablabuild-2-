export function getCfThumbnailUrl(cfUid: string, time = '1s'): string {
  return `https://customer-${process.env.NEXT_PUBLIC_CF_ACCOUNT_ID}.cloudflarestream.com/${cfUid}/thumbnails/thumbnail.jpg?time=${time}`
}

export function getCfEmbedUrl(cfPlaybackId: string): string {
  return `https://customer-${process.env.NEXT_PUBLIC_CF_ACCOUNT_ID}.cloudflarestream.com/${cfPlaybackId}/iframe`
}

export const MAX_VIDEO_DURATION_SECS = 180
export const MIN_VIDEO_DURATION_SECS = 15

export const VIDEO_QUALITY_TIERS = {
  low: '360p',
  medium: '720p',
  high: '1080p',
} as const
