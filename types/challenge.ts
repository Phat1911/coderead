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
}
