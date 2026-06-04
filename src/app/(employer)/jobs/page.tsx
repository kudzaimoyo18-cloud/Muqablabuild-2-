'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/shared/ui/Button'
import { Badge } from '@/components/shared/ui/Badge'
import { formatSalary, formatTimeAgo } from '@/lib/utils/format'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface JobItem {
  id: string
  title: string
  location: string | null
  remoteAllowed: boolean
  salaryMin: number | null
  salaryMax: number | null
  currency: string
  requiredSkills: string[]
  anonymousMode: boolean
  applicationCount: number
  active: boolean
  createdAt: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: employer } = await supabase
        .from('employer_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!employer) return

      const { data } = await supabase
        .from('job_postings')
        .select('*')
        .eq('employer_id', employer.id)
        .order('created_at', { ascending: false })

      if (data) {
        setJobs(data.map((j: any) => ({
          id: j.id,
          title: j.title,
          location: j.location,
          remoteAllowed: j.remote_allowed,
          salaryMin: j.salary_min,
          salaryMax: j.salary_max,
          currency: j.currency,
          requiredSkills: j.required_skills || [],
          anonymousMode: j.anonymous_mode,
          applicationCount: j.application_count,
          active: j.active,
          createdAt: j.created_at,
        })))
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Postings</h1>
        <Link href="/jobs/new"><Button>+ Post New Job</Button></Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-white/50 mb-2">No jobs posted yet</p>
          <p className="text-white/30 text-sm mb-4">Create your first job posting to start receiving video applications</p>
          <Link href="/jobs/new"><Button>Post Your First Job</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[.07] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{job.title}</h3>
                    {!job.active && <Badge variant="warning">Inactive</Badge>}
                    {job.anonymousMode && <Badge variant="info">Anonymous</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/40 mt-1">
                    {job.location && <span>{job.location}</span>}
                    {job.remoteAllowed && <span>Remote OK</span>}
                    {(job.salaryMin || job.salaryMax) && (
                      <span>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.requiredSkills.slice(0, 5).map((s) => (
                      <span key={s} className="text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-2xl font-bold text-emerald-400">{job.applicationCount}</p>
                  <p className="text-xs text-white/40">applications</p>
                  <p className="text-xs text-white/30 mt-1">{formatTimeAgo(job.createdAt)}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                <Link href={`/pipeline?job=${job.id}`}>
                  <Button size="sm" variant="secondary">View Pipeline</Button>
                </Link>
                <Button size="sm" variant="ghost">Edit</Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
