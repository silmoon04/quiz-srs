import { describe, it, expect } from "vitest";
import { parseMarkdownToQuizModule } from "@/utils/quiz-validation";
import { readFileSync } from "fs";
import { join } from "path";

// Test fixtures
const fixturesDir = join(process.cwd(), "tests", "fixtures");

const loadFixture = (filename: string): string => {
  return readFileSync(join(fixturesDir, filename), "utf-8");
};

describe("Markdown Parser Tests (TM-PR-01..06)", () => {
  describe("TM-PR-01: Basic MCQ Parsing", () => {
    it("should parse basic MCQ format correctly", () => {
      const markdown = loadFixture("md-mcq-basic.md");
      const result = parseMarkdownToQuizModule(markdown);

      expect(result.success).toBe(true);
      expect(result.quizModule).toBeDefined();
      expect(result.quizModule?.name).toBe("Basic Mathematics Quiz");
      expect(result.quizModule?.chapters).toHaveLength(2);

      // Check first chapter
      const chapter1 = result.quizModule?.chapters[0];
      expect(chapter1?.name).toBe("Chapter 1: Arithmetic Fundamentals");
      expect(chapter1?.questions).toHaveLength(3);

      // Check first question
      const question1 = chapter1?.questions[0];
      expect(question1?.questionText).toContain("What is 2 + 2?");
      expect(question1?.options).toHaveLength(4);
      expect(question1?.correctOptionIds).toHaveLength(1);
      expect(question1?.type).toBe("mcq");
    });

    it("should handle questions without explicit IDs by generating them", () => {
      const markdown = loadFixture("md-missing-ids.md");
      const result = parseMarkdownToQuizModule(markdown);

      expect(result.success).toBe(true);
      expect(result.quizModule).toBeDefined();

      // All questions should have generated IDs
      const allQuestions =
        result.quizModule?.chapters.flatMap((c) => c.questions) || [];
      allQuestions.forEach((question) => {
        expect(question.questionId).toBeDefined();
        expect(question.questionId.length).toBeGreaterThan(0);
      });
    });
  });

  describe("TM-PR-02: True/False Question Parsing", () => {
    it("should parse true/false questions correctly", () => {
      const markdown = loadFixture("md-tf.md");
      const result = parseMarkdownToQuizModule(markdown);

      expect(result.success).toBe(true);
      expect(result.quizModule).toBeDefined();

      const allQuestions =
        result.quizModule?.chapters.flatMap((c) => c.questions) || [];
      allQuestions.forEach((question) => {
        expect(question.type).toBe("true_false");
        expect(question.options).toHaveLength(2);
        expect(question.options[0].optionId).toBe("true");
        expect(question.options[0].optionText).toBe("True");
        expect(question.options[1].optionId).toBe("false");
        expect(question.options[1].optionText).toBe("False");
        expect(question.correctOptionIds).toHaveLength(1);
        expect(["true", "false"]).toContain(question.correctOptionIds[0]);
      });
    });

    it("should reject T/F questions with Options block", () => {
      const markdown = `# Test Module
## Chapter 1
### T/F: Test question
**Options:**
- A) True
- B) False
**Correct:** True
**Exp:** Test explanation`;

      const result = parseMarkdownToQuizModule(markdown);
      expect(result.success).toBe(false);
      expect(
        result.errors.some((e) =>
          e.includes("T/F questions cannot have an 'Options:'"),
        ),
      ).toBe(true);
    });
  });

  describe("TM-PR-03: ID Uniqueness Validation", () => {
    it("should detect and report duplicate question IDs", () => {
      const markdown = loadFixture("md-duplicate-ids.md");
      const result = parseMarkdownToQuizModule(markdown);

      // Should still parse but with warnings
      expect(result.success).toBe(true);
      expect(
        result.errors.some((e) => e.includes("Duplicate Question ID")),
      ).toBe(true);
    });

    it("should generate unique IDs when duplicates are detected", () => {
      const markdown = loadFixture("md-duplicate-ids.md");
      const result = parseMarkdownToQuizModule(markdown);

      expect(result.success).toBe(true);
      const allQuestionIds =
        result.quizModule?.chapters
          .flatMap((c) => c.questions)
          .map((q) => q.questionId) || [];
      const uniqueIds = new Set(allQuestionIds);
      expect(uniqueIds.size).toBe(allQuestionIds.length);
    });
  });

  describe("TM-PR-04: Error Recovery and Robustness", () => {
    it("should recover from malformed questions and continue parsing", () => {
      const markdown = `# Test Module
## Chapter 1
### Q: Valid question
**Options:**
- A) Option 1
- B) Option 2
**Correct:** A
**Exp:** Valid explanation

### Q: Malformed question
**Options:**
- Missing correct answer
**Exp:** This should be skipped

### Q: Another valid question
**Options:**
- A) Option 1
- B) Option 2
**Correct:** A
**Exp:** Another valid explanation`;

      const result = parseMarkdownToQuizModule(markdown);
      expect(result.success).toBe(true);
      expect(result.quizModule?.chapters[0].questions).toHaveLength(2); // Should skip malformed question
    });

    it("should handle code blocks in question text correctly", () => {
      const markdown = `# Test Module
## Chapter 1
### Q: Code question
Here's some code:
\`\`\`javascript
function test() {
  return "hello";
}
\`\`\`
What does this return?

**Options:**
- A) "hello"
- B) "world"
**Correct:** A
**Exp:** The function returns the string "hello".`;

      const result = parseMarkdownToQuizModule(markdown);
      expect(result.success).toBe(true);
      const question = result.quizModule?.chapters[0].questions[0];
      expect(question?.questionText).toContain("```javascript");
      expect(question?.questionText).toContain("function test()");
    });
  });

  describe("TM-PR-05: Schema Validation Integration", () => {
    it("should validate parsed data against QuizModule schema", () => {
      const markdown = loadFixture("md-mcq-basic.md");
      const result = parseMarkdownToQuizModule(markdown);

      expect(result.success).toBe(true);
      expect(result.quizModule).toBeDefined();

      // The result should be a valid QuizModule
      const module = result.quizModule!;
      expect(module.name).toBeDefined();
      expect(Array.isArray(module.chapters)).toBe(true);
      expect(module.chapters.length).toBeGreaterThan(0);

      module.chapters.forEach((chapter) => {
        expect(chapter.id).toBeDefined();
        expect(chapter.name).toBeDefined();
        expect(Array.isArray(chapter.questions)).toBe(true);
        expect(chapter.questions.length).toBeGreaterThan(0);

        chapter.questions.forEach((question) => {
          expect(question.questionId).toBeDefined();
          expect(question.questionText).toBeDefined();
          expect(Array.isArray(question.options)).toBe(true);
          expect(question.options.length).toBeGreaterThanOrEqual(2);
          expect(Array.isArray(question.correctOptionIds)).toBe(true);
          expect(question.correctOptionIds.length).toBeGreaterThan(0);
          expect(question.explanationText).toBeDefined();
        });
      });
    });
  });

  describe("TM-PR-06: Performance and Edge Cases", () => {
    it("should handle large markdown files efficiently", () => {
      // Create a large markdown file with many questions
      let markdown = `# Large Test Module
## Chapter 1: Many Questions
`;

      for (let i = 1; i <= 100; i++) {
        markdown += `### Q: Question ${i}
What is ${i} + ${i}?

**Options:**
- A) ${i * 2 - 1}
- B) ${i * 2}
- C) ${i * 2 + 1}
**Correct:** B
**Exp:** ${i} + ${i} = ${i * 2}

`;
      }

      const startTime = Date.now();
      const result = parseMarkdownToQuizModule(markdown);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.quizModule?.chapters[0].questions).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should handle empty or minimal markdown gracefully", () => {
      const emptyMarkdown = `# Empty Module`;
      const result = parseMarkdownToQuizModule(emptyMarkdown);

      expect(result.success).toBe(false);
      expect(
        result.errors.some((e) => e.includes("No valid chapters found")),
      ).toBe(true);
    });

    it("should handle markdown with only whitespace", () => {
      const whitespaceMarkdown = `   \n\n   \n   `;
      const result = parseMarkdownToQuizModule(whitespaceMarkdown);

      expect(result.success).toBe(false);
      expect(
        result.errors.some((e) => e.includes("Expected module title")),
      ).toBe(true);
    });
  });
});

