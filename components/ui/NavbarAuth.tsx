/**
 * @file components/ui/NavbarAuth.tsx
 * @description The auth link in the navbar must react to login/logout without a full
 *              page reload.  After signing in from /login, the user is redirected back
 *              and this component needs to know immediately that the session changed.
 *
 *              onAuthStateChange subscription is the only reliable way to catch that
 *              transition — polling or relying on navigation events would both miss
 *              some cases.  Returns null while loading to hold its space invisibly
 *              rather than flash "Sign in" before confirming the user is actually logged out.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NavbarAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null

  return isLoggedIn ? (
    <Link
      href="/profile"
      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
    >
      Profile
    </Link>
  ) : (
    <Link
      href="/login"
      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
    >
      Sign in
    </Link>
  )
}
