/**
 * @file lib/hooks/useOwlTracking.ts
 * @description Powers the "owl reads the form" effect on login/signup pages.
 *
 *              The UX intent: form-filling is anxiety-inducing (especially passwords).
 *              Making the owl's eyes track your cursor as you type your email/username
 *              turns a routine form into a playful, character-driven moment.  When you
 *              focus the password field, the owl covers its eyes — a privacy gesture that
 *              is both charming and communicates "your password is hidden."
 *
 *              The technical challenge: browsers expose no API for the pixel X position
 *              of a text cursor inside an <input>.  The getBoundingClientRect() approach
 *              that works for contentEditable does not work for input elements.  Instead
 *              we replicate the browser's text layout by measuring text width on an
 *              off-screen canvas with the same computed font, then dividing by field width
 *              to get a 0–1 cursor fraction.
 */

import { useState, useEffect, useRef } from 'react'

/**
 * Estimates cursor position as a 0–1 fraction of the input's visible width.
 * Clamps to 1 so text that has scrolled out of view (wider than the field)
 * doesn't produce a fraction greater than 1 and send pupils off-screen.
 */
function getCursorFraction(el: HTMLInputElement): number {
  const textBeforeCursor = el.value.slice(0, el.selectionStart ?? 0)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const style = window.getComputedStyle(el)
  ctx.font = `${style.fontSize} ${style.fontFamily}`

  const textWidth = ctx.measureText(textBeforeCursor).width
  const fieldWidth = el.clientWidth

  // 0 = cursor at far left edge of field, 1 = cursor at far right edge
  return Math.min(textWidth / fieldWidth, 1)
}

/**
 * Returns live pupil offsets (range -1..1) driven by cursor movement in `inputRef`.
 * `pupilY` is always 0 here — vertical offset (looking downward at the field) is
 * applied by OwlController so this hook stays reusable without those assumptions.
 */
export default function useOwlTracking(inputRef: React.RefObject<HTMLInputElement | null>): {
  pupilX: number
  pupilY: number
} {
  const [pupilX, setPupilX] = useState(0)
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const el = inputRef.current
    if (!el) return

    function handleInput() {
      if (!el) return
      const fraction = getCursorFraction(el)
      // Map 0..1 → -0.6..0.6
      setPupilX((fraction - 0.5) * 1.2)
    }

    function handleBlur() {
      if (returnTimer.current) clearTimeout(returnTimer.current)
      returnTimer.current = setTimeout(() => {
        setPupilX(0)
      }, 300)
    }

    function handleFocus() {
      if (returnTimer.current) clearTimeout(returnTimer.current)
    }

    el.addEventListener('input', handleInput)
    el.addEventListener('keydown', handleInput)
    el.addEventListener('click', handleInput)
    el.addEventListener('blur', handleBlur)
    el.addEventListener('focus', handleFocus)

    return () => {
      el.removeEventListener('input', handleInput)
      el.removeEventListener('keydown', handleInput)
      el.removeEventListener('click', handleInput)
      el.removeEventListener('blur', handleBlur)
      el.removeEventListener('focus', handleFocus)
      if (returnTimer.current) clearTimeout(returnTimer.current)
    }
  }, [inputRef])

  return { pupilX, pupilY: 0 }
}
