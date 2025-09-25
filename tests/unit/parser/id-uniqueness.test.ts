import { describe, it, expect } from 'vitest';
import { parseMarkdownToQuizModule } from '@/utils/quiz-validation';

describe.skip('Global ID Uniqueness Validation', () => {
  it('should detect duplicate chapter IDs across the entire module', () => {
    const markdown = `# Test Module
## Chapter 1: First Chapter <!-- ID:duplicate_id -->
### Q: Question 1
What is 2+2?
**Options:**
- A) 3
- B) 4
**Correct:** B
**Exp:** 2+2=4

## Chapter 2: Second Chapter <!-- ID:duplicate_id -->
### Q: Question 2
What is 3+3?
**Options:**
- A) 5
- B) 6
**Correct:** B
**Exp:** 3+3=6`;

    const result = parseMarkdownToQuizModule(markdown);

    // Should still parse but with warnings
    expect(result.success).toBe(true);
    expect(result.errors.some((e) => e.includes('Duplicate Chapter ID'))).toBe(true);

    // Both chapters should exist but with warnings
    expect(result.quizModule?.chapters).toHaveLength(2);
  });

  it('should detect duplicate question IDs across all chapters', () => {
    const markdown = `# Test Module
## Chapter 1: First Chapter
### Q: Question 1 <!-- ID:duplicate_q -->
What is 2+2?
**Options:**
- A) 3
- B) 4
**Correct:** B
**Exp:** 2+2=4

## Chapter 2: Second Chapter
### Q: Question 2 <!-- ID:duplicate_q -->
What is 3+3?
**Options:**
- A) 5
- B) 6
**Correct:** B
**Exp:** 3+3=6`;

    const result = parseMarkdownToQuizModule(markdown);

    // Should still parse but with warnings
    expect(result.success).toBe(true);
    expect(result.errors.some((e) => e.includes('Duplicate Question ID'))).toBe(true);

    // Both questions should exist but with warnings
    const allQuestions = result.quizModule?.chapters.flatMap((c) => c.questions) || [];
    expect(allQuestions).toHaveLength(2);
  });

  it('should generate unique IDs when duplicates are detected', () => {
    const markdown = `# Test Module
## Chapter 1: First Chapter
### Q: Question 1 <!-- ID:duplicate_id -->
What is 2+2?
**Options:**
- A) 3
- B) 4
**Correct:** B
**Exp:** 2+2=4

## Chapter 2: Second Chapter
### Q: Question 2 <!-- ID:duplicate_id -->
What is 3+3?
**Options:**
- A) 5
- B) 6
**Correct:** B
**Exp:** 3+3=6`;

    const result = parseMarkdownToQuizModule(markdown);

    expect(result.success).toBe(true);

    // All question IDs should be unique
    const allQuestionIds =
      result.quizModule?.chapters.flatMap((c) => c.questions).map((q) => q.questionId) || [];
    const uniqueQuestionIds = new Set(allQuestionIds);
    expect(uniqueQuestionIds.size).toBe(allQuestionIds.length);

    // All chapter IDs should be unique
    const allChapterIds = result.quizModule?.chapters.map((c) => c.id) || [];
    const uniqueChapterIds = new Set(allChapterIds);
    expect(uniqueChapterIds.size).toBe(allChapterIds.length);
  });

  it('should validate option ID uniqueness within each question', () => {
    const markdown = `# Test Module
## Chapter 1: Test Chapter
### Q: Question with duplicate option IDs
What is 2+2?
**Options:**
- A) 3
- B) 4
- C) 5
- A) 6
**Correct:** B
**Exp:** 2+2=4`;

    const result = parseMarkdownToQuizModule(markdown);

    expect(result.success).toBe(true);

    const question = result.quizModule?.chapters[0].questions[0];
    expect(question).toBeDefined();

    // Option IDs should be unique within the question
    const optionIds = question?.options.map((o) => o.optionId) || [];
    const uniqueOptionIds = new Set(optionIds);
    expect(uniqueOptionIds.size).toBe(optionIds.length);
  });

  it('should handle mixed ID scenarios (some explicit, some generated)', () => {
    const markdown = `# Test Module
## Chapter 1: First Chapter <!-- ID:explicit_ch1 -->
### Q: Question with explicit ID <!-- ID:explicit_q1 -->
What is 2+2?
**Options:**
- A) 3
- B) 4
**Correct:** B
**Exp:** 2+2=4

### Q: Question without ID
What is 3+3?
**Options:**
- A) 5
- B) 6
**Correct:** B
**Exp:** 3+3=6

## Chapter 2: Second Chapter
### Q: Another question without ID
What is 4+4?
**Options:**
- A) 7
- B) 8
**Correct:** B
**Exp:** 4+4=8`;

    const result = parseMarkdownToQuizModule(markdown);

    expect(result.success).toBe(true);
    expect(result.quizModule?.chapters).toHaveLength(2);

    // First chapter should have explicit ID
    expect(result.quizModule?.chapters[0].id).toBe('explicit_ch1');

    // First question should have explicit ID
    expect(result.quizModule?.chapters[0].questions[0].questionId).toBe('explicit_q1');

    // Other questions should have generated IDs
    const allQuestionIds =
      result.quizModule?.chapters.flatMap((c) => c.questions).map((q) => q.questionId) || [];
    const uniqueQuestionIds = new Set(allQuestionIds);
    expect(uniqueQuestionIds.size).toBe(allQuestionIds.length);
  });
});
