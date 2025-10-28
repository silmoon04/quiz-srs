# Consolidated Audit & Improvement Plan for Quiz SRS

_Last updated: 2025-10-28_

## Introduction

This document synthesizes findings from multiple internal audits to create a single, actionable roadmap for addressing critical bugs and maintainability issues. It serves as the source of truth for the development and testing cycle. Each section outlines the issue, its root cause, the blast radius of a fix, and a clear remediation strategy.

---

## Architecture Decision Records (ARD)

### ARD-001: KaTeX Sanitization Schema Fix (2025-10-28)

**Status:** Partially Completed

**Context:**
The markdown rendering pipeline was stripping KaTeX-generated MathML elements and CSS classes, causing inline math expressions to duplicate (raw LaTeX text appearing alongside rendered math) and breaking accessibility features.

**Decision:**
Updated `lib/markdown/pipeline.ts` sanitization schema to:

1. Extend `defaultSchema` from `rehype-sanitize` instead of replacing it
2. Add all KaTeX MathML tags: `math`, `semantics`, `mrow`, `mi`, `mo`, `mn`, `msup`, `msub`, `mfrac`, `mtable`, `mtr`, `mtd`, `annotation`, `annotation-xml`, `mtext`, `mspace`, `msqrt`, `mroot`, `munder`, `mover`, `munderover`, `mpadded`, `mphantom`, `menclose`
3. Add MathML-specific attributes for proper rendering and accessibility
4. **Critical:** Added `className` and `style` to wildcard attributes (`'*'`), as the default schema does not include these
5. Added `aria-hidden` to span elements for screen reader compatibility
6. Removed `sanitizeFallback` function that was bypassing KaTeX and reintroducing duplication

**Consequences:**

✅ **Positive:**

- Inline math expressions (`$...$`) now render correctly with `.katex` class preserved
- MathML structure maintained for accessibility (screen readers can access math content)
- 4/13 KaTeX tests passing (all inline math tests)
- No more duplication of math expressions in inline contexts

⚠️ **Partial:**

- Display math (`$$...$$`) still has issues - not generating `.katex-display` class wrapper
- 6/13 tests failing (display math and matrix rendering)
- Need further investigation into display mode rendering

❌ **Technical Debt:**

- Test file `test-katex-output.mjs` created for debugging but not yet removed
- Display math rendering needs additional pipeline investigation

**Alternatives Considered:**

1. Creating a custom schema from scratch - rejected due to maintenance burden and security risks
2. Post-processing HTML after sanitization - rejected as it would bypass security measures
3. Using a different sanitization library - rejected to minimize dependency changes

**Test Results:**

```
Passing: 4/13 tests
- ✅ should render inline math correctly
- ✅ should render multiple inline math expressions
- ✅ should handle inline math with special characters
- ✅ should handle inline math with fractions

Failing: 6/13 tests (display math)
- ❌ should render display math correctly
- ❌ should render multiple display math expressions
- ❌ should handle display math with complex expressions
- ❌ should handle display math with matrices
- ❌ should handle inline and display math in the same content
- ❌ should handle math within lists

Other: 3/13 tests (error handling, security checks)
```

**Files Modified:**

- `lib/markdown/pipeline.ts` - Updated sanitizeSchema, removed sanitizeFallback
- `tests/unit/renderer/latex-functionality.test.tsx` - Re-enabled test suite (removed `.skip`)

**Follow-up Required:**

- [ ] Investigate display math rendering pipeline
- [ ] Fix matrix parsing errors (KaTeX parse error for `\begin{pmatrix}`)
- [ ] Remove temporary `test-katex-output.mjs` file
- [ ] Complete remaining 9 KaTeX tests

---

## Critical Issues Discovered (2025-10-28)

### Issue 1: Duplicate Question IDs in React Rendering

**Severity:** High  
**Component:** `AccessibleQuestionGrid.tsx`, Quiz data structure

**Error:**

```
Error: Encountered two children with the same key, `ch_iterative_bigo_2_q9`.
Keys should be unique so that components maintain their identity across updates.
```

**Root Cause:**
The quiz module contains duplicate question IDs (`ch_iterative_bigo_2_q9` appears multiple times), violating React's requirement for unique keys in lists. This suggests:

1. Data validation during import is not checking for unique IDs
2. Question duplication may be occurring during chapter/module operations
3. The `AccessibleQuestionGrid` component is mapping over questions using their IDs as keys

**Impact:**

- React reconciliation errors causing unpredictable UI behavior
- Questions may be duplicated or omitted from rendering
- Component state may leak between duplicate questions
- Console flooding with error messages

**Files Affected:**

- `components/a11y/AccessibleQuestionGrid.tsx` - Line 184, using questionId as key
- `utils/quiz-validation-refactored.ts` - Should validate ID uniqueness during import
- Quiz data files (likely `dsa-comprehensive-quiz.md` or similar)

**Remediation Required:**

1. Add ID uniqueness validation to `validateQuizModule` schema
2. Scan existing quiz files for duplicate IDs
3. Implement automatic ID deduplication during import (append suffix like `-1`, `-2`)
4. Add integration test ensuring no duplicate IDs after import
5. Consider using composite keys in React (e.g., `${chapterId}-${questionId}-${index}`)

---

### Issue 2: Incorrect Answer Feedback Not Showing

**Severity:** Critical (UX)  
**Component:** `QuizSession`, answer submission flow

**Observed Behavior:**
When a user selects an incorrect answer and clicks submit:

- ✅ The correct answer is highlighted in green
- ❌ The user's incorrect selection is NOT highlighted in red
- User cannot see which option they selected after submission

**Expected Behavior:**

- Correct answer: Green background/checkmark
- User's incorrect selection: Red background/X icon
- Both should be visible simultaneously for learning

**Root Cause (Hypothesis):**
Looking at the state management issues documented in Section 2, this is likely caused by:

1. Selection state being cleared or overwritten during submission
2. The UI only rendering the `correctOptionIds` without preserving `selectedOptionId`
3. Possible conflict between historical answer view and current answer state

**Files to Investigate:**

- `components/quiz-session.tsx` - Answer submission handler
- `components/option-card.tsx` - Visual feedback rendering logic
- `app/page.tsx` - State management for `selectedOptionId` and `isSubmitted`

**Related Issues:**
This appears connected to the "State Management: Answer Integrity" issues in Section 2:

- Per-question state not being preserved
- Selection state leaking between questions
- Incorrect comparison logic between selected and correct options

**Remediation Required:**

1. Verify `selectedOptionId` is preserved in state after submission
2. Update `OptionCard` to check both `isCorrect` AND `isSelected` flags
3. Ensure styling applies both states simultaneously:
   ```tsx
   className={cn(
     isCorrect && 'bg-green-100 border-green-500',
     isSelected && !isCorrect && 'bg-red-100 border-red-500'
   )}
   ```
4. Add visual regression test for incorrect answer feedback
5. Add E2E test: "submit wrong answer -> verify red highlight on selected option"

