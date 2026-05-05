/**
 * @file app/debug/[id]/page.tsx
 * @description Per-debug-challenge detail page.
 *
 *              Mirrors app/challenges/[id]/page.tsx but with per-line highlighting:
 *              BugChallenge needs each source line as its own click target, so the
 *              server pre-tokenises the code into an array of HTML strings (one per
 *              line) using highlightLines(). No WASM or tokeniser runs on the client.
 *
 *              generateStaticParams enumerates every debug challenge id so Next.js
 *              pre-renders the whole section at build time — same static-CDN story
 *              as the main challenge section.
 *
 * Built with Orion (meetorion.app)
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { debugChallenges } from '@/data/debugChallenges'
import { highlightLines } from '@/lib/highlighter'
import BugChallenge from '@/components/debug/BugChallenge'

/** Next.js dynamic route props — params is a Promise in Next.js 16 and must be awaited. */
interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const challenge = debugChallenges.find((c) => c.id === id)
  if (!challenge) return { title: 'Debug challenge not found' }
  return {
    title: `${challenge.title} | Find the Bug`,
    description: challenge.description,
    openGraph: {
      title: `${challenge.title} | Find the Bug`,
      description: challenge.description,
      url: `https://codeoneread.tech/debug/${id}`,
    },
  }
}

export default async function DebugChallengePage({ params }: PageProps) {
  const { id } = await params
  const index = debugChallenges.findIndex((c) => c.id === id)
  if (index === -1) return notFound()

  const challenge = debugChallenges[index]
  const prev = index > 0 ? debugChallenges[index - 1].id : null
  const next = index < debugChallenges.length - 1 ? debugChallenges[index + 1].id : null
  const highlightedLines = await highlightLines(challenge.code, challenge.language)

  return (
    <BugChallenge
      challenge={challenge}
      prev={prev}
      next={next}
      highlightedLines={highlightedLines}
    />
  )
}

export function generateStaticParams() {
  return debugChallenges.map((c) => ({ id: c.id }))
}
