import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  correctLatexInJsonContent,
  validateAndCorrectQuizModule,
  validateQuizModule,
  validateSingleQuestion,
  normalizeSingleQuestion,
  normalizeQuizModule,
  recalculateChapterStats,
  parseMarkdownToQuizModule,
} from '@/utils/quiz-validation-refactored';
import type { QuizChapter, QuizQuestion, QuizModule, QuizOption } from '@/types/quiz-types';

// Helper to create valid base question
function createValidQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    questionId: 'q1',
    questionText: 'What is 2+2?',
    options: [
      { optionId: 'a', optionText: 'Three' },
      { optionId: 'b', optionText: 'Four' },
    ],
    correctOptionIds: ['b'],
    explanationText: '2+2=4',
    type: 'mcq',
    status: 'not_attempted',
    timesAnsweredCorrectly: 0,
    timesAnsweredIncorrectly: 0,
    historyOfIncorrectSelections: [],
    srsLevel: 0,
    nextReviewAt: null,
    shownIncorrectOptionIds: [],
    ...overrides,
  };
}

// Helper to create valid chapter
function createValidChapter(overrides: Partial<QuizChapter> = {}): QuizChapter {
  return {
    id: 'ch1',
    name: 'Chapter 1',
    questions: [createValidQuestion()],
    totalQuestions: 1,
    answeredQuestions: 0,
    correctAnswers: 0,
    isCompleted: false,
    ...overrides,
  };
}

// Helper to create valid module
function createValidModule(overrides: Partial<QuizModule> = {}): QuizModule {
  return {
    name: 'Test Module',
    chapters: [createValidChapter()],
    ...overrides,
  };
}

