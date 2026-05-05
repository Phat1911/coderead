/**
 * @file app/signup/page.tsx
 * @description Account creation — a three-step flow that proves email ownership
 *              before creating any database record.
 *
 *              Step 1 (form): user fills in username, email, and password, then clicks
 *              "Continue".  The form calls /api/send-code, which runs an MX check and
 *              emails a 6-digit OTP.  No Supabase auth record is created yet.
 *
 *              Step 2 (verify): user enters the OTP.  The form calls /api/verify-code,
 *              which checks the code is correct, unused, and not expired.  Only on
 *              success does the form call supabase.auth.signUp() — guaranteeing every
 *              auth record corresponds to a reachable inbox.
 *
 *              Step 3 (account): signUp() is called with email confirmation disabled
 *              in Supabase Auth settings, so it returns a live session immediately —
 *              no second email, no confirmation link.  The user is redirected straight
 *              to /profile.  A database trigger automatically creates the companion row
 *              in the profiles table; a follow-up profiles.update() writes the username.
 *
 *              Username uniqueness is enforced by a Postgres UNIQUE constraint, not by
 *              a pre-check SELECT.  Checking availability first and then inserting creates
 *              a race condition (two users could both pass the check, then both try to
 *              insert).  Relying on the constraint and catching error code 23505 handles
 *              the race correctly: exactly one request will succeed, the other gets a
 *              clear error to show the user.
 */

'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/ui/Navbar'
import OwlController from '@/components/ui/OwlController'

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

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeField, setActiveField] = useState<'none' | 'username' | 'email' | 'password'>('none')
  const router = useRouter()

  // Two-step signup: 'form' collects credentials, 'verify' collects the OTP.
  // supabase.auth.signUp() is only called after the OTP is confirmed — so no
  // auth record is created for an address that hasn't proven it can receive mail.
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [verifyCode, setVerifyCode] = useState('')
  const usernameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // ── STEP 1: SEND VERIFICATION CODE ───────────────────────────────────────
  // Validates the form, then calls /api/send-code which runs an MX check,
  // generates a 6-digit OTP, and emails it.  signUp() is NOT called here —
  // the account is only created after the code is confirmed in handleVerify.

  /** Step 1: validates the form, calls /api/send-code to email an OTP, then advances to the verify step. */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    // Client-side validation is a UX convenience — instant feedback without a
    // round-trip.  The database enforces the real constraints.
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    const res = await fetch('/api/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Failed to send verification code. Please try again.')
      setLoading(false)
      return
    }

    // Code sent — move to the OTP entry step.
    setStep('verify')
    setVerifyCode('')
    setLoading(false)
  }

  // ── STEP 2: VERIFY CODE AND CREATE ACCOUNT ────────────────────────────────
  // Submits the OTP to /api/verify-code.  Only on success does it call
  // supabase.auth.signUp(), guaranteeing every auth record has a confirmed inbox.

  /** Step 2: submits the OTP to /api/verify-code; on success calls supabase.auth.signUp() and redirects to /profile. */
  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const verifyRes = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: verifyCode }),
    })
    const { valid } = await verifyRes.json()

    if (!valid) {
      setError('Incorrect or expired code. Please try again or request a new one.')
      setLoading(false)
      return
    }

    // Email confirmed — now safe to create the Supabase auth record.
    // emailRedirectTo is omitted because email confirmation is disabled in the
    // Supabase Auth settings — signUp() returns a live session immediately and
    // the user is redirected straight to /profile without a second email.
    const supabase = createClient()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (signUpData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', signUpData.user.id)

      if (profileError?.code === '23505') {
        setError('That username is already taken. Please choose another.')
        setLoading(false)
        return
      }
    }

    // Session is live — redirect directly to profile.
    router.push('/profile')
    router.refresh()
  }

  // ── RESEND CODE ───────────────────────────────────────────────────────────
  /** Re-calls /api/send-code to delete the old OTP and issue a fresh one, then resets the error state. */
  async function handleResend() {
    setError('')
    setLoading(true)

    const res = await fetch('/api/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to resend code. Please try again.')
    }

    setVerifyCode('')
    setLoading(false)
  }

  // ── RENDER ──

  /** Shared Tailwind class string for all text inputs in the signup form. Extracted to avoid repetition. */
  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-colors'

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-200">
      <Navbar />

      <div className="max-w-md mx-auto px-6 py-20">
        {step === 'verify' ? (
          // ── STEP 2: OTP ENTRY ─────────────────────────────────────────────
          // The user has proven they own the email only once they enter the
          // correct code — signUp() fires on the next step, not before.
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Enter your code</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              We sent a 6-digit code to{' '}
              <strong className="text-gray-900 dark:text-white">{email}</strong>.
              {' '}It expires in 2 minutes.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  required
                  value={verifyCode}
                  // Strip non-digits as the user types so they can't paste garbage.
                  onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className={inputClass + ' text-center text-2xl tracking-widest font-mono'}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || verifyCode.length !== 6}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <button
                onClick={handleResend}
                disabled={loading}
                className="font-medium text-gray-900 dark:text-white underline underline-offset-4 hover:no-underline disabled:opacity-50"
              >
                Resend code
              </button>
              <button
                onClick={() => { setStep('form'); setError('') }}
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Wrong email? Go back
              </button>
            </div>
          </div>

        ) : (
          // ── STEP 1: FORM ──────────────────────────────────────────────────
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create account</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Track your progress across all challenges</p>

            <div className="flex justify-center mb-6">
              <OwlController
                activeField={activeField}
                showPassword={showPassword}
                usernameRef={usernameRef}
                emailRef={emailRef}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Username
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={() => setActiveField('username')}
                  onBlur={() => setActiveField('none')}
                  placeholder="Your username"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  Letters, numbers, and underscores only. At least 3 characters.
                </p>
              </div>

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
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField('none')}
                    placeholder="Min 6 characters"
                    className={inputClass + ' pr-12'}
                  />
                  <button
                    type="button"
                    onClick={() => { passwordRef.current?.focus(); setShowPassword(v => !v) }}
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
                {loading ? 'Sending code...' : 'Continue'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-gray-900 dark:text-white underline underline-offset-4 hover:no-underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}