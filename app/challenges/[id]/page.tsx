import { challenges } from '@/data/challenges'
import { notFound } from 'next/navigation'
import ChallengeView from '@/components/challenge/ChallengeView'
import { highlight } from '@/lib/highlighter'

interface PageProps {
  params: Promise<{ id: string }>
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
