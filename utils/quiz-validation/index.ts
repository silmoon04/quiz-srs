/**
 * Unified Quiz Validation API
 *
 * This module provides a stable API for quiz parsing and validation,
 * with support for both legacy and refactored implementations.
 *
 * The refactored implementation includes:
 * - Enhanced markdown parsing with True/False support
 * - Conservative LaTeX correction
 * - Better error handling and recovery
 * - Global ID uniqueness validation
 */

// Environment flag for rollback capability
const USE_REFACTORED_PARSER = process.env.USE_REFACTORED_PARSER !== "false";

// Re-export types
export type { ValidationResult } from "../quiz-validation";

export type {
  QuizModule,
  QuizChapter,
  QuizQuestion,
  QuizOption,
} from "@/types/quiz-types";

// Import implementations
import * as legacyParser from "../quiz-validation";
import * as refactoredParser from "../quiz-validation-refactored";

// Choose implementation based on environment flag
const parser = USE_REFACTORED_PARSER ? refactoredParser : legacyParser;

// Re-export the stable API
export const parseMarkdownToQuizModule = parser.parseMarkdownToQuizModule;
export const validateAndCorrectQuizModule = parser.validateAndCorrectQuizModule;
export const normalizeQuizModule = parser.normalizeQuizModule;
export const validateQuizModule = parser.validateQuizModule;
export const validateSingleQuestion = parser.validateSingleQuestion;
export const normalizeSingleQuestion = parser.normalizeSingleQuestion;
export const recalculateChapterStats = parser.recalculateChapterStats;
export const correctLatexInJsonContent = parser.correctLatexInJsonContent;

// Export the current implementation info for debugging
export const getCurrentImplementation = () => ({
  isRefactored: USE_REFACTORED_PARSER,
  implementation: USE_REFACTORED_PARSER ? "refactored" : "legacy",
});

// Export both implementations for comparison purposes
export { legacyParser, refactoredParser };
