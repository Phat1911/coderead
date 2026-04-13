/**
 * @file app/leaderboard/page.tsx
 * @description Public ranking of users by number of completed challenges.
 *
 *              Data comes from the `leaderboard` Postgres view, which aggregates
 *              user_progress rows per user and joins with profiles for usernames.
 *              The view handles the GROUP BY and ORDER BY so the query here stays
 *              trivial — just a limit.
 *
 *              The current user's row is highlighted server-side: getClient() reads
 *              the session cookie and returns the authenticated user (or null) in
 *              one round-trip that runs in parallel with the leaderboard fetch.
 *              No client JS is needed for personalisation.
 *
 *              The page is intentionally public — unregistered visitors can see the
 *              leaderboard, which acts as social proof and nudges sign-ups.
 */

import { getClient } from '@/lib/supabase/server'
import { challenges } from '@/data/challenges'
import Navbar from '@/components/ui/Navbar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'Top CodeRead users ranked by number of completed challenges.',
}

const TOTAL = challenges.length

type LeaderboardEntry = { id: string; username: string; completed_count: number }

// ── RANK BADGE ───────────────────────────────────────────────────────────────
// Returns the visual badge for a given rank position.
// Top 3 get distinct colours; everyone else gets a plain number.

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 shrink-0">
      1
    </span>
  )
  if (rank === 2) return (
    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 shrink-0">
      2
    </span>
  )
  if (rank === 3) return (
    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 shrink-0">
      3
    </span>
  )
  return (
    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-gray-400 dark:text-gray-500 shrink-0">
      {rank}
    </span>
  )
}

export default async function LeaderboardPage() {
  const supabase = await getClient()

  // Fetch leaderboard + current user in parallel to minimise latency.
  // get_leaderboard is SECURITY DEFINER so it bypasses RLS and can aggregate
  // across all users regardless of the caller's auth state.
  const [{ data: rows }, { data: { user } }] = await Promise.all([
    supabase.rpc('get_leaderboard', { row_limit: 20 }),
    supabase.auth.getUser(),
  ])

  const entries: LeaderboardEntry[] = (rows ?? []) as LeaderboardEntry[]

  // Find the current user's rank to show a personalised callout if they
  // are outside the top 20 (i.e. not already visible in the list).
  const myIndex = user ? entries.findIndex(e => e.id === user.id) : -1

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200">
      <Navbar activeLink="leaderboard" />

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Top {entries.length} users ranked by challenges completed.
          </p>
        </div>

        {/* List */}
        {entries.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-600">
            <p className="text-lg font-medium mb-2">No entries yet</p>
            <p className="text-sm">
              <Link href="/challenges" className="underline underline-offset-4 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Complete a challenge
              </Link>{' '}to be the first on the board.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const rank = i + 1
              const pct = Math.round((entry.completed_count / TOTAL) * 100)
              const isMe = user?.id === entry.id

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-colors ${
                    isMe
                      ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <RankBadge rank={rank} />

                  {/* Username */}
                  <span className={`text-sm font-semibold flex-1 truncate ${
                    isMe ? 'text-white dark:text-gray-900' : 'text-gray-900 dark:text-white'
                  }`}>
                    {entry.username}
                    {isMe && (
                      <span className="ml-2 text-xs font-medium opacity-60">you</span>
                    )}
                  </span>

                  {/* Progress bar + count */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`w-24 h-1.5 rounded-full hidden sm:block ${
                      isMe ? 'bg-white/30 dark:bg-gray-900/30' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isMe ? 'bg-white dark:bg-gray-900' : 'bg-gray-900 dark:bg-white'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium w-14 text-right ${
                      isMe ? 'text-white/80 dark:text-gray-900/80' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {entry.completed_count} / {TOTAL}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Callout if logged in but not in top 20 */}
        {user && myIndex === -1 && (
          <p className="mt-6 text-center text-sm text-gray-400 dark:text-gray-500">
            You&apos;re not in the top 20 yet.{' '}
            <Link href="/challenges" className="underline underline-offset-4 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Keep going
            </Link>.
          </p>
        )}

        {/* CTA for logged-out visitors */}
        {!user && (
          <p className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
            <Link href="/signup" className="font-medium text-gray-900 dark:text-white underline underline-offset-4 hover:no-underline">
              Create an account
            </Link>{' '}to appear on the leaderboard.
          </p>
        )}

      </div>
    </main>
  )
}
