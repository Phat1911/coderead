/**
 * @file proxy.ts
 * @description Next.js middleware — the enforcement point for route-level auth guards.
 *
 *              The matcher covers only protected routes — not static assets or public pages.
 *              To protect a new route: add it to both the matcher array and protectedRoutes
 *              inside the proxy function. Never add redirect logic inside individual pages
 *              — that causes a render-then-redirect flash of protected content.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Runs on every request matched by config.matcher.
 * Refreshes the session, then gates protected routes — redirecting to /login with
 * the original path as returnUrl so sign-in can complete the interrupted navigation.
 */
export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const protectedRoutes = ['/profile', '/learning-paths/']
  if (protectedRoutes.some(r => pathname.startsWith(r)) && !user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

/** Next.js middleware matcher — restricts which routes this proxy runs on.
 *  Add new protected route patterns here when extending auth guards. */
export const config = {
  matcher: ['/profile/:path*', '/learning-paths/:path+'],
}
