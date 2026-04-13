/**
 * @file app/challenges/[id]/page.tsx
 * @description Every challenge page is pre-rendered at build time — no server runs
 *              at request time.
 *
 *              generateStaticParams enumerates all challenge IDs so Next.js generates
 *              one static HTML file per challenge.  The Shiki WASM highlighting runs
 *              once per challenge during that build step, not once per visitor.  The
 *              result: a challenge page for the 10,000th simultaneous visitor is served
 *              from CDN cache with the same latency as the 1st.
 *
 *              Prev/next navigation IDs are also computed here at build time from the
 *              challenges array order, encoding the curriculum sequence into the static
 *              page rather than computing it dynamically per request.
 */

import type { Metadata } from 'next'
import { challenges } from '@/data/challenges'
import { notFound } from 'next/navigation'
import ChallengeView from '@/components/challenge/ChallengeView'
import { highlight } from '@/lib/highlighter'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Per-challenge Open Graph metadata — makes shared challenge links render a
 * meaningful preview card rather than falling back to the site-level defaults.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const challenge = challenges.find((c) => c.id === id)
  if (!challenge) return { title: 'Challenge not found' }
  return {
    title: `${challenge.title} | CodeRead`,
    description: challenge.description,
    openGraph: {
      title: `${challenge.title} | CodeRead`,
      description: challenge.description,
      url: `https://codeoneread.tech/challenges/${id}`,
    },
  }
}

export default async function ChallengePage({ params }: PageProps) {
  const { id } = await params
  const index = challenges.findIndex((c) => c.id === id)

  if (index === -1) return notFound()

  const challenge = challenges[index]
  const prev = index > 0 ? challenges[index - 1].id : null
  const next = index < challenges.length - 1 ? challenges[index + 1].id : null
  const highlightedCode = await highlight(challenge.code, challenge.language)

  return (
    <ChallengeView
      challenge={challenge}
      prev={prev}
      next={next}
      highlightedCode={highlightedCode}
    />
  )
}

/**
 * Enumerates every challenge ID so Next.js pre-renders all detail pages at build time.
 */
export function generateStaticParams() {
  return challenges.map((c) => ({ id: c.id }))
}
