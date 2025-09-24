/**
 * Quiz Validation API
 *
 * This module provides the quiz parsing and validation functionality.
 *
 * Features:
 * - Enhanced markdown parsing with True/False support
 * - Conservative LaTeX correction
 * - Better error handling and recovery
 * - Global ID uniqueness validation
 */

// Re-export types
export type { ValidationResult } from '../quiz-validation-refactored';
export type { QuizModule, QuizChapter, QuizQuestion, QuizOption } from '@/types/quiz-types';

// Import the refactored implementation
import * as parser from '../quiz-validation-refactored';

// Re-export the stable API
export const parseMarkdownToQuizModule = parser.parseMarkdownToQuizModule;
export const validateAndCorrectQuizModule = parser.validateAndCorrectQuizModule;
export const normalizeQuizModule = parser.normalizeQuizModule;
export const validateQuizModule = parser.validateQuizModule;
export const validateSingleQuestion = parser.validateSingleQuestion;
export const normalizeSingleQuestion = parser.normalizeSingleQuestion;
export const recalculateChapterStats = parser.recalculateChapterStats;
export const correctLatexInJsonContent = parser.correctLatexInJsonContent;
