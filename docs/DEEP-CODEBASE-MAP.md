# Deep Codebase Analysis Report

**Generated:** 2025-12-04 14:20:46

**Analyzer:** [scripts/deep-codebase-analyzer.py](../scripts/deep-codebase-analyzer.py)

---

## 📊 Summary

| Metric                | Count |
| --------------------- | ----- |
| Total Files           | 165   |
| Entry Points          | 16    |
| Test Files            | 93    |
| Dead Code Candidates  | 23    |
| Circular Dependencies | 0     |
| Duplicate Groups      | 2     |

---

## 🚀 Entry Points & Full Dependency Trees

### `app/layout.tsx` (layout)

**Direct Imports:**

- `components/a11y/ScreenReaderAnnouncer.tsx`

**Full Dependency Tree:**

- `components/a11y/ScreenReaderAnnouncer.tsx`

**External Dependencies:**

- `@vercel/analytics`
- `geist`
- `next`

### `app/page.tsx` (page)

**Direct Imports:**

- `components/all-questions-view.tsx`
- `components/confirmation-modal-radix.tsx`
- `components/dashboard.tsx`
- `components/quiz-complete.tsx`
- `components/quiz-session.tsx`
- `components/ui/toaster.tsx`
- `components/ui/use-toast.ts`
- `components/welcome-screen.tsx`
- `hooks/use-quiz-persistence.ts`
- `lib/engine/srs.ts`
- `types/quiz-types.ts`
- `utils/quiz-validation-refactored.ts`

**Full Dependency Tree:**

- `components/a11y/AccessibleOptionList.tsx`
- `components/a11y/AccessibleQuestionGrid.tsx`
- `components/a11y/ScreenReaderAnnouncer.tsx`
- `components/all-questions-view.tsx`
- `components/chapter-card.tsx`
- `components/confirmation-modal-radix.tsx`
- `components/dashboard.tsx`
- `components/option-card.tsx`
- `components/progress-bar.tsx`
- `components/question-editor.tsx`
- `components/quiz-complete.tsx`
- `components/quiz-session.tsx`
- `components/rendering/MarkdownRenderer.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/circular-progress.tsx`
- `components/ui/dialog.tsx`
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `components/ui/textarea.tsx`
- `components/ui/toast.tsx`
- `components/ui/toaster.tsx`
- `components/ui/tooltip.tsx`
- `components/ui/use-toast.ts`
- `components/welcome-screen.tsx`
- `hooks/use-quiz-persistence.ts`
- `lib/engine/srs.ts`
- `lib/markdown/pipeline.ts`
- `lib/utils.ts`
- `types/quiz-types.ts`
- ... and 1 more

**External Dependencies:**

- `react`

### `app/test/page.tsx` (page)

**Direct Imports:**

- `utils/quiz-validation-refactored.ts`

**Full Dependency Tree:**

- `types/quiz-types.ts`
- `utils/quiz-validation-refactored.ts`

**External Dependencies:**

- `react`

### `depcheck.config.cjs` (config)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `depcheck`

### `next.config.mjs` (config)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `@next/bundle-analyzer`
- `next`

### `playwright.config.ts` (config)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `@playwright/test`

### `postcss.config.mjs` (config)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `postcss-load-config`

### `scripts/audit-snapshot.mjs` (script)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `child_process`
- `fs`
- `path`

### `scripts/batch-quiz-update.ts` (script)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `fs`
- `path`

### `scripts/codebase-analyzer.ts` (script)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `fs`
- `path`

### `scripts/codemods/fix-dot-to-spread.mjs` (script)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `node:fs`
- `node:path`

### `scripts/fix-quiz-json.ts` (script)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `fs`
- `path`

### `scripts/merge-batches.ts` (script)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `fs`
- `path`

### `scripts/validate-quiz.ts` (script)

**Direct Imports:**

- `lib/schema/quiz.ts`

**Full Dependency Tree:**

- `lib/schema/quiz.ts`

**External Dependencies:**

