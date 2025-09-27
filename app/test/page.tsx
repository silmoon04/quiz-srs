'use client';

import { useState } from 'react';
import { parseMarkdownToQuizModule } from '@/utils/quiz-validation';

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

**Explanation:** Big O notation describes the upper bound of an algorithm's growth rate as input size approaches infinity.`;

const testMarkdown2 = `# Advanced Algorithms Quiz

Description: _Advanced topics in algorithm design and analysis_

## Chapter 1: Sorting Algorithms

<!-- CH_ID: sorting_algorithms -->

**Q1:** What is the worst-case time complexity of QuickSort?

<!-- Q_ID: sorting_q1 -->

**Options:**
**A1:** O(n log n)
**A2:** O(n²)
**A3:** O(n)

**Correct:** A2

**Explanation:** QuickSort has O(n²) worst-case time complexity when the pivot is always the smallest or largest element.

---

**Q2:** Which sorting algorithm is stable?

<!-- Q_ID: sorting_q2 -->

**Opt:**
**A1:** QuickSort
**A2:** MergeSort
**A3:** HeapSort

**Ans:** A2

**Explanation:** MergeSort is stable because it preserves the relative order of equal elements.`;

export default function TestPage() {
  const [testResults, setTestResults] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runTests = () => {
    setIsRunning(true);
    setTestResults('Running tests...\n\n');

    try {
      // Test 1: Format with "Options:" and "Correct:"
      console.log('=== Testing Format 1 ===');
      const result1 = parseMarkdownToQuizModule(testMarkdown1);

      let results = '=== TEST 1: Options/Correct Format ===\n';
      results += `Success: ${result1.success}\n`;
      results += `Errors: ${result1.errors.length}\n`;

      if (result1.success && result1.quizModule) {
        const quizModule = result1.quizModule;
        results += `Module Name: ${quizModule.name}\n`;
        results += `Description: ${quizModule.description}\n`;
        results += `Chapters: ${quizModule.chapters.length}\n`;

        if (quizModule.chapters.length > 0) {
          const chapter = quizModule.chapters[0];
          results += `Chapter ID: ${chapter.id}\n`;
          results += `Chapter Name: ${chapter.name}\n`;
          results += `Questions: ${chapter.questions.length}\n`;

          if (chapter.questions.length > 0) {
            const q1 = chapter.questions[0];
            results += `Q1 ID: ${q1.questionId}\n`;
            results += `Q1 Options: ${q1.options.length}\n`;
            results += `Q1 Correct: ${q1.correctOptionIds.join(', ')}\n`;
          }
        }
      } else {
        results += `Errors: ${result1.errors.join('; ')}\n`;
      }

      results += '\n';

      // Test 2: Format with "Opt:" and "Ans:"
      console.log('=== Testing Format 2 ===');
      const result2 = parseMarkdownToQuizModule(testMarkdown2);

      results += '=== TEST 2: Opt/Ans Format ===\n';
      results += `Success: ${result2.success}\n`;
      results += `Errors: ${result2.errors.length}\n`;

      if (result2.success && result2.quizModule) {
        const quizModule = result2.quizModule;
        results += `Module Name: ${quizModule.name}\n`;
        results += `Description: ${quizModule.description}\n`;
        results += `Chapters: ${quizModule.chapters.length}\n`;

        if (quizModule.chapters.length > 0) {
          const chapter = quizModule.chapters[0];
          results += `Chapter ID: ${chapter.id}\n`;
          results += `Chapter Name: ${chapter.name}\n`;
          results += `Questions: ${chapter.questions.length}\n`;

          if (chapter.questions.length > 0) {
            const q1 = chapter.questions[0];
            results += `Q1 ID: ${q1.questionId}\n`;
            results += `Q1 Options: ${q1.options.length}\n`;
            results += `Q1 Correct: ${q1.correctOptionIds.join(', ')}\n`;
          }
        }
      } else {
        results += `Errors: ${result2.errors.join('; ')}\n`;
      }

      setTestResults(results);
    } catch (error) {
      setTestResults(`Test failed with error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Markdown Parser Tests</h1>

      <button
        onClick={runTests}
        disabled={isRunning}
        className="mb-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        {isRunning ? 'Running Tests...' : 'Run Tests'}
      </button>

      {testResults && (
        <div className="rounded bg-gray-100 p-4">
          <h3 className="mb-2 font-bold">Test Results:</h3>
          <pre className="whitespace-pre-wrap text-sm">{testResults}</pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Test Data Preview</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold">Format 1: Options/Correct</h3>
            <pre className="max-h-64 overflow-auto bg-gray-50 p-3 text-xs">{testMarkdown1}</pre>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Format 2: Opt/Ans</h3>
            <pre className="max-h-64 overflow-auto bg-gray-50 p-3 text-xs">{testMarkdown2}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
