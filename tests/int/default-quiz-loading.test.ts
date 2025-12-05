/**
 * Integration test for default quiz file loading
 *
 * This test ensures that:
 * 1. The default quiz files exist in the public folder
 * 2. They can be parsed successfully
 * 3. They contain valid quiz data
 *
 * Run with: npm run test:unit -- tests/int/default-quiz-loading.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseMarkdownToQuizModule } from '@/lib/quiz/parser';
import { validateAndCorrectQuizModule } from '@/utils/quiz-validation-refactored';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

describe('Default Quiz File Loading', () => {
  describe('File Existence', () => {
    it('should have default-quiz.md in public folder', () => {
      const mdPath = path.join(PUBLIC_DIR, 'default-quiz.md');
      expect(fs.existsSync(mdPath)).toBe(true);
    });

    it('should have default-quiz.json in public folder as fallback', () => {
      const jsonPath = path.join(PUBLIC_DIR, 'default-quiz.json');
      expect(fs.existsSync(jsonPath)).toBe(true);
    });
  });

  describe('Markdown Quiz Parsing', () => {
    let mdContent: string;

    beforeAll(() => {
      const mdPath = path.join(PUBLIC_DIR, 'default-quiz.md');
      mdContent = fs.readFileSync(mdPath, 'utf-8');
    });

    it('should parse markdown file successfully', () => {
      const result = parseMarkdownToQuizModule(mdContent);

      expect(result.success).toBe(true);
      expect(result.quizModule).toBeDefined();
      expect(result.errors.filter((e) => e.startsWith('[Error]'))).toHaveLength(0);
    });

    it('should have a valid module name', () => {
      const result = parseMarkdownToQuizModule(mdContent);

      expect(result.quizModule?.name).toBeTruthy();
      expect(typeof result.quizModule?.name).toBe('string');
      expect(result.quizModule?.name.length).toBeGreaterThan(0);
    });

    it('should have at least one chapter', () => {
      const result = parseMarkdownToQuizModule(mdContent);

      expect(result.quizModule?.chapters).toBeDefined();
      expect(result.quizModule?.chapters.length).toBeGreaterThan(0);
    });

    it('should have at least one question per chapter', () => {
      const result = parseMarkdownToQuizModule(mdContent);

      result.quizModule?.chapters.forEach((chapter, index) => {
        expect(chapter.questions.length).toBeGreaterThan(0);
      });
    });

    it('should have valid questions with options and correct answers', () => {
      const result = parseMarkdownToQuizModule(mdContent);

      result.quizModule?.chapters.forEach((chapter) => {
        chapter.questions.forEach((question) => {
          expect(question.questionId).toBeTruthy();
          expect(question.questionText).toBeTruthy();
          expect(question.options.length).toBeGreaterThanOrEqual(2);
          expect(question.correctOptionIds.length).toBeGreaterThan(0);
          expect(question.explanationText).toBeTruthy();
        });
      });
    });
  });

  describe('JSON Quiz Validation', () => {
    let jsonContent: unknown;

    beforeAll(() => {
      const jsonPath = path.join(PUBLIC_DIR, 'default-quiz.json');
      const rawContent = fs.readFileSync(jsonPath, 'utf-8');
      jsonContent = JSON.parse(rawContent);
    });

    it('should parse JSON file as valid JSON', () => {
      expect(jsonContent).toBeDefined();
      expect(typeof jsonContent).toBe('object');
    });

    it('should validate JSON quiz structure', () => {
      const result = validateAndCorrectQuizModule(jsonContent);

      expect(result.validationResult.isValid).toBe(true);
      expect(result.normalizedModule).toBeDefined();
    });

    it('should have matching structure between MD and JSON', () => {
      const mdPath = path.join(PUBLIC_DIR, 'default-quiz.md');
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      const mdResult = parseMarkdownToQuizModule(mdContent);

      const jsonResult = validateAndCorrectQuizModule(jsonContent);

      // Both should have the same quiz name
      expect(mdResult.quizModule?.name).toBe(jsonResult.normalizedModule?.name);
    });
  });

  describe('Quiz Content Quality', () => {
    it('should have at least 10 questions total', () => {
      const mdPath = path.join(PUBLIC_DIR, 'default-quiz.md');
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      const result = parseMarkdownToQuizModule(mdContent);

      const totalQuestions =
        result.quizModule?.chapters.reduce((sum, ch) => sum + ch.questions.length, 0) || 0;

      expect(totalQuestions).toBeGreaterThanOrEqual(10);
    });

    it('should not have empty explanation texts', () => {
      const mdPath = path.join(PUBLIC_DIR, 'default-quiz.md');
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      const result = parseMarkdownToQuizModule(mdContent);

      result.quizModule?.chapters.forEach((chapter) => {
        chapter.questions.forEach((question) => {
          expect(question.explanationText.trim()).not.toBe('');
        });
      });
    });

    it('should have valid option IDs that match correct answer references', () => {
      const mdPath = path.join(PUBLIC_DIR, 'default-quiz.md');
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      const result = parseMarkdownToQuizModule(mdContent);

      result.quizModule?.chapters.forEach((chapter) => {
        chapter.questions.forEach((question) => {
          const optionIds = question.options.map((o) => o.optionId);
          question.correctOptionIds.forEach((correctId) => {
            expect(optionIds).toContain(correctId);
          });
        });
      });
    });
  });
});
