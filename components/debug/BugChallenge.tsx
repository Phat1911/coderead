/**
 * @file components/debug/BugChallenge.tsx
 * @description Click-the-buggy-line challenge UI.
 *
 *              Each source line is its own button. The line index is compared to
 *              challenge.bugLineIndex on click:
 *                - correct   -> green highlight + "+5" badge, gate opens
 *                - wrong     -> clicked line red, correct line green, gate opens
 *              After the first click all lines are disabled — one attempt per user,
 *              matching the quiz semantics.
 *
 *              Scoring: a correct answer upserts user_progress with points: 5 and
 *              is_correct: true. A wrong answer still records the attempt (so it
 *              cannot be retried) but with points: 0. UNIQUE(user_id, challenge_id)
 *              prevents double-scoring on refresh or back-navigation.
 *
 *              Auth: selecting a line while logged out redirects to /login with
 *              returnUrl pointing back at this page, matching QuizQuestion.
 *
 * Built with Orion (meetorion.app)
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DebugChallenge } from '@/types/challenge'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/ui/Navbar'
import { calculatePoints } from '@/lib/points'

/** Props from the server page. highlightedLines is the per-line token array produced by highlightLines(). */
interface BugChallengeProps {
  challenge: DebugChallenge
  prev: string | null
  next: string | null
  /** One pre-highlighted HTML string per source line, produced by highlightLines(). */
  highlightedLines: string[]
}

/** Tailwind badge classes keyed by difficulty — identical to other views so the visual language is consistent. */
const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

/** Points awarded for a correct first-attempt answer on a debug challenge. Stored in user_progress.points. */
const DEBUG_POINTS = 5

