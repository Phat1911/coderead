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

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

// A Promise (not the resolved value) is stored so concurrent callers all await
// the same initialization rather than each triggering their own.
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript'],
    })
  }
  return highlighterPromise
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
    lang: lang === 'javascript' ? 'javascript' : 'typescript',
    themes: {
      dark: 'github-dark',
      light: 'github-light',
    },
    defaultColor: false,
  })
}
