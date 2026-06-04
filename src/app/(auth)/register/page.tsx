'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { OAuthButtons } from '@/components/shared/ui/OAuthButtons'
import type { UserRole } from '@/lib/types/domain'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<UserRole>('seeker')
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, display_name: displayName } },
    })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }
    if (data.user) {
      router.push(role === 'employer' ? '/onboarding/employer' : '/onboarding/seeker')
    }
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      {/* Left: hero */}
      <motion.aside
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col justify-between p-12 border-r border-[--border-hairline]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 grid place-items-center">
            <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          </div>
          <span className="text-lg font-bold tracking-tight">Muqabla</span>
        </div>

        <div className="space-y-6">
          <div className="chip chip-emerald">Video-first hiring · GCC</div>
          <h1 className="text-display">
            Hire for who they are,
            <br />
            <span className="text-emerald-400 italic">not what they typed.</span>
          </h1>
          <p className="text-[15px] leading-relaxed text-[--text-muted] max-w-md">
            Short video pitches replace the resume. AI ranks candidates on skill,
            confidence and communication — across Arabic and English.
          </p>
        </div>

        <p className="text-xs text-[--text-faint]">
          Trusted across UAE · KSA · Qatar · Kuwait · Bahrain · Oman
        </p>
      </motion.aside>

      {/* Right: auth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-center p-6 lg:p-12"
      >
        <div className="w-full max-w-md">
          {step === 'role' ? (
            <>
              <p className="text-eyebrow mb-2">Get started</p>
              <h2 className="text-title mb-8">How will you use Muqabla?</h2>

              <div className="space-y-3">
                <button
                  onClick={() => { setRole('seeker'); setStep('details') }}
                  className="group w-full flex items-center gap-4 rounded-2xl border border-[--border-hairline] bg-[--surface-raised] p-5 text-left transition hover:border-[--accent-emerald-border] hover:-translate-y-0.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 grid place-items-center flex-shrink-0">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="oklch(75% 0.20 162)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m23 7-7 5 7 5V7z" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[15px]">I'm looking for work</p>
                    <p className="text-[13px] text-[--text-muted] mt-0.5">
                      Swipe jobs, pitch yourself on video, skip the resume.
                    </p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[--text-faint] group-hover:text-[--text] rtl:rotate-180 transition">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>

                <button
                  onClick={() => { setRole('employer'); setStep('details') }}
                  className="group w-full flex items-center gap-4 rounded-2xl border border-[--border-hairline] bg-[--surface-raised] p-5 text-left transition hover:border-[--accent-gold-border] hover:-translate-y-0.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/20 grid place-items-center flex-shrink-0">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="oklch(82% 0.16 78)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[15px]">I'm hiring</p>
                    <p className="text-[13px] text-[--text-muted] mt-0.5">
                      Post roles, get AI-ranked video candidates, hire faster.
                    </p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[--text-faint] group-hover:text-[--text] rtl:rotate-180 transition">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-[--border-hairline]" />
                <span className="text-[10px] text-[--text-faint] uppercase tracking-wider">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-[--border-hairline]" />
              </div>

              <OAuthButtons mode="register" />

              <p className="text-sm text-[--text-faint] mt-6 text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-emerald-400 font-medium">
                  Log in
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('role')}
                className="text-sm text-[--text-faint] hover:text-[--text] mb-4 flex items-center gap-1 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rtl:rotate-180">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back
              </button>
              <p className="text-eyebrow mb-2">
                {role === 'seeker' ? 'Job seeker' : 'Employer'}
              </p>
              <h2 className="text-title mb-8">Tell us a bit about you</h2>

              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder={role === 'seeker' ? 'Ahmed Al-Rashid' : 'Sarah Johnson'}
                  className="w-full px-4 py-3 rounded-xl border border-[--border-hairline] bg-[--surface-raised] text-[15px] placeholder-[--text-faint] focus:outline-none focus:border-[--accent-emerald-border] focus:ring-2 focus:ring-[--accent-emerald-soft] transition"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-[--border-hairline] bg-[--surface-raised] text-[15px] placeholder-[--text-faint] focus:outline-none focus:border-[--accent-emerald-border] focus:ring-2 focus:ring-[--accent-emerald-soft] transition"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 rounded-xl border border-[--border-hairline] bg-[--surface-raised] text-[15px] placeholder-[--text-faint] focus:outline-none focus:border-[--accent-emerald-border] focus:ring-2 focus:ring-[--accent-emerald-soft] transition"
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg"
                  >
                    {error}
                  </motion.p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-zinc-950 font-semibold text-[15px] shadow-[0_10px_28px_-12px_rgba(52,211,153,0.6)] hover:bg-emerald-400 active:bg-emerald-600 transition disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
