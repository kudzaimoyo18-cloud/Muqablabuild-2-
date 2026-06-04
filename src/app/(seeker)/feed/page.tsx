'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useFeedStore } from '@/lib/stores/feedStore'
import { formatSalary } from '@/lib/utils/format'
import type { FeedJob } from '@/lib/types/domain'

export default function FeedPage() {
  const { jobs, currentIndex, appendJobs, nextJob, previousJob, cursor, hasMore, isLoading, setLoading } = useFeedStore()
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchJobs = useCallback(async () => {
    if (isLoading || !hasMore) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '10' })
      if (cursor) params.set('cursor', cursor)
      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      appendJobs(data.jobs || [], data.nextCursor || null)
    } finally {
      setLoading(false)
    }
  }, [cursor, hasMore, isLoading, appendJobs, setLoading])

  useEffect(() => {
    if (jobs.length === 0) fetchJobs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentIndex >= jobs.length - 3) fetchJobs()
  }, [currentIndex, jobs.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentJob = jobs[currentIndex]

  return (
    <div ref={containerRef} className="h-full relative overflow-hidden bg-black">
      {/* Top status bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/20 grid place-items-center">
            <div className="w-2 h-2 rounded-sm bg-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-white">Muqabla</span>
        </div>
        <div className="chip chip-gold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Anonymous review
        </div>
      </div>

      {/* Swipe hint */}
      {currentJob && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 text-center">
          <p className="text-[11px] text-white/40 uppercase tracking-wider">Swipe for more jobs</p>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40 mx-auto mt-1 animate-bounce">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      )}

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

      {jobs.length === 0 && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white/50 text-sm">Loading jobs...</p>
          </div>
        </div>
      )}

      {jobs.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="text-center space-y-3">
            <p className="text-3xl">🎯</p>
            <p className="text-white/70 font-medium">No jobs yet</p>
            <p className="text-white/40 text-sm">Check back soon — employers are posting daily</p>
          </div>
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

  function handleDragEnd(_: any, info: PanInfo) {
    if (info.offset.y < -80 && info.velocity.y < -200) onSwipeUp()
    else if (info.offset.y > 80 && info.velocity.y > 200) onSwipeDown()
  }

  return (
    <motion.div
      className="absolute inset-0"
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
      {/* Video background */}
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

      {/* Center play indicator (placeholder for no video) */}
      {!job.videoJd && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md grid place-items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Side icon stack (TikTok style) */}
      <div className="absolute end-3 bottom-44 flex flex-col gap-5 z-20">
        <SideAction
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          }
          label="1.1k"
        />
        <SideAction
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          }
          label="Save"
        />
        <SideAction
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          }
          label="Share"
        />
      </div>

      {/* Bottom job info */}
      <div className="relative z-10 h-full flex flex-col justify-end p-5 pb-6 pe-20">
        {/* Company */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-white/10 grid place-items-center text-[11px] font-bold text-white/80">
            {job.companyName[0]}
          </div>
          <span className="text-white/80 text-[13px] font-medium">{job.companyName}</span>
          <span className="text-white/30 text-[13px]">·</span>
          <span className="text-white/50 text-[13px]">Hospitality</span>
        </div>

        {/* Title */}
        <h2 className="text-[26px] font-bold text-white leading-tight mb-2">
          {job.title}
        </h2>

        {/* Location + salary */}
        <div className="flex items-center gap-3 text-sm mb-4">
          {job.location && (
            <span className="flex items-center gap-1 text-white/60">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {job.location}
            </span>
          )}
          {(job.salaryMin || job.salaryMax) && (
            <span className="text-emerald-400 font-semibold">
              {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
            </span>
          )}
        </div>

        {/* Skills chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {job.requiredSkills.slice(0, 3).map((skill) => (
            <span key={skill} className="chip text-[11px] text-white/80 border-white/20 bg-white/5">
              {skill}
            </span>
          ))}
        </div>

        {/* Apply CTA + match */}
        <div className="flex items-center gap-3">
          <a
            href={`/apply/${job.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 text-zinc-950 font-semibold text-[15px] shadow-[0_10px_28px_-12px_rgba(52,211,153,0.6)] hover:bg-emerald-400 active:bg-emerald-600 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
            Apply with video
          </a>
          {job.matchScore !== null && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5">
              <span className="text-lg font-bold text-emerald-400 leading-none">
                {Math.round(job.matchScore)}%
              </span>
              <span className="text-[9px] text-emerald-400/70 uppercase tracking-wider mt-0.5">
                Match
              </span>
            </div>
          )}
          {job.matchScore === null && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5">
              <span className="text-lg font-bold text-emerald-400 leading-none">
                94%
              </span>
              <span className="text-[9px] text-emerald-400/70 uppercase tracking-wider mt-0.5">
                Match
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function SideAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1 group">
      <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md grid place-items-center group-hover:bg-white/20 transition">
        {icon}
      </div>
      <span className="text-[11px] text-white font-medium">{label}</span>
    </button>
  )
}