**Priority:** This should be fixed alongside the answer ledger refactor (Phase 2), as both relate to answer state management.

---

## 1. Content Pipeline: KaTeX and Markdown Rendering

**Status:** 🟡 Partially Completed (2025-10-28) - See ARD-001

**Symptoms:**

- ~~Inline math expressions are duplicated with raw text (e.g., `O(n2)O(n^2)`).~~ ✅ **FIXED** (inline only)
- ~~LaTeX commands like `\le` and `\rightarrow` appear as escaped text instead of symbols.~~ ✅ **FIXED**
- Display math blocks (`$$...$$`) still not rendering correctly ⚠️ **PARTIAL**
- Pseudo-code blocks lose their formatting and render as inline text. ⚠️ **NOT ADDRESSED**

**Primary Causes:**

1.  ~~**Aggressive Sanitization:** The markdown processing pipeline in `lib/markdown/pipeline.ts` uses a sanitizer (`rehype-sanitize`) that strips essential MathML tags and attributes generated by KaTeX.~~ ✅ **FIXED** - Schema now preserves MathML tags and `className` attribute
2.  **Flawed LaTeX Correction:** A utility named `correctLatexInJsonContent` in `utils/quiz-validation-refactored.ts` is used during file imports. It incorrectly double-escapes backslashes in LaTeX commands (e.g., `\le` becomes `\\le`), corrupting valid content before it is even rendered. This function is brittle as it operates on raw JSON strings with regex. ⚠️ **NOT ADDRESSED**
3.  **Post-Processing Mutation:** The `processExplanationText` function in `components/quiz-session.tsx` manipulates the rendered HTML of explanations as a raw string to highlight option text. This process is not markdown-aware and breaks any KaTeX content within the options. ⚠️ **NOT ADDRESSED**

**Completed (2025-10-28):**

- ✅ Updated sanitizer schema to allow KaTeX MathML elements
- ✅ Added `className` and `style` to wildcard attributes
- ✅ Removed `sanitizeFallback` function
- ✅ Re-enabled KaTeX test suite
- ✅ 4/13 tests passing (all inline math)

**Remaining Work:**

1.  ~~**Fix Sanitizer:**~~ ✅ **COMPLETED** - Updated the `sanitizeSchema` in `lib/markdown/pipeline.ts` to allow all necessary KaTeX MathML tags and `className` attribute
2.  ⚠️ **Fix Display Math:** Investigate why `$$...$$` blocks don't generate `.katex-display` class wrapper (6/13 tests failing)
3.  ⚠️ **Fix Matrix Rendering:** KaTeX parse errors for `\begin{pmatrix}` syntax (likely escaping issue in markdown source)
4.  **Clean Up Pipeline Duplicates:** Remove or consolidate the unused `sync-pipeline.ts` and `working-pipeline.ts` files to reduce maintenance overhead. Only `pipeline.ts` is used in production.
5.  **Remove LaTeX Auto-Correction:** Delete the `correctLatexInJsonContent` function (which hardcodes 200+ LaTeX commands and operates on raw JSON strings). Replace it with proper schema-based validation (using the Zod schemas in `lib/schema/quiz.ts`) that reports errors to the user instead of silently mutating content.
6.  **Refactor Explanation Handling:** Remove the `processExplanationText` function. Option text substitution should be handled within the markdown AST during the rendering pipeline (e.g., with a custom remark plugin), not after.
7.  ~~**Re-enable Tests:**~~ ✅ **COMPLETED** - KaTeX test suite re-enabled and running in CI
8.  **Expand Test Coverage:** Add cases for display math, complex expressions, and round-trip import/export integrity (complete remaining 9/13 tests)
9.  **Verify CSS Compatibility:** After schema changes, confirm that the KaTeX CSS in `app/globals.css` still applies correctly to the newly preserved MathML structure, especially for dark mode theming.
10. **Clean Up:** Remove temporary `test-katex-output.mjs` debugging file

---

## 2. State Management: Answer Integrity and UI Consistency

**Symptoms:**

- Correctly answered questions are marked as incorrect when navigating back to them using the "Previous Answer" button or the navigation menu.
- Options appear pre-selected on newly loaded questions, often leading to immediate incorrect submissions.
- The "All Questions" view shows 0% progress, ignoring all previously answered questions.

**Primary Causes:**

1.  **Global, Per-Question State:** The application uses a single, global state for the current selection (`selectedOptionId`, `isSubmitted`) in `app/page.tsx`. This state is not saved per-question, so navigating between questions or viewing history causes state to leak from one context to another.
2.  **Incorrect Historical Comparison:** When viewing a historical answer, the UI correctly shows the historical question snapshot but compares the selected option against the _live_ question's `correctOptionIds`, leading to incorrect feedback if the answer keys differ.
3.  **Unstable Option Order:** Options are re-shuffled on every question mount (`sort(() => Math.random() - 0.5)`), meaning a stored `selectedOptionId` may no longer point to the same option text upon revisit.
4.  **Isolated Component State:** The `AllQuestionsView` component maintains its own `questionStates` map and never synchronizes with the canonical quiz module, effectively resetting progress within that view.
5.  **Focus vs. Selection ambiguity:** `AccessibleOptionList` forcibly focuses the first option on mount, and the styling for focus is too similar to selection, making it appear pre-selected.

**Why It Slips Through:**

- Lack of integration tests for complex navigation flows (e.g., answer -> navigate away -> navigate back).
- The state is managed in a monolithic component (`app/page.tsx`), making it difficult to trace data flow and identify state leakage.

**Blast Radius:**

- The entire quiz-taking experience: `QuizSession`, `QuestionNavigationMenu`, `AllQuestionsView`.
- Spaced Repetition System (SRS) logic, which relies on correct answer stats and uses `shownIncorrectOptionIds` to track learning progress.
- User trust and experience, as the app appears buggy and unreliable.
- `sessionHistory` data structure used for navigation and review.
- Chapter statistics calculated by `recalculateChapterStats`.

**Remediation Strategy:**

### Phased Answer-Ledger Refactor

| Phase  | Goal                        | Key Actions                                                                                                                                                                                                                | Feature Flag                     | Rollback                           |
| ------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------- |
| **P0** | Baseline safety net         | Capture current Playwright recordings, Vitest snapshots, and state shape for regression comparison.                                                                                                                        | N/A                              | Re-run baseline suites.            |
| **P1** | Ledger schema & utilities   | Add `AnswerRecord`/`AnswerLedger` types, create `lib/answer-ledger.ts` helpers (`createAnswerRecord`, `validateAnswerRecord`, `mergeLedgers`, `migrateLegacyQuestion`).                                                    | Off                              | Remove helper module.              |
| **P2** | Read-only hydration         | Mirror legacy state into ledger (no writes), pass ledger data to `QuizSession`/`AllQuestionsView` as optional props, instrument mismatch logging.                                                                          | `USE_ANSWER_LEDGER` (reads only) | Disable flag.                      |
| **P3** | Write-through (shadow mode) | Gated writes from submit/reset/delete handlers populate ledger while legacy state remains canonical; purge ledger entries on resets/deletes; track ledger snapshot IDs in history.                                         | `USE_ANSWER_LEDGER` (writes)     | Set flag false, revert mocks.      |
| **P4** | Ledger-first rendering      | Derive UI state from ledger (remove `selectedOptionId`/`isSubmitted` state), reconstruct option order from stored IDs, render All Questions view from ledger, keep legacy fallback for one release behind flag default ON. | Default ON                       | Toggle flag + revert PR.           |
| **P5** | Import/export + cleanup     | Persist ledger in exports, migrate imports, remove legacy fields/caches, delete temporary logging and the feature flag.                                                                                                    | Flag removed                     | Revert migration + export changes. |

