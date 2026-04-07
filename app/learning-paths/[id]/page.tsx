import { notFound } from 'next/navigation'
import Link from 'next/link'
import { learningPaths } from '@/data/learningPaths'
import { challenges } from '@/data/challenges'
import Navbar from '@/components/ui/Navbar'

const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function generateStaticParams() {
  return learningPaths.map((path) => ({
    id: path.id,
  }))
}

export default function LearningPathPage({ params }: { params: { id: string } }) {
  const path = learningPaths.find((p) => p.id === params.id)
  if (!path) notFound()

  const pathChallenges = challenges.filter((c) => path.challengeIds.includes(c.id))

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/learning-paths"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Learning Paths
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{path.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{path.title}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className={`px-2.5 py-1 rounded-full ${difficultyColor[path.difficulty]}`}>
                  {path.difficulty}
                </span>
                <span>{path.estimatedTime}</span>
                <span>•</span>
                <span>{pathChallenges.length} challenges</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{path.description}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Challenges</h2>
          {pathChallenges.map((challenge, index) => (
            <Link
              key={challenge.id}
              href={`/challenges/${challenge.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-900"
            >
              <span className="text-sm font-mono font-bold text-gray-300 dark:text-gray-600 shrink-0">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{challenge.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{challenge.language}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${difficultyColor[challenge.difficulty]}`}>
                {challenge.difficulty}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href={`/challenges/${pathChallenges[0]?.id}`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Start Path
          </Link>
        </div>
      </main>
    </div>
  )
}
