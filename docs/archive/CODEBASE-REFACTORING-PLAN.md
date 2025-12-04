# Codebase Refactoring Plan

**Generated:** December 3, 2025  
**Analysis Method:** 30 subagent parallel deep analysis across 3 waves  
**Total Files Analyzed:** 220 (94 source, 120 tests, 6 config)

---

## Executive Summary

After comprehensive analysis by 30 specialized subagents, we found that the codebase is **fundamentally healthy** with 3552 tests passing. The proposed "massive refactor" would be **scope creep**.

### The 80/20 Approach

| Effort                   | Impact                        |
| ------------------------ | ----------------------------- |
| Fix 2 proven bugs        | Immediate user value          |
| Delete 13 dead files     | Cleaner codebase              |
| Extract 4 pure functions | Better testability            |
| Fix 1 config line        | Correct test suite separation |
| Add 2 E2E test files     | Fill coverage gap             |

**Total Effort:** ~2 days  
**Benefit:** 80% of proposed improvements with 20% of risk

---

## Phase 0: Analysis Summary

### Files by Type

| Category        | Count | Status    |
| --------------- | ----- | --------- |
| Source files    | 94    | Analyzed  |
| Test files      | 120   | Analyzed  |
| Config files    | 6     | Analyzed  |
| Dead code files | 13    | To delete |
| Entry points    | 6     | Verified  |

### Key Findings

#### Critical Issues (Fix Now)

1. **Missing prop bug**: `answerRecords` not passed to AllQuestionsView
2. **Duplicate code**: `generateDisplayedOptions` duplicated in quiz-session.tsx
3. **Dead code**: 7 source files + 6 test files never imported

#### High-Value Improvements (Do Soon)

1. Extract pure SRS functions from page.tsx
2. Add E2E tests for edit mode (0% coverage)
3. Fix vitest config include pattern

#### Defer (Too Risky Now)

1. Split page.tsx into 8 hooks
2. Restructure lib/ folder
3. Remove CSP unsafe-inline

---

## Phase 1: Bug Fixes (1-2 hours)

### Bug 1: Missing answerRecords Prop

**Location:** [app/page.tsx](../app/page.tsx)

**Current code:**

```tsx
<AllQuestionsView
  chapter={allQuestionsChapter}
  onBackToQuiz={handleBackToQuizFromAllQuestions}
  onBackToDashboard={handleBackToDashboard}
  onRetryChapter={handleRetryChapter}
  isReviewSession={isReviewSessionActive}
/>
```

**Fixed code:**

```tsx
<AllQuestionsView
  chapter={allQuestionsChapter}
  onBackToQuiz={handleBackToQuizFromAllQuestions}
  onBackToDashboard={handleBackToDashboard}
  onRetryChapter={handleRetryChapter}
  isReviewSession={isReviewSessionActive}
  answerRecords={answerRecords} // ← Add this
/>
```

### Bug 2: Duplicate generateDisplayedOptions

**Location:** [components/quiz-session.tsx](../components/quiz-session.tsx)

**Current:** Inline implementation (~50 lines)  
**Fix:** Import from `@/lib/quiz/generate-displayed-options`

```tsx
import { generateDisplayedOptions } from '@/lib/quiz/generate-displayed-options';
// Delete the inline generateDisplayedOptions function
```

### Verification

```powershell
npx vitest run
npm run typecheck
npm run lint
```

---

## Phase 2: Dead Code Removal (2-3 hours)

### Files to Delete (in order)

#### Wave 1: Isolated Files

| File                             | Reason                                      | Associated Test                                  |
| -------------------------------- | ------------------------------------------- | ------------------------------------------------ |
| lib/markdown/latex-processor.ts  | Superseded by rehype-katex                  | tests/unit/lib/markdown/latex-processor.test.ts  |
| lib/markdown/sync-pipeline.ts    | Unused fallback                             | tests/unit/lib/markdown/sync-pipeline.test.ts    |
| lib/markdown/working-pipeline.ts | Duplicate of pipeline.ts                    | tests/unit/lib/markdown/working-pipeline.test.ts |
| components/ui/use-mobile.tsx     | Identical duplicate of hooks/use-mobile.tsx | None                                             |

#### Wave 2: Dependent Components

| File                                          | Reason                 | Associated Test                                               |
| --------------------------------------------- | ---------------------- | ------------------------------------------------------------- |
| components/a11y/DashboardWithInlineErrors.tsx | Not used in production | tests/unit/components/a11y/DashboardWithInlineErrors.test.tsx |
| components/a11y/InlineErrorHandler.tsx        | Only used by above     | tests/unit/components/a11y/InlineErrorHandler.test.tsx        |

#### Wave 3: Unused Hooks

| File               | Reason                   | Associated Test                    |
| ------------------ | ------------------------ | ---------------------------------- |
| hooks/use-toast.ts | Different impl, not used | tests/unit/hooks/use-toast.test.ts |

### Verification After Each Wave

```powershell
npm run typecheck
npx vitest run
```

---

## Phase 3: Pure Function Extraction (1 day)

### Create: lib/quiz/srs-calculations.ts

```typescript
import { QuizModule, QuizQuestion, NextReviewQuestion } from '@/types/quiz-types';

/**
 * Calculate how many questions are due for review
 */
export function calculateReviewQueueCount(module: QuizModule): number {
  // Extract logic from page.tsx useMemo
}

/**
 * Get the next question due for review
 */
export function getNextDueQuestion(module: QuizModule): NextReviewQuestion | null {
  // Extract from handleLoadNextReviewQuestion
}

/**
 * Calculate SRS progress counts per level
 */
export function calculateSrsProgressCounts(module: QuizModule): SrsProgressCounts | null {
  // Extract from useMemo
}

/**
 * Update question SRS level after answer
 */
export function updateQuestionSrsLevel(question: QuizQuestion, isCorrect: boolean): QuizQuestion {
  // Extract SRS level update logic
}
```

