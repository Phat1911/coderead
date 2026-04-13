/**
 * @file lib/supabase/client.ts
 * @description The browser half of a two-client auth architecture.
 *
 *              The project uses the @supabase/ssr adapter (not the standard JS client)
 *              so auth tokens are stored in cookies rather than localStorage.  This is the
 *              decision that makes server/client auth state consistent: both the Next.js
 *              server and the browser read from the same cookie jar, so there is no
 *              "logged-in on client, anonymous on server" split that would require an extra
 *              round-trip to reconcile.
 *
 *              Use this file only in Client Components ('use client').
 *              Server Components and Route Handlers must use lib/supabase/server.ts,
 *              which binds to Next.js cookies() instead of document.cookie.
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Returns the browser-side Supabase client.
 * Safe to call on every render — the SSR adapter memoizes the singleton internally.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
