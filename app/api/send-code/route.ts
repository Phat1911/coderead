/**
 * @file app/api/send-code/route.ts
 * @description Generates a 6-digit OTP, stores it in `email_verifications`, and
 *              sends it to the user before any Supabase auth record is created.
 *
 *              Why send a code instead of just using Supabase's confirmation link?
 *              Supabase's signUp() always succeeds and creates an auth record even for
 *              undeliverable addresses — the bounce happens silently.  By verifying the
 *              email can receive mail *before* calling signUp(), we ensure every auth
 *              record in the database corresponds to a reachable inbox.
 *
 *              The MX check runs first as a cheap pre-filter: if the domain has no mail
 *              server at all (typo like "gmail.con"), we reject immediately without
 *              consuming a Resend send.  The OTP that follows is the real proof —
 *              the user must demonstrate they can receive mail at that specific address.
 *
 *              Codes expire after 2 minutes and are single-use.  Any existing unused
 *              codes for the same email are deleted before a new one is inserted, so
 *              "Resend code" always invalidates the previous code.
 */

import dns from 'node:dns/promises'
import { randomInt } from 'node:crypto'
import { Resend } from 'resend'
import { getClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Validates the email domain via MX lookup, then generates, stores, and emails
 * a 6-digit verification code that expires in 2 minutes.
 */
export async function POST(request: Request) {
  // Instantiated inside the handler so the env var is only read at request time,
  // not at build time (where it would be undefined and crash the build).
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { email }: { email: string } = await request.json()

  // ── 1. MX CHECK ──────────────────────────────────────────────────────────
  // Fast pre-filter before touching the database or spending a Resend send.
  // If the domain has no mail exchange records, no mail server can accept the
  // message — reject early with a clear user-facing message.
  const domain = email.split('@')[1]
  try {
    const records = await dns.resolveMx(domain)
    if (records.length === 0) {
      return NextResponse.json(
        { error: 'That email address does not appear to exist. Please check for typos.' },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'That email address does not appear to exist. Please check for typos.' },
      { status: 400 }
    )
  }

  // ── 2. GENERATE CODE ─────────────────────────────────────────────────────
  // randomInt is cryptographically secure — Math.random() is not suitable for
  // generating codes that protect account creation.
  const code = randomInt(100000, 1000000).toString()
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString()

  // ── 3. STORE CODE ────────────────────────────────────────────────────────
  const supabase = await getClient()

  // Delete any existing unused codes for this email so "Resend code" always
  // invalidates the previous one rather than leaving stale rows.
  await supabase.from('email_verifications').delete().eq('email', email)

  const { error: insertError } = await supabase
    .from('email_verifications')
    .insert({ email, code, expires_at: expiresAt })

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to create verification code. Please try again.' },
      { status: 500 }
    )
  }

  // ── 4. SEND EMAIL ─────────────────────────────────────────────────────────
  const { error: emailError } = await resend.emails.send({
    from: 'CodeRead <noreply@codeoneread.tech>',
    to: email,
    subject: `${code} is your CodeRead verification code`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;color:#111;background:#fff;">
          <p style="font-size:22px;font-weight:700;margin:0 0 4px;">CodeRead</p>
          <p style="color:#666;margin:0 0 32px;font-size:14px;">Verify your email address</p>

          <div style="background:#f4f4f5;border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
            <span style="font-size:40px;font-weight:700;letter-spacing:10px;font-family:monospace;">${code}</span>
          </div>

          <p style="font-size:13px;color:#666;margin:0 0 8px;">
            This code expires in <strong style="color:#111;">2 minutes</strong>.
          </p>
          <p style="font-size:13px;color:#999;margin:0;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </body>
      </html>
    `,
  })

  if (emailError) {
    return NextResponse.json(
      { error: 'Failed to send verification email. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