describe("LaTeX Correction Tests (TM-LX-02)", () => {
  it("should apply conservative LaTeX corrections idempotently", async () => {
    const { correctLatexInJsonContent } = await import(
      "@/utils/quiz-validation"
    );

    const jsonWithLatex = JSON.stringify(
      {
        question: "What is $\\frac{1}{2}$ + $\\frac{1}{3}$?",
        explanation:
          "The answer is $\\frac{5}{6}$ using $\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$",
      },
      null,
      2,
    );

    // First correction
    const result1 = correctLatexInJsonContent(jsonWithLatex);
    expect(result1.correctionsMade).toBeGreaterThan(0);

    // Second correction should be idempotent (no more corrections)
    const result2 = correctLatexInJsonContent(result1.correctedContent);
    expect(result2.correctionsMade).toBe(0);
    expect(result2.correctedContent).toBe(result1.correctedContent);
  });

  it("should only correct LaTeX within $...$ delimiters", async () => {
    const { correctLatexInJsonContent } = await import(
      "@/utils/quiz-validation"
    );

    const jsonWithMixedContent = JSON.stringify(
      {
        question: "What is \\alpha + \\beta?", // Should NOT be corrected
        explanation: "The answer is $\\alpha + \\beta$", // Should be corrected
      },
      null,
      2,
    );

    const result = correctLatexInJsonContent(jsonWithMixedContent);

    const parsed = JSON.parse(result.correctedContent);
    expect(parsed.question).toBe("What is \\alpha + \\beta?"); // Unchanged
    expect(parsed.explanation).toContain("\\\\alpha + \\\\beta"); // Corrected
  });

  it("should handle complex LaTeX expressions correctly", async () => {
    const { correctLatexInJsonContent } = await import(
      "@/utils/quiz-validation"
    );

    const complexLatex = JSON.stringify(
      {
        question:
          "Solve: $\\int_0^1 x^2 dx = \\left[\\frac{x^3}{3}\\right]_0^1$",
        explanation: "Using the power rule: $\\frac{d}{dx}[x^n] = nx^{n-1}$",
      },
      null,
      2,
    );

    const result = correctLatexInJsonContent(complexLatex);
    expect(result.correctionsMade).toBeGreaterThan(0);

    const parsed = JSON.parse(result.correctedContent);
    expect(parsed.question).toContain("\\\\int");
    expect(parsed.question).toContain("\\\\frac");
    expect(parsed.explanation).toContain("\\\\frac");
  });
});
