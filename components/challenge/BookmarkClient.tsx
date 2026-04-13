/**
 * @file components/challenge/BookmarkClient.tsx
 * @description Exists to solve a server/client boundary constraint.
 *
 *              The /bookmarks page has no server-side data to fetch — challenges are
 *              static and bookmark state is in localStorage.  The tempting solution is
 *              to make the whole page a Client Component and read localStorage directly.
 *              The problem: that would force all the static challenge data to be fetched
 *              client-side, adding a loading state to a page that needs none.
 *
 *              The solution: keep the page a Server Component that passes the full
 *              challenge catalogue as a static prop, then delegate only the
 *              localStorage-dependent rendering to this Client Component island.
 *              The page loads instantly from static HTML; this component hydrates and
 *              filters silently after.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Challenge, Difficulty } from '@/types/challenge'
import { useBookmarks } from '@/lib/hooks/useBookmarks'

interface BookmarkClientProps {
  challenges: Challenge[]
  difficultyColor: Record<Difficulty, string>
}

export default function BookmarkClient({ challenges, difficultyColor }: BookmarkClientProps) {
  const { bookmarks, loading, toggleBookmark, isBookmarked } = useBookmarks()

  if (loading) {
    return <p className="text-gray-400">Loading bookmarks...</p>
  }

  const bookmarkedChallenges = challenges.filter(c => isBookmarked(c.id))

  if (bookmarkedChallenges.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">🔖</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookmarks yet</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Bookmark challenges from the list to revisit them later.
        </p>
        <Link
          href="/challenges"
          className="text-sm text-gray-600 dark:text-gray-400 underline hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Browse challenges
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookmarkedChallenges.map((challenge) => (
        <div
          key={challenge.id}
          className="group block rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200 bg-white dark:bg-gray-900"
        >
          <div className="flex items-start justify-between gap-4">
            <Link href={`/challenges/${challenge.id}`} className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">
                {challenge.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{challenge.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{challenge.language}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
              </div>
            </Link>
            <button
              onClick={() => toggleBookmark(challenge.id)}
              className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors shrink-0 p-2"
              aria-label="Remove bookmark"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
