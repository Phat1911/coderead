/**
 * @file components/ui/PosthogProvider.tsx
 * @description Initialises PostHog and tracks page views across the entire app.
 *
 *              Two concerns live here together because they are tightly coupled:
 *
 *              PosthogProvider wraps the React tree with PHProvider (the context that
 *              makes usePostHog() available to any child component) and initialises
 *              the PostHog client once on mount.  capture_pageview is set to false
 *              because Next.js App Router navigations are client-side transitions —
 *              PostHog's built-in automatic pageview only fires on hard page loads.
 *              We fire it manually in PosthogPageview instead.
 *
 *              PosthogPageview watches pathname + searchParams and fires a $pageview
 *              event on every route change.  It must be a separate component (not
 *              inlined into the provider) because useSearchParams() suspends during
 *              SSR — it needs its own <Suspense> boundary so the suspension is
 *              contained and doesn't block the rest of the tree from rendering.
 */

'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Fires a PostHog $pageview event whenever the route changes.
 * Must be rendered inside PHProvider so usePostHog() has access to the client.
 * Wrapped in Suspense by the parent because useSearchParams() suspends on SSR.
 */
function PosthogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()

  useEffect(() => {
    if (!pathname || !ph) return
    const search = searchParams.toString()
    const url = window.location.origin + pathname + (search ? `?${search}` : '')
    ph.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams, ph])

  return null
}

/**
 * Initialises PostHog once on mount and provides the client to the React tree.
 * Wraps children with PHProvider so any component can call usePostHog().
 */
export default function PosthogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Guard against double-init in React dev mode (Strict Mode mounts twice).
    // posthog.__loaded is set to true after the first successful init call.
    if (posthog.__loaded) return

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      // Track all visitors, anonymous or not.  'identified_only' in newer SDK
      // versions suppresses events entirely for anonymous sessions, which means
      // no data at all until a user logs in.  'always' is the correct default
      // for a public site where most visitors are not signed in.
      person_profiles: 'always',
      // Disabled — we fire $pageview manually in PosthogPageview to capture
      // client-side navigations that PostHog's built-in tracker would miss.
      capture_pageview: false,
      capture_pageleave: true,
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      {/* Suspense boundary confines the useSearchParams() suspension to this
          subtree so it never blocks the rest of the page from rendering. */}
      <Suspense fallback={null}>
        <PosthogPageview />
      </Suspense>
      {children}
    </PHProvider>
  )
}
