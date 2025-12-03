**You are tasked with generating a quiz module in JSON format for a Spaced Repetition System (SRS) quiz application. Follow these specifications EXACTLY to ensure the quiz validates successfully and works without errors.**

---

### 📁 **OUTPUT FORMAT: JSON**

Generate a single, valid JSON object. The file must be syntactically correct JSON that can be parsed by `JSON.parse()`.

---

### 🏗️ **SCHEMA STRUCTURE**

```typescript
interface QuizModule {
  name: string; // Required: Non-empty module title
  description?: string; // Optional: Module description
  chapters: QuizChapter[]; // Required: At least 1 chapter
}

interface QuizChapter {
  id: string; // Required: Unique chapter ID (e.g., "ch_topic_1")
  name: string; // Required: Chapter title
  description?: string; // Optional: Chapter description
  questions: QuizQuestion[]; // Required: At least 1 question
  totalQuestions: number; // Required: Count of questions (auto-calculated)
  answeredQuestions: number; // Required: Initialize to 0
  correctAnswers: number; // Required: Initialize to 0
  isCompleted: boolean; // Required: Initialize to false
}

interface QuizQuestion {
  questionId: string; // Required: Globally unique across entire quiz
  questionText: string; // Required: The question (supports Markdown & KaTeX)
  options: QuizOption[]; // Required: At least 2 options (for MCQ: 4-10 typical)
  correctOptionIds: string[]; // Required: Array of correct optionId(s)
  explanationText: string; // Required: Explanation (supports Markdown & KaTeX)
  type?: 'mcq' | 'true_false'; // Optional: Defaults to "mcq"

  // SRS Tracking Fields (initialize all to defaults):
  status?: string; // Initialize: "not_attempted"
  timesAnsweredCorrectly?: number; // Initialize: 0
  timesAnsweredIncorrectly?: number; // Initialize: 0
  historyOfIncorrectSelections?: string[]; // Initialize: []
  lastSelectedOptionId?: string | null; // Initialize: null
  lastAttemptedAt?: string | null; // Initialize: null
  srsLevel?: number; // Initialize: 0
  nextReviewAt?: string | null; // Initialize: null
  shownIncorrectOptionIds?: string[]; // Initialize: []
}

interface QuizOption {
  optionId: string; // Required: Unique within the question
  optionText: string; // Required: The option text (supports Markdown)
}
```

---

### 📏 **CRITICAL REQUIREMENTS**

#### 1. **Unique IDs are MANDATORY**

- **Chapter IDs**: Must be unique across the entire module
  - Pattern: `ch_<topic>_<number>` (e.g., `ch_algorithms_1`, `ch_sorting_2`)
- **Question IDs**: Must be globally unique across ALL chapters
  - Pattern: `<chapterId>_q<number>` (e.g., `ch_algorithms_1_q1`, `ch_algorithms_1_q2`)
- **Option IDs**: Must be unique within each question
  - Pattern: `<questionId>_opt<number>` (e.g., `ch_algorithms_1_q1_opt1`)

#### 2. **Option Requirements**

- **MCQ Questions**: Must have **at least 4 options**, ideally **8-10 options** for SRS effectiveness
- **True/False Questions**: Must have exactly 2 options with these EXACT values:
  ```json
  [
    { "optionId": "true", "optionText": "True" },
    { "optionId": "false", "optionText": "False" }
  ]
  ```

#### 3. **Correct Answers**

- `correctOptionIds` must be an array containing valid `optionId` values from the options
- For MCQ: One or more correct answers allowed
- For True/False: Must be exactly `["true"]` or `["false"]`

#### 4. **LaTeX Math Support**

- Use `$...$` for inline math: `$O(n^2)$`
- Use `$$...$$` for display math in explanations
- **CRITICAL**: In JSON, backslashes must be escaped as `\\`
  - ✅ Correct: `"$O(n^2)$"`, `"$\\frac{1}{2}$"`, `"$\\log n$"`
  - ❌ Wrong: `"$\frac{1}{2}$"` (unescaped backslash)

#### 5. **Markdown Support**

- Use `**text**` for bold
- Use `_text_` or `*text*` for italic
- Use `` `code` `` for inline code
- Use triple backticks for code blocks (with language specifier)
- Use `- item` for lists

#### 6. **Chapter Statistics**

Each chapter MUST include these computed fields:

```json
{
  "totalQuestions": <count of questions array>,
  "answeredQuestions": 0,
  "correctAnswers": 0,
  "isCompleted": false
}
```

---

### 📝 **COMPLETE EXAMPLE**

