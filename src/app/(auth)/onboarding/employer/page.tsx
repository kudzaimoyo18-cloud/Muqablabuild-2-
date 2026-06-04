'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/shared/ui/Button'

const INDUSTRIES = [
  'Technology', 'Hospitality & Tourism', 'Retail & E-commerce',
  'Finance & Banking', 'Healthcare', 'Real Estate & Construction',
  'Education', 'Oil & Gas', 'Government', 'Consulting',
  'F&B', 'Logistics', 'Media & Entertainment', 'Manufacturing',
]

const COMPANY_SIZES = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+',
]

export default function EmployerOnboardingPage() {
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: insertError } = await supabase.from('employer_profiles').insert({
      profile_id: user.id,
      company_name: companyName,
      industry,
      company_size: companySize,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-zinc-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-2">Set up your company</h1>
        <p className="text-white/50 text-sm mb-8">Tell us about your organization</p>

        <form onSubmit={handleComplete} className="space-y-5">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="Acme Corp"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-3">Company Size</label>
            <div className="grid grid-cols-3 gap-2">
              {COMPANY_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setCompanySize(size)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    companySize === size
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Go to Dashboard
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