- `fs`
- `path`
- `zod`

### `tailwind.config.ts` (config)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `tailwindcss`

### `vitest.config.ts` (config)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `@vitejs/plugin-react`
- `path`
- `vitest`

---

## ☠️ Dead Code Candidates (DELETION TARGETS)

> These files have NO non-test imports and are likely safe to delete.

### 🔴 HIGH CONFIDENCE (Safe to Delete)

| File                             | Reason            | Related Test |
| -------------------------------- | ----------------- | ------------ |
| `components/ui/separator.tsx`    | No imports at all | `N/A`        |
| `components/ui/toggle.tsx`       | No imports at all | `N/A`        |
| `hooks/use-quiz-state.ts`        | No imports at all | `N/A`        |
| `lib/engine/index.ts`            | No imports at all | `N/A`        |
| `next-env.d.ts`                  | No imports at all | `N/A`        |
| `store/index.ts`                 | No imports at all | `N/A`        |
| `vitest.config.accessibility.ts` | No imports at all | `N/A`        |
| `vitest.config.integration.ts`   | No imports at all | `N/A`        |

### 🟡 MEDIUM CONFIDENCE (Only imported by tests)

| File                                      | Reason                    | Related Test                                        |
| ----------------------------------------- | ------------------------- | --------------------------------------------------- |
| `components/toast-notification.tsx`       | No non-test imports found | `tests/unit/components/toast-notification.test.tsx` |
| `components/ui/badge.tsx`                 | No non-test imports found | `N/A`                                               |
| `components/ui/collapsible.tsx`           | No non-test imports found | `N/A`                                               |
| `components/ui/dropdown-menu.tsx`         | No non-test imports found | `N/A`                                               |
| `components/ui/popover.tsx`               | No non-test imports found | `N/A`                                               |
| `components/ui/scroll-area.tsx`           | No non-test imports found | `N/A`                                               |
| `components/ui/select.tsx`                | No non-test imports found | `N/A`                                               |
| `components/ui/sheet.tsx`                 | No non-test imports found | `N/A`                                               |
| `components/ui/skeleton.tsx`              | No non-test imports found | `N/A`                                               |
| `components/ui/slider.tsx`                | No non-test imports found | `N/A`                                               |
| `components/ui/switch.tsx`                | No non-test imports found | `N/A`                                               |
| `components/ui/table.tsx`                 | No non-test imports found | `N/A`                                               |
| `components/ui/tabs.tsx`                  | No non-test imports found | `N/A`                                               |
| `hooks/use-mobile.tsx`                    | No non-test imports found | `tests/unit/hooks/use-mobile.test.tsx`              |
| `lib/quiz/generate-displayed-options.tsx` | No non-test imports found | `N/A`                                               |

---

## 🔄 Duplicate Files

### Group 1: NAME

_Multiple files with base name 'page'_

- `app/page.tsx`
- `app/test/page.tsx`

### Group 2: NAME

_Multiple files with base name 'index'_

- `lib/engine/index.ts`
- `store/index.ts`

---

## 📦 Component Usage Analysis

