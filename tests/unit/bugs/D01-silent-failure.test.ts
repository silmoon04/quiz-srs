/**
 * D1: Silent Failure Path in handleLoadQuiz JSON Branch
 *
 * Bug: When JSON.parse() fails and validateAndCorrectQuizModule() returns
 * a truthy correctionResult but FALSY correctedModule, the function silently
 * completes without loading any module or showing an error.
 *
 * These tests verify that ALL code paths result in either:
 * - A successfully loaded module, OR
 * - An error being shown to the user
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateAndCorrectQuizModule,
  validateQuizModule,
  normalizeQuizModule,
} from '@/utils/quiz-validation-refactored';

describe('D1: Silent Failure Path in JSON Loading', () => {
  describe('validateAndCorrectQuizModule edge cases', () => {
    it('should never return truthy correctionResult with falsy correctedModule', () => {
      // Malformed JSON that triggers correction attempt but fails to produce valid module
      const malformedJsonContent = `{
        "name": "Test Quiz",
        "chapters": [
          {
            "id": "ch1",
            "title": "Chapter 1",
            "questions": [
              {
                "questionId": "q1",
                "questionText": "Test with bad LaTeX $x^{2",
                "options": []
              }
            ]
          }
        ]
      }`;

      const result = validateAndCorrectQuizModule(malformedJsonContent);

      // EXPECTED BEHAVIOR: If correctionResult is truthy, correctedModule must also be truthy
      // OR correctionResult should be null/falsy
      if (result.correctionResult) {
        expect(result.normalizedModule).toBeTruthy();
      }
    });

    it('should return validation errors when JSON is completely invalid', () => {
      const invalidJson = 'not valid json at all {{{';

      const result = validateAndCorrectQuizModule(invalidJson);

      // Should have validation errors or throw
      expect(result.validationResult.isValid).toBe(false);
      expect(result.validationResult.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty chapters array gracefully', () => {
      const emptyChaptersJson = JSON.stringify({
        name: 'Empty Quiz',
        chapters: [],
      });

      const result = validateAndCorrectQuizModule(emptyChaptersJson);

      // Should either be valid with empty chapters, or have clear error
      if (!result.validationResult.isValid) {
        expect(
          result.validationResult.errors.some(
            (e) => e.toLowerCase().includes('chapter') || e.toLowerCase().includes('empty'),
          ),
        ).toBe(true);
      }
    });

    it('should handle questions with no options', () => {
      const noOptionsJson = JSON.stringify({
        name: 'Bad Quiz',
        chapters: [
          {
            id: 'ch1',
            title: 'Chapter 1',
            questions: [
              {
                questionId: 'q1',
                questionText: 'What is 2+2?',
                options: [],
                correctOptionIds: ['opt1'],
              },
            ],
          },
        ],
      });

      const result = validateAndCorrectQuizModule(noOptionsJson);

      // Must either fail validation or return a usable module
      expect(result.validationResult.isValid).toBe(false);
    });

    it('should handle questions with mismatched correctOptionIds', () => {
      const mismatchedIdsJson = JSON.stringify({
        name: 'Mismatched Quiz',
        chapters: [
          {
            id: 'ch1',
            title: 'Chapter 1',
            questions: [
              {
                questionId: 'q1',
                questionText: 'What is 2+2?',
                options: [
                  { optionId: 'a', text: '3' },
                  { optionId: 'b', text: '4' },
                ],
                correctOptionIds: ['nonexistent'], // This ID doesn't exist!
              },
            ],
          },
        ],
      });

      const result = validateAndCorrectQuizModule(mismatchedIdsJson);

      // This should fail validation
      expect(result.validationResult.isValid).toBe(false);
      expect(
        result.validationResult.errors.some(
          (e) => e.includes('correctOptionId') || e.includes('not found'),
        ),
      ).toBe(true);
    });
  });

  describe('Control flow completeness', () => {
    it('should always set module OR show error - never neither', async () => {
      // This test simulates the handleLoadQuiz control flow
      type LoadResult = { moduleSet: boolean; errorShown: boolean };

      async function simulateLoadQuiz(fileContent: string): Promise<LoadResult> {
        let moduleSet = false;
        let errorShown = false;
        let correctionResult: any = null;
        let normalizedModule: any = null;

        try {
          // Simulate JSON parsing
          let parsedData: any;
          try {
            parsedData = JSON.parse(fileContent);
          } catch {
            // Apply LaTeX corrections
            const result = validateAndCorrectQuizModule(fileContent);
            correctionResult = result.correctionResult;

            if (!result.validationResult.isValid) {
              throw new Error('Invalid quiz module format');
            }

            if (result.normalizedModule) {
              moduleSet = true;
              return { moduleSet, errorShown };
            }
            // BUG: Falls through here if correctionResult is truthy but normalizedModule is falsy
          }

          if (!correctionResult) {
            const validation = validateQuizModule(parsedData);
            if (!validation.isValid) {
              throw new Error('Invalid quiz module format');
            }
            normalizedModule = normalizeQuizModule(parsedData);
            moduleSet = true;
          }
          // BUG: If correctionResult is truthy but we didn't return early, we fall through here
        } catch {
          errorShown = true;
        }

        return { moduleSet, errorShown };
      }

      // Test case that triggers the bug
      const bugTriggeringContent = '{"name": "Test", "chapters": "invalid"}';
      const result = await simulateLoadQuiz(bugTriggeringContent);

      // EXPECTED: Either module is set OR error is shown, never neither
      expect(result.moduleSet || result.errorShown).toBe(true);
    });
  });

  describe('LaTeX correction edge cases', () => {
    it('should handle unclosed LaTeX delimiters', () => {
      const unclosedLatex = JSON.stringify({
        name: 'LaTeX Quiz',
        chapters: [
          {
            id: 'ch1',
            title: 'Math',
            questions: [
              {
                questionId: 'q1',
                questionText: 'The formula is $x^2', // Missing closing $
                options: [
                  { optionId: 'a', text: 'Yes' },
                  { optionId: 'b', text: 'No' },
                ],
                correctOptionIds: ['a'],
              },
            ],
          },
        ],
      });

      const result = validateAndCorrectQuizModule(unclosedLatex);

      // Should either fix it or report error, not silently fail
      expect(result.normalizedModule !== null || !result.validationResult.isValid).toBe(true);
    });

    it('should handle nested LaTeX delimiters', () => {
      const nestedLatex = JSON.stringify({
        name: 'Nested LaTeX',
        chapters: [
          {
            id: 'ch1',
            title: 'Math',
            questions: [
              {
                questionId: 'q1',
                questionText: 'Formula: $$x = $y$$$', // Nested/malformed
                options: [
                  { optionId: 'a', text: 'Correct' },
                  { optionId: 'b', text: 'Wrong' },
                ],
                correctOptionIds: ['a'],
              },
            ],
          },
        ],
      });

      const result = validateAndCorrectQuizModule(nestedLatex);

      // Should handle gracefully
      expect(
        result.normalizedModule !== null ||
          !result.validationResult.isValid ||
          (result.correctionResult && result.correctionResult.correctionsMade > 0),
      ).toBe(true);
    });
  });
});