### 2025-10-28 Interim Stabilization

- Restored a temporary per-question answer cache in `app/page.tsx` to stop runtime crashes introduced by the ledger refactor. The React state now stores `AnswerRecord` entries keyed by `questionId` and the helper `applyAnswerRecordToQuestion` rehydrates UI state when navigating between questions.
- Added a `useEffect` guard so quiz view automatically replays cached selections unless the user is inspecting historical entries, ensuring the navigation menu and SRS review flow stay stable while ledger work continues.
- Purge cached records whenever a module loads, a chapter resets, or a question is deleted/overwritten so stale submissions cannot leak across sessions; submission handlers now write fresh records after each answer to maintain parity with the eventual ledger format.
- This stopgap unblocks quiz launch by replacing the missing helper (`ReferenceError: applyAnswerRecordToQuestion is not defined`) while keeping the phased ledger plan intact.

### Testing Plan per Phase

- **P0 Baseline:**
  - Run `npm run test:unit`, `npm run test:integration`, and `npx playwright test tests/e2e/quiz-flow.spec.ts --headed`; archive videos/snapshots for diffing.
- **P1 Schema:**
  - Add unit coverage for ledger helpers (`npm run test -- lib/answer-ledger.test.ts`).
  - Type-check with `pnpm types:check` to ensure contracts compile.
- **P2 Hydration:**
  - New Vitest component test verifying `useLedgerMirror` prefers history snapshots when present.
  - Integration test `npm run test:integration use-ledger-mirror.int.test.ts` confirming ledger stays empty with flag off.
  - Manual QA in DevTools to confirm UI unchanged.
- **P3 Write-through:**
  - Flagged integration suite `NEXT_PUBLIC_ENABLE_ANSWER_LEDGER=true npm run test:integration answer-ledger-write.int.ts` validating quiz vs review writes and reset purges.
  - Playwright smoke (`--grep @ledger`) ensures high-traffic flows behave with flag on.
- **P4 Ledger-first:**
  - Unit tests ensuring derived state matches stored records and reconstructed option order is stable.
  - Integration spec `ledger-navigation.int.ts` covering navigation, history, and option order.
  - Visual regression for focus vs selection styling and full Playwright run with flag on, compared to P0 assets.
- **P5 Cleanup:**
  - Migration unit tests round-tripping legacy exports.
  - Integration `import-export-ledger.int.ts` and cross-browser Playwright import/export runs.
  - Manual regression checklist confirming no option pre-selection and successful restart flows.

#### P0 Baseline Execution Log — 2025-10-27

- `pnpm test:unit` **failed**: Vitest picked up `tests/e2e/quiz-flow.spec.ts`, triggering the Playwright "did not expect test.describe" error (failure surfaced even before assertions). Multiple KaTeX-related suites remain skipped, and Vitest-Axe continues to be disabled pending ESM compatibility.
- `pnpm test:int` **passed**: `vitest run --config vitest.config.integration.ts` completed (1 suite, 9 tests).
- `npx playwright test tests/e2e/quiz-flow.spec.ts --headed` **failed**: 15/55 cross-browser specs timed out while `page.goto('/')` waited for a server that never started; WebKit cases also showed navigation interruptions and a focus visibility assertion. Artifacts saved under `test-results/quiz-flow-*`.
- `pnpm test:access` **skipped**: entire accessibility suite skipped due to Vitest-Axe being disabled for ESM compatibility; no assertions executed.
- `pnpm typecheck` **failed**: 8 unresolved identifier/implicit `any` errors in `app/page.tsx` related to answer-ledger stubs (`applyAnswerRecordToQuestion`, `setAnswerRecords`).
- `pnpm typecheck:strict` **failed**: 134 errors across 18 files exposing widespread nullability issues and unstable types in `app/page.tsx`, review modal, quiz session logic, validation utilities, and test fixtures.
- `pnpm lint` **warned**: ESLint reported unused props/variables in quiz UI components (`all-questions-view.tsx`, `option-card.tsx`, `quiz-session.tsx`).
- `pnpm test:e2e` **failed**: WebKit and Mobile Safari scenarios flaked on focus visibility and navigation to `/non-existent-page`; Chromium/Firefox flows passed but suite exits non-zero (3 failures).
- Next actions for P0: adjust Vitest configuration to exclude Playwright specs from unit runs, wire Playwright's `webServer` (or start Next.js manually) before reattempting the suite, then rerun the same commands to capture a clean baseline.

#### Follow-up Execution Log — 2025-10-28

- `pnpm lint` (post hotfix verification) **warned**: Existing unused-variable issues persist—`components/all-questions-view.tsx` (Clock, Brain, CircularProgress icons; several unused props/locals), `components/option-card.tsx` (`_onSelect`), and `components/quiz-session.tsx` (`_targetCorrectOptionForFeedback`). No new lint errors introduced by the answer-record patch; warnings remain queued for cleanup under Phase 5.

### Additional Workstreams

1.  **Ensure Correct Historical View:** The history renderer continues to use historical snapshots for content and correct-option comparison while referencing ledger records for status badges.
2.  **Cache Shuffled Options:** Store only the displayed option IDs in ledger entries; recompute option objects on read to guarantee consistent order without duplicating text payloads.
3.  **Separate Focus and Selection Styles:** Update `OptionCard`/`AccessibleOptionList` styling to distinguish focus outlines from selected backgrounds; retain existing keyboard behaviour in a11y tests.

---

## 3. Core Features: Import and Export

**Symptoms:**

- The "Load New Module" button on the dashboard is non-functional.
- Importing questions appears to succeed (shows a toast), but the questions are never added to the quiz.
- Exporting state or questions works intermittently, failing silently on browsers like Firefox and Safari.

**Primary Causes:**

1.  **Stubbed Implementation:** The `handleLoadNewModule` function in `app/page.tsx` is a placeholder that only logs "not implemented yet" to the console.
2.  **Incomplete Import Logic:** The question import flow (`handleInitiateImportCurrentQuestionState`) validates the incoming data but stops short of actually committing it to the application's state (at a `TODO` comment).
3.  **Unreliable Download Trigger:** The export functions create a temporary `<a>` tag and trigger a `click()` event without first appending the element to the DOM. This non-standard pattern is ignored by some browsers.
4.  **Buggy File Reader:** The `readFileAsText` helper assigns `reader.onload` twice, which can lead to unexpected behavior and makes error handling brittle.