| Component                                    | Import Count | Imported By                                                                                            |
| -------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| `components/toast-notification.tsx`          | 0            | NONE                                                                                                   |
| `components/ui/badge.tsx`                    | 0            | NONE                                                                                                   |
| `components/ui/collapsible.tsx`              | 0            | NONE                                                                                                   |
| `components/ui/dropdown-menu.tsx`            | 0            | NONE                                                                                                   |
| `components/ui/popover.tsx`                  | 0            | NONE                                                                                                   |
| `components/ui/scroll-area.tsx`              | 0            | NONE                                                                                                   |
| `components/ui/select.tsx`                   | 0            | NONE                                                                                                   |
| `components/ui/separator.tsx`                | 0            | NONE                                                                                                   |
| `components/ui/sheet.tsx`                    | 0            | NONE                                                                                                   |
| `components/ui/skeleton.tsx`                 | 0            | NONE                                                                                                   |
| `components/ui/slider.tsx`                   | 0            | NONE                                                                                                   |
| `components/ui/switch.tsx`                   | 0            | NONE                                                                                                   |
| `components/ui/table.tsx`                    | 0            | NONE                                                                                                   |
| `components/ui/tabs.tsx`                     | 0            | NONE                                                                                                   |
| `components/ui/toggle.tsx`                   | 0            | NONE                                                                                                   |
| `components/all-questions-view.tsx`          | 1            | app/page.tsx                                                                                           |
| `components/chapter-card.tsx`                | 1            | components/dashboard.tsx                                                                               |
| `components/dashboard.tsx`                   | 1            | app/page.tsx                                                                                           |
| `components/question-editor.tsx`             | 1            | components/quiz-session.tsx                                                                            |
| `components/quiz-complete.tsx`               | 1            | app/page.tsx                                                                                           |
| `components/quiz-session.tsx`                | 1            | app/page.tsx                                                                                           |
| `components/welcome-screen.tsx`              | 1            | app/page.tsx                                                                                           |
| `components/a11y/AccessibleOptionList.tsx`   | 1            | components/quiz-session.tsx                                                                            |
| `components/a11y/AccessibleQuestionGrid.tsx` | 1            | components/quiz-session.tsx                                                                            |
| `components/ui/circular-progress.tsx`        | 1            | components/quiz-session.tsx                                                                            |
| `components/ui/dialog.tsx`                   | 1            | components/confirmation-modal-radix.tsx                                                                |
| `components/ui/input.tsx`                    | 1            | components/question-editor.tsx                                                                         |
| `components/ui/label.tsx`                    | 1            | components/question-editor.tsx                                                                         |
| `components/ui/textarea.tsx`                 | 1            | components/question-editor.tsx                                                                         |
| `components/ui/toaster.tsx`                  | 1            | app/page.tsx                                                                                           |
| `components/confirmation-modal-radix.tsx`    | 2            | components/question-editor.tsx, app/page.tsx                                                           |
| `components/option-card.tsx`                 | 2            | components/a11y/AccessibleOptionList.tsx, components/all-questions-view.tsx                            |
| `components/a11y/ScreenReaderAnnouncer.tsx`  | 2            | components/quiz-session.tsx, app/layout.tsx                                                            |
| `components/ui/toast.tsx`                    | 2            | components/ui/use-toast.ts, components/ui/toaster.tsx                                                  |
| `components/ui/tooltip.tsx`                  | 2            | components/quiz-session.tsx, components/all-questions-view.tsx                                         |
| `components/ui/use-toast.ts`                 | 2            | app/page.tsx, components/ui/toaster.tsx                                                                |
| `components/progress-bar.tsx`                | 5            | components/quiz-session.tsx, components/quiz-complete.tsx, components/all-questions-view.tsx +2 more   |
| `components/rendering/MarkdownRenderer.tsx`  | 5            | components/option-card.tsx, components/quiz-session.tsx, components/question-editor.tsx +2 more        |
| `components/ui/button.tsx`                   | 8            | components/quiz-session.tsx, components/question-editor.tsx, components/all-questions-view.tsx +5 more |
| `components/ui/card.tsx`                     | 9            | components/option-card.tsx, components/quiz-session.tsx, components/question-editor.tsx +6 more        |

---

## 🪝 Hook Usage Analysis

| Hook                                            | Import Count | Imported By                             |
| ----------------------------------------------- | ------------ | --------------------------------------- |
| `hooks/use-mobile.tsx`                          | 0            | NONE                                    |
| `hooks/use-quiz-state.ts`                       | 0            | NONE                                    |
| `tests/unit/hooks/use-mobile.test.tsx`          | 0            | NONE                                    |
| `tests/unit/hooks/use-quiz-persistence.test.ts` | 0            | NONE                                    |
| `hooks/use-quiz-persistence.ts`                 | 1            | app/page.tsx                            |
| `components/ui/use-toast.ts`                    | 2            | app/page.tsx, components/ui/toaster.tsx |

