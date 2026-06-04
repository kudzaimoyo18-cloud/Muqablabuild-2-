'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/shared/ui/Button'

interface VideoRecorderProps {
  maxDurationSecs?: number
  onComplete: (blob: Blob, durationSecs: number) => void
  prompt?: string | null
}

export function VideoRecorder({
  maxDurationSecs = 180,
  onComplete,
  prompt,
}: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1080, height: 1920 },
        audio: true,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch {
      setError('Camera access denied. Please enable camera permissions.')
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startRecording() {
    if (!stream) return
    chunksRef.current = []
    setElapsed(0)
    setRecordedBlob(null)

    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
    })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setRecordedBlob(blob)
    }

    recorder.start(1000) // chunk every second
    mediaRecorderRef.current = recorder
    setIsRecording(true)

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= maxDurationSecs - 1) {
          stopRecording()
          return maxDurationSecs
        }
        return prev + 1
      })
    }, 1000)
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function retake() {
    setRecordedBlob(null)
    setElapsed(0)
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }

  function useRecording() {
    if (recordedBlob) {
      onComplete(recordedBlob, elapsed)
    }
  }

  const progressPct = (elapsed / maxDurationSecs) * 100

  return (
    <div className="relative h-full bg-black flex flex-col">
      {/* Video preview */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!recordedBlob}
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 recording-pulse" />
            <span className="text-white text-sm font-mono">
              {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Progress bar */}
        {isRecording && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              className="h-full bg-red-500"
              style={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Prompt overlay */}
        {prompt && isRecording && (
          <div className="absolute top-16 left-4 right-4">
            <div className="glass rounded-xl px-4 py-3">
              <p className="text-white/90 text-sm leading-relaxed">{prompt}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-8">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={startCamera}>Retry</Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 flex items-center justify-center gap-6">
        {!recordedBlob ? (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-all ${
              isRecording ? 'bg-transparent' : 'bg-transparent'
            }`}
          >
            {isRecording ? (
              <div className="w-6 h-6 rounded-sm bg-red-500" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-500" />
            )}
          </button>
        ) : (
          <div className="flex gap-3 w-full">
            <Button variant="secondary" onClick={retake} className="flex-1">
              Retake
            </Button>
            <Button onClick={useRecording} className="flex-1">
              Use This Video
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
