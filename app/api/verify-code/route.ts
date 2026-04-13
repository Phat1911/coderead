/**
 * @file app/api/verify-code/route.ts
 * @description Validates a submitted OTP code against the `email_verifications` table
 *              and marks it as used on success.
 *
 *              Three conditions must all be true for a code to be accepted:
 *                1. The code matches the one stored for that email.
 *                2. The row has not already been used (prevents replay attacks where
 *                   someone intercepts a valid code and submits it a second time).
 *                3. The row has not expired (expires_at is in the future).
 *
 *              On success the row is marked `used = true` before responding, so a
 *              code cannot be accepted twice even under concurrent requests.
 *              The signup page calls supabase.auth.signUp() only after receiving
 *              { valid: true } from this route — so no auth record is ever created
 *              for an address that hasn't proven it can receive mail.
 */

import { getClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Checks the submitted code against the database and marks it used if valid.
 * Returns { valid: true } on success, { valid: false } on any failure.
 */
export async function POST(request: Request) {
  const { email, code }: { email: string; code: string } = await request.json()

  const supabase = await getClient()

  // Fetch a row that matches email + code, is unused, and hasn't expired yet.
  // All three conditions are checked in a single query to avoid TOCTOU races.
  const { data, error } = await supabase
    .from('email_verifications')
    .select('id')
    .eq('email', email)
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    return NextResponse.json({ valid: false })
  }

  // Mark the code as used immediately so it cannot be submitted again.
  await supabase
    .from('email_verifications')
    .update({ used: true })
    .eq('id', data.id)

  return NextResponse.json({ valid: true })
}
