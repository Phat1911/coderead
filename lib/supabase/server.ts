/**
 * @file lib/supabase/server.ts
 * @description Server-side auth enables a critical UX pattern: redirect before render.
 *
 *              With a client-side auth check (useEffect), a protected page would briefly
 *              render its content before the check completes and triggers a redirect —
 *              a flash of protected content.  By checking auth here on the server, the
 *              profile page can issue an HTTP redirect before a single byte of HTML is sent.
 *
 *              The empty catch in setAll is intentional: Server Components run in a
 *              read-only rendering context where cookie writes are not possible.  Rather
 *              than crash, we silently skip the write.  The cookie will be refreshed on
 *              the next request that goes through middleware instead.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Returns a Supabase client that reads/writes auth state via the current request's
 * cookie store.  Must be awaited — Next.js cookies() is async in this version.
 */
export async function getClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
