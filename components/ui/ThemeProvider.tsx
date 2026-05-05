/**
 * @file components/ui/ThemeProvider.tsx
 * @description Theme persistence is a two-layer problem.
 *
 *              Layer 1 — after hydration (this file): reads localStorage, falls back to
 *              OS preference, provides a toggle that writes back to localStorage and
 *              syncs the `dark` class on `<html>` so Tailwind's dark variants respond.
 *
 *              Layer 2 — before hydration (the inline <script> in app/layout.tsx):
 *              applies the `dark` class synchronously before any CSS renders, preventing
 *              a flash of the wrong theme.  suppressHydrationWarning on `<html>` is
 *              required because the inline script changes the DOM before React can
 *              reconcile it — React would otherwise warn about the class mismatch.
 *
 *              A CSS-only solution (prefers-color-scheme alone) was rejected because
 *              users should be able to override their OS setting per-site.
 */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'

/** The two visual states the app can be in. Stored in localStorage as the literal string. */
type Theme = 'light' | 'dark'

/** Shape of the value exposed by ThemeContext — consumed by useTheme() in any child component. */
interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

/** React context that broadcasts the current theme and toggle function to the component tree. */
const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggle: () => {},
})

/**
 * Consumes the theme context.  Must be called inside a ThemeProvider.
 */
export function useTheme() {
  return useContext(ThemeContext)
}

/** Reads the stored preference (localStorage → OS media query → 'light') without causing SSR errors.
 *  Called as a useState initialiser so it only runs once per mount. */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem('theme') as Theme | null
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  /** Flips the theme, persists to localStorage, and syncs the `dark` class on <html> immediately. */
  function toggle() {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
