/**
 * @file lib/supabase/middleware.ts
 * @description Auth token refresh cannot be deferred to individual pages.
 *
 *              If a JWT expires between visits, the first page the user hits would get a
 *              401 from Supabase and show them as logged out — even if their refresh token
 *              is still valid.  Handling the refresh in middleware means every request
 *              gets a valid, up-to-date token before any page or API route runs.
 *
 *              The double cookie-write in setAll is the price the Supabase SSR contract
 *              charges for this guarantee.  The write to request.cookies makes the new
 *              token visible to the page handler in the same request cycle.  The write
 *              to supabaseResponse.cookies sends it to the browser so subsequent requests
 *              also carry the refreshed token.  Skipping either write breaks one half of
 *              the delivery chain.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the auth token for this request and returns both the response to
 * forward and the current user, so the caller (proxy.ts) can apply route guards.
 * Always return `supabaseResponse` from middleware — never a fresh NextResponse —
 * or the cookies set here will be silently dropped.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return { supabaseResponse, user }
}
