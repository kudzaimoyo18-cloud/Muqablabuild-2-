'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/shared/ui/Badge'
import { formatScore, formatTimeAgo } from '@/lib/utils/format'
import type { ApplicationStage, CandidateView } from '@/lib/types/domain'

const STAGES: { key: ApplicationStage; label: string; color: string }[] = [
  { key: 'applied', label: 'Applied', color: 'bg-blue-500/20 text-blue-400' },
  { key: 'reviewed', label: 'Reviewed', color: 'bg-amber-500/20 text-amber-400' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'bg-purple-500/20 text-purple-400' },
  { key: 'interview', label: 'Interview', color: 'bg-cyan-500/20 text-cyan-400' },
  { key: 'offer', label: 'Offer', color: 'bg-emerald-500/20 text-emerald-400' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
]

interface PipelineJob {
  id: string
  title: string
}

export default function PipelinePage() {
  const [jobs, setJobs] = useState<PipelineJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<CandidateView[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadJobs() {
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
        .select('id, title')
        .eq('employer_id', employer.id)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setJobs(data)
        setSelectedJobId(data[0].id)
      }
      setLoading(false)
    }
    loadJobs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCandidates = useCallback(async () => {
    if (!selectedJobId) return
    const res = await fetch(`/api/candidates?jobId=${selectedJobId}&limit=50`)
    const data = await res.json()
    setCandidates(data.candidates || [])
  }, [selectedJobId])

  useEffect(() => {
    loadCandidates()
  }, [loadCandidates])

  async function moveCandidate(applicationId: string, newStage: ApplicationStage) {
    // Optimistic update
    setCandidates((prev) =>
      prev.map((c) =>
        c.applicationId === applicationId ? { ...c, stage: newStage } : c
      )
    )

    await fetch(`/api/pipeline/${applicationId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hiring Pipeline</h1>
        <p className="text-white/40 text-sm mt-1">Drag candidates through stages</p>
      </div>

      {/* Job selector */}
      {jobs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => setSelectedJobId(job.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedJobId === job.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {job.title}
            </button>
          ))}
        </div>
      )}

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.stage === stage.key)
          return (
            <div key={stage.key} className="flex-shrink-0 w-72">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="text-xs text-white/30">{stageCandidates.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[200px] bg-white/[.02] rounded-xl p-2 border border-white/5">
                {stageCandidates.map((candidate, i) => (
                  <motion.div
                    key={candidate.applicationId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/[.08] transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
                        {candidate.seekerName?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {candidate.seekerName || 'Anonymous Candidate'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {candidate.aiScore !== null && (
                            <Badge variant="score">{formatScore(candidate.aiScore)}</Badge>
                          )}
                          <span className="text-[10px] text-white/30">
                            {formatTimeAgo(candidate.appliedAt)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.skills.slice(0, 3).map((s) => (
                            <span key={s} className="text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick actions - visible on hover */}
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {stage.key !== 'rejected' && STAGES.filter((s) => s.key !== stage.key && s.key !== 'rejected').slice(0, 2).map((nextStage) => (
                        <button
                          key={nextStage.key}
                          onClick={(e) => {
                            e.stopPropagation()
                            moveCandidate(candidate.applicationId, nextStage.key)
                          }}
                          className={`text-[10px] px-2 py-1 rounded ${nextStage.color} hover:opacity-80`}
                        >
                          → {nextStage.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {stageCandidates.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-white/20 text-xs">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