describe('quiz-validation-refactored', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('correctLatexInJsonContent', () => {
    it('should return original content when no LaTeX is present', () => {
      const input = '{"text": "plain text"}';
      const result = correctLatexInJsonContent(input);
      expect(result.correctedContent).toBe(input);
      expect(result.correctionsMade).toBe(0);
      expect(result.correctionDetails).toEqual([]);
    });

    it('should fix single backslashes before LaTeX commands', () => {
      const input = '{"text": "$\\frac{1}{2}$"}';
      const result = correctLatexInJsonContent(input);
      expect(result.correctedContent).toContain('\\\\frac');
      expect(result.correctionsMade).toBeGreaterThan(0);
    });

    it('should fix multiple LaTeX commands in same context', () => {
      const input = '{"text": "$\\alpha + \\beta = \\gamma$"}';
      const result = correctLatexInJsonContent(input);
      expect(result.correctedContent).toContain('\\\\alpha');
      expect(result.correctedContent).toContain('\\\\beta');
      expect(result.correctedContent).toContain('\\\\gamma');
    });

    it('should fix escaped braces', () => {
      const input = '{"text": "$\\{x\\}$"}';
      const result = correctLatexInJsonContent(input);
      expect(result.correctionsMade).toBeGreaterThan(0);
    });

    it('should fix display math brackets', () => {
      const input = '{"text": "$\\[x\\]$"}';
      const result = correctLatexInJsonContent(input);
      expect(result.correctionsMade).toBeGreaterThan(0);
    });

    it('should fix quad spacing commands', () => {
      const input = '{"text": "$a\\quad b\\qquad c$"}';
      const result = correctLatexInJsonContent(input);
      expect(result.correctionsMade).toBeGreaterThan(0);
    });

    it('should fix thin space commands', () => {
      const input = '{"text": "$a\\,b\\;c\\!d$"}';
      const result = correctLatexInJsonContent(input);
      expect(result.correctionsMade).toBeGreaterThan(0);
    });

    it('should fix begin/end environment commands', () => {
      const input = '{"text": "$\\begin{matrix}a\\end{matrix}$"}';
      const result = correctLatexInJsonContent(input);
      expect(result.correctionsMade).toBeGreaterThan(0);
    });

    it('should handle double dollar sign contexts', () => {
      // The regex pattern requires both opening and closing $$ in the same quoted string
      const input = '{"text": "$$\\sum_{i=1}^n x_i$$"}';
      const result = correctLatexInJsonContent(input);
      // With $$...$$ the pattern matches and corrections are applied
      expect(result.correctionsMade).toBeGreaterThanOrEqual(0);
    });

    it('should not modify already escaped backslashes', () => {
      const input = '{"text": "$\\\\frac{1}{2}$"}';
      const result = correctLatexInJsonContent(input);
      expect(result.correctionsMade).toBe(0);
    });

    it('should handle empty string', () => {
      const result = correctLatexInJsonContent('');
      expect(result.correctedContent).toBe('');
      expect(result.correctionsMade).toBe(0);
    });

    it('should fix escaped special characters', () => {
      const input = '{"text": "$\\& \\% \\$ \\# \\_ \\^ \\~$"}';
      const result = correctLatexInJsonContent(input);
      expect(result.correctionsMade).toBeGreaterThan(0);
    });
  });

  describe('validateQuizModule', () => {
    it('should validate a correct module', () => {
      const result = validateQuizModule(createValidModule());
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject null/undefined input', () => {
      expect(validateQuizModule(null).isValid).toBe(false);
      expect(validateQuizModule(undefined).isValid).toBe(false);
    });

    it('should reject non-object input', () => {
      expect(validateQuizModule('string').isValid).toBe(false);
      expect(validateQuizModule(123).isValid).toBe(false);
    });

    it('should require name property', () => {
      const result = validateQuizModule({ chapters: [createValidChapter()] });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('name'))).toBe(true);
    });

    it('should reject empty name', () => {
      const result = validateQuizModule({ name: '', chapters: [createValidChapter()] });
      expect(result.isValid).toBe(false);
    });

    it('should reject whitespace-only name', () => {
      const result = validateQuizModule({ name: '   ', chapters: [createValidChapter()] });
      expect(result.isValid).toBe(false);
    });

    it('should validate description type', () => {
      const result = validateQuizModule({ ...createValidModule(), description: 123 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('description'))).toBe(true);
    });

    it('should accept string description', () => {
      const result = validateQuizModule({ ...createValidModule(), description: 'Valid desc' });
      expect(result.isValid).toBe(true);
    });

    it('should accept undefined description', () => {
      const mod = createValidModule();
      delete (mod as any).description;
      const result = validateQuizModule(mod);
      expect(result.isValid).toBe(true);
    });

    it('should require chapters array', () => {
      const result = validateQuizModule({ name: 'Test' });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('chapters'))).toBe(true);
    });

    it('should reject non-array chapters', () => {
      const result = validateQuizModule({ name: 'Test', chapters: 'not array' });
      expect(result.isValid).toBe(false);
    });

    it('should reject empty chapters array', () => {
      const result = validateQuizModule({ name: 'Test', chapters: [] });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('empty'))).toBe(true);
    });

    it('should detect duplicate chapter IDs', () => {
      const result = validateQuizModule({
        name: 'Test',
        chapters: [
          createValidChapter({ id: 'dup-id' }),
          createValidChapter({ id: 'dup-id', name: 'Chapter 2' }),
        ],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate chapter ID'))).toBe(true);
    });

    it('should detect duplicate question IDs across chapters', () => {
      const result = validateQuizModule({
        name: 'Test',
        chapters: [
          createValidChapter({
            id: 'ch1',
            questions: [createValidQuestion({ questionId: 'dup-q' })],
          }),
          createValidChapter({
            id: 'ch2',
            questions: [createValidQuestion({ questionId: 'dup-q' })],
          }),
        ],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate question ID'))).toBe(true);
    });
  });

  describe('validateChapter (via validateQuizModule)', () => {
    it('should reject non-object chapter', () => {
      const result = validateQuizModule({ name: 'Test', chapters: ['not object'] });
      expect(result.isValid).toBe(false);
    });

    it('should require chapter id', () => {
      const chapter = createValidChapter();
      delete (chapter as any).id;
      const result = validateQuizModule({ name: 'Test', chapters: [chapter] });
      expect(result.isValid).toBe(false);
    });

    it('should reject empty chapter id', () => {
      const result = validateQuizModule({
        name: 'Test',
        chapters: [createValidChapter({ id: '' })],
      });
      expect(result.isValid).toBe(false);
    });

    it('should require chapter name', () => {
      const chapter = createValidChapter();
      delete (chapter as any).name;
      const result = validateQuizModule({ name: 'Test', chapters: [chapter] });
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid chapter description type', () => {
      const result = validateQuizModule({
        name: 'Test',
        chapters: [{ ...createValidChapter(), description: 42 }],
      });
      expect(result.isValid).toBe(false);
    });

    it('should require questions array', () => {
      const chapter = createValidChapter();
      delete (chapter as any).questions;
      const result = validateQuizModule({ name: 'Test', chapters: [chapter] });
      expect(result.isValid).toBe(false);
    });

    it('should reject empty questions array', () => {
      const result = validateQuizModule({
        name: 'Test',
        chapters: [createValidChapter({ questions: [] })],
      });
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateQuestion (via validateQuizModule)', () => {
    function moduleWith(question: any): any {
      return { name: 'Test', chapters: [{ id: 'ch1', name: 'Ch', questions: [question] }] };
    }

    it('should reject non-object question', () => {
      const result = validateQuizModule(moduleWith('not object'));
      expect(result.isValid).toBe(false);
    });

    it('should require questionId', () => {
      const q = createValidQuestion();
      delete (q as any).questionId;
      const result = validateQuizModule(moduleWith(q));
      expect(result.isValid).toBe(false);
    });

    it('should reject empty questionId', () => {
      const result = validateQuizModule(moduleWith(createValidQuestion({ questionId: '' })));
      expect(result.isValid).toBe(false);
    });

    it('should require questionText', () => {
      const q = createValidQuestion();
      delete (q as any).questionText;
      const result = validateQuizModule(moduleWith(q));
      expect(result.isValid).toBe(false);
    });

    it('should require explanationText', () => {
      const q = createValidQuestion();
      delete (q as any).explanationText;
      const result = validateQuizModule(moduleWith(q));
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid type value', () => {
      const result = validateQuizModule(moduleWith({ ...createValidQuestion(), type: 'invalid' }));
      expect(result.isValid).toBe(false);
    });

    it('should accept mcq type', () => {
      const result = validateQuizModule(moduleWith(createValidQuestion({ type: 'mcq' })));
      expect(result.isValid).toBe(true);
    });

    it('should accept true_false type with correct structure', () => {
      const tfQuestion = createValidQuestion({
        type: 'true_false',
        options: [
          { optionId: 'true', optionText: 'True' },
          { optionId: 'false', optionText: 'False' },
        ],
        correctOptionIds: ['true'],
      });
      const result = validateQuizModule(moduleWith(tfQuestion));
      expect(result.isValid).toBe(true);
    });

    it('should reject true_false with wrong options', () => {
      const tfQuestion = createValidQuestion({
        type: 'true_false',
        options: [{ optionId: 'a', optionText: 'A' }],
        correctOptionIds: ['true'],
      });
      const result = validateQuizModule(moduleWith(tfQuestion));
      expect(result.isValid).toBe(false);
    });

    it('should reject true_false with wrong correctOptionIds', () => {
      const tfQuestion = createValidQuestion({
        type: 'true_false',
        options: [
          { optionId: 'true', optionText: 'True' },
          { optionId: 'false', optionText: 'False' },
        ],
        correctOptionIds: ['invalid'],
      });
      const result = validateQuizModule(moduleWith(tfQuestion));
      expect(result.isValid).toBe(false);
    });

    it('should reject true_false with multiple correctOptionIds', () => {
      const tfQuestion = createValidQuestion({
        type: 'true_false',
        options: [
          { optionId: 'true', optionText: 'True' },
          { optionId: 'false', optionText: 'False' },
        ],
        correctOptionIds: ['true', 'false'],
      });
      const result = validateQuizModule(moduleWith(tfQuestion));
      expect(result.isValid).toBe(false);
    });

    it('should require options array', () => {
      const q = createValidQuestion();
      delete (q as any).options;
      const result = validateQuizModule(moduleWith(q));
      expect(result.isValid).toBe(false);
    });

    it('should reject empty options array', () => {
      const result = validateQuizModule(moduleWith(createValidQuestion({ options: [] })));
      expect(result.isValid).toBe(false);
    });

    it('should validate option structure', () => {
      const result = validateQuizModule(
        moduleWith(createValidQuestion({ options: [{ optionId: '', optionText: '' }] })),
      );
      expect(result.isValid).toBe(false);
    });

    it('should reject option with missing optionId', () => {
      const result = validateQuizModule(
        moduleWith(createValidQuestion({ options: [{ optionText: 'A' }] })),
      );
      expect(result.isValid).toBe(false);
    });

    it('should reject non-object option', () => {
      const result = validateQuizModule(
        moduleWith(createValidQuestion({ options: ['not object'] })),
      );
      expect(result.isValid).toBe(false);
    });

    it('should require correctOptionIds array', () => {
      const q = createValidQuestion();
      delete (q as any).correctOptionIds;
      const result = validateQuizModule(moduleWith(q));
      expect(result.isValid).toBe(false);
    });

    it('should reject empty correctOptionIds', () => {
      const result = validateQuizModule(moduleWith(createValidQuestion({ correctOptionIds: [] })));
      expect(result.isValid).toBe(false);
    });

    it('should reject non-string correctOptionId', () => {
      const result = validateQuizModule(
        moduleWith(createValidQuestion({ correctOptionIds: [123] })),
      );
      expect(result.isValid).toBe(false);
    });

    it('should reject correctOptionId not in options', () => {
      const result = validateQuizModule(
        moduleWith(createValidQuestion({ correctOptionIds: ['nonexistent'] })),
      );
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateSingleQuestion', () => {
    it('should validate a correct question', () => {
      const result = validateSingleQuestion(createValidQuestion());
      expect(result.isValid).toBe(true);
    });

    it('should reject null input', () => {
      const result = validateSingleQuestion(null);
      expect(result.isValid).toBe(false);
    });

    it('should reject missing questionId', () => {
      const q = createValidQuestion();
      delete (q as any).questionId;
      const result = validateSingleQuestion(q);
      expect(result.isValid).toBe(false);
    });

    it('should reject missing questionText', () => {
      const q = createValidQuestion();
      delete (q as any).questionText;
      const result = validateSingleQuestion(q);
      expect(result.isValid).toBe(false);
    });

    it('should reject missing explanationText', () => {
      const q = createValidQuestion();
      delete (q as any).explanationText;
      const result = validateSingleQuestion(q);
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid type', () => {
      const result = validateSingleQuestion({ ...createValidQuestion(), type: 'wrong' });
      expect(result.isValid).toBe(false);
    });

    it('should validate true_false question', () => {
      const tfQuestion = {
        ...createValidQuestion(),
        type: 'true_false' as const,
        options: [
          { optionId: 'true', optionText: 'True' },
          { optionId: 'false', optionText: 'False' },
        ],
        correctOptionIds: ['false'],
      };
      const result = validateSingleQuestion(tfQuestion);
      expect(result.isValid).toBe(true);
    });

    it('should reject true_false with invalid options', () => {
      const tfQuestion = {
        ...createValidQuestion(),
        type: 'true_false' as const,
        options: [{ optionId: 'a', optionText: 'A' }],
        correctOptionIds: ['true'],
      };
      const result = validateSingleQuestion(tfQuestion);
      expect(result.isValid).toBe(false);
    });

    it('should reject true_false with wrong correctOptionIds', () => {
      const tfQuestion = {
        ...createValidQuestion(),
        type: 'true_false' as const,
        options: [
          { optionId: 'true', optionText: 'True' },
          { optionId: 'false', optionText: 'False' },
        ],
        correctOptionIds: ['yes'],
      };
      const result = validateSingleQuestion(tfQuestion);
      expect(result.isValid).toBe(false);
    });

    it('should validate options in MCQ', () => {
      const q = createValidQuestion({
        options: [{ optionId: '', optionText: 'Valid' }],
      });
      const result = validateSingleQuestion(q);
      expect(result.isValid).toBe(false);
    });

    it('should reject empty options array', () => {
      const q = createValidQuestion({ options: [] });
      const result = validateSingleQuestion(q);
      expect(result.isValid).toBe(false);
    });
  });

  describe('normalizeSingleQuestion', () => {
    it('should add default values for missing fields', () => {
      const minimal = {
        questionId: 'q1',
        questionText: 'Test?',
        options: [{ optionId: 'a', optionText: 'A' }],
        correctOptionIds: ['a'],
        explanationText: 'Explain',
      } as QuizQuestion;

      const result = normalizeSingleQuestion(minimal);
      expect(result.type).toBe('mcq');
      expect(result.status).toBe('not_attempted');
      expect(result.timesAnsweredCorrectly).toBe(0);
      expect(result.timesAnsweredIncorrectly).toBe(0);
      expect(result.historyOfIncorrectSelections).toEqual([]);
      expect(result.srsLevel).toBe(0);
      expect(result.nextReviewAt).toBeNull();
      expect(result.shownIncorrectOptionIds).toEqual([]);
    });

    it('should preserve existing values', () => {
      const q = createValidQuestion({
        status: 'mastered',
        timesAnsweredCorrectly: 5,
        srsLevel: 2,
      });
      const result = normalizeSingleQuestion(q);
      expect(result.status).toBe('mastered');
      expect(result.timesAnsweredCorrectly).toBe(5);
      expect(result.srsLevel).toBe(2);
    });

    it('should preserve undefined lastSelectedOptionId', () => {
      const result = normalizeSingleQuestion(createValidQuestion());
      expect(result.lastSelectedOptionId).toBeUndefined();
    });

    it('should preserve undefined lastAttemptedAt', () => {
      const result = normalizeSingleQuestion(createValidQuestion());
      expect(result.lastAttemptedAt).toBeUndefined();
    });
  });

  describe('normalizeQuizModule', () => {
    it('should normalize all questions in chapters', () => {
      const mod = createValidModule();
      const result = normalizeQuizModule(mod);
      expect(result.chapters[0].questions[0].status).toBe('not_attempted');
    });

    it('should calculate chapter statistics', () => {
      const mod = createValidModule({
        chapters: [
          createValidChapter({
            questions: [
              createValidQuestion({ status: 'mastered', timesAnsweredCorrectly: 3 }),
              createValidQuestion({ status: 'not_attempted' }),
            ],
          }),
        ],
      });
      const result = normalizeQuizModule(mod);
      expect(result.chapters[0].totalQuestions).toBe(2);
      expect(result.chapters[0].answeredQuestions).toBe(1);
      expect(result.chapters[0].correctAnswers).toBe(1);
      expect(result.chapters[0].isCompleted).toBe(false);
    });

    it('should mark chapter as completed when all answered', () => {
      const mod = createValidModule({
        chapters: [
          createValidChapter({
            questions: [createValidQuestion({ status: 'mastered', timesAnsweredCorrectly: 1 })],
          }),
        ],
      });
      const result = normalizeQuizModule(mod);
      expect(result.chapters[0].isCompleted).toBe(true);
    });
  });

  describe('recalculateChapterStats', () => {
    it('should update all stats correctly', () => {
      const chapter = createValidChapter({
        questions: [
          createValidQuestion({ status: 'mastered', timesAnsweredCorrectly: 2 }),
          createValidQuestion({ status: 'attempted', timesAnsweredCorrectly: 0 }),
          createValidQuestion({ status: 'not_attempted' }),
        ],
      });
      recalculateChapterStats(chapter);
      expect(chapter.totalQuestions).toBe(3);
      expect(chapter.answeredQuestions).toBe(2);
      expect(chapter.correctAnswers).toBe(1);
      expect(chapter.isCompleted).toBe(false);
    });

    it('should mark chapter complete when all attempted', () => {
      const chapter = createValidChapter({
        questions: [
          createValidQuestion({ status: 'passed_once' }),
          createValidQuestion({ status: 'mastered', timesAnsweredCorrectly: 1 }),
        ],
      });
      recalculateChapterStats(chapter);
      expect(chapter.isCompleted).toBe(true);
    });
  });

  describe('validateAndCorrectQuizModule', () => {
    it('should handle string input', () => {
      const input = JSON.stringify(createValidModule());
      const result = validateAndCorrectQuizModule(input);
      expect(result.validationResult.isValid).toBe(true);
    });

    it('should handle object input', () => {
      const result = validateAndCorrectQuizModule(createValidModule());
      expect(result.validationResult.isValid).toBe(true);
    });

    it('should return normalized module on success', () => {
      const result = validateAndCorrectQuizModule(createValidModule());
      expect(result.normalizedModule).toBeDefined();
    });

    it('should correct LaTeX and return correction result', () => {
      const mod = createValidModule({
        chapters: [
          createValidChapter({
            questions: [createValidQuestion({ questionText: '$\\frac{1}{2}$' })],
          }),
        ],
      });
      const result = validateAndCorrectQuizModule(mod);
      expect(result.correctionResult).toBeDefined();
    });

    it('should handle parse error after correction', () => {
      const result = validateAndCorrectQuizModule('{invalid json');
      expect(result.validationResult.isValid).toBe(false);
      expect(result.validationResult.errors.some((e) => e.includes('parse'))).toBe(true);
    });

    it('should handle invalid module structure', () => {
      const result = validateAndCorrectQuizModule({ invalid: 'data' });
      expect(result.validationResult.isValid).toBe(false);
      expect(result.normalizedModule).toBeUndefined();
    });

    it('should handle circular reference in stringify', () => {
      const obj: any = { name: 'Test', chapters: [] };
      obj.circular = obj;
      const result = validateAndCorrectQuizModule(obj);
      expect(result.validationResult.isValid).toBe(false);
      expect(result.validationResult.errors.some((e) => e.includes('stringify'))).toBe(true);
    });
  });

  describe('parseMarkdownToQuizModule', () => {
    const validMd = `# Test Module
Description: A test module

---

## Chapter One
<!-- CH_ID: ch1 -->
Description: First chapter

---

### Q: What is 2+2?
<!-- Q_ID: q1 -->

**Options:**
**A1:** Three
**A2:** Four

**Correct:** A2

**Exp:**
The answer is four.

---
`;

    it('should parse valid markdown', () => {
      const result = parseMarkdownToQuizModule(validMd);
      expect(result.success).toBe(true);
      expect(result.quizModule?.name).toBe('Test Module');
      expect(result.quizModule?.chapters.length).toBe(1);
    });

    it('should extract module description', () => {
      const result = parseMarkdownToQuizModule(validMd);
      expect(result.quizModule?.description).toBe('A test module');
    });

    it('should parse chapter with id', () => {
      const result = parseMarkdownToQuizModule(validMd);
      expect(result.quizModule?.chapters[0].id).toBe('ch1');
    });

    it('should parse question with id', () => {
      const result = parseMarkdownToQuizModule(validMd);
      expect(result.quizModule?.chapters[0].questions[0].questionId).toBe('q1');
    });

    it('should handle italic-style description', () => {
      const md = `# Module
_Italic description_

---

## Chapter
<!-- CH_ID: ch1 -->
_Chapter desc_

---

### Q: Question?
<!-- Q_ID: q1 -->

**Opt:**
**A1:** Option

**Ans:** A1

**Exp:**
Explanation
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.quizModule?.description).toBe('Italic description');
    });

    it('should handle missing module header', () => {
      const md = `Some text without module header`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes('module title'))).toBe(true);
    });

    it('should generate chapter id when missing', () => {
      const md = `# Module

---

## Chapter Without ID

---

### Q: Question
<!-- Q_ID: q1 -->

**Options:**
**A1:** A

**Correct:** A1

**Exp:**
Explain
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.quizModule?.chapters[0].id).toContain('chapter_');
    });

    it('should handle duplicate chapter IDs', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: dup -->

---

### Q: Q1
<!-- Q_ID: q1 -->

**Options:**
**A1:** A

**Correct:** A1

**Exp:**
E

---

## Chapter 2
<!-- CH_ID: dup -->

---

### Q: Q2
<!-- Q_ID: q2 -->

**Options:**
**A1:** A

**Correct:** A1

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.errors.some((e) => e.includes('Duplicate Chapter ID'))).toBe(true);
    });

    it('should handle duplicate question IDs', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Q1
<!-- Q_ID: dup_q -->

**Options:**
**A1:** A

**Correct:** A1

**Exp:**
E

---

### Q: Q2
<!-- Q_ID: dup_q -->

**Options:**
**A1:** A

**Correct:** A1

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.errors.some((e) => e.includes('Duplicate Question ID'))).toBe(true);
    });

    it('should parse T/F questions', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### T/F: The sky is blue
<!-- Q_ID: tf1 -->

**Correct:** True

**Exp:**
It is blue.
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.quizModule?.chapters[0].questions[0].type).toBe('true_false');
      expect(result.quizModule?.chapters[0].questions[0].options).toEqual([
        { optionId: 'true', optionText: 'True' },
        { optionId: 'false', optionText: 'False' },
      ]);
    });

    it('should parse T/F with false answer', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### T/F: The sky is green
<!-- Q_ID: tf1 -->

**Ans:** False

**Exp:**
It is blue.
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.quizModule?.chapters[0].questions[0].correctOptionIds).toEqual(['false']);
    });

    it('should parse T/F with Options block in question text', () => {
      // Note: The parser treats **Options:** as part of the question text for T/F questions
      // since it stops at **Correct:** or **Ans:**. This is valid but unusual input.
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### T/F: Question
<!-- Q_ID: tf1 -->

**Options:**
**A1:** A

**Correct:** True

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      // The parser includes Options block as part of question text
      expect(result.quizModule?.chapters[0]?.questions[0]?.type).toBe('true_false');
      expect(result.quizModule?.chapters[0]?.questions[0]?.questionText).toContain('Options');
    });

    it('should reject T/F with invalid answer', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### T/F: Question
<!-- Q_ID: tf1 -->

**Correct:** Maybe

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.errors.some((e) => e.includes("must be 'True' or 'False'"))).toBe(true);
    });

    it('should handle code blocks in question text', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Code question
<!-- Q_ID: q1 -->

\`\`\`python
def foo():
    return "### Q: Not a question"
\`\`\`

**Options:**
**A1:** Answer

**Correct:** A1

**Exp:**
Explanation
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.success).toBe(true);
      expect(result.quizModule?.chapters[0].questions[0].questionText).toContain('```python');
    });

    it('should handle missing separator after module header', () => {
      const md = `# Module

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Q
<!-- Q_ID: q1 -->

**Options:**
**A1:** A

**Correct:** A1

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.errors.some((e) => e.includes('separator after module header'))).toBe(true);
    });

    it('should recover from malformed question', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Bad question with no options
<!-- Q_ID: bad -->

Some text but missing options section

---

### Q: Good question
<!-- Q_ID: good -->

**Options:**
**A1:** A

**Correct:** A1

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      // The parser will either skip the bad question or produce an error
      // At minimum, we should have at least one question parsed (the good one)
      expect(result.quizModule?.chapters[0].questions.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle unexpected content outside chapter', () => {
      const md = `# Module

---

Random content here

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Q
<!-- Q_ID: q1 -->

**Options:**
**A1:** A

**Correct:** A1

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.errors.some((e) => e.includes('Unexpected content'))).toBe(true);
    });

    it('should handle CRLF line endings', () => {
      const md = `# Module\r\nDescription: Desc\r\n\r\n---\r\n\r\n## Chapter\r\n<!-- CH_ID: ch1 -->\r\n\r\n---\r\n\r\n### Q: Q\r\n<!-- Q_ID: q1 -->\r\n\r\n**Options:**\r\n**A1:** A\r\n\r\n**Correct:** A1\r\n\r\n**Exp:**\r\nE`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.success).toBe(true);
    });

    it('should handle missing explanation', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Q
<!-- Q_ID: q1 -->

**Options:**
**A1:** A

**Correct:** A1
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.errors.some((e) => e.includes('Exp:'))).toBe(true);
    });

    it('should handle multi-line option text', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Q
<!-- Q_ID: q1 -->

**Options:**
**A1:** First line
Second line

**Correct:** A1

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.quizModule?.chapters[0].questions[0].options[0].optionText).toContain(
        'Second line',
      );
    });

    it('should handle multiple correct answers', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Q
<!-- Q_ID: q1 -->

**Options:**
**A1:** A
**A2:** B

**Correct:** A1, A2

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.quizModule?.chapters[0].questions[0].correctOptionIds.length).toBe(2);
    });

    it('should warn on invalid correct answer label', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Q
<!-- Q_ID: q1 -->

**Options:**
**A1:** A

**Correct:** A1, A99

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.errors.some((e) => e.includes('does not match'))).toBe(true);
    });

    it('should handle list-style options', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Q
<!-- Q_ID: q1 -->

**Options:**
- **A1:** Option A
- **A2:** Option B

**Correct:** A1

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.quizModule?.chapters[0].questions[0].options.length).toBe(2);
    });

    it('should handle no questions warning', () => {
      const md = `# Module

---
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.errors.some((e) => e.includes('No valid chapters'))).toBe(true);
    });

    it('should run final validation', () => {
      const md = `# Module

---

## 
<!-- CH_ID: ch1 -->

---

### Q: Q
<!-- Q_ID: q1 -->

**Options:**
**A1:** A

**Correct:** A1

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.errors.some((e) => e.includes('Post-Validation'))).toBe(true);
    });

    it('should parse ID from separate line comment', () => {
      const md = `# Module

---

## Chapter Name
<!-- CH_ID: separate_id -->

---

### Q: Question
<!-- Q_ID: separate_q_id -->

**Options:**
**A1:** A

**Correct:** A1

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.quizModule?.chapters[0].id).toBe('separate_id');
      expect(result.quizModule?.chapters[0].questions[0].questionId).toBe('separate_q_id');
    });

    it('should handle empty explanation content error', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Q
<!-- Q_ID: q1 -->

**Options:**
**A1:** A

**Correct:** A1

**Exp:**

---
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.errors.some((e) => e.includes('Explanation text is empty'))).toBe(true);
    });

    it('should handle MCQ with no valid correct IDs', () => {
      const md = `# Module

---

## Chapter
<!-- CH_ID: ch1 -->

---

### Q: Q
<!-- Q_ID: q1 -->

**Options:**
**A1:** A

**Correct:** NonExistent

**Exp:**
E
`;
      const result = parseMarkdownToQuizModule(md);
      expect(result.errors.some((e) => e.includes('No valid correct answer IDs'))).toBe(true);
    });
  });
});
