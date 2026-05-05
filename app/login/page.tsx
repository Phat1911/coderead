/**
 * @file app/login/page.tsx
 * @description Sign-in page — the entry point of the auth flow.
 *
 *              LoginForm is separated from LoginPage and wrapped in <Suspense> for a
 *              specific Next.js reason: useSearchParams() suspends during SSR to prevent
 *              search params from leaking into the statically cached shell.  Without the
 *              Suspense boundary the entire route would be forced into dynamic rendering
 *              on every request, losing static caching.  The boundary confines the
 *              dynamic part to just the form.
 *
 *              returnUrl is the key UX contract with middleware: when proxy.ts redirects
 *              an unauthenticated user from /profile to /login, it appends the original
 *              path as returnUrl so the user lands back where they intended after signing in.
 */

'use client'

import { useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/ui/Navbar'
import OwlController from '@/components/ui/OwlController'

/** Shared Tailwind class string for all text inputs in the login form. Extracted to avoid repetition. */
const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-colors'

/** Toggles between the open-eye and strikethrough-eye SVG icon based on `open`. Used in password fields. */
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

// ── LOGIN FORM ──

/** Inner form that calls useSearchParams() — wrapped in Suspense by LoginPage to prevent SSR from going dynamic. */
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeField, setActiveField] = useState<'none' | 'username' | 'email' | 'password'>('none')
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  /** Validates the form, calls Supabase signInWithPassword, then redirects to returnUrl on success. */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    // Client-side validation is a UX courtesy, not a security boundary.
    // Supabase enforces the same rules server-side; this just avoids a round-trip
    // for the most common mistakes.
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(returnUrl)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200">
      <Navbar />

      <div className="max-w-md mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to track your progress</p>

        <div className="flex justify-center mb-6">
          <OwlController
            activeField={activeField}
            showPassword={showPassword}
            usernameRef={emailRef}
            emailRef={emailRef}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <input
              ref={emailRef}
              type="text"
              inputMode="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField('none')}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setActiveField('password')}
                onBlur={() => setActiveField('none')}
                placeholder="••••••••"
                className={inputClass + ' pr-12'}
              />
              <button
                type="button"
                onClick={() => { passwordRef.current?.focus(); setShowPassword(v => !v); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          No account?{' '}
          <Link href="/signup" className="font-medium text-gray-900 dark:text-white underline underline-offset-4 hover:no-underline">
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  )
}

// ── PAGE SHELL ──

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}