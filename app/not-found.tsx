import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200 flex flex-col">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
          CodeRead
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/challenges" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Challenges
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* 404 Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">
          404
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-10 text-sm leading-relaxed">
          Looks like this page doesn&apos;t exist. Maybe you were looking for a challenge?
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/challenges"
            className="min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
          >
            Browse challenges
          </Link>
          <Link
            href="/"
            className="min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>

      <footer className="border-t border-gray-100 dark:border-gray-800 text-center py-8 text-xs text-gray-400 dark:text-gray-600">
        Built with <a href="https://meetorion.app" className="underline hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Orion</a>
      </footer>
    </main>
  )
}
