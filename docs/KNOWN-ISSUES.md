# Bug Report: Quiz-SRS Application

**Generated:** December 2, 2025  
**Analysis Method:** Full codebase review with call stack evaluation + Sequential Thinking deep analysis

---

## Deep Analysis Bugs (Hidden/Subtle Issues)

### D1. **Silent Failure Path in handleLoadQuiz JSON Branch**

**File:** [app/page.tsx](app/page.tsx#L776-L850)  
**Severity:** Critical  
**Type:** Control Flow Bug

**Description:**  
In the JSON loading path, if `JSON.parse()` fails and `validateAndCorrectQuizModule()` returns a truthy `correctionResult` but a FALSY `correctedModule`, the function silently completes without loading any module or showing an error.

**Call Stack:**

```
handleLoadQuiz()
  → try { JSON.parse() } // fails
  → catch { validateAndCorrectQuizModule() }
    → correctionResult = { ... } // truthy
    → correctedModule = undefined // falsy
  → if (correctedModule) { return; } // skipped
  → if (!correctionResult) { ... } // skipped because correctionResult is truthy!
  → // NO CODE RUNS - silent failure
```

**Impact:** User sees loading complete but no module is loaded, dashboard shows nothing.

**Fix:** Add else clause or restructure control flow to handle all cases.

---

### D2. **Race Condition: Import Uses Stale Chapter Context**

**File:** [app/page.tsx](app/page.tsx#L1015-1095)  
**Severity:** High  
**Type:** Race Condition

**Description:**  
`handleInitiateImportCurrentQuestionState` captures `currentChapterId` at function start, then does async file reading. When the confirmation modal is shown and user confirms, `handleConfirmOverwriteCurrentQuestion` uses the CURRENT `currentChapterId` state - which may have changed if user navigated.

**Stale Data Flow:**

```
1. User on Chapter A, Question 1
2. Clicks Import, captures currentChapterId = "A"
3. Async file read starts...
4. User navigates to Chapter B (before confirming)
5. currentChapterId is now "B"
6. User confirms overwrite
7. Code searches for question in Chapter B (wrong chapter!)
8. Question not found → silent failure
```

**Impact:** Question overwrite silently fails or modifies wrong chapter.

**Fix:** Store chapterId in `pendingOverwriteData` object, not rely on current state.

---

### D3. **Zero Correct Options = Impossible Question**

**File:** [components/quiz-session.tsx](components/quiz-session.tsx#L175-L183)  
**Severity:** High  
**Type:** Data Integrity Bug

**Description:**  
If `correctOptionIds` contains IDs that don't exist in `options` (data corruption or import error), `correctOptions` will be empty. The question will only display incorrect options, making it impossible to answer correctly.

**Code:**

```typescript
const correctOptions = question.options.filter((opt) =>
  question.correctOptionIds.includes(opt.optionId),
);
// If correctOptions.length === 0, NO correct option is added to display!
```

**Impact:** User cannot pass the question, SRS level never increases, stuck in review loop.

**Fix:** Add validation check; if no correct options found, show error or skip question.

---

### D4. **srsLevel || 0 Treats Negative Values as Valid**

**File:** [app/page.tsx](app/page.tsx#L1553), [utils/quiz-validation-refactored.ts](utils/quiz-validation-refactored.ts#L711)  
**Severity:** Medium  
**Type:** Type Safety Gap

**Description:**  
The pattern `srsLevel || 0` treats negative numbers as valid because they're truthy. If imported data has `srsLevel: -1`, calculations like `srsLevel + 1 = 0` produce incorrect results.

**Example:**

```typescript
const newSrsLevel = Math.min((targetQuestion.srsLevel || 0) + 1, 2);
// If srsLevel is -1: Math.min(-1 + 1, 2) = Math.min(0, 2) = 0
// Expected: Should reject or clamp to 0 first
```

**Impact:** SRS progression behaves incorrectly with corrupted data.

**Fix:** Use `Math.max(0, srsLevel ?? 0)` or add validation.

---

### D5. **History Snapshot Uses Wrong Question State**

**File:** [app/page.tsx](app/page.tsx#L1617-L1627)  
**Severity:** Medium  
**Type:** Stale Data Bug

**Description:**  
When adding to session history, the code snapshots `currentQuestion`:

```typescript
questionSnapshot: JSON.parse(JSON.stringify(currentQuestion)),
```

But `currentQuestion` is from BEFORE the `setCurrentModule(updatedModule)` call, so it doesn't reflect the updated SRS state from this answer.

**Impact:** Historical view shows pre-update state (wrong srsLevel, status).

**Fix:** Snapshot `targetQuestion` (the mutated copy) instead of `currentQuestion`.

---

### D6. **answerRecords Persist Across Chapter Switches**

**File:** [app/page.tsx](app/page.tsx#L1259-L1269)  
**Severity:** Medium  
**Type:** State Leakage

**Description:**  
When starting a quiz (`handleStartQuiz`), answerRecords is reset:

```typescript
setAnswerRecords({});
```

But when navigating TO a chapter FROM another (not via "Start Quiz"), answerRecords may not be cleared. If two chapters have questions with the same ID pattern, old answers could appear.

**Impact:** Previously answered questions may show stale selection on navigation.

---

### D7. **JSON.stringify Loses undefined Properties**

**File:** Multiple locations using `JSON.parse(JSON.stringify(obj))`  
**Severity:** Low  
**Type:** Subtle Data Mutation

**Description:**  
Deep cloning via `JSON.parse(JSON.stringify())` removes properties with `undefined` values. After cloning, checking `'lastSelectedOptionId' in question` behaves differently than before cloning.

**Example:**

```typescript
const original = { id: 'q1', lastSelectedOptionId: undefined };
const cloned = JSON.parse(JSON.stringify(original));
// cloned = { id: 'q1' }  // lastSelectedOptionId is GONE

'lastSelectedOptionId' in original; // true
'lastSelectedOptionId' in cloned; // false
```

**Impact:** Code that checks property existence vs undefined value may behave incorrectly.

---

### D8. **Keyboard Event Handler Collision in AccessibleOptionList**

**File:** [components/a11y/AccessibleOptionList.tsx](components/a11y/AccessibleOptionList.tsx#L73-L77)  
**Severity:** Low  
**Type:** Duplicate Event Handling

**Description:**  
Both the wrapper `div` and individual option `div`s have `onKeyDown` handlers for Enter/Space:

```typescript
// Wrapper div
onKeyDown={handleKeyDown}  // handles Enter/Space

// Option div
onKeyDown={(e) => {
  if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    onSelectOption(option.optionId);
  }
}}
```

If focus is on an option, BOTH handlers fire, potentially selecting twice.

**Impact:** Double selection events, possible state inconsistency.

**Fix:** Stop propagation in option's keydown handler.

---

### D9. **useToast Effect Has Incorrect Dependency**

**File:** [components/ui/use-toast.ts](components/ui/use-toast.ts#L119-L128)  
**Severity:** Medium  
**Type:** React Hook Bug

**Description:**  
The `useToast` hook's effect has `state` in its dependency array:

```typescript
React.useEffect(() => {
  listeners.push(setState);
  return () => {
    const index = listeners.indexOf(setState);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}, [state]); // <-- BUG: Should be []
```

Every time a toast is added/removed, `state` changes, triggering:

1. Cleanup runs (removes listener)
2. Effect runs (adds listener back)
3. During this gap, a dispatch could be missed

**Impact:** Toast updates may be missed in edge cases with rapid toast operations.

**Fix:** Change dependency array from `[state]` to `[]`.

---

### D10. **Non-Deterministic ID Generation with Date.now()**

**File:** [utils/quiz-validation-refactored.ts](utils/quiz-validation-refactored.ts#L956)  
**Severity:** Medium  
**Type:** Determinism Bug

**Description:**  
When parsing Markdown, missing IDs are generated using `Date.now()`:

```typescript
chapterId = `chapter_${chapters.length + 1}_${Date.now()}`;
questionId = `${chapterId}_q${questionCounterInChapter}_${Date.now()}`;
```

**Problems:**

1. Same Markdown parsed twice produces DIFFERENT IDs
2. Exported state won't match if user re-imports original Markdown
3. In fast loops, multiple items could get same timestamp (collision)
4. Makes unit testing harder (non-deterministic output)

**Impact:** State portability issues, potential ID collisions.

**Fix:** Use content hash or sequential counters instead of timestamps.

---

### D11. **Incorrect XSS Pattern Escaping**

**File:** [components/rendering/MarkdownRenderer.tsx](components/rendering/MarkdownRenderer.tsx#L53)  
**Severity:** Medium  
**Type:** Security Bug

**Description:**  
The XSS detection regex has incorrect escaping:

```typescript
const disallowed = /<script\b|\\son\\w+=|javascript:/i.test(normalizedHtml);
//                         ^^^^ This matches literal "\s" not whitespace
```

The pattern `\\son` matches the literal string `\son`, not "whitespace followed by on".
Should be `\son` to match event handlers like ` onclick=`.

**Impact:** Some XSS vectors using event handlers could slip through.

**Fix:** Change `\\son\\w+=` to `\s+on\w+=`.

---

### D12. **Module Export Flow Has Implicit Race**

**File:** [app/page.tsx](app/page.tsx#L1243-1258)  
**Severity:** Low  
**Type:** State Consistency

**Description:**  
In `handleExportState`, the module is exported directly without ensuring pending state updates have been flushed:

```typescript
const handleExportState = () => {
  if (!currentModule) return;
  const dataStr = JSON.stringify(currentModule, null, 2);
  // ... export
};
```

If called immediately after submitting an answer, React's state batching might mean `currentModule` doesn't yet reflect the answer.

**Impact:** Exported state might be missing the most recent answer.

**Fix:** Use a ref to track pending updates or add explicit state sync.

---

## Critical Bugs (P0)

### 1. **Duplicate FileReader `onload` Handler Assignment**

**File:** [app/page.tsx](app/page.tsx#L445-L454)  
**Severity:** Critical  
**Type:** Logic Error

**Description:**  
The `readFileAsText` function assigns `reader.onload` twice, which overwrites the first handler. The first assignment is incomplete and would never resolve the promise if it were the active handler.

**Call Stack:**

```
handleLoadQuiz() → readFileAsText() → FileReader.onload (assigned twice!)
```

**Code:**

```typescript
// Line 445-454 - DUPLICATE HANDLERS
reader.onload = (event) => {
  const result = event.target?.result;
  if (typeof result === 'string') {
    resolve(result);
  }
};
reader.onload = (event) => {
  // OVERWRITES FIRST HANDLER
  const result = event.target?.result;
  if (typeof result === 'string') {
    resolve(result);
  } else {
    reject(new Error('Failed to read file as text'));
  }
};
```

**Impact:** Potential file reading failures with no error handling on first handler.

**Fix:** Remove the duplicate `reader.onload` assignment.

---

### 2. **Race Condition in Mermaid Diagram Rendering**

**File:** [components/rendering/MarkdownRenderer.tsx](components/rendering/MarkdownRenderer.tsx#L74-L95)  
**Severity:** Critical  
**Type:** Race Condition

**Description:**  
Mermaid rendering uses `document.querySelectorAll('.mermaid')` which may select nodes from OTHER MarkdownRenderer instances on the same page, causing duplicate rendering attempts or conflicts.

**Call Stack:**

```
MarkdownRenderer.useEffect (hasMermaid) → mermaid.run() → document.querySelectorAll('.mermaid')
```

**Impact:** Multiple quiz questions/explanations with mermaid diagrams may interfere with each other.

**Fix:** Scope the mermaid node selection to the component's container using `useRef`.

---

### 3. **All Questions View Progress Shows 0% Due to Missing answerRecords Prop**

**File:** [app/page.tsx](app/page.tsx#L1085-L1092)  
**Severity:** Critical  
**Type:** Missing Data Flow

**Description:**  
`AllQuestionsView` requires `answerRecords` prop to display progress, but it's never passed from the parent. The component receives an empty default `{}`, causing all questions to appear unanswered.

**Call Stack:**

```
MCQQuizForge.renderCurrentView() → AllQuestionsView(answerRecords={})  // Missing!
```

**Code:**

```typescript
// Line 1085-1092 - answerRecords NOT PASSED
<AllQuestionsView
  chapter={allQuestionsChapter}
  onBackToQuiz={handleBackToQuizFromAllQuestions}
  onBackToDashboard={handleBackToDashboard}
  onRetryChapter={handleRetryChapter}
  isReviewSession={isReviewSessionActive}
  // MISSING: answerRecords={answerRecords}
/>
```

**Impact:** All Questions View always shows 0% progress regardless of actual answers.

**Fix:** Pass `answerRecords={answerRecords}` to the component.

---

## High Priority Bugs (P1)

### 4. **LaTeX Duplication in Display Math**

**File:** [lib/markdown/pipeline.ts](lib/markdown/pipeline.ts#L67-L81)  
**Severity:** High  
**Type:** Content Rendering Bug

**Description:**  
The `preprocessDisplayMath` function attempts to normalize `$$...$$` delimiters but may cause KaTeX to render both the raw LaTeX text AND the formatted output if the sanitizer or rehype chain mishandles intermediate states.

**Call Stack:**

```
MarkdownRenderer → processMarkdown() → preprocessDisplayMath() → unified pipeline → rehypeKatex
```

**Evidence from contracts:**

```typescript
// content-rendering.contract.test.ts
// BAD: "The complexity is O(n2)O(n^2)" (duplicated)
```

**Impact:** Math expressions may appear twice - once as raw text and once rendered.

**Fix:** Review the pipeline order; ensure `rehypeSanitize` runs AFTER `rehypeKatex` and preserves all KaTeX elements.

---

### 5. **Incorrect Answer Feedback Not Showing Both States**

**File:** [components/option-card.tsx](components/option-card.tsx#L19-L48)  
**Severity:** High  
**Type:** UI Logic Bug

**Description:**  
After submitting an incorrect answer, the correct answer's green highlight may not be visible simultaneously with the user's incorrect selection's red highlight. The `getCardClasses` logic handles `showAsCorrect` and `showAsIncorrect` as mutually exclusive states, but the parent (`AccessibleOptionList`) only sets one of these per option.

**Call Stack:**

```
QuizSession → AccessibleOptionList → OptionCard.getCardClasses()
```

**Code in AccessibleOptionList:**

```typescript
// Line 104-107 - Logic is correct here
const displayState = {
  isSelected,
  showAsCorrect: isSubmitted && isCorrect,
  showAsIncorrect: isSubmitted && isSelected && !isCorrect,
};
```

**Note:** After review, the logic appears correct. Verify with E2E tests.

---

### 6. **SRS State Inconsistency: Status vs srsLevel Mismatch**

**File:** [app/page.tsx](app/page.tsx#L791-L821)  
**Severity:** High  
**Type:** Data Integrity Bug

**Description:**  
When updating question state after an answer, the logic sets `srsLevel` and `status` independently. If `srsLevel >= 2`, status is set to `'mastered'`, but there's no inverse check - a question could theoretically have `status: 'mastered'` with `srsLevel: 0` after an import.

**Call Stack:**

```
handleSubmitAnswer() → targetQuestion.status = 'mastered' (only if srsLevel >= 2)
```

**Code:**

```typescript
// Line 791-798
const newSrsLevel = Math.min((targetQuestion.srsLevel || 0) + 1, 2);
targetQuestion.srsLevel = newSrsLevel;

if (newSrsLevel >= 2) {
  targetQuestion.status = 'mastered'; // OK
  targetQuestion.nextReviewAt = null;
} else {
  targetQuestion.status = 'passed_once'; // What about 'attempted'?
}
```

**Impact:** Imported data with inconsistent status/srsLevel may not be caught and could cause SRS logic failures.

**Fix:** Add validation in `normalizeSingleQuestion` to ensure status matches srsLevel.

---

### 7. **Question Editor Not Receiving `chapterId` Prop**

**File:** [components/quiz-session.tsx](components/quiz-session.tsx#L586-L593)  
**Severity:** High  
**Type:** Missing Prop

**Description:**  
The `QuestionEditor` component interface requires `chapterId` prop, but it's destructured away in the component definition (`Omit<QuestionEditorProps, 'chapterId'>`). However, the editor may need chapter context for proper ID generation.

**Interface in question-editor.tsx:**

```typescript
interface QuestionEditorProps {
  isOpen: boolean;
  question: QuizQuestion;
  chapterId: string; // Required but never used
  // ...
}
```

**Usage in quiz-session.tsx:**

```typescript
export function QuestionEditor({
  // ...
}: Omit<QuestionEditorProps, 'chapterId'>) {  // Explicitly removed
```

**Impact:** Potential for duplicate question IDs if chapter context is needed.

---

### 8. **Navigation State Lost on History Navigation Exit**

**File:** [app/page.tsx](app/page.tsx#L128-L148)  
**Severity:** High  
**Type:** State Management Bug

**Description:**  
The `applyAnswerRecordToQuestion` effect runs when navigating between questions but doesn't handle the transition from history view back to live question cleanly. If `currentHistoryViewIndex` is cleared while viewing history, the effect may restore incorrect state.

**Call Stack:**

```
useEffect (appState changes) → applyAnswerRecordToQuestion() → setSelectedOptionId/setIsSubmitted
```

**Code:**

```typescript
// Line 128-148
useEffect(() => {
  if (appState !== 'quiz') return;
  if (currentHistoryViewIndex !== null) return;  // Exits early for history

  // For live questions, applies answerRecords
  // BUT: No cleanup when exiting history view
}, [appState, currentChapterId, currentQuestionIndex, ...]);
```

**Impact:** Potential for stale selection state when returning from history view to live question.

---

## Medium Priority Bugs (P2)

### 9. **Regex Pattern Allows Potential XSS Through Malformed Patterns**

**File:** [lib/markdown/pipeline.ts](lib/markdown/pipeline.ts#L49-L65)  
**Severity:** Medium  
**Type:** Security Concern

**Description:**  
The sanitization regex in `MarkdownRenderer.tsx` (`/<script\b|\\son\\w+=|javascript:/i`) uses `\\s` which matches literal `\s` not whitespace. Should be `\s`.

**File:** [components/rendering/MarkdownRenderer.tsx](components/rendering/MarkdownRenderer.tsx#L53)

**Code:**

```typescript
const disallowed = /<script\b|\\son\\w+=|javascript:/i.test(normalizedHtml);
//                         ^^^^ This is wrong - matches literal \s
```

**Fix:** Change `\\son` to `\son` or `\s+on` to properly match event handlers.

---

### 10. **DisplayedOptions Not Stable Across Re-renders**

**File:** [components/quiz-session.tsx](components/quiz-session.tsx#L93-L162)  
**Severity:** Medium  
**Type:** UI Stability Bug

**Description:**  
The `generateDisplayedOptions` function uses `Math.random()` for shuffling, but it's called within a `useEffect` that may re-run on unrelated state changes. While there's a `questionChanged` guard, certain edge cases could cause options to reshuffle unexpectedly.

**Call Stack:**

```
QuizSession useEffect → generateDisplayedOptions() → sort(() => Math.random() - 0.5)
```

**Impact:** Options could reshuffle mid-question in edge cases, confusing users.

**Fix:** Use a seeded random number generator based on `question.questionId`.

---

### 11. **Chapter Statistics Can Become Stale**

**File:** [utils/quiz-validation-refactored.ts](utils/quiz-validation-refactored.ts#L296-L302)  
**Severity:** Medium  
**Type:** Data Consistency Bug

**Description:**  
`recalculateChapterStats` updates chapter stats but is only called in specific places. If a question state changes without calling this function, the chapter stats become inconsistent with actual question states.

**Places where recalculate is called:**

- `handleSaveQuestion` ✓
- `handleDeleteQuestion` ✓
- `handleSubmitAnswer` ✓
- `handleRetryChapter` ✓

**Places where it might be missed:**

- After import if questions are modified
- After markdown parsing

---

### 12. **Incorrect Export Filename Uses String Split**

**File:** [app/page.tsx](app/page.tsx#L896)  
**Severity:** Low  
**Type:** String Handling

**Description:**  
The export filename generation uses `.split('T')[0]` which will fail if `toISOString()` ever returns a different format.

**Code:**

```typescript
link.download = `quiz-state-${new Date().toISOString().split('T')[0]}.json`;
```

**Impact:** Minor - unlikely to fail but not robust.

**Fix:** Use `toLocaleDateString()` or proper date formatting.

---

## Low Priority Bugs (P3)

### 13. **Missing aria-describedby Reference**

**File:** [components/a11y/AccessibleQuestionGrid.tsx](components/a11y/AccessibleQuestionGrid.tsx#L131)  
**Severity:** Low  
**Type:** Accessibility Warning

**Description:**  
The button has `aria-describedby={question-status-${index}}` but no element with that ID exists in the DOM.

**Impact:** Screen readers may warn about missing reference.

---

### 14. **Unused Variable `_onSelect` Pattern**

**File:** [components/option-card.tsx](components/option-card.tsx#L20)  
**Severity:** Low  
**Type:** Code Quality

**Description:**  
The prop is renamed to `_onSelect` but then used without the underscore pattern being consistent.

---

### 15. **Console Logs in Production**

**Files:** Multiple files  
**Severity:** Low  
**Type:** Code Quality

**Description:**  
Extensive `console.log` statements throughout the codebase that should be removed or gated for production.

---

### 16. **Commented-Out Code Blocks**

**File:** [components/quiz-session.tsx](components/quiz-session.tsx#L196-L235)  
**Severity:** Low  
**Type:** Code Quality

**Description:**  
Large commented-out code block `_getOptionDisplayState` should be removed if not needed.

---

## Potential Race Conditions

### 17. **Async Import State Update Race**

**File:** [app/page.tsx](app/page.tsx#L536-L595)  
**Severity:** Medium  
**Type:** Race Condition

**Description:**  
`handleImportState` performs async operations and sets multiple state variables sequentially. If the user triggers another action during this process, state could become inconsistent.

**Call Stack:**

```
handleImportState() → readFileAsText() → validateAndCorrectQuizModule()
  → setCurrentModule() → setAnswerRecords() → setCurrentChapterId() → ...
```

**Fix:** Use a loading state lock or batch state updates.

---

### 18. **Review Session Completion Race**

**File:** [app/page.tsx](app/page.tsx#L412-L432)  
**Severity:** Low  
**Type:** Race Condition

**Description:**  
`loadNextReviewQuestion` may call `setAppState('dashboard')` while another async operation is pending, causing a flash of incorrect UI.

---

## Type Safety Issues

### 19. **Missing Optional Chaining on `question.srsLevel`**

**File:** [lib/quiz/generate-displayed-options.tsx](lib/quiz/generate-displayed-options.tsx#L23)  
**Severity:** Low  
**Type:** Type Safety

**Description:**  
`question.srsLevel` is optional (`srsLevel?: number`) but used without null check:

```typescript
const correctIndex = question.srsLevel ? question.srsLevel % correctOptions.length : 0;
```

This works due to falsy check, but relies on `0` being treated as falsy which may not be intended.

---

### 20. **Inconsistent Question Type Handling**

**File:** [types/quiz-types.ts](types/quiz-types.ts#L14)  
**Severity:** Low  
**Type:** Type Design

**Description:**  
`type?: 'mcq' | 'true_false'` is optional but used in validation. Some code paths don't check for undefined.

---

## Summary

| Priority                   | Count  | Categories                                             |
| -------------------------- | ------ | ------------------------------------------------------ |
| **Deep Analysis (D1-D12)** | 12     | Silent failures, Race conditions, State bugs, Security |
| P0 (Critical)              | 3      | FileReader bug, Race condition, Missing prop           |
| P1 (High)                  | 5      | LaTeX, Feedback, SRS, Editor, Navigation               |
| P2 (Medium)                | 4      | Security, Stability, Stats, Filename                   |
| P3 (Low)                   | 7      | A11y, Code quality, Types                              |
| **Total**                  | **31** |                                                        |

### Most Critical Issues (Fix First):

| ID  | Issue                          | Complexity | Impact                      |
| --- | ------------------------------ | ---------- | --------------------------- |
| D1  | Silent failure in JSON loading | Easy       | High - Users see no error   |
| D2  | Import race condition          | Medium     | High - Data corruption      |
| D3  | Zero correct options           | Easy       | High - Impossible questions |
| 1   | Duplicate FileReader handler   | Easy       | Medium - Potential failures |
| 3   | Missing answerRecords prop     | Easy       | High - 0% progress always   |
| D11 | XSS regex escape               | Easy       | Medium - Security gap       |
| D9  | useToast dependency            | Easy       | Low - Missed toasts         |

### Root Cause Analysis:

**Pattern 1: Async/State Race Conditions** (D1, D2, 17, 18)

- Functions capture state at start but use it after async operations
- Fix: Store context in refs or pass as parameters

**Pattern 2: Missing Defensive Checks** (D3, D4, 11)

- Code assumes data is valid even after potential corruption
- Fix: Add runtime validation at critical points

**Pattern 3: React Hook Misuse** (D9, D8)

- Incorrect dependency arrays, duplicate event handlers
- Fix: Lint rules, code review

**Pattern 4: Deep Clone Issues** (D7)

- JSON.stringify/parse loses undefined properties
- Fix: Use structuredClone() or lodash.cloneDeep()

### Call Stack Analysis Summary:

```
handleLoadQuiz()
├── readFileAsText() ← BUG #1: Duplicate onload
├── if (isMarkdownFile) → parseMarkdownToQuizModule()
│   └── [Date.now() IDs] ← BUG D10
└── else (JSON)
    ├── JSON.parse() OK → validate → setCurrentModule()
    └── JSON.parse() FAIL
        ├── validateAndCorrectQuizModule()
        │   ├── correctedModule exists → setCurrentModule() + return ✓
        │   └── correctedModule undefined, correctionResult truthy
        │       └── [SILENT FAILURE] ← BUG D1
        └── if (!correctionResult) → [skipped]

handleSubmitAnswer()
├── getCurrentQuestion() ← captures current state
├── JSON.parse(JSON.stringify(currentModule)) ← BUG D7: loses undefined
├── update targetQuestion.srsLevel
│   └── || 0 pattern ← BUG D4: negative values pass
├── setCurrentModule(updatedModule)
├── setAnswerRecords()
└── setSessionHistory()
    └── JSON.parse(JSON.stringify(currentQuestion)) ← BUG D5: pre-update state

handleInitiateImportCurrentQuestionState()
├── getCurrentQuestion() ← captures currentChapterId
├── await readFileAsText() ← USER COULD NAVIGATE HERE
├── [validation]
└── setShowOverwriteCurrentQuestionConfirmation(true)
    └── handleConfirmOverwriteCurrentQuestion()
        └── uses currentChapterId ← BUG D2: could be stale!
```
