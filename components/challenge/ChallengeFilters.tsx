/**
 * @file components/challenge/ChallengeFilters.tsx
 * @description Full-text search and filtering for the challenge catalogue.
 *
 *              Simple substring search was rejected because it can't rank results by
 *              relevance — a query for "async" would return a random-order list where a
 *              challenge titled "Async/Await Patterns" might appear below one that merely
 *              mentions "async" in its description.  BM25 solves this with IDF-weighted
 *              scoring: rare terms get higher weight, common terms (like "javascript")
 *              are down-weighted, and title matches outrank description matches.
 *
 *              Filter state is kept local (not in the URL) because sharing a filtered
 *              view is not a use case — individual challenge permalinks are already
 *              shareable.  URL-encoding the filter state would add parsing complexity
 *              with no user benefit at this scale.
 */

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Challenge, Difficulty } from '@/types/challenge'
import { useBookmarks } from '@/lib/hooks/useBookmarks'

// ---------------------------------------------------------------------------
// BM25 Search Engine
// Best Match 25 — the gold-standard ranked retrieval algorithm (used by
// Elasticsearch, Lucene, etc.). Handles multi-field weighted scoring, IDF,
// TF saturation, length normalization, and prefix matching for partial words.
// ---------------------------------------------------------------------------

const BM25_K1 = 1.5   // term-frequency saturation (1.2–2.0 is typical)
const BM25_B  = 0.75  // length normalization factor (0 = off, 1 = full)

const FIELD_WEIGHTS = { title: 3.0, tags: 2.0, description: 1.0 } as const

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean)
}

interface SearchIndex {
  docs: Array<{ titleTerms: string[]; descTerms: string[]; tagTerms: string[] }>
  avgTitleLen: number
  avgDescLen: number
  avgTagLen: number
  df: Map<string, number>  // document frequency per term
  N: number                // total documents
}

function buildSearchIndex(challenges: Challenge[]): SearchIndex {
  const N = challenges.length
  const docs = challenges.map(c => ({
    titleTerms: tokenize(c.title),
    descTerms:  tokenize(c.description),
    tagTerms:   tokenize((c.tags ?? []).join(' ')),
  }))

  const df = new Map<string, number>()
  docs.forEach(doc => {
    const seen = new Set([...doc.titleTerms, ...doc.descTerms, ...doc.tagTerms])
    seen.forEach(t => df.set(t, (df.get(t) ?? 0) + 1))
  })

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1)
  return {
    docs,
    avgTitleLen: avg(docs.map(d => d.titleTerms.length)),
    avgDescLen:  avg(docs.map(d => d.descTerms.length)),
    avgTagLen:   avg(docs.map(d => d.tagTerms.length)),
    df,
    N,
  }
}

function bm25Field(
  queryTerms: string[],
  fieldTerms: string[],
  avgLen: number,
  df: Map<string, number>,
  N: number,
): number {
  if (fieldTerms.length === 0) return 0
  const len = fieldTerms.length

  // Pre-count term frequencies in this field
  const tf = new Map<string, number>()
  fieldTerms.forEach(t => tf.set(t, (tf.get(t) ?? 0) + 1))

  let score = 0
  for (const qt of queryTerms) {
    // Prefix matching: accumulate freq of all field terms that start with the query term
    let termFreq = 0
    tf.forEach((count, term) => { if (term.startsWith(qt)) termFreq += count })
    if (termFreq === 0) continue

    const docFreq = df.get(qt) ?? 1
    const idf = Math.log((N - docFreq + 0.5) / (docFreq + 0.5) + 1)

    // BM25 TF normalization with length penalty
    const tfNorm = (termFreq * (BM25_K1 + 1)) /
      (termFreq + BM25_K1 * (1 - BM25_B + BM25_B * len / avgLen))

    score += idf * tfNorm
  }
  return score
}

