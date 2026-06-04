'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VideoRecorder } from '@/components/seeker/record/VideoRecorder'
import { UploadProgress } from '@/components/shared/video/UploadProgress'
import { createClient } from '@/lib/supabase/client'

export default function RecordPage() {
  const [prompt, setPrompt] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'processing' | 'ready' | 'failed'>('uploading')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Load a random recording prompt
    async function loadPrompt() {
      const { data } = await supabase
        .from('recording_prompts')
        .select('text_en')
        .eq('active', true)
        .limit(1)
        .single()
      if (data) setPrompt(data.text_en)
    }
    loadPrompt()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRecordComplete(blob: Blob, durationSecs: number) {
    setUploading(true)
    setUploadStatus('uploading')

    try {
      // Get upload URL from our API
      const urlRes = await fetch('/api/videos/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoType: 'portfolio', language: 'en' }),
      })
      const { uploadUrl, videoId } = await urlRes.json()

      // Upload directly to Cloudflare Stream
      const formData = new FormData()
      formData.append('file', blob, 'recording.webm')

      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100)
        }
      }

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error('Upload failed'))
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('POST', uploadUrl)
        xhr.send(formData)
      })

      setUploadStatus('processing')
      // Video will be processed via webhook -> Trigger.dev
      // Poll for status or rely on realtime subscription
      setTimeout(() => {
        setUploadStatus('ready')
        setTimeout(() => router.push('/profile'), 1500)
      }, 3000)
    } catch {
      setUploadStatus('failed')
    }
  }

  if (uploading) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          {uploadStatus === 'ready' ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
              <path d="m9 12 2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          ) : (
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <div className="w-full max-w-xs">
          <UploadProgress progress={uploadProgress} status={uploadStatus} />
        </div>
        {uploadStatus === 'ready' && (
          <p className="text-emerald-400 font-medium">Video saved to portfolio!</p>
        )}
      </div>
    )
  }

  return <VideoRecorder maxDurationSecs={180} onComplete={handleRecordComplete} prompt={prompt} />
}
