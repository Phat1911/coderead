/**
 * @file app/debug/page.tsx
 * @description Listing page for the "Find the Bug" section at /debug.
 *
 *              Mirrors app/challenges/page.tsx: Server Component, static shell,
 *              data imported from code so the page renders at build time with no
 *              runtime DB calls. Each card deep-links to /debug/[id].
 *
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { debugChallenges } from '@/data/debugChallenges'
import Navbar from '@/components/ui/Navbar'

export const metadata: Metadata = {
  title: 'Find the Bug | CodeRead',
  description:
    'Spot the bug in AI-generated code. Each challenge hides one subtle mistake — click the line you think is wrong to check your instinct.',
  openGraph: {
    title: 'Find the Bug | CodeRead',
    description:
      'Spot the bug in AI-generated code. Each challenge hides one subtle mistake — click the line you think is wrong to check your instinct.',
    url: 'https://codeoneread.tech/debug',
  },
}

/** Tailwind badge classes for difficulty chips on debug challenge cards. */
const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function DebugChallengesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200">
      <Navbar activeLink="debug" />

      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
              +5 pts per bug
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">one attempt each</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Find the Bug
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            {debugChallenges.length} AI-generated snippets. Each one has exactly one subtle bug.
            Read the code, click the line you think is wrong, and see if your eye caught it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {debugChallenges.map((c) => (
            <Link
              key={c.id}
              href={`/debug/${c.id}`}
              className="group block p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[c.difficulty]}`}>
                  {c.difficulty}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  {c.language}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {c.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug mb-3">
                {c.description}
              </p>
              {c.tags && c.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      <footer className="border-t border-gray-100 dark:border-gray-800 text-center py-8 text-xs text-gray-400 dark:text-gray-600 mt-8">
        Built with{' '}
        <a
          href="https://www.facebook.com/profile.php?id=100090521350628"
          className="underline hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          Nicolas Tran
        </a>
      </footer>
    </main>
  )
}