function bm25Search(query: string, challenges: Challenge[], index: SearchIndex): Challenge[] {
  const queryTerms = tokenize(query)
  if (queryTerms.length === 0) return challenges

  const { docs, avgTitleLen, avgDescLen, avgTagLen, df, N } = index

  const scored = challenges
    .map((c, i) => {
      const doc = docs[i]
      const score =
        bm25Field(queryTerms, doc.titleTerms, avgTitleLen, df, N) * FIELD_WEIGHTS.title +
        bm25Field(queryTerms, doc.tagTerms,   avgTagLen,   df, N) * FIELD_WEIGHTS.tags  +
        bm25Field(queryTerms, doc.descTerms,  avgDescLen,  df, N) * FIELD_WEIGHTS.description
      return { c, score }
    })
    .filter(({ score }) => score > 0)

  scored.sort((a, b) => b.score - a.score)
  return scored.map(({ c }) => c)
}

// ---------------------------------------------------------------------------
// Filter state + UI constants
// ---------------------------------------------------------------------------

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

/**
 * Challenge catalogue with BM25 search and hard filter controls.
 * Search runs before filters so hard filters narrow an already-ranked result set —
 * a "closures" search + "advanced" filter returns the most relevant advanced
 * closures challenge first, not a random advanced challenge that mentions closures.
 */
export default function ChallengeFilters({ challenges }: ChallengeFiltersProps) {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [language, setLanguage] = useState<Language>('all')
  const [tag, setTag] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showAllTags, setShowAllTags] = useState(false)

  const TAG_PREVIEW_COUNT = 8
  const { bookmarks: _bookmarks, loading: bookmarksLoading, toggleBookmark, isBookmarked } = useBookmarks()

  // Build BM25 index once — O(n) pre-processing, O(q·f) per query
  const searchIndex = useMemo(() => buildSearchIndex(challenges), [challenges])

  // Collect all unique tags
  const allTags = Array.from(new Set(challenges.flatMap(c => c.tags ?? []))).sort()
  const tagOptions = [{ label: 'All', value: 'all' }, ...allTags.map(t => ({ label: t, value: t }))]

  // ── FILTERING ──
  const filtered = useMemo(() => {
    // 1. BM25 ranked search (returns all when query is empty)
    const searched = search.trim()
      ? bm25Search(search, challenges, searchIndex)
      : challenges

    // 2. Apply hard filters on top of ranked results
    return searched.filter(c =>
      (difficulty === 'all' || c.difficulty === difficulty) &&
      (language === 'all'   || c.language   === language)   &&
      (tag === 'all'        || (c.tags?.includes(tag) ?? false))
    )
  }, [search, difficulty, language, tag, challenges, searchIndex])

  const percentage = challenges.length > 0
    ? Math.round((filtered.length / challenges.length) * 100)
    : 0

  // ── RENDER ──

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
        {/* Search */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search challenges by title, description, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

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

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider w-20 shrink-0">
              Tag
            </span>
            <div className="flex flex-wrap gap-2">
              {(showAllTags ? tagOptions : tagOptions.slice(0, TAG_PREVIEW_COUNT + 1)).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTag(opt.value)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                    tag === opt.value
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {allTags.length > TAG_PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllTags(v => !v)}
                  className="min-h-11 px-4 py-2 rounded-xl text-sm font-medium border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-gray-500 dark:hover:border-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-150"
                >
                  {showAllTags ? 'Show less' : `+${allTags.length - TAG_PREVIEW_COUNT} more`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Challenge list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <p className="text-sm">No challenges match these filters.</p>
          <button
            onClick={() => { setDifficulty('all'); setLanguage('all'); setTag('all') }}
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
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {challenge.tags && challenge.tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${difficultyColor[challenge.difficulty]}`}>
                    {challenge.difficulty}
                  </span>
                  {!bookmarksLoading && (
                    <button
                      onClick={(e) => { e.preventDefault(); toggleBookmark(challenge.id) }}
                      className={`p-1.5 rounded-lg transition-colors ${isBookmarked(challenge.id) ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill={isBookmarked(challenge.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
