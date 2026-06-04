'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatTimeAgo } from '@/lib/utils/format'

interface DashboardStats {
  openRoles: number
  totalApplications: number
  pendingReview: number
  shortlisted: number
}

interface RecentApplication {
  id: string
  jobTitle: string
  seekerName: string | null
  appliedAt: string
  aiScore: number | null
}

interface FunnelStage {
  label: string
  count: number
  pct: number
}

const SCORING_WEIGHTS = [
  { label: 'Skill match', value: 30, color: 'oklch(75% 0.20 162)' },
  { label: 'Confidence', value: 25, color: 'oklch(70% 0.15 250)' },
  { label: 'Body language', value: 20, color: 'oklch(82% 0.16 78)' },
  { label: 'Sentiment', value: 15, color: 'oklch(70% 0.22 25)' },
  { label: 'Video quality', value: 10, color: 'oklch(70% 0.18 300)' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ openRoles: 0, totalApplications: 0, pendingReview: 0, shortlisted: 0 })
  const [recent, setRecent] = useState<RecentApplication[]>([])
  const [funnel, setFunnel] = useState<FunnelStage[]>([])
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()
      if (profile?.display_name) setDisplayName(profile.display_name.split(' ')[0])

      const { data: employer } = await supabase
        .from('employer_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single()
      if (!employer) return

      const [jobsRes, appsRes] = await Promise.all([
        supabase.from('job_postings').select('id', { count: 'exact' }).eq('employer_id', employer.id).eq('active', true),
        supabase.from('applications')
          .select('id, stage, ai_score, applied_at, job_postings!inner(title, employer_id), seeker_profiles(profile_id, profiles(display_name))')
          .eq('job_postings.employer_id', employer.id)
          .order('applied_at', { ascending: false })
          .limit(10),
      ])

      const apps = appsRes.data || []
      const total = apps.length
      const stageCount = (s: string) => apps.filter((a: any) => a.stage === s).length

      setStats({
        openRoles: jobsRes.count || 0,
        totalApplications: total,
        pendingReview: stageCount('applied'),
        shortlisted: stageCount('shortlisted'),
      })

      const max = Math.max(total, 1)
      setFunnel([
        { label: 'Applied', count: total, pct: 100 },
        { label: 'Reviewed', count: stageCount('reviewed') + stageCount('shortlisted') + stageCount('interview') + stageCount('offer'), pct: ((stageCount('reviewed') + stageCount('shortlisted') + stageCount('interview') + stageCount('offer')) / max) * 100 },
        { label: 'Shortlisted', count: stageCount('shortlisted') + stageCount('interview') + stageCount('offer'), pct: ((stageCount('shortlisted') + stageCount('interview') + stageCount('offer')) / max) * 100 },
        { label: 'Interview', count: stageCount('interview') + stageCount('offer'), pct: ((stageCount('interview') + stageCount('offer')) / max) * 100 },
        { label: 'Offer', count: stageCount('offer'), pct: (stageCount('offer') / max) * 100 },
      ])

      setRecent(apps.slice(0, 5).map((a: any) => ({
        id: a.id,
        jobTitle: a.job_postings?.title || 'Unknown',
        seekerName: a.seeker_profiles?.profiles?.display_name || null,
        appliedAt: a.applied_at,
        aiScore: a.ai_score,
      })))

      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-8">
      {/* Greeting + post */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-title">{greeting}, {displayName || 'there'}</h1>
          <p className="text-[13px] text-[--text-muted] mt-1">Here's what's happening across your roles today.</p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 text-[13px] font-semibold shadow-[0_10px_24px_-12px_rgba(52,211,153,0.55)] hover:bg-emerald-400 transition"
        >
          <span className="text-base leading-none">+</span> Post a job
        </Link>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
            </svg>
          }
          iconBg="bg-white/5"
          iconColor="text-white/70"
          value={stats.openRoles}
          label="Open roles"
        />
        <KpiCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-400"
          value={stats.totalApplications}
          label="Total applications"
          delta="+18%"
          deltaColor="text-emerald-400"
        />
        <KpiCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          iconBg="bg-amber-400/15"
          iconColor="text-amber-400"
          value={stats.pendingReview}
          label="Pending review"
        />
        <KpiCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
          iconBg="bg-purple-400/15"
          iconColor="text-purple-400"
          value={stats.shortlisted}
          label="Shortlisted"
          delta="+12%"
          deltaColor="text-emerald-400"
        />
      </div>

      {/* Recent + funnel */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent applications */}
        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-title-sm">Recent applications</h2>
            <Link href="/pipeline" className="text-xs text-emerald-400 font-medium">View all →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[--text-muted]">No applications yet</p>
              <p className="text-xs text-[--text-faint] mt-1">Post a job to start receiving video pitches</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recent.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[.04] transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 grid place-items-center flex-shrink-0 relative">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{app.seekerName || 'Anonymous'}</p>
                    <p className="text-[11px] text-[--text-muted] truncate">{app.jobTitle}</p>
                  </div>
                  <span className="text-[11px] text-[--text-faint]">{formatTimeAgo(app.appliedAt).replace(' ago', '')}</span>
                  {app.aiScore !== null && (
                    <div className="flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-400/30 px-1.5 py-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="oklch(75% 0.20 162)">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="text-[11px] font-bold text-emerald-400">{Math.round(app.aiScore)}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Hiring funnel */}
        <div className="surface-card p-5">
          <h2 className="text-title-sm mb-4">Hiring funnel</h2>
          <div className="space-y-3">
            {funnel.map((s) => (
              <div key={s.label} className="grid grid-cols-[100px_1fr_30px] items-center gap-3">
                <span className="text-[12px] text-[--text-muted]">{s.label}</span>
                <div className="weight-bar">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{ background: 'linear-gradient(90deg, oklch(75% 0.20 162), oklch(82% 0.18 160))' }}
                  />
                </div>
                <span className="text-[12px] font-semibold text-end">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI scoring weights */}
      <div className="surface-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="oklch(75% 0.20 162)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <h2 className="text-title-sm">AI scoring weights</h2>
        </div>
        <div className="space-y-3">
          {SCORING_WEIGHTS.map((w) => (
            <div key={w.label} className="grid grid-cols-[120px_1fr_30px] items-center gap-3">
              <span className="text-[12px] text-[--text-muted]">{w.label}</span>
              <div className="weight-bar">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${w.value}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  style={{ background: w.color }}
                />
              </div>
              <span className="text-[12px] font-semibold text-end">{w.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  delta,
  deltaColor,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  value: number
  label: string
  delta?: string
  deltaColor?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card p-5 relative"
    >
      <div className="flex items-start justify-between mb-3">
        {delta && (
          <span className={`text-[11px] font-bold ${deltaColor}`}>{delta}</span>
        )}
        {!delta && <span />}
        <div className={`w-9 h-9 rounded-xl grid place-items-center ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <p className="text-[32px] font-bold leading-none">{value}</p>
      <p className="text-[12px] text-[--text-muted] mt-1.5">{label}</p>
    </motion.div>
  )
}
