/**
 * @file types/challenge.ts
 * @description The domain model for the entire app.
 *
 *              Challenge content is split into "required" and "optional" fields by design.
 *              A challenge is shippable with just the core Q&A (code + question + explanation).
 *              hints and aiExplanation are additive — they can be backfilled later without
 *              touching the display logic.  This lets content grow incrementally.
 *
 *              Language and Difficulty are union string types rather than enums so they can be
 *              used directly as Record keys (difficultyColor maps), URL params, and filter
 *              values without any conversion layer.
 */

export type Language = 'javascript' | 'typescript' | 'python'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Challenge {
  id: string
  title: string
  description: string
  code: string
  language: Language
  difficulty: Difficulty
  question: string
  explanation: string
  keyConceptsToSpot: string[]
  tags?: string[]
  aiExplanation?: string
  hints?: string[]
}

export interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  estimatedTime: string
  challengeIds: string[]
  icon: string
}