export default function BugChallenge({ challenge, prev, next, highlightedLines }: BugChallengeProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  // null = no attempt yet; a number = the line index the user clicked.
  const [selectedLineIdx, setSelectedLineIdx] = useState<number | null>(null)
  const [showAIExplanation, setShowAIExplanation] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
      setUserId(user?.id ?? null)
    })
  }, [])

  /** Guards interactive actions behind auth. Redirects to /login with returnUrl so the user lands back here after sign-in.
   *  Returns true if the caller may proceed, false if a redirect was initiated. */
  function requireAuth(): boolean {
    if (isLoggedIn) return true
    router.push(`/login?returnUrl=/debug/${challenge.id}`)
    return false
  }

  const hasAnswered = selectedLineIdx !== null
  const isCorrect = hasAnswered && selectedLineIdx === challenge.bugLineIndex

  /** Called when the user clicks a line. Locks the attempt, shows feedback, and upserts user_progress. */
  async function handleSelectLine(lineIdx: number) {
    if (hasAnswered || !requireAuth()) return
    setSelectedLineIdx(lineIdx)

    if (!userId) return
    const supabase = createClient()
    const answerIsCorrect = lineIdx === challenge.bugLineIndex

    if (answerIsCorrect) {
      await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: userId,
            challenge_id: `debug-${challenge.id}`,
            is_correct: true,
            points: calculatePoints('debug', challenge.difficulty),
          },
          { onConflict: 'user_id,challenge_id' }
        )
    } else {
      // Record the attempt so the user can't retry, but don't award points.
      // ignoreDuplicates protects any prior correct row from being overwritten.
      await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: userId,
            challenge_id: `debug-${challenge.id}`,
            is_correct: false,
            points: 0,
          },
          { onConflict: 'user_id,challenge_id', ignoreDuplicates: true }
        )
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200">
      <Navbar activeLink="debug" />

      <div className="max-w-3xl mx-auto py-10 px-6">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/debug"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            All Bugs
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
              +{DEBUG_POINTS} pts
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[challenge.difficulty]}`}>
              {challenge.difficulty}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {challenge.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{challenge.description}</p>
        {challenge.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {challenge.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Prompt */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            Your task
          </p>
          <p className="text-gray-900 dark:text-white font-semibold text-lg leading-snug">
            One line in this snippet contains a bug. Click the line you think is wrong.
          </p>
        </div>

        {/* Code Block — each line is its own clickable button */}
        <div className="bg-gray-100 dark:bg-[#080808] rounded-2xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {challenge.language}
            </span>
          </div>
          <div className="shiki-wrapper text-sm leading-relaxed font-mono overflow-x-auto">
            {highlightedLines.map((lineHtml, idx) => {
              const isBug = idx === challenge.bugLineIndex
              const isSelected = selectedLineIdx === idx

              let rowCls =
                'group flex items-stretch w-full text-left transition-colors border-l-4 '
              if (!hasAnswered) {
                rowCls +=
                  'border-transparent hover:bg-gray-200/60 dark:hover:bg-gray-800/60 cursor-pointer'
              } else if (isBug) {
                rowCls +=
                  'border-green-500 bg-green-100/70 dark:bg-green-900/30 cursor-default'
              } else if (isSelected) {
                rowCls +=
                  'border-red-500 bg-red-100/70 dark:bg-red-900/30 cursor-default'
              } else {
                rowCls += 'border-transparent cursor-default opacity-70'
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLine(idx)}
                  disabled={hasAnswered}
                  aria-label={`Line ${idx + 1}`}
                  className={rowCls}
                >
                  <span className="select-none shrink-0 w-10 pr-3 py-1 text-right text-xs text-gray-400 dark:text-gray-600 border-r border-gray-200 dark:border-gray-800">
                    {idx + 1}
                  </span>
                  <span
                    className="flex-1 pl-4 pr-4 py-1 whitespace-pre"
                    // Shiki-produced span tokens with --shiki-light / --shiki-dark CSS vars.
                    // Safe: content comes from our own highlighter at build time, not user input.
                    dangerouslySetInnerHTML={{
                      __html: lineHtml.length > 0 ? lineHtml : '&nbsp;',
                    }}
                  />
                  {hasAnswered && isBug && (
                    <span className="shrink-0 self-center mr-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-600 text-white">
                      +{DEBUG_POINTS}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Post-answer panels */}
        {hasAnswered && (
          <div className="flex flex-col gap-4">
            {/* Result banner */}
            <div
              className={`rounded-2xl px-5 py-4 text-sm font-semibold border ${
                isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300'
              }`}
            >
              {isCorrect
                ? `✓ Correct! +${DEBUG_POINTS} points added to your score.`
                : `✗ Not quite — the buggy line is highlighted in green above.`}
            </div>

            {/* Bug summary */}
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-6">
              <p className="text-xs font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-3">
                The bug
              </p>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {challenge.bugDescription}
              </p>
            </div>

            {/* Explanation + key concepts */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-6">
              <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">
                Why this happens
              </p>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                {challenge.explanation}
              </p>
              <div className="mt-5 pt-5 border-t border-blue-200 dark:border-blue-800/50">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">
                  Key concepts
                </p>
                <div className="flex flex-wrap gap-2">
                  {challenge.keyConceptsToSpot.map((concept) => (
                    <span
                      key={concept}
                      className="text-xs bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI explanation toggle */}
            {challenge.aiExplanation && (
              <button
                onClick={() => setShowAIExplanation((v) => !v)}
                className="w-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 py-3.5 rounded-2xl font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                {showAIExplanation ? 'Hide AI Explanation' : 'Explain this to me'}
              </button>
            )}
            {challenge.aiExplanation && showAIExplanation && (
              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-6">
                <p className="text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-widest mb-3">
                  AI Explanation
                </p>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                  {challenge.aiExplanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Prev / Next */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          {prev ? (
            <Link
              href={`/debug/${prev}`}
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Previous
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/debug/${next}`}
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      <footer className="border-t border-gray-100 dark:border-gray-800 text-center py-8 text-xs text-gray-400 dark:text-gray-600 mt-8">
        Built by{' '}
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
