import type { Metadata } from 'next'
import Link from 'next/link'
import { challenges } from '@/data/challenges'
import ThemeToggle from '@/components/ui/ThemeToggle'
import NavbarAuth from '@/components/ui/NavbarAuth'
import ChallengeFilters from '@/components/challenge/ChallengeFilters'

export const metadata: Metadata = {
  title: 'All Challenges',
  description: 'Browse all code reading challenges. Filter by difficulty and language. Improve your ability to read and understand AI-generated code.',
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
          <NavbarAuth />
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

        {/* Filters + Challenge List (client component) */}
        <ChallengeFilters challenges={challenges} />

      </div>

      <footer className="border-t border-gray-100 dark:border-gray-800 text-center py-8 text-xs text-gray-400 dark:text-gray-600 mt-8">
        Built with <a href="https://meetorion.app" className="underline hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Orion</a>
      </footer>
    </main>
  )
}
