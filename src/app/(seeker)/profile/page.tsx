'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/shared/ui/Badge'
import { Button } from '@/components/shared/ui/Button'
import { VideoThumbnail } from '@/components/shared/video/VideoThumbnail'
import type { DbProfile, DbSeekerProfile, DbPortfolioVideo } from '@/lib/types/db'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState<DbProfile | null>(null)
  const [seekerProfile, setSeekerProfile] = useState<DbSeekerProfile | null>(null)
  const [portfolioVideos, setPortfolioVideos] = useState<DbPortfolioVideo[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, seekerRes, portfolioRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('seeker_profiles').select('*').eq('profile_id', user.id).single(),
        supabase
          .from('portfolio_videos')
          .select('*, video:videos(*)')
          .order('sort_order')
      ])

      if (profileRes.data) setProfile(profileRes.data as unknown as DbProfile)
      if (seekerRes.data) setSeekerProfile(seekerRes.data as unknown as DbSeekerProfile)
      if (portfolioRes.data) setPortfolioVideos(portfolioRes.data as unknown as DbPortfolioVideo[])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="relative px-6 pt-8 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
            {profile?.display_name?.[0] || '?'}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile?.display_name}</h1>
            <p className="text-white/50 text-sm">{profile?.headline || 'No headline yet'}</p>
            {profile?.location && (
              <p className="text-white/40 text-xs mt-1">{profile.location}</p>
            )}
          </div>
          <Button variant="secondary" size="sm">Edit</Button>
        </div>

        {seekerProfile?.open_to_work && (
          <div className="mt-4">
            <Badge variant="success">Open to Work</Badge>
          </div>
        )}

        {seekerProfile && seekerProfile.skills.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {seekerProfile.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">{portfolioVideos.length}</p>
            <p className="text-xs text-white/40">Videos</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">{seekerProfile?.experience_years || 0}</p>
            <p className="text-xs text-white/40">Years Exp</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">--</p>
            <p className="text-xs text-white/40">Applications</p>
          </div>
        </div>
      </div>

      {/* Video Portfolio */}
      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Video Portfolio</h2>
          <Link href="/record">
            <Button size="sm">+ Record</Button>
          </Link>
        </div>

        {portfolioVideos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-dashed border-white/20 rounded-2xl p-8 text-center"
          >
            <p className="text-white/50 mb-3">No videos yet</p>
            <p className="text-white/30 text-sm mb-4">Record your first skill video to stand out</p>
            <Link href="/record">
              <Button>Record Your First Video</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {portfolioVideos.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-xl overflow-hidden bg-white/5 aspect-[9/16]"
              >
                {item.video.cf_uid && (
                  <VideoThumbnail
                    cfUid={item.video.cf_uid}
                    className="w-full h-full"
                    alt={item.title}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="flex gap-1 mt-1">
                    {item.skill_tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
