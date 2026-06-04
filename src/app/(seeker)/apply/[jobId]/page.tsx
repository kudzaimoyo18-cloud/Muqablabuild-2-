'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/shared/ui/Button'
import { Badge } from '@/components/shared/ui/Badge'
import { VideoThumbnail } from '@/components/shared/video/VideoThumbnail'
import { useApplicationStore } from '@/lib/stores/applicationStore'
import type { DbPortfolioVideo } from '@/lib/types/db'
import Link from 'next/link'

interface DbJob {
  id: string
  title: string
  required_skills: string[]
}

export default function ApplyPage() {
  const params = useParams()
  const jobId = params.jobId as string
  const router = useRouter()
  const supabase = createClient()

  const [job, setJob] = useState<DbJob | null>(null)
  const [portfolio, setPortfolio] = useState<DbPortfolioVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const { selectedVideoIds, toggleVideo, notes, setNotes, isSubmitting, setSubmitting, reset } = useApplicationStore()

  useEffect(() => {
    async function load() {
      const [jobRes, portfolioRes] = await Promise.all([
        supabase.from('job_postings').select('id, title, required_skills').eq('id', jobId).single(),
        supabase.from('portfolio_videos').select('*, video:videos(*)').order('sort_order'),
      ])
      if (jobRes.data) setJob(jobRes.data as unknown as DbJob)
      if (portfolioRes.data) setPortfolio(portfolioRes.data as unknown as DbPortfolioVideo[])
      setLoading(false)
    }
    load()
    return () => reset()
  }, [jobId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachedVideoIds: selectedVideoIds,
          notes: notes || undefined,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => router.push('/applications'), 2000)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
            <path d="m9 12 2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Application Sent!</h2>
        <p className="text-white/50 text-sm text-center">Your video pitch is on its way to the hiring team</p>
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <button onClick={() => router.back()} className="text-white/50 hover:text-white mb-4 flex items-center gap-1 text-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        Back
      </button>

      <h1 className="text-xl font-bold mb-1">Apply to {job?.title}</h1>
      <p className="text-white/40 text-sm mb-6">Select videos that showcase your fit for this role</p>

      {job && job.required_skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {job.required_skills.map((skill) => (
              <Badge key={skill} variant="info">{skill}</Badge>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-sm font-medium text-white/70 mb-3">
        Your Videos ({selectedVideoIds.length} selected)
      </h3>

      {portfolio.length === 0 ? (
        <div className="border border-dashed border-white/20 rounded-xl p-6 text-center mb-6">
          <p className="text-white/50 text-sm mb-3">No videos in portfolio</p>
          <Link href="/record"><Button size="sm">Record One Now</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {portfolio.map((item) => {
            const selected = selectedVideoIds.includes(item.video.id)
            return (
              <button
                key={item.id}
                onClick={() => toggleVideo(item.video.id)}
                className={`relative rounded-xl overflow-hidden aspect-[9/16] border-2 transition-all ${
                  selected ? 'border-emerald-500 shadow-lg shadow-emerald-500/25' : 'border-transparent'
                }`}
              >
                {item.video.cf_uid && (
                  <VideoThumbnail cfUid={item.video.cf_uid} className="w-full h-full" alt={item.title} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs font-medium truncate">{item.title}</p>
                </div>
                {selected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="m9 12 2 2 4-4" /></svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm text-white/60 mb-1.5">Add a note (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none"
          placeholder="Why you're excited about this role..."
        />
      </div>

      <Button
        onClick={handleSubmit}
        loading={isSubmitting}
        disabled={selectedVideoIds.length === 0}
        className="w-full"
        size="lg"
      >
        Submit Application ({selectedVideoIds.length} video{selectedVideoIds.length !== 1 ? 's' : ''})
      </Button>
    </div>
  )
}