'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/shared/ui/Button'
import { motion } from 'framer-motion'

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
  'Java', 'Go', 'AWS', 'Docker', 'SQL',
  'Customer Service', 'Sales', 'Leadership', 'Communication',
  'Arabic', 'English', 'Hospitality', 'Marketing', 'Finance',
]

export default function NewJobPage() {
  const [title, setTitle] = useState('')
  const [titleAr, setTitleAr] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [remoteAllowed, setRemoteAllowed] = useState(false)
  const [anonymousMode, setAnonymousMode] = useState(false)
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [currency, setCurrency] = useState('AED')
  const [skills, setSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: employer } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!employer) return

    const { error } = await supabase.from('job_postings').insert({
      employer_id: employer.id,
      title,
      title_ar: titleAr || null,
      description,
      location,
      remote_allowed: remoteAllowed,
      anonymous_mode: anonymousMode,
      salary_min: salaryMin ? Number(salaryMin) : null,
      salary_max: salaryMax ? Number(salaryMax) : null,
      currency,
      required_skills: skills,
    })

    if (!error) {
      router.push('/jobs')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Post New Job</h1>
      <p className="text-white/40 text-sm mb-8">Create a job posting to receive video applications</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Job Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
            placeholder="Senior Frontend Developer"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-1.5">Job Title (Arabic)</label>
          <input
            type="text"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            dir="rtl"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
            placeholder="مطور واجهات أمامية أول"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none transition-all"
            placeholder="Describe the role, responsibilities, and what you're looking for..."
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm text-white/60 mb-2">Required Skills</label>
          <div className="flex flex-wrap gap-2">
            {SKILL_SUGGESTIONS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  skills.includes(skill)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Location + Remote */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">Select</option>
              <option value="Dubai, UAE">Dubai, UAE</option>
              <option value="Abu Dhabi, UAE">Abu Dhabi, UAE</option>
              <option value="Riyadh, KSA">Riyadh, KSA</option>
              <option value="Jeddah, KSA">Jeddah, KSA</option>
              <option value="Doha, Qatar">Doha, Qatar</option>
              <option value="Kuwait City">Kuwait City</option>
              <option value="Manama, Bahrain">Manama, Bahrain</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer px-4 py-3">
              <input
                type="checkbox"
                checked={remoteAllowed}
                onChange={(e) => setRemoteAllowed(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/25"
              />
              <span className="text-sm text-white/60">Remote OK</span>
            </label>
          </div>
        </div>

        {/* Salary */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Min Salary</label>
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="5000"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Max Salary</label>
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="15000"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="AED">AED</option>
              <option value="SAR">SAR</option>
              <option value="QAR">QAR</option>
              <option value="KWD">KWD</option>
              <option value="BHD">BHD</option>
              <option value="OMR">OMR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Anonymous mode */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymousMode}
              onChange={(e) => setAnonymousMode(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/25"
            />
            <div>
              <p className="text-sm font-medium">Anonymous Mode</p>
              <p className="text-xs text-white/40 mt-0.5">
                Hide candidate names and photos during review to reduce unconscious bias.
                Identity revealed only after shortlisting.
              </p>
            </div>
          </label>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Post Job
        </Button>
      </form>
    </div>
  )
}
