/**
 * @file app/auth/callback/route.ts
 * @description The landing point for Supabase email confirmation links.
 *
 *              When a user clicks the confirmation link in their inbox, Supabase
 *              redirects them here with a one-time `code` param.  The code-for-session
 *              exchange must happen server-side (in a Route Handler, not client JS)
 *              because it sets HttpOnly auth cookies on the response — cookies that
 *              client JavaScript cannot read or steal.  Doing this exchange client-side
 *              would expose the session token in the URL fragment longer than necessary.
 */

import { getClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Exchanges the one-time code for an auth session, then forwards the user onward.
 * Always redirects — never returns a rendered page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await getClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
