/**
 * @file app/profile/page.tsx
 * @description The profile page demonstrates why server-side auth matters.
 *
 *              The redirect happens at the HTTP level — before a single byte of HTML
 *              is sent — because auth is checked on the server.  A client-side approach
 *              (useEffect + router.push) would render the page first, then redirect
 *              after the JS loads and the auth check resolves, causing a flash of
 *              protected content for unauthenticated users.
 *
 *              The inline `'use server'` on signOut is a Next.js Server Action.  The
 *              browser submits a form POST; the server calls Supabase and redirects.
 *              No auth token or session data is ever exposed to client-side JavaScript.
 *              Promise.all for profile + progress fetches is a minor but real win:
 *              two sequential awaits would double the DB round-trip time.
 */

import { getClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { challenges } from '@/data/challenges'
import Navbar from '@/components/ui/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Track your CodeRead challenge progress.',
}

export default async function ProfilePage() {
  const supabase = await getClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase.from('profiles').select('username').eq('id', user.id).single(),
    supabase.from('user_progress').select('challenge_id, completed_at').eq('user_id', user.id).order('completed_at', { ascending: false }),
  ])

  // ── PROGRESS CALCULATION ──
  // Set gives O(1) lookup per challenge row — vs O(n) for array.includes() across
  // potentially hundreds of completed challenges for each of 20+ rendered rows.
  const completedIds = new Set((progress ?? []).map(p => p.challenge_id))
  const totalCompleted = completedIds.size
  const totalChallenges = challenges.length
  const percentage = Math.round((totalCompleted / totalChallenges) * 100)

  // ── STREAK CALCULATION ────────────────────────────────────────────────────
  // Extract the calendar date (UTC) from each completion timestamp, deduplicate
  // so that completing multiple challenges in one day counts as a single streak
  // day, then sort newest-first.
  //
  // Dates are UTC throughout.  The user's local date may differ by up to ±12 h,
  // but server-side rendering has no access to the browser's timezone.  UTC is
  // the pragmatic choice for a first implementation.
  const uniqueDates = [
    ...new Set((progress ?? []).map(p => p.completed_at.slice(0, 10)))
  ].sort((a, b) => b.localeCompare(a))

  // A streak is only alive if the user practiced today or yesterday (UTC).
  // If the most recent activity is older than yesterday the streak is 0 — broken.
  const todayUTC     = new Date().toISOString().slice(0, 10)
  const yesterdayUTC = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

  let streak = 0
  if (uniqueDates.length > 0 && (uniqueDates[0] === todayUTC || uniqueDates[0] === yesterdayUTC)) {
    streak = 1
    // Walk the sorted date list and count how many consecutive days follow.
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]).getTime()
      const curr = new Date(uniqueDates[i]).getTime()
      if (Math.round((prev - curr) / 86_400_000) === 1) {
        streak++
      } else {
        break
      }
    }
  }

  // ── SERVER ACTION ──

  async function signOut() {
    'use server'
    const supabase = await getClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  // ── RENDER ──

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {profile?.username ? `@${profile.username}` : 'My Profile'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline underline-offset-4"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Stats Row — progress + streak side by side */}
        <div className="grid grid-cols-2 gap-4 mb-8">

          {/* Progress card */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Completed</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {totalCompleted}
              <span className="text-xl font-normal text-gray-400 dark:text-gray-500"> / {totalChallenges}</span>
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div
                className="bg-gray-900 dark:bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{percentage}% done</p>
          </div>

          {/* Streak card */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Day Streak</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {streak}
              <span className="text-xl font-normal text-gray-400 dark:text-gray-500"> day{streak !== 1 ? 's' : ''}</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {streak === 0
                ? 'Complete a challenge to start your streak'
                : streak === 1
                ? 'Keep going — come back tomorrow'
                : `${streak} days in a row`}
            </p>
          </div>

        </div>

        {/* Challenge List */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Challenges</h2>
        <div className="grid gap-2">
          {challenges.map((challenge) => {
            const done = completedIds.has(challenge.id)
            return (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.id}`}
                className="group flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-4 hover:border-gray-400 dark:hover:border-gray-600 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    done
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {done && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm font-medium truncate ${
                    done ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'
                  }`}>
                    {challenge.title}
                  </span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-3 shrink-0 ${
                  challenge.difficulty === 'beginner'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : challenge.difficulty === 'intermediate'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {challenge.difficulty}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <footer className="border-t border-gray-100 dark:border-gray-800 text-center py-8 text-xs text-gray-400 dark:text-gray-600 mt-8">
        Built with <a href="https://meetorion.app" className="underline hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Orion</a>
      </footer>
    </main>
  )
}
