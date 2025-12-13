import { describe, it, expect } from 'vitest';
import { parseMarkdownToQuizModule } from '@/lib/quiz/parser';
import { sanitizeForId, resolveDuplicateId } from '@/utils/quiz-validation-refactored';

describe('ID Generation Determinism', () => {
  describe('sanitizeForId', () => {
    it('should produce same output for same input', () => {
      const input = 'Chapter 1: Introduction to Algorithms!';
      expect(sanitizeForId(input)).toBe(sanitizeForId(input));
      expect(sanitizeForId(input)).toBe('chapter_1_introduction_to_alg');
    });

    it('should handle edge cases consistently', () => {
      expect(sanitizeForId('')).toBe('');
      expect(sanitizeForId('   ')).toBe('');
      expect(sanitizeForId('ABC123')).toBe('abc123');
    });
  });

  describe('resolveDuplicateId', () => {
    it('should produce same sequence for same inputs', () => {
      const seen1 = new Set<string>();
      const seen2 = new Set<string>();

      const id1a = resolveDuplicateId('chapter_1', seen1);
      const id1b = resolveDuplicateId('chapter_1', seen1);
      const id1c = resolveDuplicateId('chapter_1', seen1);

      const id2a = resolveDuplicateId('chapter_1', seen2);
      const id2b = resolveDuplicateId('chapter_1', seen2);
      const id2c = resolveDuplicateId('chapter_1', seen2);

      expect(id1a).toBe(id2a);
      expect(id1b).toBe(id2b);
      expect(id1c).toBe(id2c);
    });
  });

  describe('parseMarkdownToQuizModule', () => {
    it('should produce identical IDs for same markdown', () => {
      const markdown = `# Test Quiz

## Chapter 1

### Q: What is 2+2?

**Options:**
- **A1:** 3
- **A2:** 4

**Correct:** A2
**Exp:** Basic math.
`;

      const result1 = parseMarkdownToQuizModule(markdown);
      const result2 = parseMarkdownToQuizModule(markdown);

      // Both parses should succeed
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // IDs should be identical
      expect(result1.quizModule?.chapters[0]?.id).toBe(result2.quizModule?.chapters[0]?.id);
      expect(result1.quizModule?.chapters[0]?.questions[0]?.questionId).toBe(
        result2.quizModule?.chapters[0]?.questions[0]?.questionId,
      );
    });
  });
});
