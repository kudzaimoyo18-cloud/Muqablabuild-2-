'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { OAuthButtons } from '@/components/shared/ui/OAuthButtons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single()
    if (profile?.role === 'employer') router.push('/dashboard')
    else router.push('/feed')
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      {/* Left: hero pitch */}
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
          <div className="chip chip-emerald">
            Video-first hiring · GCC
          </div>
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
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 grid place-items-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            </div>
            <span className="text-base font-bold">Muqabla</span>
          </div>

          <p className="text-eyebrow mb-2">Welcome back</p>
          <h2 className="text-title mb-6">Log in to Muqabla</h2>

          <OAuthButtons mode="login" />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[--border-hairline]" />
            <span className="text-[10px] text-[--text-faint] uppercase tracking-wider">
              or continue with email
            </span>
            <div className="flex-1 h-px bg-[--border-hairline]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full px-4 py-3 rounded-xl border border-[--border-hairline] bg-[--surface-raised] text-[15px] placeholder-[--text-faint] focus:outline-none focus:border-[--accent-emerald-border] focus:ring-2 focus:ring-[--accent-emerald-soft] transition"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
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
              {loading ? 'Signing in…' : 'Log In'}
            </button>
          </form>

          <p className="text-sm text-[--text-faint] mt-6 text-center">
            New here?{' '}
            <Link href="/register" className="text-emerald-400 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
