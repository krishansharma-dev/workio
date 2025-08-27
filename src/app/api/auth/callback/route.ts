// src/app/api/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  try {
    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(
          `${requestUrl.origin}/signin?error=${encodeURIComponent(error.message)}`
        )
      }
    }

    // Redirect all users to onboarding after successful auth
    // The onboarding page will handle whether to show steps or redirect
    return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/signin?error=${encodeURIComponent('An unexpected error occurred')}`
    )
  }
}