/**
 * @file components/quiz/QuizQuestion.tsx
 * @description Client component that renders the multiple-choice quiz UI for a challenge.
 *
 *              Responsibilities:
 *              - Shuffle option display order once on mount (Fisher-Yates) so the correct
 *                answer is never predictably in the same position across page loads.
 *              - Gate ALL post-answer content (explanation, hints, AI explanation, Next CTA)
 *                behind the user making a selection — nothing leaks before they answer.
 *              - On correct answer: upsert user_progress (counts toward leaderboard) and
 *                insert into quiz_scores (one-per-challenge, enforced by UNIQUE constraint).
 *              - Require auth before accepting a selection; redirect to /login with returnUrl
 *                so the user lands back here after signing in.
 *
 *              This component is only rendered when challenge.options is populated.
 *              Challenges without options fall back to the plain "Reveal Explanation" flow
 *              in ChallengeView.tsx.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Challenge } from '@/types/challenge'
import { createClient } from '@/lib/supabase/client'

/** Component props: the challenge to display and the next challenge's id for post-answer navigation. */
interface Props {
  challenge: Challenge
  nextChallengeId: string | null
}

import { calculatePoints } from '@/lib/points'

/** Letters displayed next to each option after shuffling. Assigned by position, not by the stored option.label,
 *  so the correct answer gets a fresh letter every page load. */
const DISPLAY_LABELS = ['A', 'B', 'C', 'D'] as const

/**
 * Returns a shuffled array of indices [0, length) using the Fisher-Yates algorithm.
 * Called once inside a useState initialiser so the shuffle is stable for the component
 * lifetime — navigating prev/next re-mounts the component and re-shuffles.
 */