**Why It Slips Through:**

- No end-to-end integration tests for the import/export flows.
- Success toasts are fired before the operation is guaranteed to have completed, masking the failure.

**Blast Radius:**

- All features related to content management, including starting a new quiz from a file, saving progress, and sharing questions. This is a critical blow to user autonomy.
- Multiple export paths: `handleExportState`, `handleExportIncorrectAnswers`, `handleExportCurrentQuestionState` - all need the same fix.
- Both JSON and Markdown import flows, which use different validation paths (`validateQuizModule` vs `parseMarkdownToQuizModule`).

**Remediation Strategy:**

1.  **Implement `handleLoadNewModule`:** Connect the dashboard button to the file import logic, which should then reset the quiz state with the new module after user confirmation.
2.  **Complete Question Import Flow:** Finish the implementation to append or overwrite questions in the `currentModule`, merge the new questions, and recalculate chapter statistics using `recalculateChapterStats`.
3.  **Consolidate Export Logic:** Create a shared `downloadBlob` utility function for downloads that correctly appends the anchor to the `document.body`, triggers the click, and then uses `requestAnimationFrame` or a short `setTimeout` to clean up the element and revoke the object URL. Apply this fix to all three export functions: `handleExportState`, `handleExportIncorrectAnswers`, and `handleExportCurrentQuestionState`.
4.  **Fix `readFileAsText`:** Refactor the helper to use a single `onload` handler and properly handle both success and error cases. Ensure drag-and-drop file handling works correctly.
5.  **Add Schema Versioning:** Implement JSON schema versioning so state imports can be validated and migrated when the schema changes.
6.  **Add E2E Tests:** Create Playwright tests that cover the full cycle: export state -> clear session -> import state -> verify restoration. Test both JSON and Markdown import paths.

---

## 4. Structural Maintainability

**Symptoms:**

- Development is slow and risky. Small changes have unpredictable side effects across the application.
- It is difficult to write isolated unit tests for specific behaviors.
- The codebase is hard for new developers to reason about.

**Primary Causes:**

1.  **Monolithic `app/page.tsx`:** This single file has grown to over 1,700 lines and mixes UI rendering, state management, business logic (SRS scheduling), and data I/O (import/export). This is a classic "God Component" anti-pattern.
2.  **Monolithic Validation Module:** The `utils/quiz-validation-refactored.ts` file is a monolithic (~1,200 lines), side-effect-heavy utility that is difficult to maintain and test. It mixes validation, data correction, and logging.

**Remediation Strategy:**

1.  **Decompose `app/page.tsx`:** Break down the massive component into smaller, feature-specific custom hooks that can be independently tested and maintained:
    - `useQuizSession`: Manages the state for an active quiz session (current question, answers, history).
    - `useImportExport`: Handles all file import/export logic.
    - `useReviewScheduler`: Contains the SRS scheduling logic.
    - `useQuestionEditor`: Manages the state and logic for the question editing modal.
2.  **Refactor Validation Logic:**
    - Consolidate all schema validation using the existing Zod schemas in `lib/schema/quiz.ts` as the single source of truth.
    - Break `quiz-validation-refactored.ts` into smaller, pure functions with clear responsibilities (e.g., `normalizeQuestion`, `recalculateChapterStats`).
    - Eliminate all `console.log` side effects from validation functions, replacing them with returned errors or warnings.

---

## 5. Additional UI/UX Issues

**Symptoms:**

- Button labels are inconsistent across components ("Next Answer" vs "Next Question").
- Success toasts appear even when operations fail.
- Question editor saves fail silently when required fields are missing.
- Modal dialogs lack focus traps, allowing keyboard focus to escape.
- Scroll can lock mid-form in the question editor.
- Pseudo-code snippets collapse into prose; fenced blocks lose monospace styling and spacing.
- Keyboard focus indicators are faint, and focus can disappear when tabbing through long forms or modals.
- ARIA roles and labels are incomplete on navigation, progress bars, and answer groups.
- Correct/incorrect states rely only on color with low contrast, making statuses inaccessible.

**Primary Causes:**

1.  **Inconsistent Button Copy:** Button labels are hardcoded across multiple components (`QuizSession`, `QuizComplete`, `Dashboard`) with divergent text.
2.  **Premature Toast Notifications:** Toast helpers are called before operations complete, masking failures.
3.  **Missing Client-Side Validation:** The question editor relies on `normalizeSingleQuestion` which provides defaults but never validates minimum requirements (e.g., at least 2 options, at least 1 correct option).
4.  **Inadequate Modal Implementation:** The question editor modal is regular DOM without a focus trap, and the modal body can overflow without proper scroll handling.
5.  **Markdown Styling Debt:** The current renderer does not differentiate code fences from paragraphs, so pseudo-code loses formatting.
6.  **Focus & ARIA Gaps:** Tailwind resets strip default focus outlines, and semantic landmarks are missing across quiz navigation and progress indicators.
7.  **Color-Only Feedback:** Correctness badges rely on hue without iconography or contrast safeguards.

**Why It Slips Through:**

- No design system or style guide enforcing consistent terminology.
- Toast/notification logic is scattered and not centrally managed.
- Lack of form validation tests for the editor.
- Markdown regression tests focus on math, not pseudo-code or fenced blocks.
- Accessibility suites (axe/Playwright) are skipped, so focus/ARIA/color regressions go unnoticed.

**Blast Radius:**

- User confusion and loss of trust due to inconsistent UI language.
- Accessibility issues for keyboard and screen reader users.
- Visual learners lose context when pseudo-code collapses into paragraphs.
- Data integrity issues when invalid questions are saved.

**Remediation Strategy:**

1.  **Centralize UI Copy:** Create a constants file (e.g., `lib/constants/ui-copy.ts`) with all button labels, toast messages, and user-facing strings. Import from this single source across all components.
2.  **Fix Toast Timing:** Ensure all toast notifications are emitted after promise resolution, not before. Provide actionable body text (e.g., "Saved to quiz-state-2025-10-27.json").
3.  **Add Editor Validation:** Implement client-side schema validation in the question editor using Zod. Display inline error messages and prevent save until all required fields are valid.
4.  **Improve Modal UX:** Migrate to a proper modal library (Radix Dialog already exists in the project) that includes focus trapping and scroll locking. Keep action buttons sticky at the bottom.
5.  **Restore Code Blocks:** Update the markdown pipeline to render code fences as `<pre><code>` with monospace fonts, preserved whitespace, and optional syntax highlighting.
6.  **Strengthen Focus & Semantics:** Re-enable focus rings, declare radio groups/progress indicators with ARIA roles, and add live regions for toasts.
7.  **Improve Status Contrast:** Pair colors with icons/labels (e.g., ✓ Correct, ✗ Incorrect) and adjust palettes to meet WCAG AA for light/dark themes.
8.  **Add Accessibility Tests:** Extend the a11y suite (axe + Playwright) to cover keyboard journeys, ARIA assertions, and color-contrast checks.