---

## 📚 Lib/Utils Usage Analysis

| File                                      | Import Count | Imported By                                                                          |
| ----------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| `lib/engine/index.ts`                     | 0            | NONE                                                                                 |
| `lib/quiz/generate-displayed-options.tsx` | 0            | NONE                                                                                 |
| `lib/engine/srs.ts`                       | 1            | app/page.tsx                                                                         |
| `lib/markdown/pipeline.ts`                | 1            | components/rendering/MarkdownRenderer.tsx                                            |
| `lib/schema/quiz.ts`                      | 1            | scripts/validate-quiz.ts                                                             |
| `utils/quiz-validation-refactored.ts`     | 2            | app/page.tsx, app/test/page.tsx                                                      |
| `lib/utils.ts`                            | 22           | components/ui/popover.tsx, components/ui/toast.tsx, components/ui/table.tsx +19 more |

---

## 📁 All Files Overview

<details>
<summary>Click to expand full file list</summary>

| File                                         | Lines | Imports | Exports | Imported By |
| -------------------------------------------- | ----- | ------- | ------- | ----------- |
| `app/layout.tsx`                             | 37    | 5       | 2       | 1           |
| `app/page.tsx`                               | 2021  | 14      | 1       | 1           |
| `app/test/page.tsx`                          | 194   | 2       | 1       | 1           |
| `components/a11y/AccessibleOptionList.tsx`   | 158   | 3       | 1       | 2           |
| `components/a11y/AccessibleQuestionGrid.tsx` | 233   | 2       | 1       | 2           |
| `components/a11y/ScreenReaderAnnouncer.tsx`  | 81    | 1       | 2       | 6           |
| `components/all-questions-view.tsx`          | 281   | 9       | 1       | 2           |
| `components/chapter-card.tsx`                | 123   | 4       | 1       | 2           |
| `components/confirmation-modal-radix.tsx`    | 108   | 4       | 1       | 4           |
| `components/dashboard.tsx`                   | 265   | 8       | 1       | 2           |
| `components/option-card.tsx`                 | 97    | 5       | 1       | 3           |
| `components/progress-bar.tsx`                | 86    | 0       | 1       | 6           |
| `components/question-editor.tsx`             | 586   | 11      | 1       | 1           |
| `components/quiz-complete.tsx`               | 212   | 4       | 1       | 1           |
| `components/quiz-session.tsx`                | 969   | 14      | 1       | 4           |
| `components/rendering/MarkdownRenderer.tsx`  | 142   | 3       | 1       | 18          |
| `components/toast-notification.tsx`          | 117   | 3       | 3       | 1           |
| `components/ui/badge.tsx`                    | 33    | 3       | 1       | 1           |
| `components/ui/button.tsx`                   | 49    | 4       | 1       | 9           |
| `components/ui/card.tsx`                     | 55    | 2       | 0       | 9           |
| `components/ui/circular-progress.tsx`        | 55    | 1       | 1       | 2           |
| `components/ui/collapsible.tsx`              | 11    | 1       | 0       | 1           |
| `components/ui/dialog.tsx`                   | 104   | 4       | 0       | 1           |
| `components/ui/dropdown-menu.tsx`            | 187   | 4       | 0       | 1           |
| `components/ui/input.tsx`                    | 22    | 2       | 0       | 1           |
| `components/ui/label.tsx`                    | 21    | 4       | 0       | 1           |
| `components/ui/popover.tsx`                  | 31    | 3       | 0       | 1           |
| `components/ui/scroll-area.tsx`              | 46    | 3       | 0       | 1           |
| `components/ui/select.tsx`                   | 153   | 4       | 0       | 1           |
| `components/ui/separator.tsx`                | 26    | 3       | 0       | 0           |
| `components/ui/sheet.tsx`                    | 121   | 5       | 0       | 1           |
| `components/ui/skeleton.tsx`                 | 7     | 1       | 0       | 1           |
| `components/ui/slider.tsx`                   | 25    | 3       | 0       | 1           |
| `components/ui/switch.tsx`                   | 29    | 3       | 0       | 1           |
| `components/ui/table.tsx`                    | 91    | 2       | 0       | 1           |
| `components/ui/tabs.tsx`                     | 55    | 3       | 0       | 1           |
| `components/ui/textarea.tsx`                 | 21    | 2       | 0       | 1           |
| `components/ui/toast.tsx`                    | 124   | 5       | 0       | 2           |
| `components/ui/toaster.tsx`                  | 29    | 2       | 1       | 1           |
| `components/ui/toggle.tsx`                   | 43    | 4       | 0       | 0           |
| `components/ui/tooltip.tsx`                  | 30    | 3       | 0       | 3           |
| `components/ui/use-toast.ts`                 | 194   | 2       | 1       | 2           |
| `components/welcome-screen.tsx`              | 222   | 5       | 1       | 2           |
| `depcheck.config.cjs`                        | 63    | 2       | 0       | 0           |
| `hooks/use-mobile.tsx`                       | 19    | 1       | 1       | 1           |
| `hooks/use-quiz-persistence.ts`              | 314   | 2       | 6       | 2           |
| `hooks/use-quiz-state.ts`                    | 176   | 3       | 1       | 0           |
| `lib/engine/index.ts`                        | 22    | 0       | 0       | 0           |
| `lib/engine/srs.ts`                          | 252   | 0       | 11      | 2           |
| `lib/markdown/pipeline.ts`                   | 178   | 9       | 4       | 2           |
| `lib/quiz/generate-displayed-options.tsx`    | 103   | 1       | 2       | 2           |
| `lib/schema/quiz.ts`                         | 135   | 1       | 27      | 6           |
| `lib/utils.ts`                               | 6     | 2       | 1       | 23          |
| `next-env.d.ts`                              | 5     | 0       | 0       | 0           |
| `next.config.mjs`                            | 37    | 2       | 1       | 0           |
| `playwright.config.ts`                       | 76    | 1       | 1       | 0           |
| `postcss.config.mjs`                         | 9     | 1       | 1       | 0           |
| `scripts/audit-snapshot.mjs`                 | 109   | 3       | 0       | 0           |
| `scripts/batch-quiz-update.ts`               | 106   | 2       | 0       | 0           |
| `scripts/codebase-analyzer.ts`               | 821   | 2       | 0       | 0           |
| `scripts/codemods/fix-dot-to-spread.mjs`     | 45    | 2       | 0       | 0           |
| `scripts/fix-quiz-json.ts`                   | 39    | 2       | 0       | 0           |
| `scripts/merge-batches.ts`                   | 148   | 2       | 0       | 0           |
| `scripts/validate-quiz.ts`                   | 100   | 4       | 0       | 0           |
| `store/index.ts`                             | 9     | 0       | 4       | 0           |
| `store/quiz-store.ts`                        | 320   | 3       | 6       | 2           |
| `tailwind.config.ts`                         | 101   | 1       | 1       | 0           |
| `types/quiz-types.ts`                        | 100   | 0       | 11      | 29          |
| `utils/quiz-validation-refactored.ts`        | 1384  | 1       | 9       | 16          |
| `vitest.config.accessibility.ts`             | 18    | 3       | 1       | 0           |
| `vitest.config.integration.ts`               | 18    | 3       | 1       | 0           |
| `vitest.config.ts`                           | 65    | 3       | 1       | 0           |

</details>

---

## 🧹 Cleanup Commands

### Delete High-Confidence Dead Code

```powershell
Remove-Item 'next-env.d.ts'
Remove-Item 'vitest.config.accessibility.ts'
Remove-Item 'vitest.config.integration.ts'
Remove-Item 'components/ui/separator.tsx'
Remove-Item 'components/ui/toggle.tsx'
Remove-Item 'hooks/use-quiz-state.ts'
Remove-Item 'lib/engine/index.ts'
Remove-Item 'store/index.ts'
```
