'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Challenge, Difficulty } from '@/types/challenge'

type Language = 'all' | 'javascript' | 'typescript' | 'python'
type DifficultyFilter = 'all' | Difficulty

const difficultyColor: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const difficultyOptions: { label: string; value: DifficultyFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
]

const languageOptions: { label: string; value: Language }[] = [
  { label: 'All', value: 'all' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
]

interface ChallengeFiltersProps {
  challenges: Challenge[]
}

export default function ChallengeFilters({ challenges }: ChallengeFiltersProps) {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [language, setLanguage] = useState<Language>('all')

  const filtered = challenges.filter((c) => {
    const matchDifficulty = difficulty === 'all' || c.difficulty === difficulty
    const matchLanguage = language === 'all' || c.language === language
    return matchDifficulty && matchLanguage
  })

  const percentage = challenges.length > 0
    ? Math.round((filtered.length / challenges.length) * 100)
    : 0

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length === challenges.length
              ? `${challenges.length} challenges`
              : `${filtered.length} of ${challenges.length} challenges`}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{percentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-8">
        {/* Difficulty filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider w-20 shrink-0">
            Difficulty
          </span>
          <div className="flex flex-wrap gap-2">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                  difficulty === opt.value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider w-20 shrink-0">
            Language
          </span>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLanguage(opt.value)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                  language === opt.value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Challenge list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <p className="text-sm">No challenges match these filters.</p>
          <button
            onClick={() => { setDifficulty('all'); setLanguage('all') }}
            className="mt-3 text-sm text-gray-600 dark:text-gray-400 underline hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((challenge, index) => (
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
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {challenge.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{challenge.description}</p>
                    <span className="mt-2 inline-block text-xs font-mono text-gray-400 dark:text-gray-500">
                      {challenge.language}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${difficultyColor[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
