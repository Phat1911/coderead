'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Challenge } from '@/types/challenge'
import { createClient } from '@/lib/supabase/client'
import { useBookmarks } from '@/lib/hooks/useBookmarks'
import Navbar from '@/components/ui/Navbar'

interface ChallengeViewProps {
  challenge: Challenge
  prev: string | null
  next: string | null
  highlightedCode: string
}

const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function ChallengeView({ challenge, prev, next, highlightedCode }: ChallengeViewProps) {
  const router = useRouter()
  const [revealed, setRevealed] = useState(false)
  const [showAIExplanation, setShowAIExplanation] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { bookmarks, loading: bookmarksLoading, toggleBookmark, isBookmarked } = useBookmarks()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [])

  // Redirects to login with returnUrl if not logged in.
  // Returns true if the caller should proceed, false if redirected.
  function requireAuth(): boolean {
    if (isLoggedIn) return true
    router.push(`/login?returnUrl=/challenges/${challenge.id}`)
    return false
  }

  async function handleReveal() {
    if (!requireAuth()) return
    setRevealed(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('user_progress').upsert(
      { user_id: user.id, challenge_id: challenge.id },
      { onConflict: 'user_id,challenge_id' }
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200">

      <Navbar activeLink="challenges" />

      <div className="max-w-3xl mx-auto py-10 px-6">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/challenges" className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            All Challenges
          </Link>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[challenge.difficulty]}`}>
            {challenge.difficulty}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {challenge.title}
          </h1>
          {!bookmarksLoading && (
            <button
              onClick={() => toggleBookmark(challenge.id)}
              className={`p-2 rounded-lg transition-colors shrink-0 ${isBookmarked(challenge.id) ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'}`}
              aria-label={isBookmarked(challenge.id) ? 'Remove bookmark' : 'Add bookmark'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={isBookmarked(challenge.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{challenge.description}</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {challenge.tags && challenge.tags.map((t) => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {t}
            </span>
          ))}
        </div>

        {/* Code Block */}
        <div className="bg-gray-100 dark:bg-[#080808] rounded-2xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{challenge.language}</span>
          </div>
          <div
            className="shiki-wrapper p-6 overflow-x-auto text-sm leading-relaxed [&_pre]:!bg-transparent [&_code]:font-mono"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </div>

        {/* Question */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Question</p>
          <p className="text-gray-900 dark:text-white font-semibold text-lg leading-snug">
            {challenge.question}
          </p>
        </div>

        {/* Reveal */}
        <div className="flex flex-col gap-3">
          {/* Hint button */}
          {challenge.hints && challenge.hints.length > 0 && hintLevel < challenge.hints.length && (
            <button
              onClick={() => { if (requireAuth()) setHintLevel(prev => prev + 1) }}
              className="w-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 py-3 rounded-xl font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Hint {hintLevel + 1} of {challenge.hints.length}
            </button>
          )}

          {/* Show current hints */}
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

          <button
            onClick={handleReveal}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-2xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors text-sm"
          >
            Reveal Explanation
          </button>

          {/* Explanation — shown after reveal */}
          {revealed && (
            <div className="space-y-4 mt-4">
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
              </div>
            )}
            
          {challenge.aiExplanation && (
            <button
              onClick={() => { if (requireAuth()) setShowAIExplanation(!showAIExplanation) }}
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
        </div>



        {/* Prev / Next */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          {prev ? (
            <Link
              href={`/challenges/${prev}`}
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Previous
            </Link>
          ) : <div />}
          {next ? (
            <Link
              href={`/challenges/${next}`}
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ) : <div />}
        </div>
      </div>

      <footer className="border-t border-gray-100 dark:border-gray-800 text-center py-8 text-xs text-gray-400 dark:text-gray-600 mt-8">
        Built by <a href="https://www.facebook.com/profile.php?id=100090521350628" className="underline hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Nicolas Tran</a>
      </footer>
    </main>
  )
}
