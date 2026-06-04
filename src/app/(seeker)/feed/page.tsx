'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useFeedStore } from '@/lib/stores/feedStore'
import { Badge } from '@/components/shared/ui/Badge'
import { Button } from '@/components/shared/ui/Button'
import { formatSalary } from '@/lib/utils/format'
import type { FeedJob } from '@/lib/types/domain'

export default function FeedPage() {
  const { jobs, currentIndex, appendJobs, nextJob, previousJob, cursor, hasMore, isLoading, setLoading } = useFeedStore()
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    if (isLoading || !hasMore) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '10' })
      if (cursor) params.set('cursor', cursor)
      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      appendJobs(data.jobs, data.nextCursor)
    } finally {
      setLoading(false)
    }
  }, [cursor, hasMore, isLoading, appendJobs, setLoading])

  useEffect(() => {
    if (jobs.length === 0) fetchJobs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Prefetch when near end
  useEffect(() => {
    if (currentIndex >= jobs.length - 3) fetchJobs()
  }, [currentIndex, jobs.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentJob = jobs[currentIndex]

  return (
    <div ref={containerRef} className="h-full relative overflow-hidden bg-black">
      <AnimatePresence mode="popLayout">
        {currentJob && (
          <JobCard
            key={currentJob.id}
            job={currentJob}
            onSwipeUp={nextJob}
            onSwipeDown={previousJob}
          />
        )}
      </AnimatePresence>

      {/* Loading state */}
      {jobs.length === 0 && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white/50 text-sm">Loading jobs...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {jobs.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="text-center space-y-3">
            <p className="text-2xl">🎯</p>
            <p className="text-white/70 font-medium">No jobs yet</p>
            <p className="text-white/40 text-sm">Check back soon — employers are posting daily</p>
          </div>
        </div>
      )}

      {/* Position indicator */}
      {jobs.length > 0 && (
        <div className="absolute top-4 right-4 z-20">
          <Badge variant="default">
            {currentIndex + 1} / {jobs.length}
          </Badge>
        </div>
      )}
    </div>
  )
}

function JobCard({
  job,
  onSwipeUp,
  onSwipeDown,
}: {
  job: FeedJob
  onSwipeUp: () => void
  onSwipeDown: () => void
}) {
  const y = useMotionValue(0)
  const opacity = useTransform(y, [-200, 0, 200], [0.5, 1, 0.5])
  const scale = useTransform(y, [-200, 0, 200], [0.95, 1, 0.95])
  const [showApply, setShowApply] = useState(false)

  function handleDragEnd(_: any, info: PanInfo) {
    if (info.offset.y < -80 && info.velocity.y < -200) {
      onSwipeUp()
    } else if (info.offset.y > 80 && info.velocity.y > 200) {
      onSwipeDown()
    }
  }

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ opacity, scale }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
    >
      {/* Video background or gradient placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
        {job.videoJd?.cfPlaybackId && (
          <iframe
            src={`https://customer-placeholder.cloudflarestream.com/${job.videoJd.cfPlaybackId}/iframe?autoplay=true&muted=true&loop=true&controls=false`}
            className="w-full h-full border-0 object-cover"
            allow="autoplay"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-8">
        {/* Company */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-emerald-400">
            {job.companyName[0]}
          </div>
          <span className="text-white/70 text-sm font-medium">{job.companyName}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
          {job.title}
        </h2>

        {/* Location & salary */}
        <div className="flex items-center gap-3 text-sm text-white/60 mb-4">
          {job.location && (
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {job.location}
            </span>
          )}
          {job.remoteAllowed && <Badge variant="info">Remote OK</Badge>}
          {(job.salaryMin || job.salaryMax) && (
            <span className="text-emerald-400 font-medium">
              {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
            </span>
          )}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {job.requiredSkills.slice(0, 5).map((skill) => (
            <Badge key={skill} variant="default">{skill}</Badge>
          ))}
          {job.requiredSkills.length > 5 && (
            <Badge variant="default">+{job.requiredSkills.length - 5}</Badge>
          )}
        </div>

        {/* Match score */}
        {job.matchScore !== null && (
          <div className="mb-4">
            <Badge variant="score">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {Math.round(job.matchScore)}% match
            </Badge>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            onClick={() => setShowApply(true)}
          >
            Apply with Video
          </Button>
          <button className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>
        </div>

        {/* Swipe hint */}
        <motion.p
          className="text-center text-xs text-white/30 mt-4"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Swipe up for next job
        </motion.p>
      </div>
    </motion.div>
  )
}
