import { describe, it, expect } from 'vitest';
import { parseMarkdownToQuizModule } from '@/lib/quiz/parser';

describe('Quiz Parser', () => {
  it('should parse a basic MCQ quiz', () => {
    const markdown = `
# My Quiz
Description: A test quiz
---

## Chapter 1
<!-- ID: ch1 -->
Description: Chapter 1 desc
---

### Q: What is 1+1?
<!-- ID: q1 -->
**Options:**
- **A1:** 1
- **A2:** 2
- **A3:** 3

**Correct:** A2
**Exp:** It is 2.
`;
    const result = parseMarkdownToQuizModule(markdown);
    expect(result.success).toBe(true);
    expect(result.quizModule?.chapters[0].questions[0].questionText).toContain('What is 1+1?');
  });

  it('should parse a True/False quiz', () => {
    const markdown = `
# TF Quiz
---
## Chapter 1
---
### T/F: The sky is blue.
<!-- ID: q_tf -->
**Correct:** True
**Exp:** Yes it is.
`;
    const result = parseMarkdownToQuizModule(markdown);
    expect(result.success).toBe(true);
    expect(result.quizModule?.chapters[0].questions[0].type).toBe('true_false');
    expect(result.quizModule?.chapters[0].questions[0].correctOptionIds[0]).toBe('true');
  });

  it('should handle code blocks in options without breaking', () => {
    const markdown = `
# Code Quiz
---
## Chapter 1
---
### Q: Which code is correct?
<!-- ID: q_code -->
**Options:**
- **A1:** 
\`\`\`javascript
console.log("A");
\`\`\`
- **A2:** \`console.log("B")\`

**Correct:** A1
**Exp:** A is correct.
`;
    const result = parseMarkdownToQuizModule(markdown);
    expect(result.success).toBe(true);
    const options = result.quizModule?.chapters[0].questions[0].options;
    expect(options?.[0].optionText).toContain('console.log("A")');
  });

  it('should handle extra whitespace and newlines gracefully', () => {
    const markdown = `
# Messy Quiz

Description: messy
---


## Chapter 1
<!-- ID: ch1 -->

---

### Q: Question?
<!-- ID: q1 -->

**Options:**

- **A1:** Option 1

- **A2:** Option 2


**Correct:** A1

**Exp:** Explanation
`;
    const result = parseMarkdownToQuizModule(markdown);
    expect(result.success).toBe(true);
    expect(result.quizModule?.chapters[0].questions.length).toBe(1);
  });
});
