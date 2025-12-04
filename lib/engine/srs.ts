/**
 * SRS Engine - Spaced Repetition System Calculation Engine
 *
 * Pure functions for calculating SRS state transitions.
 * No side effects, fully testable, framework-agnostic.
 *
 * Based on a simplified Leitner system:
 * - Level 0: New/Failed (review in 30 seconds after failure)
 * - Level 1: Learning (review in 10 minutes)
 * - Level 2: Mastered (no scheduled review)
 *
 * @module lib/engine/srs
 */

// Define QuestionStatus locally to avoid circular dependencies
export type QuestionStatus =
  | 'not_attempted'
  | 'attempted'
  | 'passed_once'
  | 'review_soon'
  | 'review_later'
  | 'mastered';

// ============================================
// CONSTANTS
// ============================================

/** Maximum SRS level (mastered) */
export const MAX_SRS_LEVEL = 2;

/** Minimum SRS level (new/failed) */
export const MIN_SRS_LEVEL = 0;

/**
 * Review intervals in milliseconds
 */
export const SRS_INTERVALS = {
  /** Retry interval after incorrect answer (30 seconds) */
  FAILED: 30 * 1000,
  /** Review interval for level 1 (10 minutes) */
  LEARNING: 10 * 60 * 1000,
  /** No review needed for mastered (0) */
  MASTERED: 0,
} as const;

// ============================================
// TYPES
// ============================================

/**
 * Input state for SRS calculation
 */
export interface SrsInput {
  /** Current SRS level (0-2) */
  srsLevel: number;
  /** Current question status */
  status: QuestionStatus;
  /** Total times answered correctly */
  timesAnsweredCorrectly: number;
  /** Total times answered incorrectly */
  timesAnsweredIncorrectly: number;
}

/**
 * Result of SRS calculation after an answer
 */
export interface SrsResult {
  /** New SRS level after update */
  srsLevel: number;
  /** New question status */
  status: QuestionStatus;
  /** Next review timestamp (ISO string) or null if mastered */
  nextReviewAt: string | null;
  /** Updated correct answer count */
  timesAnsweredCorrectly: number;
  /** Updated incorrect answer count */
  timesAnsweredIncorrectly: number;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clamps SRS level to valid range [0, MAX_SRS_LEVEL]
 *
 * Handles edge cases:
 * - Negative values → 0
 * - Values > MAX → MAX
 * - NaN → 0
 * - Infinity → bounds
 *
 * @param level - Raw SRS level value
 * @returns Clamped SRS level
 */
export function clampSrsLevel(level: number): number {
  // Handle NaN
  if (Number.isNaN(level)) {
    return MIN_SRS_LEVEL;
  }

  // Handle Infinity
  if (!Number.isFinite(level)) {
    return level > 0 ? MAX_SRS_LEVEL : MIN_SRS_LEVEL;
  }

  // Clamp to valid range
  return Math.max(MIN_SRS_LEVEL, Math.min(MAX_SRS_LEVEL, Math.floor(level)));
}

/**
 * Safely gets a number value, defaulting to 0 for invalid inputs
 */
function safeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return 0;
}

// ============================================
// CORE SRS CALCULATION
// ============================================

/**
 * Calculates the next SRS state after answering a question
 *
 * Implements a simplified Leitner system:
 * - Correct: Level increases (max 2), status updates
 * - Incorrect: Level resets to 0, schedules quick retry
 *
 * @param input - Current question SRS state
 * @param isCorrect - Whether the answer was correct
 * @returns New SRS state after the answer
 *
 * @example
 * ```ts
 * const input = { srsLevel: 0, status: 'not_attempted', ... };
 * const result = calculateNextReview(input, true);
 * // result.srsLevel === 1
 * // result.status === 'passed_once'
 * ```
 */
export function calculateNextReview(input: SrsInput, isCorrect: boolean): SrsResult {
  const now = Date.now();

  // Sanitize inputs
  const currentLevel = clampSrsLevel(input.srsLevel);
  const currentCorrect = safeNumber(input.timesAnsweredCorrectly);
  const currentIncorrect = safeNumber(input.timesAnsweredIncorrectly);

  if (isCorrect) {
    // Progress to next level (capped at MAX)
    const newLevel = Math.min(currentLevel + 1, MAX_SRS_LEVEL);

    // Determine new status and review time
    if (newLevel >= MAX_SRS_LEVEL) {
      // Mastered - no more reviews
      return {
        srsLevel: newLevel,
        status: 'mastered',
        nextReviewAt: null,
        timesAnsweredCorrectly: currentCorrect + 1,
        timesAnsweredIncorrectly: currentIncorrect,
      };
    } else {
      // Learning - schedule next review
      const nextReviewTime = new Date(now + SRS_INTERVALS.LEARNING);
      return {
        srsLevel: newLevel,
        status: 'passed_once',
        nextReviewAt: nextReviewTime.toISOString(),
        timesAnsweredCorrectly: currentCorrect + 1,
        timesAnsweredIncorrectly: currentIncorrect,
      };
    }
  } else {
    // Incorrect - reset to level 0 and schedule quick retry
    const nextReviewTime = new Date(now + SRS_INTERVALS.FAILED);
    return {
      srsLevel: MIN_SRS_LEVEL,
      status: 'attempted',
      nextReviewAt: nextReviewTime.toISOString(),
      timesAnsweredCorrectly: currentCorrect,
      timesAnsweredIncorrectly: currentIncorrect + 1,
    };
  }
}

// ============================================
// HELPER FUNCTIONS FOR REVIEW SCHEDULING
// ============================================

/**
 * Checks if a question is due for review
 *
 * @param nextReviewAt - ISO timestamp or null
 * @param now - Current time (defaults to Date.now())
 * @returns True if the question is due for review
 */
export function isQuestionDue(nextReviewAt: string | null, now: number = Date.now()): boolean {
  // New questions with no review time are always due
  if (nextReviewAt === null) {
    return true;
  }

  // Check if scheduled time has passed
  const reviewTime = new Date(nextReviewAt).getTime();
  return reviewTime <= now;
}

/**
 * Gets the status label for display
 *
 * @param srsLevel - Current SRS level
 * @returns Human-readable status string
 */
export function getSrsStatusLabel(srsLevel: number): string {
  const level = clampSrsLevel(srsLevel);

  switch (level) {
    case 0:
      return 'New/Failed';
    case 1:
      return 'Learning';
    case 2:
      return 'Mastered';
    default:
      return 'Unknown';
  }
}

/**
 * Gets the color class for SRS level display
 *
 * @param srsLevel - Current SRS level
 * @returns Tailwind color class
 */
export function getSrsLevelColor(srsLevel: number): string {
  const level = clampSrsLevel(srsLevel);

  switch (level) {
    case 0:
      return 'text-blue-400'; // New/Failed - blue like Anki
    case 1:
      return 'text-yellow-400'; // Learning - yellow/orange
    case 2:
      return 'text-green-400'; // Mastered - green
    default:
      return 'text-gray-400';
  }
}
