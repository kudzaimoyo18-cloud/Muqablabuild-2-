'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/shared/ui/Button'
import { Badge } from '@/components/shared/ui/Badge'
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ openRoles: 0, totalApplications: 0, pendingReview: 0, shortlisted: 0 })
  const [recent, setRecent] = useState<RecentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get employer profile
      const { data: employer } = await supabase
        .from('employer_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!employer) return

      // Stats
      const [jobsRes, appsRes] = await Promise.all([
        supabase.from('job_postings').select('id', { count: 'exact' }).eq('employer_id', employer.id).eq('active', true),
        supabase.from('applications')
          .select('id, stage, ai_score, applied_at, job_postings!inner(title, employer_id), seeker_profiles(profile_id, profiles(display_name))')
          .eq('job_postings.employer_id', employer.id)
          .order('applied_at', { ascending: false })
          .limit(10),
      ])

      const apps = appsRes.data || []
      setStats({
        openRoles: jobsRes.count || 0,
        totalApplications: apps.length,
        pendingReview: apps.filter((a: any) => a.stage === 'applied').length,
        shortlisted: apps.filter((a: any) => a.stage === 'shortlisted').length,
      })

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

  const statCards = [
    { label: 'Open Roles', value: stats.openRoles, color: 'text-blue-400' },
    { label: 'Applications', value: stats.totalApplications, color: 'text-emerald-400' },
    { label: 'Pending Review', value: stats.pendingReview, color: 'text-amber-400' },
    { label: 'Shortlisted', value: stats.shortlisted, color: 'text-purple-400' },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Overview of your hiring pipeline</p>
        </div>
        <Link href="/jobs/new">
          <Button>+ Post New Job</Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5"
          >
            <p className="text-sm text-white/50">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <Link href="/pipeline" className="text-sm text-emerald-400 hover:text-emerald-300">View all</Link>
        </div>

        {recent.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/50">No applications yet</p>
            <p className="text-white/30 text-sm mt-1">Post a job to start receiving video pitches</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/[.07] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center text-sm font-bold text-emerald-400">
                  {app.seekerName?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{app.seekerName || 'Anonymous'}</p>
                  <p className="text-xs text-white/40">Applied to {app.jobTitle}</p>
                </div>
                {app.aiScore !== null && (
                  <Badge variant="score">{Math.round(app.aiScore)}% AI</Badge>
                )}
                <span className="text-xs text-white/30">{formatTimeAgo(app.appliedAt)}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
