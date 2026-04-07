import type { Metadata } from 'next'
import { challenges } from '@/data/challenges'
import { notFound } from 'next/navigation'
import ChallengeView from '@/components/challenge/ChallengeView'
import { highlight } from '@/lib/highlighter'

interface PageProps {
  params: Promise<{ id: string }>
}

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

export function generateStaticParams() {
  return challenges.map((c) => ({ id: c.id }))
}
