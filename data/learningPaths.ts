import { LearningPath } from '@/types/challenge'

export const learningPaths: LearningPath[] = [
  {
    id: 'js-basics',
    title: 'JavaScript Basics',
    description: 'Master the fundamentals of JavaScript, from conditionals to async patterns.',
    difficulty: 'beginner',
    estimatedTime: '2 hours',
    challengeIds: ['1', '2', '4', '5', '6', '7', '8'],
    icon: '🟨'
  },
  {
    id: 'react-hooks',
    title: 'React Hooks Mastery',
    description: 'Deep dive into useState, useEffect, and custom hooks with real-world examples.',
    difficulty: 'intermediate',
    estimatedTime: '3 hours',
    challengeIds: ['3', '10', '17', '18'],
    icon: '⚛️'
  },
  {
    id: 'ts-fundamentals',
    title: 'TypeScript Fundamentals',
    description: 'Learn type safety, generics, and utility types to write robust code.',
    difficulty: 'intermediate',
    estimatedTime: '2.5 hours',
    challengeIds: ['12', '16', '20'],
    icon: '🔷'
  },
  {
    id: 'advanced-patterns',
    title: 'Advanced Patterns',
    description: 'Explore closures, decorators, and complex type manipulations.',
    difficulty: 'advanced',
    estimatedTime: '4 hours',
    challengeIds: ['9', '13', '14', '15', '19'],
    icon: '🚀'
  }
]
