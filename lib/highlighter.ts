/**
 * @file lib/highlighter.ts
 * @description Syntax highlighting is intentionally server-only.
 *
 *              Shiki ships a ~2MB WASM bundle.  By running it at build time (during
 *              generateStaticParams + page render) the browser receives pre-highlighted
 *              HTML and never downloads or executes any highlighting code at all.
 *
 *              The module-level singleton prevents the more subtle performance problem:
 *              without it, every concurrent SSR request would spin up its own WASM
 *              instance, multiplying memory usage and initialization time under load.
 *              One instance per Node.js process is the correct granularity.
 */

import { createHighlighter } from 'shiki'

/** Module-level singleton. Storing the Promise (not the resolved value) means concurrent
 *  callers await the same initialisation rather than each triggering a separate WASM load. */
let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

/** Returns (or lazily creates) the shared Shiki highlighter instance. */
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript', 'python'],
    })
  }
  return highlighterPromise
}

/** Maps the Challenge.language string to the exact Shiki grammar key. Defaults to 'typescript' for unknown values. */
function resolveLang(lang: string): 'javascript' | 'typescript' | 'python' {
  return lang === 'javascript' ? 'javascript'
    : lang === 'python' ? 'python'
    : 'typescript'
}

/**
 * Returns pre-highlighted HTML for the given code snippet.
 * `defaultColor: false` instructs Shiki to emit CSS-variable tokens instead of
 * hardcoded colours, enabling the dark/light switch purely via the `dark` class
 * on `<html>` with no client-side JavaScript involved.
 */
export async function highlight(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter()
  return highlighter.codeToHtml(code, {
    lang: resolveLang(lang),
    themes: {
      dark: 'github-dark',
      light: 'github-light',
    },
    defaultColor: false,
  })
}

/**
 * Returns an array of pre-highlighted HTML strings, one per source line, so each
 * line can be rendered as its own clickable target (see BugChallenge). Tokens
 * still carry the same --shiki-light / --shiki-dark CSS variables as `highlight`
 * so theme switching works identically.
 */
export async function highlightLines(code: string, lang: string): Promise<string[]> {
  const highlighter = await getHighlighter()
  const tokensPerLine = highlighter.codeToTokensWithThemes(code, {
    themes: { dark: 'github-dark', light: 'github-light' },
    lang: resolveLang(lang),
  })
  return tokensPerLine.map((line) =>
    line
      .map((tok) => {
        const styleParts: string[] = []
        for (const [themeName, color] of Object.entries(tok.variants ?? {})) {
          styleParts.push(`--shiki-${themeName}:${color.color}`)
        }
        const style = styleParts.join(';')
        const safe = tok.content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        return `<span style="${style}">${safe}</span>`
      })
      .join('')
  )
}
