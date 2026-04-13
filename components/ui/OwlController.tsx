/**
 * @file components/ui/OwlController.tsx
 * @description The translation layer between form state and animation state.
 *
 *              OwlMascot knows nothing about forms; login/signup pages know nothing about
 *              SVG geometry.  OwlController sits between them and owns the mapping:
 *              "email field active" → tracking mode using emailRef's cursor position,
 *              "password field active + hidden" → hiding mode,
 *              "password field active + visible" → peeking mode.
 *
 *              useOwlTracking runs for every trackable field simultaneously, but only the
 *              active field's pupilX value is forwarded to OwlMascot.  This means tracking
 *              state is always ready the moment a field becomes active — no initialization
 *              delay as the user switches focus between fields.
 */

'use client'

import OwlMascot from '@/components/ui/OwlMascot'
import useOwlTracking from '@/lib/hooks/useOwlTracking'

interface OwlControllerProps {
  activeField: 'none' | 'username' | 'email' | 'password'
  showPassword: boolean
  usernameRef: React.RefObject<HTMLInputElement | null>
  emailRef: React.RefObject<HTMLInputElement | null>
}

export default function OwlController({
  activeField,
  showPassword,
  usernameRef,
  emailRef,
}: OwlControllerProps) {
  const usernameTracking = useOwlTracking(usernameRef)
  const emailTracking = useOwlTracking(emailRef)

  let mode: 'idle' | 'tracking' | 'hiding' | 'peeking' = 'idle'
  let pupilX = 0
  // When tracking, pupils glance down (0.55) to observe the text cursor
  const TRACKING_PUPIL_Y = 0.55

  if (activeField === 'username') {
    mode = 'tracking'
    pupilX = usernameTracking.pupilX
  } else if (activeField === 'email') {
    mode = 'tracking'
    pupilX = emailTracking.pupilX
  } else if (activeField === 'password') {
    mode = showPassword ? 'peeking' : 'hiding'
  }

  const pupilY = mode === 'tracking' ? TRACKING_PUPIL_Y : 0

  return (
    <div className="mb-2">
      <OwlMascot mode={mode} pupilX={pupilX} pupilY={pupilY} />
    </div>
  )
}
