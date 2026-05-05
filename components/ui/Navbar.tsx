/**
 * @file components/ui/Navbar.tsx
 * @description The navbar is a Server Component with a single Client island (NavbarAuth).
 *
 *              Making the whole navbar a Client Component just to show a login/profile
 *              link would force every page using it to ship unnecessary JavaScript.
 *              Instead, the static structure (links, logo, theme toggle) is server-rendered
 *              with zero client JS, and only the one dynamic piece — "is the user logged
 *              in?" — is isolated in NavbarAuth.  This pattern keeps the JS bundle lean
 *              while still supporting real-time auth state updates.
 */

import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ui/ThemeToggle'
import NavbarAuth from '@/components/ui/NavbarAuth'

/** Identifies the currently active top-level route so the matching nav link gets the bold/white style. */
interface NavbarProps {
  activeLink?: 'challenges' | 'profile' | 'learning-paths' | 'bookmarks' | 'leaderboard' | 'debug'
}

export default function Navbar({ activeLink }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-gray-900 dark:text-white">
        <Image src="/hoot-40.png" alt="Hoot the owl" width={32} height={32} className="rounded-full" />
        CodeRead
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/challenges"
          className={`text-sm transition-colors ${
            activeLink === 'challenges'
              ? 'font-medium text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Challenges
        </Link>
        <Link
          href="/learning-paths"
          className={`text-sm transition-colors ${
            activeLink === 'learning-paths'
              ? 'font-medium text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Learning Paths
        </Link>
        <Link
          href="/debug"
          className={`text-sm transition-colors ${
            activeLink === 'debug'
              ? 'font-medium text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Debug
        </Link>
        <Link
          href="/bookmarks"
          className={`text-sm transition-colors ${
            activeLink === 'bookmarks'
              ? 'font-medium text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Bookmarks
        </Link>
        <Link
          href="/leaderboard"
          className={`text-sm transition-colors ${
            activeLink === 'leaderboard'
              ? 'font-medium text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Leaderboard
        </Link>
        <NavbarAuth />
        <ThemeToggle />
      </div>
    </nav>
  )
}