---

## 6. Code Cleanup and Removal

As part of the remediation work, the following code should be removed to reduce maintenance burden and eliminate sources of bugs:

**Functions to Delete:**

1.  `processExplanationText` (in `components/quiz-session.tsx`) - Post-processes HTML and breaks KaTeX.
2.  `sanitizeFallback` (in `lib/markdown/pipeline.ts`) - Bypasses KaTeX and reintroduces duplicates.
3.  `correctLatexInJsonContent` (in `utils/quiz-validation-refactored.ts`) - Double-escapes valid content.

**Files to Remove or Consolidate:**

1.  `sync-pipeline.ts` and `working-pipeline.ts` - Unused markdown pipeline duplicates.
2.  `utils/quiz-validation/index.ts` - Simply re-exports from `quiz-validation-refactored.ts`. After refactoring validation logic, consolidate into a single module.

**Duplicate Logic to Merge:**

1.  Option generation/shuffle logic is duplicated between `QuizSession` and `AllQuestionsView`. Extract to a shared utility.
2.  Progress calculation is duplicated in multiple components. Use `recalculateChapterStats` as the single source of truth.
3.  Blob download code is duplicated in three export functions. Extract to `downloadBlob` utility.

---

## 7. Implementation Order and Dependencies

To minimize risk and ensure each fix builds on the previous one, execute the remediation work in the following order:

### Phase 1: Content Pipeline Stabilization (Highest Priority)

**Goal:** Fix KaTeX/Markdown rendering so all content displays correctly.

**Steps:**

1.  Update sanitizer schema in `lib/markdown/pipeline.ts`.
2.  Remove `correctLatexInJsonContent`, `processExplanationText`, and `sanitizeFallback`.
3.  Re-enable and expand KaTeX test suite.
4.  Manual verification with `advanced-test-quiz.md` and `dsa-comprehensive-quiz.md`.

**Why First:** This affects every piece of content in the app. Until it's fixed, users cannot trust what they see, making other improvements meaningless. This work is also relatively isolated and won't be affected by state management changes.

### Phase 2: State Management Refactor (Core Architecture)

**Goal:** Deliver the phased answer ledger outlined in Section 2 without regressing navigation, review, or SRS flows.

**Steps:**

1.  **P1 – Schema & Utilities:** Ship ledger types/helpers behind a dormant flag and add focused unit coverage.
2.  **P2 – Read-Only Hydration:** Mirror legacy state into ledger (no writes), plumb data to UI props, measure mismatches.
3.  **P3 – Shadow Writes:** Gate ledger writes behind `USE_ANSWER_LEDGER`, ensure resets/deletes purge related entries, keep legacy state authoritative.
4.  **P4 – Ledger-First Rendering:** Derive UI state from ledger (with legacy fallback for one release), stabilise option order reconstruction, update All Questions view.
5.  **P5 – Persistence & Cleanup:** Extend export/import, remove legacy fields/caches, retire the feature flag and telemetry.
6.  **Styling & Accessibility:** During P4, separate focus vs selection visuals and verify keyboard flows with the existing a11y suite.

**Testing:**

- Follow the per-phase plan in Section 2 (“Testing Plan per Phase”).
- Maintain parity with baseline recordings captured in Phase 1 by comparing Playwright videos and snapshot diffs at the end of P4 and P5.

**Why Second:** This is a foundational change that other features depend on. Once state management is solid, import/export and UI improvements become safer and easier.

### Phase 3: Import/Export Completion (Critical User Feature)

**Goal:** Make content import/export work reliably across all browsers.

**Steps:**

1.  Create shared `downloadBlob` utility.
2.  Apply to all three export functions.
3.  Implement `handleLoadNewModule`.
4.  Complete question import flow with append/overwrite logic.
5.  Fix `readFileAsText` handler.
6.  Add schema versioning.
7.  Create E2E tests for import/export flows.

**Why Third:** With content rendering fixed (Phase 1) and state management solid (Phase 2), users can now safely import/export content and preserve their progress.

### Phase 4: Structural Refactor (Long-term Health)

**Goal:** Break down monolithic components and improve maintainability.

**Steps:**

1.  Extract `useQuizSession` hook from `app/page.tsx`.
2.  Extract `useImportExport` hook.
3.  Extract `useReviewScheduler` hook.
4.  Extract `useQuestionEditor` hook.
5.  Refactor `quiz-validation-refactored.ts` into smaller modules.
6.  Remove duplicate files and consolidate logic.

**Why Last:** This is important for long-term health but doesn't directly fix user-facing bugs. By doing it after the critical fixes, we ensure the refactored code is built on a solid foundation.

### Phase 5: UI/UX Polish (User Experience)

**Goal:** Fix inconsistent labels, toast timing, and editor validation.

**Steps:**

1.  Create `lib/constants/ui-copy.ts` and centralize all strings.
2.  Fix toast timing across all operations.
3.  Add client-side validation to question editor.
4.  Migrate modals to Radix Dialog with focus traps.
5.  Add accessibility tests.

**Why Last:** These are "polish" items that improve the experience but aren't blocking critical functionality. They're safe to do last because they have minimal dependencies.

---

## 8. Next Steps and Verification

To ensure the fixes are effective and do not introduce new regressions, the following steps must be taken after implementing the remediation strategies.

### Verification for Content Pipeline

1.  **Automated Tests:** Confirm that the re-enabled KaTeX test suite passes. Add new tests for round-trip import/export of content containing complex math to ensure no data corruption occurs.
2.  **Manual Testing:**
    - Load the `advanced-test-quiz.md` and `dsa-comprehensive-quiz.md` files and verify that all mathematical and pseudo-code notations render correctly.
    - Create a new question with complex LaTeX in the editor and confirm it renders correctly in the preview and the live quiz.
    - Test that explanations with math in the option text are no longer broken.

### Verification for State Management

1.  **Automated Tests:** Write new integration tests for the following scenarios:
    - Answer a question, navigate several questions forward, then navigate back. The original answer and its correctness status must be preserved.
    - Start a quiz and verify that the first question has no pre-selected options.
    - Answer several questions and then open the "All Questions" view. The progress bar and individual question statuses must reflect the main quiz state.
2.  **Manual Testing:**
    - Perform the automated test scenarios manually to confirm the user experience.
    - Check that the visual distinction between a _focused_ option and a _selected_ option is clear and unambiguous.

### Verification for Import/Export

1.  **Automated Tests:** Implement the end-to-end Playwright tests outlined in the remediation strategy. These tests should run on a CI server against a Chromium-based browser.
2.  **Manual Testing:**
    - On the latest versions of Chrome, Firefox, and Safari, test the "Load New Module", "Import State", and "Export State" functionalities. Confirm that files are downloaded correctly and can be re-imported.
    - Attempt to import a malformed or corrupted JSON file. The application should display a clear error message to the user instead of failing silently or crashing.

### Verification for Structural Maintainability

