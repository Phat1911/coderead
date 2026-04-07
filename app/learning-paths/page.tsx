import Link from 'next/link'
import { learningPaths } from '@/data/learningPaths'
import Navbar from '@/components/ui/Navbar'

const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function LearningPathsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Learning Paths
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Curated sequences of challenges designed to take you from beginner to master in specific topics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map((path) => (
            <Link
              key={path.id}
              href={`/learning-paths/${path.id}`}
              className="group block p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-200 bg-white dark:bg-gray-900"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{path.icon}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[path.difficulty]}`}>
                  {path.difficulty}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">
                {path.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                {path.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span>{path.challengeIds.length} challenges</span>
                <span>•</span>
                <span>{path.estimatedTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
