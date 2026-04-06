export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Challenge {
  id: string
  title: string
  description: string
  code: string
  language: string
  difficulty: Difficulty
  question: string
  explanation: string
  keyConceptsToSpot: string[]
}
