import Link from 'next/link'
import { challenges } from '@/data/challenges'
import { Difficulty } from '@/types/challenge'
import ThemeToggle from '@/components/ui/ThemeToggle'

const difficultyColor: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function ChallengesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
          CodeRead
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/challenges" className="text-sm font-medium text-gray-900 dark:text-white">
            Challenges
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-6">

        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            All Challenges
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {challenges.length} challenges to build your code reading skills
          </p>
        </div>

        {/* List */}
        <div className="grid gap-3">
          {challenges.map((challenge, index) => (
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
      </div>

      <footer className="border-t border-gray-100 dark:border-gray-800 text-center py-8 text-xs text-gray-400 dark:text-gray-600 mt-8">
        Built with <a href="https://meetorion.app" className="underline hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Orion</a>
      </footer>
    </main>
  )
}
