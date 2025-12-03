# File Reference Map & Call Stack Analysis

**Generated:** December 3, 2025  
**Analyzer:** [scripts/codebase-analyzer.ts](../scripts/codebase-analyzer.ts)

---

## Quick Reference Commands

### Find Where a File is Imported

```powershell
# PowerShell - Find all imports of a specific file
Select-String -Path "**/*.tsx","**/*.ts" -Pattern "from ['\"].*component-name" -Exclude "node_modules/*"
```

### Find Function Usages

```powershell
# Find where a function is called
Select-String -Path "**/*.tsx","**/*.ts" -Pattern "functionName\(" -Exclude "node_modules/*"
```

### Verify No Imports Before Deletion

```powershell
# Check if file is imported anywhere
$file = "generate-displayed-options"
Get-ChildItem -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern $file
```

---

## Entry Points

### Next.js Pages (Auto-discovered)

| File              | Type     | Imports From                                                               |
| ----------------- | -------- | -------------------------------------------------------------------------- |
| app/page.tsx      | Page     | welcome-screen, dashboard, quiz-session, quiz-complete, all-questions-view |
| app/layout.tsx    | Layout   | ScreenReaderAnnouncer, @vercel/analytics                                   |
| app/test/page.tsx | Dev Page | None (self-contained)                                                      |

### Config Files

| File                 | Purpose                    |
| -------------------- | -------------------------- |
| next.config.mjs      | Next.js configuration      |
| tailwind.config.ts   | Tailwind CSS configuration |
| tsconfig.json        | TypeScript main config     |
| vitest.config.ts     | Unit test configuration    |
| playwright.config.ts | E2E test configuration     |

---

## Core Component Call Stack

### app/page.tsx → Component Tree

```
app/page.tsx (MCQQuizForge)
├── WelcomeScreen (appState === 'welcome')
│   └── Button (Load Quiz, Load Default)
│
├── Dashboard (appState === 'dashboard')
│   ├── ChapterCard[] (one per chapter)
│   └── Buttons (Start Review, Export, Import)
│
├── QuizSession (appState === 'quiz')
│   ├── ProgressBar
│   ├── QuestionNavigationMenu
│   ├── MarkdownRenderer (question text)
│   ├── OptionCard[] or AccessibleOptionList
│   ├── QuestionEditor (edit mode)
│   └── ConfirmationModal (confirmations)
│
├── QuizComplete (appState === 'complete')
│   └── Buttons (Retry, Dashboard, Next Chapter)
│
├── AllQuestionsView (appState === 'allQuestions')
│   └── Question cards with MarkdownRenderer
│
├── Toaster (global toast notifications)
└── ConfirmationModal (import confirmations)
```

---

## Import Dependency Map

### Components Imported by app/page.tsx

| Component         | Path                                  | Used For            |
| ----------------- | ------------------------------------- | ------------------- |
| WelcomeScreen     | @/components/welcome-screen           | Initial load screen |
| Dashboard         | @/components/dashboard                | Module overview     |
| QuizSession       | @/components/quiz-session             | Quiz interaction    |
| QuizComplete      | @/components/quiz-complete            | Results display     |
| AllQuestionsView  | @/components/all-questions-view       | Question review     |
| Toaster           | @/components/ui/toaster               | Toast notifications |
| ConfirmationModal | @/components/confirmation-modal-radix | Confirm dialogs     |

### Utility Imports in app/page.tsx

| Module                     | Path                               | Functions Used      |
| -------------------------- | ---------------------------------- | ------------------- |
| use-toast                  | @/components/ui/use-toast          | useToast, toast     |
| quiz-validation-refactored | @/utils/quiz-validation-refactored | \* (dynamic import) |

---

## Library Dependencies

### lib/markdown/ Call Chain

```
components/rendering/MarkdownRenderer.tsx
└── imports processMarkdown from
    └── lib/markdown/pipeline.ts
        ├── remark-parse
        ├── remark-gfm
        ├── remark-math
        ├── remark-rehype
        ├── rehype-raw
        ├── rehype-katex
        ├── rehype-sanitize
        └── rehype-stringify
```

### lib/quiz/ Usage

```
components/quiz-session.tsx
├── INLINE generateDisplayedOptions (DUPLICATE - should import)
│
lib/quiz/generate-displayed-options.tsx
└── Imported by:
    └── (Should be imported by quiz-session.tsx)
    └── tests/unit/lib/quiz/generate-displayed-options.test.ts
```

---

## Dead Code File Map

### Files With ZERO Imports (Safe to Delete)

| File                                          | Verified Dead  | Test File to Delete                                           |
| --------------------------------------------- | -------------- | ------------------------------------------------------------- |
| lib/markdown/latex-processor.ts               | ✅             | tests/unit/lib/markdown/latex-processor.test.ts               |
| lib/markdown/sync-pipeline.ts                 | ✅             | tests/unit/lib/markdown/sync-pipeline.test.ts                 |
| lib/markdown/working-pipeline.ts              | ✅             | tests/unit/lib/markdown/working-pipeline.test.ts              |
| components/ui/use-mobile.tsx                  | ✅ (duplicate) | None                                                          |
| hooks/use-toast.ts                            | ✅             | tests/unit/hooks/use-toast.test.ts                            |
| components/a11y/DashboardWithInlineErrors.tsx | ✅             | tests/unit/components/a11y/DashboardWithInlineErrors.test.tsx |
| components/a11y/InlineErrorHandler.tsx        | ✅             | tests/unit/components/a11y/InlineErrorHandler.test.tsx        |

---

## Duplicate Code Locations

### generateDisplayedOptions (DUPLICATE)

