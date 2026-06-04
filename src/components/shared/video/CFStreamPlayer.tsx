'use client'

import { useRef, useEffect } from 'react'

interface CFStreamPlayerProps {
  playbackId: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  loop?: boolean
  className?: string
  onEnded?: () => void
  onPlay?: () => void
}

export function CFStreamPlayer({
  playbackId,
  autoplay = false,
  muted = true,
  controls = true,
  loop = false,
  className = '',
  onEnded,
  onPlay,
}: CFStreamPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const src = `https://customer-${process.env.NEXT_PUBLIC_CF_ACCOUNT_ID}.cloudflarestream.com/${playbackId}/iframe?${new URLSearchParams({
    autoplay: String(autoplay),
    muted: String(muted),
    controls: String(controls),
    loop: String(loop),
    preload: 'auto',
    poster: `https://customer-${process.env.NEXT_PUBLIC_CF_ACCOUNT_ID}.cloudflarestream.com/${playbackId}/thumbnails/thumbnail.jpg`,
  })}`

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'ended' && onEnded) onEnded()
      if (e.data?.type === 'play' && onPlay) onPlay()
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onEnded, onPlay])

  return (
    <iframe
      ref={iframeRef}
      src={src}
      className={`w-full h-full border-0 ${className}`}
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}