### Create: lib/quiz/index.ts

```typescript
export * from './generate-displayed-options';
export * from './srs-calculations';
```

### Update page.tsx Imports

```diff
- // Inline SRS calculations
+ import { calculateReviewQueueCount, getNextDueQuestion, calculateSrsProgressCounts } from '@/lib/quiz';
```

### Expected Size Reduction

| File                         | Before      | After       |
| ---------------------------- | ----------- | ----------- |
| app/page.tsx                 | ~1550 lines | ~1200 lines |
| lib/quiz/srs-calculations.ts | 0           | ~200 lines  |

---

## Phase 4: Config Fixes (30 minutes)

### Fix: vitest.config.ts

**Current (runs all tests including integration):**

```typescript
include: ['tests/**/*.{test,spec}.{ts,tsx}'],
exclude: ['tests/e2e/**', 'node_modules/**'],
```

**Fixed (runs only unit tests):**

```typescript
include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
exclude: ['node_modules/**'],
```

---

## Phase 5: Test Coverage Improvements (2-4 hours)

### Create: tests/e2e/edit-mode/question-crud.spec.ts

```typescript
import { test, expect } from '@playwright/test';

test.describe('Question CRUD Operations', () => {
  test('should create a new question', async ({ page }) => {
    // Navigate to quiz, click Add Question, fill form, save
  });

  test('should edit an existing question', async ({ page }) => {
    // Navigate to quiz, click Edit, modify text, save
  });

  test('should delete a question with confirmation', async ({ page }) => {
    // Navigate to quiz, click Delete, confirm, verify removed
  });
});
```

### Create: tests/unit/lib/quiz/srs-calculations.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { calculateReviewQueueCount, getNextDueQuestion } from '@/lib/quiz';

describe('SRS Calculations', () => {
  it('should return 0 when no questions are due', () => {
    // Test with all questions at level 2 (mastered)
  });

  it('should return correct count of due questions', () => {
    // Test with mixed SRS levels and due dates
  });

  it('should get next due question in priority order', () => {
    // Test ordering by due date and SRS level
  });
});
```

---

## Defer List (NOT Now)

| Proposed Change                 | Reason to Defer                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| Split page.tsx into 8 hooks     | High risk of introducing bugs; coupled state would require callback hell between hooks |
| Restructure lib/ folder         | 50+ import path changes; marginal benefit                                              |
| Create useFileImport hook       | Over-abstraction; file imports have different validation needs                         |
| Remove CSP unsafe-inline        | Would break KaTeX and Mermaid rendering                                                |
| Delete app/test/page.tsx        | Useful dev tool; gate behind env check instead                                         |
| Consolidate types/quiz-types.ts | 51 files import it; use re-export pattern instead                                      |

---

## Validation Checklist

### Before Starting

- [ ] Create branch: `git checkout -b refactor/minimum-viable`
- [ ] Run baseline: `npx vitest run` → expect 3552 passed
- [ ] Run E2E baseline: `npm run test:e2e`

### After Each Phase

- [ ] `npm run typecheck` → 0 errors
- [ ] `npx vitest run` → 3552+ passed
- [ ] `npm run lint` → no new warnings
- [ ] Commit with descriptive message

### Final Validation

- [ ] Full test suite passes
- [ ] Coverage not decreased
- [ ] No console errors in dev mode
- [ ] Manual test: complete quiz flow, edit mode, SRS review

---

## Risk Assessment

| Phase               | Risk     | Rollback Strategy                    |
| ------------------- | -------- | ------------------------------------ |
| Phase 1: Bug fixes  | Very Low | Revert single line change            |
| Phase 2: Dead code  | Low      | Restore files from git               |
| Phase 3: Extraction | Medium   | Keep old inline code, revert imports |
| Phase 4: Config     | Very Low | Revert single line change            |
| Phase 5: New tests  | Very Low | Delete test files                    |

---

## Success Metrics

| Metric                 | Before | After |
| ---------------------- | ------ | ----- |
| Dead code files        | 13     | 0     |
| page.tsx lines         | ~1550  | ~1200 |
| E2E edit mode coverage | 0%     | 100%  |
| Proven bugs            | 2      | 0     |
| Test count             | 3552   | 3560+ |

---

## Appendix: File Reference Map

Generated by [scripts/codebase-analyzer.ts](../scripts/codebase-analyzer.ts)

Full analysis saved to: [codebase-analysis.json](../codebase-analysis.json)

### Entry Points

| File                 | Type           |
| -------------------- | -------------- |
| app/page.tsx         | Next.js page   |
| app/layout.tsx       | Next.js layout |
| vitest.config.ts     | Test config    |
| playwright.config.ts | E2E config     |

### High-Impact Files

| File                                | Size  | Functions | Status                     |
| ----------------------------------- | ----- | --------- | -------------------------- |
| app/page.tsx                        | 67KB  | 89        | Extract pure functions     |
| components/quiz-session.tsx         | ~25KB | 30+       | Remove duplicate code      |
| utils/quiz-validation-refactored.ts | ~25KB | 20+       | Consider splitting (defer) |

---

_Report generated through 3-wave subagent analysis with 30 parallel evaluations_
