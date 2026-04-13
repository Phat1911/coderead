/**
 * @file app/page.tsx
 * @description Landing page with live social proof stats.
 *
 *              Static content (hero, challenges preview, paths) is derived from
 *              local data arrays. Dynamic stats (learner count, total completions,
 *              top 3 leaderboard) come from Supabase and are revalidated hourly
 *              via ISR — the page stays CDN-fast while reflecting real growth.
 *
 *              If the DB returns no data (empty DB, network error), the stats
 *              gracefully fall back to 0 and the leaderboard teaser is hidden.
 */

import Link from 'next/link'
import { challenges } from '@/data/challenges'
import { learningPaths } from '@/data/learningPaths'
import { Difficulty } from '@/types/challenge'
import Navbar from '@/components/ui/Navbar'
import { getClient } from '@/lib/supabase/server'

// Regenerate the page (and re-fetch DB stats) at most once per hour.
export const revalidate = 3600

const difficultyColor: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

// Rank badge colours for positions 1–3.
const rankStyle = [
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
]

const TOTAL = challenges.length
const LANGUAGES = [...new Set(challenges.map(c => c.language))].length

export default async function Home() {
  const supabase = await getClient()

  // Fetch all three stats in a single round-trip to Supabase.
  const [
    { count: learnerCount },
    { count: completionCount },
    { data: topRows },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('user_progress').select('*', { count: 'exact', head: true }),
    supabase.rpc('get_leaderboard', { row_limit: 3 }),
  ])

  const learners    = learnerCount   ?? 0
  const completions = completionCount ?? 0
  const leaders     = topRows         ?? []

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200">

      <Navbar />

      {/* ── HERO ── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {TOTAL} challenges available
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
          Learn to{' '}
          <span className="relative">
            <span className="relative z-10">read code</span>
            <span className="absolute bottom-1 left-0 w-full h-3 bg-yellow-200 dark:bg-yellow-500/30 -z-0 skew-x-1" />
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI writes the code. You need to understand it.
          Practice reading real snippets and sharpen your judgment when working with AI.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/challenges"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors text-sm"
          >
            Start Practicing
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── HERO VIDEO ── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-black/50">
          <video
            src="/coderead-hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full aspect-video object-cover"
          />
        </div>
      </section>

      {/* ── STATS BAR ──
           First two stats are static (content meta).
           Last two are live community numbers from the DB. */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-6">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'Challenges',   value: `${TOTAL}` },
            { label: 'Languages',    value: `${LANGUAGES}` },
            { label: 'Learners',     value: `${learners.toLocaleString()}` },
            { label: 'Completions',  value: `${completions.toLocaleString()}` },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOP LEARNERS TEASER ──
           Only rendered when the DB has at least one entry (hides cleanly on
           an empty DB before seed data or real users exist). */}
      {leaders.length > 0 && (
        <section className="max-w-4xl mx-auto py-16 px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Learners</h2>
            <Link
              href="/leaderboard"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Full leaderboard
            </Link>
          </div>
          <div className="space-y-2">
            {leaders.map((entry, i) => {
              const pct = Math.round((entry.completed_count / TOTAL) * 100)
              return (
                <div
                  key={entry.username}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rankStyle[i]}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1 truncate">
                    {entry.username}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hidden sm:block">
                      <div
                        className="h-1.5 rounded-full bg-gray-900 dark:bg-white transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-14 text-right">
                      {entry.completed_count} / {TOTAL}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              See all rankings
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* ── LEARNING PATHS PREVIEW ── */}
      <section className="max-w-4xl mx-auto py-16 px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Learning Paths
          </h2>
          <Link href="/learning-paths" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningPaths.slice(0, 4).map((path) => (
            <Link
              key={path.id}
              href={`/learning-paths/${path.id}`}
              className="group block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{path.icon}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[path.difficulty]}`}>
                  {path.difficulty}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">
                {path.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{path.description}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                <span>{path.challengeIds.length} challenges</span>
                <span>•</span>
                <span>{path.estimatedTime}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/learning-paths"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
            View all {learningPaths.length} learning paths
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── FEATURED CHALLENGES ── */}
      <section className="max-w-4xl mx-auto py-16 px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Featured Challenges
          </h2>
          <Link href="/challenges" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {challenges.slice(0, 3).map((challenge, index) => (
            <Link
              key={challenge.id}
              href={`/challenges/${challenge.id}`}
              className="group block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <span className="text-sm font-mono font-bold text-gray-300 dark:text-gray-600 mt-0.5 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{challenge.description}</p>
                    <span className="mt-2 inline-block text-xs font-mono text-gray-400 dark:text-gray-500">{challenge.language}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${difficultyColor[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
            View all {TOTAL} challenges
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800 text-center py-8 text-xs text-gray-400 dark:text-gray-600">
        Built by <a href="https://www.facebook.com/profile.php?id=100090521350628" className="underline hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Nicolas Tran</a>
      </footer>

    </main>
  )
}
