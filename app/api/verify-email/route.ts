/**
 * @file app/api/verify-email/route.ts
 * @description Checks whether an email domain can actually receive mail before
 *              a signup attempt hits Supabase.
 *
 *              Supabase's signUp() always returns success — it sends the confirmation
 *              email and never reports a bounce back to the caller.  That means a user
 *              who mistyped their domain (e.g. "gmail.con") gets the success screen,
 *              waits for an email that never arrives, and has no idea what went wrong.
 *
 *              The fix is a server-side DNS MX lookup: if the domain has no mail
 *              exchange records, no mail server exists to receive the message.  We
 *              reject it here with a clear error before creating any auth record.
 *
 *              Why DNS and not a paid verification API?
 *              MX lookup is free, requires no third-party dependency, and catches the
 *              most common failure mode (made-up or mistyped domains).  It won't catch
 *              a valid domain whose specific mailbox doesn't exist — that requires SMTP
 *              probing, which is slower and many servers block anyway.  For this project
 *              the DNS check is the right tradeoff.
 *
 *              This must be a Route Handler (server-side) rather than a client fetch
 *              because the Node.js `dns` module is not available in the browser.
 */

import dns from 'node:dns/promises'
import { NextResponse } from 'next/server'

/**
 * Resolves MX records for the email's domain and reports whether any exist.
 * Returns { valid: true } when the domain accepts mail, { valid: false } otherwise.
 * Never throws to the caller — DNS failures are treated as invalid.
 */
export async function POST(request: Request) {
  const { email } = await request.json()
  const domain = (email as string).split('@')[1]

  try {
    const records = await dns.resolveMx(domain)
    return NextResponse.json({ valid: records.length > 0 })
  } catch {
    // resolveMx throws when the domain has no MX records or doesn't exist at all.
    // Either way the email cannot receive mail, so treat it as invalid.
    return NextResponse.json({ valid: false })
  }
}
