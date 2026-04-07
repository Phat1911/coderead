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
