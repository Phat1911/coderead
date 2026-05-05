/**
 * @file lib/points.ts
 * @description Calculates points awarded for completing a challenge.
 *
 *              Points scale by difficulty and challenge type:
 *              - Learn (code reading): beginner=1, intermediate=2, advanced=3
 *              - Debug (find the bug): beginner=5, intermediate=10, advanced=15
 *
 *              The `challengeType` parameter is a string: 'learn' or 'debug'.
 *              The `difficulty` parameter is a string: 'beginner', 'intermediate', or 'advanced'.
 */

// Point values for each difficulty level by challenge type.
// Keys are challenge types, values are maps from difficulty to points.
const POINT_TABLE: Record<string, Record<string, number>> = {
  learn: {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  },
  debug: {
    beginner: 5,
    intermediate: 10,
    advanced: 15,
  },
}

/**
 * calculatePoints - Returns the point value for a completed challenge.
 *
 * @param challengeType - The type of challenge: 'learn' or 'debug'
 * @param difficulty - The difficulty level: 'beginner', 'intermediate', or 'advanced'
 * @returns The number of points to award (defaults to 1 if type/difficulty not found)
 */
export function calculatePoints(challengeType: string, difficulty: string): number {
  return POINT_TABLE[challengeType]?.[difficulty] ?? 1
}
