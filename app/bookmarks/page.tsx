/**
 * @file app/bookmarks/page.tsx
 * @description Route "/bookmarks" — static shell wrapping a localStorage-dependent island.
 *
 *              This page has no server data to fetch, yet it can't be a pure Server
 *              Component because the bookmark list lives in localStorage (browser-only).
 *              The architecture: the server pre-renders the page skeleton and passes all
 *              challenge data as static props, then BookmarkClient hydrates and filters
 *              by what the user has actually bookmarked.  The difficultyColor map is
 *              passed as a prop rather than duplicated inside BookmarkClient to keep the
 *              styling definition in one place.
 */

import Link from 'next/link'
import { challenges } from '@/data/challenges'
import { Difficulty } from '@/types/challenge'
import Navbar from '@/components/ui/Navbar'
import BookmarkClient from '@/components/challenge/BookmarkClient'

const difficultyColor: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function BookmarksPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar activeLink="bookmarks" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Bookmarked Challenges</h1>
        <BookmarkClient challenges={challenges} difficultyColor={difficultyColor} />
      </main>
    </div>
  )
}
