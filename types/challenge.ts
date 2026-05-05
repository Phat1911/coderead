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

/** Supported syntax-highlighting languages. Extend here and in lib/highlighter.ts if a new language is added. */
export type Language = 'javascript' | 'typescript' | 'python'

/** Three-tier progression model. Used as Record keys for colour maps and as URL-safe filter values. */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

/** One answer option displayed in the multiple-choice quiz. label is the display letter; text is the full answer. */
export interface QuizOption {
  label: 'A' | 'B' | 'C' | 'D'
  text: string
}

/** Core challenge entity. Required fields are sufficient to ship; optional fields (hints, aiExplanation, options) are additive. */
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
  /** Four multiple-choice options. When present, the quiz UI is shown instead of the plain reveal. */
  options?: QuizOption[]
  /** Zero-based index into `options` pointing to the correct answer. */
  correctOptionIndex?: number
}

/** A curated sequence of challenge IDs that guides learners through a topic. Displayed on /learning-paths. */
export interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  estimatedTime: string
  challengeIds: string[]
  icon: string
}

/**
 * A "Find the Bug" challenge. Separate domain from Challenge: the user clicks the
 * line they think contains the bug rather than picking from A/B/C/D. bugLineIndex
 * is stored 0-based; the component converts to 1-based line numbers for display.
 */
export interface DebugChallenge {
  id: string
  title: string
  description: string
  /** Raw buggy code. Split by \n in the component to build clickable line targets. */
  code: string
  language: Language
  difficulty: Difficulty
  /** 0-based index into code.split('\n') pointing at the buggy line. */
  bugLineIndex: number
  /** One-line summary of what goes wrong at runtime. */
  bugDescription: string
  /** Full walkthrough of why the bug exists and how to fix it. */
  explanation: string
  /** Plain-language retelling for the "Explain this to me" panel. */
  aiExplanation?: string
  keyConceptsToSpot: string[]
  tags?: string[]
}
