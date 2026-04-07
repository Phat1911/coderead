import { createHighlighter } from 'shiki'

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript'],
    })
  }
  return highlighterPromise
}

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
