import Link from 'next/link'
import { challenges } from '@/data/challenges'
import { Difficulty } from '@/types/challenge'
import Navbar from '@/components/ui/Navbar'

const difficultyColor: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200">

      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {challenges.length} challenges available
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

      {/* Stats bar */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-6">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Challenges', value: `${challenges.length}` },
            { label: 'Difficulty levels', value: '3' },
            { label: 'Languages', value: '2' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Challenges */}
      <section className="max-w-4xl mx-auto py-16 px-6">
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
            View all {challenges.length} challenges
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