1.  **Code Review:** Conduct a thorough code review of the refactored hooks and utilities. Ensure they follow the single-responsibility principle and are well-documented.
2.  **Code Coverage:** Measure the unit test coverage for the new, smaller modules. Aim for high coverage on all business logic to prevent future regressions.
3.  **Onboarding Document:** As a final check, ask a developer unfamiliar with the changes to read the new code. They should be able to understand the purpose and data flow of the new hooks and utilities with minimal guidance.

This consolidated plan provides a clear path forward. By executing these steps in order, we will address the most critical user-facing issues while simultaneously improving the long-term health and maintainability of the codebase.

---

## 9. Risk Mitigation and Rollback Strategy

### Risk Assessment by Phase

**Phase 1 (Content Pipeline):**

- **Risk Level:** Medium
- **Impact if Failed:** Content may render incorrectly, but no data loss.
- **Mitigation:** Comprehensive KaTeX test suite, manual testing with diverse content.
- **Rollback:** Revert sanitizer schema changes and restore skipped tests.

**Phase 2 (State Management):**

- **Risk Level:** High
- **Impact if Failed:** Quiz state could become corrupted, SRS scheduling breaks.
- **Mitigation:** Extensive integration testing, gradual rollout of answer ledger.
- **Rollback:** Complex - requires careful migration strategy. Consider feature flag.

**Phase 3 (Import/Export):**

- **Risk Level:** Medium
- **Impact if Failed:** Users cannot import/export content, but existing functionality preserved.
- **Mitigation:** E2E tests across browsers, schema versioning for safe data migration.
- **Rollback:** Disable new import/export buttons, keep existing (broken) behavior as fallback.

**Phase 4 (Structural Refactor):**

- **Risk Level:** Low-Medium
- **Impact if Failed:** Code organization issues, but functionality should be preserved.
- **Mitigation:** Extract one hook at a time, ensure all tests pass before moving to next.
- **Rollback:** Revert individual hooks, monolithic component still functions.

**Phase 5 (UI/UX Polish):**

- **Risk Level:** Low
- **Impact if Failed:** Cosmetic issues only, no data corruption.
- **Mitigation:** Visual regression tests, accessibility audit.
- **Rollback:** Simple - revert styling and copy changes.

### Feature Flags

For high-risk changes (especially Phase 2), consider implementing feature flags:

```typescript
// lib/feature-flags.ts
export const FEATURE_FLAGS = {
  USE_ANSWER_LEDGER: process.env.NEXT_PUBLIC_ENABLE_ANSWER_LEDGER === 'true',
  USE_NEW_IMPORT_EXPORT: process.env.NEXT_PUBLIC_ENABLE_NEW_IMPORT === 'true',
} as const;
```

This allows gradual rollout and quick rollback without code deployment.

### Data Migration Strategy

For Phase 2 (answer ledger), implement a migration path:

1.  Add a version field to localStorage state.
2.  On app load, check version and migrate old state to new answer ledger format.
3.  Keep migration code in the codebase for at least 2 release cycles.
4.  Log migration successes/failures for monitoring.

### Monitoring and Observability

Add telemetry around critical paths:

1.  **Content Rendering:** Track sanitization errors, KaTeX parsing failures.
2.  **State Management:** Monitor state corruption, unexpected resets.
3.  **Import/Export:** Track success/failure rates by browser.
4.  **Performance:** Measure bundle size impact, rendering performance.

Use existing error boundaries and toast system to surface issues without breaking the app.

---

## 10. Success Criteria

This improvement plan will be considered successful when:

### User-Facing Success Metrics

1.  ✅ Math expressions render correctly without duplication (0 reports in user testing).
2.  ✅ Answer states persist correctly across navigation (100% accuracy in test suite).
3.  ✅ Import/export works on Chrome, Firefox, and Safari (100% success rate in E2E tests).
4.  ✅ No pre-selected options on fresh questions (verified in a11y tests).
5.  ✅ All Questions view shows accurate progress (matches main quiz state).

### Technical Success Metrics

1.  ✅ KaTeX test suite passes with 100% coverage of math syntax.
2.  ✅ Integration test suite covers all navigation flows with 0 failures.
3.  ✅ E2E test suite covers import/export with 0 flaky tests.
4.  ✅ `app/page.tsx` reduced to < 500 lines.
5.  ✅ No `console.log` statements in production validation code.
6.  ✅ Code coverage for business logic > 80%.

### Developer Experience Metrics

1.  ✅ New developers can understand the codebase within 2 hours (measured via onboarding survey).
2.  ✅ Time to implement new feature reduced by 50% (after Phase 4).
3.  ✅ CI build time remains < 10 minutes.
4.  ✅ Zero regressions introduced during refactoring (tracked via test suite).

---

## 11. Detailed Test Plan for Verification

This section provides specific, actionable test cases for verifying each fix. Execute these tests after implementing each phase to ensure the changes work correctly.

### Phase 1: Content Pipeline - KaTeX/Markdown Rendering Tests

#### Test 1.1: KaTeX MathML Preservation

**Objective:** Verify that MathML elements are not stripped by the sanitizer.

**Steps:**

1. Open the browser developer console.
2. Load a quiz with inline math (e.g., `$O(n^2)$`).
3. Inspect the rendered HTML for the math expression.
4. **Expected Result:** The DOM should contain `<span class="katex-mathml">` with nested `<math>`, `<semantics>`, and `<annotation>` tags.
5. **Failure Indicator:** If these tags are missing or the math appears duplicated (e.g., `O(n2)O(n^2)`), the sanitizer fix has failed.

#### Test 1.2: LaTeX Commands Render Correctly

**Objective:** Verify that LaTeX commands are not double-escaped.

**Steps:**

1. Create a test question with the following content:
   ```
   Which inequality is correct? $a \le b \rightarrow c \cdot d$
   ```
2. Save and view the question in the quiz.
3. **Expected Result:** The expression should render as mathematical symbols (≤, →, ·), not as escaped text (`\le`, `\rightarrow`, `\cdot`).
4. **Failure Indicator:** If backslashes or raw command names are visible, the `correctLatexInJsonContent` removal was incomplete.

#### Test 1.3: Import/Export Round-Trip Integrity

**Objective:** Ensure LaTeX content survives export and re-import without corruption.

**Steps:**

1. Load the `dsa-comprehensive-quiz.md` file.
2. Export the quiz state to JSON.
3. Clear the quiz state.
4. Re-import the exported JSON file.
5. Navigate through several questions with complex math.
6. **Expected Result:** All math expressions should render identically to the original load.
7. **Failure Indicator:** Any duplication, escaping, or missing symbols indicates corruption during export/import.

#### Test 1.4: Explanation Text with Math

**Objective:** Verify that explanations with mathematical expressions in option text render correctly.

**Steps:**

1. Create a question with an option containing math (e.g., "The complexity is $O(n \log n)$").
2. In the explanation, reference this option (e.g., "Option A is correct because...").
3. Submit an answer and view the explanation.
4. **Expected Result:** The math in both the option and the explanation should render correctly without duplication.
5. **Failure Indicator:** Broken math or duplicated text in the explanation.

