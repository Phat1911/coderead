/**
 * @file lib/hooks/useBookmarks.ts
 * @description Bookmarks are deliberately local-only — no account required.
 *
 *              The design choice: a user should be able to bookmark a challenge the
 *              moment they see it, before deciding whether to create an account.
 *              localStorage makes this zero-friction.  The accepted trade-off is that
 *              bookmarks don't sync across devices.
 *
 *              The `loading` flag solves a specific SSR problem: the server renders with
 *              an empty bookmark list, but localStorage may have data after hydration.
 *              Components that render a bookmark icon immediately would flash from
 *              "unbookmarked" to "bookmarked".  The loading gate delays rendering the
 *              bookmark UI until after the client has read localStorage.
 */

import { useState, useEffect } from 'react'

/**
 * Bookmark state with localStorage persistence.
 * `loading` is true until the post-hydration localStorage read completes —
 * callers should suppress bookmark UI during this window to avoid a flash.
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('coderead_bookmarks')
    setBookmarks(stored ? JSON.parse(stored) : [])
    setLoading(false)
  }, [])

  function toggleBookmark(challengeId: string) {
    const isBookmarked = bookmarks.includes(challengeId)
    const updated = isBookmarked
      ? bookmarks.filter(id => id !== challengeId)
      : [...bookmarks, challengeId]
    setBookmarks(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('coderead_bookmarks', JSON.stringify(updated))
    }
  }

  return { bookmarks, loading, toggleBookmark, isBookmarked: (id: string) => bookmarks.includes(id) }
}