```json
{
  "name": "Introduction to Computer Science",
  "description": "Fundamental concepts covering algorithms, data structures, and complexity analysis.",
  "chapters": [
    {
      "id": "ch_algorithms_1",
      "name": "Chapter 1: Algorithm Fundamentals",
      "description": "Core concepts of algorithm design and analysis.",
      "questions": [
        {
          "questionId": "ch_algorithms_1_q1",
          "questionText": "What is the **time complexity** of binary search on a sorted array of $n$ elements?",
          "options": [
            { "optionId": "ch_algorithms_1_q1_opt1", "optionText": "$O(1)$ - Constant time" },
            {
              "optionId": "ch_algorithms_1_q1_opt2",
              "optionText": "$O(\\log n)$ - Logarithmic time"
            },
            { "optionId": "ch_algorithms_1_q1_opt3", "optionText": "$O(n)$ - Linear time" },
            { "optionId": "ch_algorithms_1_q1_opt4", "optionText": "$O(n^2)$ - Quadratic time" },
            {
              "optionId": "ch_algorithms_1_q1_opt5",
              "optionText": "$O(n \\log n)$ - Linearithmic time"
            },
            { "optionId": "ch_algorithms_1_q1_opt6", "optionText": "$O(2^n)$ - Exponential time" },
            { "optionId": "ch_algorithms_1_q1_opt7", "optionText": "$O(n!)$ - Factorial time" },
            {
              "optionId": "ch_algorithms_1_q1_opt8",
              "optionText": "$O(\\sqrt{n})$ - Square root time"
            }
          ],
          "correctOptionIds": ["ch_algorithms_1_q1_opt2"],
          "explanationText": "Binary search has $O(\\log n)$ time complexity because it **halves the search space** with each comparison.\n\n**Recurrence relation:**\n$$T(n) = T(n/2) + O(1)$$\n\nThis solves to $O(\\log n)$ using the Master Theorem.",
          "type": "mcq",
          "status": "not_attempted",
          "timesAnsweredCorrectly": 0,
          "timesAnsweredIncorrectly": 0,
          "historyOfIncorrectSelections": [],
          "lastSelectedOptionId": null,
          "lastAttemptedAt": null,
          "srsLevel": 0,
          "nextReviewAt": null,
          "shownIncorrectOptionIds": []
        },
        {
          "questionId": "ch_algorithms_1_q2",
          "questionText": "A stable sorting algorithm preserves the relative order of elements with equal keys.",
          "options": [
            { "optionId": "true", "optionText": "True" },
            { "optionId": "false", "optionText": "False" }
          ],
          "correctOptionIds": ["true"],
          "explanationText": "**True.** A stable sorting algorithm maintains the original relative order of records with equal keys.\n\n**Examples of stable sorts:**\n- Merge Sort\n- Insertion Sort\n- Bubble Sort\n\n**Examples of unstable sorts:**\n- Quick Sort (standard)\n- Heap Sort\n- Selection Sort",
          "type": "true_false",
          "status": "not_attempted",
          "timesAnsweredCorrectly": 0,
          "timesAnsweredIncorrectly": 0,
          "historyOfIncorrectSelections": [],
          "lastSelectedOptionId": null,
          "lastAttemptedAt": null,
          "srsLevel": 0,
          "nextReviewAt": null,
          "shownIncorrectOptionIds": []
        }
      ],
      "totalQuestions": 2,
      "answeredQuestions": 0,
      "correctAnswers": 0,
      "isCompleted": false
    }
  ]
}
```

---

### ⚠️ **COMMON MISTAKES TO AVOID**

| ❌ Mistake                                 | ✅ Correct                                |
| ------------------------------------------ | ----------------------------------------- |
| Duplicate question IDs across chapters     | Each `questionId` must be globally unique |
| Fewer than 4 options for MCQ               | Provide 4-10 options per MCQ question     |
| Unescaped LaTeX backslashes                | Use `\\frac`, `\\log`, `\\sum` in JSON    |
| `correctOptionIds` with invalid IDs        | Must match actual `optionId` values       |
| Missing SRS tracking fields                | Include all SRS fields with defaults      |
| `totalQuestions` not matching array length | Must equal `questions.length`             |
| T/F with custom option IDs                 | Must use exactly `"true"` and `"false"`   |

---

### 🎯 **CONTENT GUIDELINES FOR QUALITY QUESTIONS**

1. **Question Text:**
   - Ask one clear concept per question
   - Use precise technical terminology
   - Include context when necessary
   - Support both conceptual and practical questions

2. **Options (for MCQ):**
   - Include plausible distractors (wrong answers that seem reasonable)
   - Avoid "all of the above" or "none of the above"
   - Make options mutually exclusive
   - Vary option lengths (don't make the correct answer obviously longer)
   - Order options logically (numerical order, alphabetical, or by complexity)

3. **Explanations:**
   - Explain WHY the correct answer is right
   - Explain WHY common wrong answers are incorrect
   - Include formulas, code examples, or diagrams when helpful
   - Use bullet points and formatting for clarity

4. **Distractor Design (for SRS effectiveness):**
   - Create 8-10 options per question when possible
   - Include common misconceptions as distractors
   - Add partially correct answers that test deep understanding
   - Include answers that would be correct for related but different questions

---

### 📊 **VALIDATION CHECKLIST**

Before finalizing, verify:

- [ ] Valid JSON syntax (use a JSON validator)
- [ ] Module has `name` and at least one chapter
- [ ] Each chapter has unique `id` and at least one question
- [ ] Each question has globally unique `questionId`
- [ ] Each option has unique `optionId` within its question
- [ ] `correctOptionIds` contain valid option IDs
- [ ] True/False questions have exactly 2 options with IDs `"true"` and `"false"`
- [ ] All LaTeX backslashes are double-escaped (`\\`)
- [ ] All SRS tracking fields are initialized
- [ ] `totalQuestions` matches the actual question count

---

**Now generate a complete quiz JSON following ALL specifications above.**