| Location                                | Lines     | Status             |
| --------------------------------------- | --------- | ------------------ |
| lib/quiz/generate-displayed-options.tsx | ~90 lines | CANONICAL          |
| components/quiz-session.tsx             | ~50 lines | DUPLICATE - DELETE |

### use-mobile Hook (DUPLICATE)

| Location                     | Lines    | Status             |
| ---------------------------- | -------- | ------------------ |
| hooks/use-mobile.tsx         | 19 lines | CANONICAL          |
| components/ui/use-mobile.tsx | 19 lines | DUPLICATE - DELETE |

### use-toast Hook (DIFFERENT IMPLEMENTATIONS)

| Location                   | Implementation        | Status          |
| -------------------------- | --------------------- | --------------- |
| components/ui/use-toast.ts | Radix reducer-based   | ACTIVE          |
| hooks/use-toast.ts         | Simple useState-based | UNUSED - DELETE |

---

## Type Definition Locations

### Quiz Types

| File                | Contents                     | Import Count |
| ------------------- | ---------------------------- | ------------ |
| types/quiz-types.ts | Manual interfaces            | 51 files     |
| lib/schema/quiz.ts  | Zod schemas + inferred types | 6 files      |

**Recommendation:** Use re-export to consolidate:

```typescript
// types/quiz-types.ts (new)
export * from '@/lib/schema/quiz';
```

---

## Function Call Frequency (app/page.tsx)

| Function                 | Calls From    | Description              |
| ------------------------ | ------------- | ------------------------ |
| handleLoadQuiz           | WelcomeScreen | Load quiz from file      |
| handleLoadDefaultQuiz    | WelcomeScreen | Load default quiz        |
| handleStartQuiz          | Dashboard     | Start chapter quiz       |
| handleSubmitAnswer       | QuizSession   | Submit selected answer   |
| handleNextQuestion       | QuizSession   | Advance to next question |
| handleExportState        | Dashboard     | Export quiz state        |
| handleImportState        | Dashboard     | Import quiz state        |
| handleStartReviewSession | Dashboard     | Start SRS review         |
| handleSetEditMode        | QuizSession   | Toggle edit mode         |
| handleSaveEditedQuestion | QuizSession   | Save edited question     |

---

## Test File Organization

### Unit Tests

```
tests/unit/
├── app/
│   └── page.test.tsx (coverage: 30.69%)
├── components/
│   ├── a11y/ (5 test files)
│   ├── rendering/ (3 test files)
│   └── [component].test.tsx (12 files)
├── lib/
│   ├── markdown/ (4 test files - 3 to delete)
│   ├── quiz/ (2 test files)
│   └── schema/ (3 test files)
├── hooks/ (1 test file - to delete)
├── bugs/ (12 regression test files)
└── renderer/ (3 test files)
```

### Integration Tests

```
tests/int/
├── srs/ (SRS algorithm tests)
├── state/ (state persistence tests)
└── keyboard/ (keyboard navigation tests)
```

### E2E Tests

```
tests/e2e/
├── access/ (accessibility tests)
├── edge/ (edge case tests)
├── journey/ (user journey tests)
├── responsive/ (responsive design tests)
└── edit-mode/ (MISSING - need to create)
```

---

## Safe Refactoring Patterns

### Renaming a Component

1. Find all imports: `Select-String -Pattern "from.*ComponentName"`
2. Update imports to new name
3. Rename file
4. Run `npm run typecheck`

### Moving a File

1. Find all imports: `Select-String -Pattern "from.*filename"`
2. Update all import paths
3. Move file
4. Update any re-exports
5. Run `npm run typecheck`

### Deleting a File

1. Verify no imports: `Select-String -Pattern "from.*filename"`
2. Check for dynamic imports: `Select-String -Pattern "import\(.*filename"`
3. Delete associated test file
4. Delete source file
5. Run `npm run typecheck`

---

## Undocumented Code Sections

### Files Lacking JSDoc/Comments

| File                                | Lines | Status           |
| ----------------------------------- | ----- | ---------------- |
| utils/quiz-validation-refactored.ts | 1385  | Minimal comments |
| app/page.tsx                        | 1550  | Some comments    |
| components/quiz-session.tsx         | 800   | Minimal comments |

### Functions Lacking Documentation

| Function                 | File                          | Description Needed                 |
| ------------------------ | ----------------------------- | ---------------------------------- |
| generateDisplayedOptions | quiz-session.tsx              | Explain SRS-based option selection |
| handleSubmitAnswer       | page.tsx                      | Explain SRS level update logic     |
| getNextReviewQuestion    | page.tsx                      | Explain due date calculation       |
| normalizeQuizModule      | quiz-validation-refactored.ts | Explain normalization rules        |

---

## Naming Convention Summary

### Current Conventions (Mostly Consistent)

| Type       | Convention                           | Example                        |
| ---------- | ------------------------------------ | ------------------------------ |
| Components | kebab-case files, PascalCase exports | quiz-session.tsx → QuizSession |
| Hooks      | use-\*.ts/tsx                        | use-toast.ts → useToast        |
| Utilities  | kebab-case                           | quiz-validation-refactored.ts  |
| Types      | kebab-case files, PascalCase types   | quiz-types.ts → QuizModule     |

### Naming Issues Found

| File                           | Issue                | Suggestion                  |
| ------------------------------ | -------------------- | --------------------------- |
| generate-displayed-options.tsx | .tsx but no JSX      | Rename to .ts               |
| quiz-validation-refactored.ts  | "refactored" in name | Remove suffix after cleanup |

---

_This map is auto-generated. Run `npx tsx scripts/codebase-analyzer.ts` to refresh._
