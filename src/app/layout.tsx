import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Arabic } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
})

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Muqabla - Video-First Hiring',
  description: 'Land your dream job with a video pitch. The Gulf region hiring platform.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body
        className={`${inter.variable} ${notoArabic.variable} font-sans bg-zinc-950 text-white antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