#### Test 1.5: Pseudo-Code Formatting

**Objective:** Ensure code blocks maintain their structure.

**Steps:**

1. Load a question with pseudo-code in a fenced code block.
2. View the question.
3. **Expected Result:** The code should display as a formatted block, not inline text with `<br>` tags.
4. **Failure Indicator:** Code appearing as inline text or broken formatting.

---

### Phase 2: State Management - Answer Persistence Tests

#### Test 2.1: Answer Persistence Across Navigation

**Objective:** Verify that answer state is preserved when navigating away and back.

**Steps:**

1. Start a quiz and answer Question 1 correctly.
2. Navigate to Question 2.
3. Use the "Previous Question" button or navigation menu to return to Question 1.
4. **Expected Result:**
   - The previously selected option should be highlighted.
   - The "Correct" badge should still be visible.
   - The explanation should still be shown.
5. **Failure Indicator:** Option appears unselected, badge changes to incorrect, or UI resets.

#### Test 2.2: No Pre-Selection on Fresh Questions

**Objective:** Ensure new questions start with no options selected.

**Steps:**

1. Start a quiz and view Question 1.
2. **Before** clicking any option, observe the UI.
3. **Expected Result:** No option should have a selected/checked state. Only focus (subtle outline) may be visible on the first option for accessibility.
4. **Failure Indicator:** An option appears checked or has a filled background before interaction.

#### Test 2.3: All Questions View Synchronization

**Objective:** Verify that the "All Questions" view reflects actual progress.

**Steps:**

1. Start a quiz and answer Questions 1, 3, and 5 (skip 2 and 4).
2. Open the "All Questions" view.
3. **Expected Result:**
   - Progress bar shows 60% (3/5 answered).
   - Questions 1, 3, and 5 show as "answered" with correct/incorrect status.
   - Questions 2 and 4 show as "not attempted".
4. **Failure Indicator:** Progress shows 0%, or answered questions appear as unanswered.

#### Test 2.4: Historical Answer Review

**Objective:** Ensure viewing history doesn't corrupt answer status.

**Steps:**

1. Answer Question 1 correctly and move to Question 2.
2. Click "Previous Answer" to view your answer to Question 1.
3. Note the status (should be "Correct").
4. Exit history view and navigate back to Question 1 normally.
5. **Expected Result:** The status should still be "Correct" and match what you saw in history view.
6. **Failure Indicator:** Status flips to "Incorrect" or disappears.

#### Test 2.5: Option Order Stability

**Objective:** Verify that shuffled options remain stable during a session.

**Steps:**

1. Start a quiz and note the order of options in Question 1 (take a screenshot).
2. Navigate to Question 2, then return to Question 1.
3. Compare the option order.
4. **Expected Result:** Options should appear in the same order as before.
5. **Failure Indicator:** Options are re-shuffled, causing confusion.

#### Test 2.6: Focus vs. Selection Visual Distinction

**Objective:** Ensure users can distinguish focused from selected options.

**Steps:**

1. Start a quiz and press Tab to move focus to the option list.
2. Use arrow keys to move focus between options.
3. Click an option to select it.
4. **Expected Result:**
   - Focused state: Subtle outline or border.
   - Selected state: Filled background or check mark.
   - The two states should be visually distinct.
5. **Failure Indicator:** Focused options look identical to selected options.

---

### Phase 3: Import/Export - File Operations Tests

#### Test 3.1: Export State (Cross-Browser)

**Objective:** Verify file download works in all major browsers.

**For each browser (Chrome, Firefox, Safari):**

1. Answer a few questions in a quiz.
2. Click "Export State" from the dashboard or quiz menu.
3. **Expected Result:**
   - A JSON file downloads immediately.
   - Toast notification shows "State exported successfully" with filename.
4. **Failure Indicator:** No download occurs, or toast appears without file.

#### Test 3.2: Import State Restoration

**Objective:** Ensure exported state can be fully restored.

**Steps:**

1. Complete a full quiz session with various answers (correct, incorrect, skipped).
2. Export the state.
3. Clear browser localStorage or use an incognito window.
4. Import the exported state file.
5. **Expected Result:**
   - All answered questions show their previous state.
   - Progress indicators match the exported session.
   - You can resume from where you left off.
6. **Failure Indicator:** State appears empty or partially restored.

#### Test 3.3: Load New Module

**Objective:** Verify the "Load New Module" button works.

**Steps:**

1. From the dashboard, click "Load New Module".
2. Select a valid quiz JSON file.
3. **Expected Result:**
   - A confirmation modal appears.
   - After confirming, the quiz resets and loads the new content.
   - The dashboard shows the new quiz title and chapter count.
4. **Failure Indicator:** Nothing happens, or an error appears in the console.

#### Test 3.4: Import Questions (Append)

**Objective:** Test adding new questions to an existing quiz.

**Steps:**

1. Load a quiz with 10 questions.
2. Import a JSON file containing 5 new questions with "Append" mode.
3. **Expected Result:**
   - The quiz now has 15 questions.
   - Original questions are unchanged.
   - New questions appear at the end of the chapter.
4. **Failure Indicator:** Questions are not added, or original questions are modified.

#### Test 3.5: Import Questions (Overwrite)

**Objective:** Test replacing existing questions.

**Steps:**

1. Load a quiz and note Question 1's content.
2. Import a JSON file with a modified version of Question 1 using "Overwrite" mode.
3. View Question 1.
4. **Expected Result:** Question 1 now shows the new content from the imported file.
5. **Failure Indicator:** Original content persists, or question is duplicated.

#### Test 3.6: Import Error Handling

**Objective:** Ensure malformed files show clear error messages.

**Steps:**

1. Create a malformed JSON file (e.g., missing required fields, invalid syntax).
2. Attempt to import it.
3. **Expected Result:**
   - An error toast appears with a specific message (e.g., "Invalid JSON: Missing 'questions' field").
   - The app does not crash or freeze.
4. **Failure Indicator:** Silent failure, generic "Invalid format" message, or app crash.

#### Test 3.7: Markdown File Import

**Objective:** Verify Markdown quiz files can be loaded.

**Steps:**

1. Click "Load Quiz" and select `dsa-comprehensive-quiz.md`.
2. **Expected Result:**
   - The quiz loads successfully.
   - Questions are formatted correctly.
   - Math expressions render properly.
3. **Failure Indicator:** Parse errors, missing questions, or broken formatting.

---

### Phase 4: Structural Refactor - Code Quality Tests

#### Test 4.1: No Functional Regressions

**Objective:** Ensure extracted hooks don't break existing features.

**Steps:**

1. After extracting each hook (e.g., `useQuizSession`), run the full test suite.
2. **Expected Result:** All existing unit, integration, and E2E tests pass.
3. **Failure Indicator:** Any test failures that weren't present before the refactor.

#### Test 4.2: Code Coverage Verification

**Objective:** Maintain or improve test coverage after refactoring.

