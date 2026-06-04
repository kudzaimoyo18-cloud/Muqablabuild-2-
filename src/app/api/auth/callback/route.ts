import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/feed'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists (new OAuth user won't have one)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // First-time OAuth user — create profile from provider metadata
        const meta = data.user.user_metadata
        const displayName =
          meta?.full_name ||
          meta?.name ||
          `${meta?.given_name || ''} ${meta?.family_name || ''}`.trim() ||
          data.user.email?.split('@')[0] ||
          'User'

        await supabase.from('profiles').insert({
          id: data.user.id,
          role: 'seeker', // Default to seeker; can switch in onboarding
          display_name: displayName,
          avatar_cf_uid: meta?.avatar_url || meta?.picture || null,
        })

        // Redirect to onboarding for new OAuth users
        return NextResponse.redirect(`${origin}/onboarding/seeker`)
      }

      // Existing user — route by role
      if (existingProfile.role === 'employer') {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
