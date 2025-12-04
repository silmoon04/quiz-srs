/**
 * Engine Module Index
 *
 * Pure calculation engines for quiz logic.
 * These modules contain no side effects and are fully testable.
 *
 * @module lib/engine
 */

// SRS (Spaced Repetition System) Engine
export {
  calculateNextReview,
  clampSrsLevel,
  isQuestionDue,
  getSrsStatusLabel,
  getSrsLevelColor,
  SRS_INTERVALS,
  MAX_SRS_LEVEL,
  MIN_SRS_LEVEL,
  type SrsInput,
  type SrsResult,
} from './srs';