function fisherYatesShuffle(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

export default function QuizQuestion({ challenge }: Props) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // Cached on mount — avoids a second auth.getUser() call inside handleSelectOption,
  // which would race with this initial check for the same Supabase auth lock and
  // cause "Lock stolen by another request" errors.
  const [userId, setUserId] = useState<string | null>(null)
  // Initialiser runs once — array is frozen for this mount so the order never changes
  // while the user is reading the options.
  const [shuffledIndices] = useState(() => fisherYatesShuffle(challenge.options!.length))
  // null = no answer chosen yet; a number = the display-position index the user clicked.
  const [selectedDisplayIdx, setSelectedDisplayIdx] = useState<number | null>(null)
  const [showAIExplanation, setShowAIExplanation] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
      setUserId(user?.id ?? null)
    })
  }, [])

  /** Guards answer selection behind auth. Redirects to /login with returnUrl so the user lands back here after sign-in.
   *  Returns true if the caller may proceed, false if a redirect was initiated. */
  function requireAuth(): boolean {
    if (isLoggedIn) return true
    router.push(`/login?returnUrl=/challenges/${challenge.id}`)
    return false
  }

  const options = challenge.options!
  const correctOrigIdx = challenge.correctOptionIndex!
  // Map the data-level correct index to its randomised display position so we can
  // highlight the right button regardless of shuffle order.
  const correctDisplayIdx = shuffledIndices.indexOf(correctOrigIdx)
  const hasAnswered = selectedDisplayIdx !== null
  const isCorrect = hasAnswered && selectedDisplayIdx === correctDisplayIdx

  /** Called when the user clicks an answer option. Locks the selection, scores the answer, and writes to user_progress. */
  async function handleSelectOption(displayIdx: number) {
    // Guard: ignore clicks after an answer is locked in, or if auth fails.
    if (hasAnswered || !requireAuth()) return
    // Update UI immediately; DB writes happen in the background.
    setSelectedDisplayIdx(displayIdx)

    // Use the cached userId — avoids a second auth.getUser() call that would
    // race with the mount-time check for the same Supabase auth lock.
    if (!userId) return
    const supabase = createClient()
    const isAnswerCorrect = displayIdx === correctDisplayIdx

    if (isAnswerCorrect) {
      // Calculate tiered points based on difficulty (learn: 1/2/3, debug: 5/10/15)
      const points = calculatePoints('learn', challenge.difficulty)

      // Single upsert: creates the row with is_correct=true, or upgrades an existing
      // false row to true. One round-trip, no separate UPDATE needed.
      await supabase
        .from('user_progress')
        .upsert(
          { user_id: userId, challenge_id: challenge.id, is_correct: true, points },
          { onConflict: 'user_id,challenge_id' }
        )

      // Record in quiz_scores — UNIQUE constraint silently prevents double-scoring.
      await supabase
        .from('quiz_scores')
        .insert({ user_id: userId, challenge_id: challenge.id, is_correct: true })
    } else {
      // Wrong answer: create the row if missing, but never overwrite an existing
      // correct row (ignoreDuplicates = ON CONFLICT DO NOTHING).
      await supabase
        .from('user_progress')
        .upsert(
          { user_id: userId, challenge_id: challenge.id, is_correct: false, points: 0 },
          { onConflict: 'user_id,challenge_id', ignoreDuplicates: true }
        )
    }
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Options */}
      <div className="flex flex-col gap-2">
        {shuffledIndices.map((origIdx, displayIdx) => {
          const option = options[origIdx]
          const label = DISPLAY_LABELS[displayIdx]
          const isSelected = selectedDisplayIdx === displayIdx
          const isThisCorrect = displayIdx === correctDisplayIdx

          let btnCls = 'w-full text-left px-5 py-4 rounded-2xl border font-medium transition-colors flex items-start gap-3 '
          let badgeCls = 'shrink-0 w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center '

          if (!hasAnswered) {
            btnCls += 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-800 dark:text-gray-200 cursor-pointer'
            badgeCls += 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
          } else if (isThisCorrect) {
            btnCls += 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300 cursor-default'
            badgeCls += 'border-green-500 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
          } else if (isSelected) {
            btnCls += 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-800 dark:text-red-300 cursor-default'
            badgeCls += 'border-red-400 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
          } else {
            btnCls += 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 opacity-50 cursor-default'
            badgeCls += 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-600'
          }

          return (
            <button
              key={displayIdx}
              onClick={() => handleSelectOption(displayIdx)}
              disabled={hasAnswered}
              className={btnCls}
            >
              <span className={badgeCls}>{label}</span>
              <span className="leading-snug">{option.text}</span>
            </button>
          )
        })}
      </div>

      {/* Post-answer content — revealed only after selection */}
      {hasAnswered && (
        <div className="flex flex-col gap-3 mt-2">

          {/* Result banner */}
          <div className={`rounded-2xl px-5 py-4 text-sm font-semibold border ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300'
          }`}>
            {isCorrect
              ? '✓ Correct! +1 point added to your score.'
              : '✗ Not quite — the correct answer is highlighted above.'}
          </div>

          {/* Hint button */}
          {challenge.hints && hintLevel < challenge.hints.length && (
            <button
              onClick={() => setHintLevel(prev => prev + 1)}
              className="w-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 py-3 rounded-xl font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Hint {hintLevel + 1} of {challenge.hints.length}
            </button>
          )}

          {/* Revealed hints */}
          {challenge.hints && hintLevel > 0 && (
            <div className="space-y-2">
              {challenge.hints.slice(0, hintLevel).map((hint, i) => (
                <div key={i} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-500 dark:text-amber-400 mb-1">Hint {i + 1}</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">{hint}</p>
                </div>
              ))}
            </div>
          )}

          {/* Explanation */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-6">
            <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">Explanation</p>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
              {challenge.explanation}
            </p>
            <div className="mt-5 pt-5 border-t border-blue-200 dark:border-blue-800/50">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Key Concepts</p>
              <div className="flex flex-wrap gap-2">
                {challenge.keyConceptsToSpot.map((concept) => (
                  <span key={concept} className="text-xs bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Explanation toggle */}
          {challenge.aiExplanation && (
            <button
              onClick={() => setShowAIExplanation(v => !v)}
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
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <p className="text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-widest">AI Explanation</p>
              </div>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                {challenge.aiExplanation}
              </p>
            </div>
          )}

          {/* Next Challenge CTA */}
          {/* {nextChallengeId && (
            <Link
              href={`/challenges/${nextChallengeId}`}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-2xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors text-sm flex items-center justify-center gap-2"
            >
              Next Challenge
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          )} */}

        </div>
      )}
    </div>
  )
}
