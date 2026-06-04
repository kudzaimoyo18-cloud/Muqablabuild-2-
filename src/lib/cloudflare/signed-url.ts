import * as crypto from 'crypto'

export function generateSignedUrl(videoUid: string, expiresInSeconds = 3600): string {
  const keyId = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID!
  const pemKey = process.env.CLOUDFLARE_STREAM_SIGNING_KEY!

  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds

  const token = Buffer.from(
    JSON.stringify({ sub: videoUid, kid: keyId, exp: expiresAt })
  ).toString('base64url')

  const header = Buffer.from(
    JSON.stringify({ alg: 'RS256', kid: keyId })
  ).toString('base64url')

  const signingInput = `${header}.${token}`
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(signingInput)
    .sign(pemKey, 'base64url')

  return `https://customer-${process.env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${header}.${token}.${signature}/manifest/video.m3u8`
}
