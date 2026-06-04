'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/shared/ui/Badge'
import { formatTimeAgo } from '@/lib/utils/format'
import { motion } from 'framer-motion'
import type { ApplicationStage } from '@/lib/types/domain'

interface MyApplication {
  id: string
  stage: ApplicationStage
  appliedAt: string
  jobTitle: string
  companyName: string
  location: string | null
}

const STAGE_BADGES: Record<ApplicationStage, { variant: 'default' | 'success' | 'warning' | 'info'; label: string }> = {
  applied: { variant: 'info', label: 'Applied' },
  reviewed: { variant: 'warning', label: 'Under Review' },
  shortlisted: { variant: 'success', label: 'Shortlisted!' },
  interview: { variant: 'success', label: 'Interview' },
  offer: { variant: 'success', label: 'Offer!' },
  rejected: { variant: 'default', label: 'Not Selected' },
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<MyApplication[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: seeker } = await supabase
        .from('seeker_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!seeker) return

      const { data } = await supabase
        .from('applications')
        .select('id, stage, applied_at, job_postings(title, location, employer_profiles(company_name))')
        .eq('seeker_id', seeker.id)
        .order('applied_at', { ascending: false })

      if (data) {
        setApps(data.map((a: any) => ({
          id: a.id,
          stage: a.stage,
          appliedAt: a.applied_at,
          jobTitle: a.job_postings?.title || 'Unknown',
          companyName: a.job_postings?.employer_profiles?.company_name || 'Unknown',
          location: a.job_postings?.location,
        })))
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <h1 className="text-xl font-bold mb-6">My Applications</h1>

      {apps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/50 mb-2">No applications yet</p>
          <p className="text-white/30 text-sm">Swipe through jobs and apply with your video pitch</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app, i) => {
            const stageBadge = STAGE_BADGES[app.stage]
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{app.jobTitle}</h3>
                    <p className="text-sm text-white/40">{app.companyName}</p>
                    {app.location && <p className="text-xs text-white/30 mt-0.5">{app.location}</p>}
                  </div>
                  <Badge variant={stageBadge.variant}>{stageBadge.label}</Badge>
                </div>
                <p className="text-xs text-white/30 mt-2">{formatTimeAgo(app.appliedAt)}</p>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
