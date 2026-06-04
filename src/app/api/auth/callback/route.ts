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
      // Profile auto-created by DB trigger on auth.users insert
      // Check if profile exists and get role
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        // First OAuth login — trigger should have created profile
        // Redirect to seeker onboarding (default role)
        return NextResponse.redirect(`${origin}/onboarding/seeker`)
      }

      // Check if seeker_profile or employer_profile exists (onboarding done?)
      if (profile.role === 'employer') {
        const { data: employer } = await supabase
          .from('employer_profiles')
          .select('id')
          .eq('profile_id', data.user.id)
          .single()

        if (!employer) {
          return NextResponse.redirect(`${origin}/onboarding/employer`)
        }
        return NextResponse.redirect(`${origin}/dashboard`)
      } else {
        const { data: seeker } = await supabase
          .from('seeker_profiles')
          .select('id')
          .eq('profile_id', data.user.id)
          .single()

        if (!seeker) {
          return NextResponse.redirect(`${origin}/onboarding/seeker`)
        }
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
