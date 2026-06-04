'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const sidebarItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/jobs',
    label: 'Candidates',
    badge: '128',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/pipeline',
    label: 'Pipeline',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16h2v-5h2v8h2V7h2v12h2V3" />
      </svg>
    ),
  },
  {
    href: '/jobs/new',
    label: 'Post a job',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
]

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-dvh" style={{ background: 'var(--surface-base)' }}>
      <aside
        className="w-64 flex flex-col border-e border-[--border-hairline]"
        style={{ background: 'var(--surface-sidebar)' }}
      >
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 grid place-items-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            </div>
            <span className="text-base font-bold tracking-tight">Muqabla</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && item.href !== '/jobs/new' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? 'text-white bg-white/[.06]'
                    : 'text-[--text-muted] hover:text-white hover:bg-white/[.03]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="employer-sidebar-indicator"
                    className="absolute start-0 top-1.5 bottom-1.5 w-0.5 bg-emerald-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] text-[--text-faint] font-mono">{item.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* ML Engine status */}
        <div className="px-3 pb-3">
          <div className="rounded-xl border border-[--border-hairline] bg-[--surface-raised] px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="oklch(75% 0.20 162)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-[11px] font-semibold text-emerald-400">ML Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="text-[10px] text-[--text-muted]">Analyzing 3 videos...</span>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="p-3 border-t border-[--border-hairline]">
          <Link
            href="/login"
            className="flex items-center gap-2 px-2 py-2 text-[12px] text-[--text-muted] hover:text-white transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}
