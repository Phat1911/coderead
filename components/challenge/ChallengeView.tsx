'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Challenge } from '@/types/challenge'
import { createClient } from '@/lib/supabase/client'
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
  const [revealed, setRevealed] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [])

  async function handleReveal() {
    setRevealed(true)
    if (!isLoggedIn) return
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {challenge.title}
        </h1>
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
        {!revealed ? (
          <button
            onClick={handleReveal}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-2xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors text-sm"
          >
            Reveal Explanation
          </button>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-6 mb-6">
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
        )}

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
        Built with <a href="https://meetorion.app" className="underline hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Orion</a>
      </footer>
    </main>
  )
}
