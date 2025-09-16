"use client"

import { useState } from "react"
import { parseMarkdownToQuizModule } from "@/utils/quiz-validation"

// Test data based on your actual formats
const testMarkdown1 = `# MCQ Compact Output

Description: _Fundamentals of Computer Science_

## Chapter 1: Algorithm Fundamentals

<!-- CH_ID: ch_fundamentals_1 -->

**Q1:** What is the primary purpose of algorithm analysis?

<!-- Q_ID: ch_fundamentals_1_q1 -->

**Options:**
- **A1:** To determine the correctness of an algorithm
- **A2:** To measure the efficiency and resource usage of an algorithm
- **A3:** To write the algorithm in a specific programming language

**Correct:** A2

**Explanation:** Algorithm analysis primarily focuses on measuring efficiency and resource usage, including time and space complexity.

---

**Q2:** Which of the following best describes Big O notation?

<!-- Q_ID: ch_fundamentals_1_q2 -->

**Opt:**
- **A1:** It provides the exact running time of an algorithm
- **A2:** It describes the upper bound of an algorithm's growth rate
- **A3:** It only applies to sorting algorithms

**Ans:** A2

**Explanation:** Big O notation describes the upper bound of an algorithm's growth rate as input size approaches infinity.`

const testMarkdown2 = `# Quiz Title
_Optional description_
---
## Chapter Name <!-- ID:chapter_id -->
---
### Q: What is 2+2? <!-- ID:q1 -->

**Opt:**
- **A1:** 3
- **A2:** 4
- **A3:** 5

**Ans:** A2

**Exp:** 2+2 equals 4.
---

### Q: What is 3+3?

**Opt:**
- **A1:** 5
- **A2:** 6
- **A3:** 7

**Ans:** A2

**Exp:** 3+3 equals 6.
---`

const testMarkdown3 = `# Advanced Quiz
_Advanced topics_
---
## Math Chapter
<!-- ID:math_chapter -->
---
### Q: What is the square root of 16?
<!-- ID:sqrt_q -->

**Opt:**
- **A1:** 2
- **A2:** 4
- **A3:** 8

**Ans:** A2

**Exp:** The square root of 16 is 4.
---`

export function TestMarkdownParser() {
  const [testResults, setTestResults] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)

  const runTests = () => {
    setIsRunning(true)
    setTestResults("Running tests...\n\n")

    try {
      // Test 1: Format with "Options:" and "Correct:"
      console.log("=== Testing Format 1 ===")
      const result1 = parseMarkdownToQuizModule(testMarkdown1)

      let results = "=== TEST 1: Options/Correct Format ===\n"
      results += `Success: ${result1.success}\n`
      results += `Errors: ${result1.errors.length}\n`

      if (result1.success && result1.quizModule) {
        const module = result1.quizModule
        results += `Module Name: ${module.name}\n`
        results += `Description: ${module.description}\n`
        results += `Chapters: ${module.chapters.length}\n`

        if (module.chapters.length > 0) {
          const chapter = module.chapters[0]
          results += `Chapter ID: ${chapter.id}\n`
          results += `Chapter Name: ${chapter.name}\n`
          results += `Questions: ${chapter.questions.length}\n`

          if (chapter.questions.length > 0) {
            const q1 = chapter.questions[0]
            results += `Q1 ID: ${q1.questionId}\n`
            results += `Q1 Options: ${q1.options.length}\n`
            results += `Q1 Correct: ${q1.correctOptionIds.join(", ")}\n`
          }
        }
      } else {
        results += `Errors: ${result1.errors.join("; ")}\n`
      }

      results += "\n"

      // Test 2: Format with "Opt:" and "Ans:"
      console.log("=== Testing Format 2 ===")
      const result2 = parseMarkdownToQuizModule(testMarkdown2)

      results += "=== TEST 2: Opt/Ans Format ===\n"
      results += `Success: ${result2.success}\n`
      results += `Errors: ${result2.errors.length}\n`

      if (result2.success && result2.quizModule) {
        const module = result2.quizModule
        results += `Module Name: ${module.name}\n`
        results += `Description: ${module.description}\n`
        results += `Chapters: ${module.chapters.length}\n`

        if (module.chapters.length > 0) {
          const chapter = module.chapters[0]
          results += `Chapter ID: ${chapter.id}\n`
          results += `Chapter Name: ${chapter.name}\n`
          results += `Questions: ${chapter.questions.length}\n`

          if (chapter.questions.length > 0) {
            const q1 = chapter.questions[0]
            results += `Q1 ID: ${q1.questionId}\n`
            results += `Q1 Options: ${q1.options.length}\n`
            results += `Q1 Correct: ${q1.correctOptionIds.join(", ")}\n`
          }
        }
      } else {
        results += `Errors: ${result2.errors.join("; ")}\n`
      }

      // Test 3: Your specific format
      console.log("=== Testing Format 3 (Your Format) ===")
      const result3 = parseMarkdownToQuizModule(testMarkdown3)

      results += "=== TEST 3: Your Specific Format ===\n"
      results += `Success: ${result3.success}\n`
      results += `Errors: ${result3.errors.length}\n`

      if (result3.success && result3.quizModule) {
        const module = result3.quizModule
        results += `Module Name: ${module.name}\n`
        results += `Description: ${module.description}\n`
        results += `Chapters: ${module.chapters.length}\n`

        if (module.chapters.length > 0) {
          const chapter = module.chapters[0]
          results += `Chapter ID: ${chapter.id}\n`
          results += `Chapter Name: ${chapter.name}\n`
          results += `Questions: ${chapter.questions.length}\n`

          if (chapter.questions.length > 0) {
            const q1 = chapter.questions[0]
            results += `Q1 ID: ${q1.questionId}\n`
            results += `Q1 Options: ${q1.options.length}\n`
            results += `Q1 Correct: ${q1.correctOptionIds.join(", ")}\n`
          }
        }
      } else {
        results += `Errors: ${result3.errors.join("; ")}\n`
      }

      setTestResults(results)
    } catch (error) {
      setTestResults(`Test failed with error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Markdown Parser Tests</h2>

      <button
        onClick={runTests}
        disabled={isRunning}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {isRunning ? "Running Tests..." : "Run Tests"}
      </button>

      {testResults && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Test Results:</h3>
          <pre className="whitespace-pre-wrap text-sm">{testResults}</pre>
        </div>
      )}
    </div>
  )
}