**Steps:**

1. Run `npm run test:coverage` (or equivalent) before refactoring.
2. Note the coverage percentage.
3. After refactoring, run coverage again.
4. **Expected Result:** Coverage percentage is equal to or greater than before.
5. **Failure Indicator:** Coverage drops significantly (>5%).

#### Test 4.3: Performance Benchmarking

**Objective:** Ensure refactoring doesn't degrade performance.

**Steps:**

1. Before refactoring, measure:
   - Quiz load time (time from clicking "Start Quiz" to first question visible).
   - Navigation time (time between questions).
   - Import time (time to import a 100-question JSON file).
2. After refactoring, measure the same metrics.
3. **Expected Result:** Performance metrics are within 10% of the baseline.
4. **Failure Indicator:** Any metric is >20% slower.

---

### Phase 5: UI/UX Polish - User Experience Tests

#### Test 5.1: Button Label Consistency

**Objective:** Verify consistent terminology across the app.

**Steps:**

1. Navigate through all major screens (dashboard, quiz session, completion, settings).
2. Note all button labels.
3. **Expected Result:**
   - "Next Question" is used consistently (not "Next Answer").
   - "Export" buttons use the same verb everywhere.
   - Terminology matches the centralized `ui-copy.ts` file.
4. **Failure Indicator:** Inconsistent labels across screens.

#### Test 5.2: Toast Notification Timing

**Objective:** Ensure toasts appear only after operations complete.

**Steps:**

1. Perform an export operation and watch for the toast.
2. Verify that the file download starts before or simultaneously with the toast.
3. Perform an import operation.
4. **Expected Result:**
   - "Export successful" toast appears AFTER file download starts.
   - "Import successful" toast appears AFTER data is committed to state.
5. **Failure Indicator:** Toast appears before the operation completes.

#### Test 5.3: Question Editor Validation

**Objective:** Verify that invalid questions cannot be saved.

**Steps:**

1. Open the question editor to create a new question.
2. Try to save with only 1 option (minimum is 2).
3. **Expected Result:**
   - An inline error message appears: "At least 2 options are required".
   - Save button remains disabled.
4. Add a second option but don't mark any as correct.
5. **Expected Result:** Error message: "At least 1 correct option is required".
6. Fix all errors and save.
7. **Expected Result:** Question saves successfully, no console errors.

#### Test 5.4: Modal Focus Trap

**Objective:** Ensure keyboard focus stays within modals.

**Steps:**

1. Open the question editor modal.
2. Press Tab repeatedly to cycle through focusable elements.
3. **Expected Result:**
   - Focus cycles within the modal only (input fields, buttons).
   - Pressing Tab from the last element returns focus to the first element.
   - Pressing Escape closes the modal.
4. **Failure Indicator:** Focus escapes to elements behind the modal.

#### Test 5.5: Responsive Layout

**Objective:** Verify the app works on mobile devices.

**Steps:**

1. Open the app on a mobile device or use browser dev tools to emulate one (e.g., iPhone 12, 375x812).
2. Navigate through a quiz.
3. **Expected Result:**
   - All content is readable without horizontal scrolling.
   - Math expressions wrap or scroll within cards.
   - Buttons are thumb-sized and easy to tap.
4. **Failure Indicator:** Content overflows, text is too small, or buttons are inaccessible.

---

### Phase 6: Integration & Regression Tests

#### Test 6.1: End-to-End Quiz Flow

**Objective:** Simulate a complete user journey.

**Steps:**

1. Load a quiz from a JSON file.
2. Answer 10 questions (mix of correct and incorrect).
3. View the "All Questions" view to review progress.
4. Export the state.
5. Use "Previous Answer" to review a past question.
6. Complete the remaining questions.
7. View the completion screen.
8. Export incorrect answers.
9. Restart the quiz.
10. Import the previously exported state.
11. **Expected Result:** Every step works without errors, and the final imported state matches the exported state.

#### Test 6.2: Accessibility Audit

**Objective:** Ensure the app meets WCAG 2.1 AA standards.

**Steps:**

1. Run Lighthouse accessibility audit on the main quiz page.
2. Use a screen reader (NVDA on Windows, VoiceOver on Mac) to navigate the quiz.
3. **Expected Result:**
   - Lighthouse score ≥ 90.
   - All interactive elements are announced correctly by the screen reader.
   - Keyboard navigation works without a mouse.
4. **Failure Indicator:** Low Lighthouse score, missing ARIA labels, or elements not reachable by keyboard.

#### Test 6.3: Performance Audit

**Objective:** Ensure the app performs well under load.

**Steps:**

1. Load a quiz with 500 questions.
2. Measure initial load time.
3. Navigate quickly through 50 questions.
4. Open the "All Questions" view.
5. **Expected Result:**
   - Initial load < 3 seconds.
   - Navigation is smooth with no lag.
   - "All Questions" view renders in < 2 seconds.
6. **Failure Indicator:** Slow load times, janky animations, or browser freezes.

---

### Test Execution Checklist

Use this checklist to track test completion after each phase:

**Phase 1: Content Pipeline**

- [ ] Test 1.1: KaTeX MathML Preservation
- [ ] Test 1.2: LaTeX Commands Render Correctly
- [ ] Test 1.3: Import/Export Round-Trip Integrity
- [ ] Test 1.4: Explanation Text with Math
- [ ] Test 1.5: Pseudo-Code Formatting

**Phase 2: State Management**

- [ ] Test 2.1: Answer Persistence Across Navigation
- [ ] Test 2.2: No Pre-Selection on Fresh Questions
- [ ] Test 2.3: All Questions View Synchronization
- [ ] Test 2.4: Historical Answer Review
- [ ] Test 2.5: Option Order Stability
- [ ] Test 2.6: Focus vs. Selection Visual Distinction

**Phase 3: Import/Export**

- [ ] Test 3.1: Export State (Chrome, Firefox, Safari)
- [ ] Test 3.2: Import State Restoration
- [ ] Test 3.3: Load New Module
- [ ] Test 3.4: Import Questions (Append)
- [ ] Test 3.5: Import Questions (Overwrite)
- [ ] Test 3.6: Import Error Handling
- [ ] Test 3.7: Markdown File Import

**Phase 4: Structural Refactor**

- [ ] Test 4.1: No Functional Regressions
- [ ] Test 4.2: Code Coverage Verification
- [ ] Test 4.3: Performance Benchmarking

**Phase 5: UI/UX Polish**

- [ ] Test 5.1: Button Label Consistency
- [ ] Test 5.2: Toast Notification Timing
- [ ] Test 5.3: Question Editor Validation
- [ ] Test 5.4: Modal Focus Trap
- [ ] Test 5.5: Responsive Layout

**Phase 6: Final Integration**

- [ ] Test 6.1: End-to-End Quiz Flow
- [ ] Test 6.2: Accessibility Audit
- [ ] Test 6.3: Performance Audit

---

**Document Status:** Ready for implementation. All critical issues from audits have been consolidated, prioritized, and sequenced for safe execution.
