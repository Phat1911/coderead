import { useState, useEffect, useRef } from 'react'

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
