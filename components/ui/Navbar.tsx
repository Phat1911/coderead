import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ui/ThemeToggle'
import NavbarAuth from '@/components/ui/NavbarAuth'

interface NavbarProps {
  activeLink?: 'challenges' | 'profile'
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
        <NavbarAuth />
        <ThemeToggle />
      </div>
    </nav>
  )
}
