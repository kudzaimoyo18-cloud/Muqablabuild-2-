'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const navItems = [
  {
    href: '/feed',
    label: 'Discover',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    href: '/record',
    label: 'Record',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    href: '/applications',
    label: 'Applied',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function SeekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [cursorPos, setCursorPos] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  })

  return (
    <div className="flex flex-col h-dvh bg-zinc-950">
      <main className="flex-1 overflow-hidden">{children}</main>

      <nav className="glass border-t border-white/10 px-4 pb-safe">
        <div className="flex items-center justify-center py-2">
          <ul
            className="relative flex w-fit rounded-full border border-white/10 bg-white/5 p-1"
            onMouseLeave={() =>
              setCursorPos((pv) => ({ ...pv, opacity: 0 }))
            }
          >
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <NavTab
                  key={item.href}
                  href={item.href}
                  isActive={isActive}
                  setCursorPos={setCursorPos}
                  icon={item.icon}
                  label={item.label}
                />
              )
            })}

            {/* Hover cursor */}
            <motion.li
              animate={cursorPos}
              className="absolute z-0 h-10 rounded-full bg-emerald-500/20"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </ul>
        </div>
      </nav>
    </div>
  )
}

function NavTab({
  href,
  isActive,
  setCursorPos,
  icon,
  label,
}: {
  href: string
  isActive: boolean
  setCursorPos: React.Dispatch<
    React.SetStateAction<{ left: number; width: number; opacity: number }>
  >
  icon: React.ReactNode
  label: string
}) {
  const ref = useRef<HTMLLIElement>(null)

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return
        const { width } = ref.current.getBoundingClientRect()
        setCursorPos({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        })
      }}
      className="relative z-10"
    >
      <Link
        href={href}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wide transition-colors duration-200 ${
          isActive
            ? 'text-emerald-400'
            : 'text-white/40 hover:text-white/70'
        }`}
      >
        <span className="mix-blend-difference">{icon}</span>
        <span className="hidden sm:inline mix-blend-difference">{label}</span>
        {isActive && (
          <span className="sm:hidden mix-blend-difference">{label}</span>
        )}
      </Link>
    </li>
  )
}
