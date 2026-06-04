'use client'

import { motion } from 'framer-motion'

interface UploadProgressProps {
  progress: number
  status: 'uploading' | 'processing' | 'ready' | 'failed'
}

export function UploadProgress({ progress, status }: UploadProgressProps) {
  const statusLabels = {
    uploading: 'Uploading...',
    processing: 'Processing video...',
    ready: 'Ready',
    failed: 'Failed',
  }

  const statusColors = {
    uploading: 'bg-blue-500',
    processing: 'bg-amber-500',
    ready: 'bg-emerald-500',
    failed: 'bg-red-500',
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs text-white/60">
        <span>{statusLabels[status]}</span>
        {status === 'uploading' && <span>{Math.round(progress)}%</span>}
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${statusColors[status]}`}
          initial={{ width: 0 }}
          animate={{
            width: status === 'ready' ? '100%' : `${progress}%`,
          }}
          transition={{ ease: 'easeOut', duration: 0.3 }}
        />
      </div>
    </div>
  )
}
