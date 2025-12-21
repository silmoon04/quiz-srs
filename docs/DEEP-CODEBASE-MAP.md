# Deep Codebase Analysis Report

**Generated:** 2025-12-21 08:27:24

**Analyzer:** [scripts/deep-codebase-analyzer.py](../scripts/deep-codebase-analyzer.py)

---

## Summary

| Metric                | Count |
| --------------------- | ----- |
| Total Files           | 177   |
| Entry Points          | 24    |
| Test Files            | 96    |
| Dead Code Candidates  | 15    |
| Circular Dependencies | 0     |
| Duplicate Groups      | 2     |

---

## Entry Points & Full Dependency Trees

### `app/design-showcase/page.tsx` (page)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `next`

### `app/design-showcase/theme-ankidroid/page.tsx` (page)

**Direct Imports:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**Full Dependency Tree:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**External Dependencies:**

- `lucide-react`
- `react`

### `app/design-showcase/theme-aptitude/page.tsx` (page)

**Direct Imports:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**Full Dependency Tree:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**External Dependencies:**

- `lucide-react`
- `react`

### `app/design-showcase/theme-brand/page.tsx` (page)

**Direct Imports:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**Full Dependency Tree:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**External Dependencies:**

- `lucide-react`
- `react`

### `app/design-showcase/theme-dark/page.tsx` (page)

**Direct Imports:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**Full Dependency Tree:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**External Dependencies:**

- `lucide-react`
- `react`

### `app/design-showcase/theme-minimal/page.tsx` (page)

**Direct Imports:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**Full Dependency Tree:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**External Dependencies:**

- `lucide-react`
- `react`

### `app/design-showcase/theme-playful/page.tsx` (page)

**Direct Imports:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**Full Dependency Tree:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**External Dependencies:**

- `lucide-react`
- `react`

### `app/design-showcase/theme-saas/page.tsx` (page)

**Direct Imports:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**Full Dependency Tree:**

- `app/design-showcase/shared.tsx`
- `lib/utils.ts`

**External Dependencies:**

- `lucide-react`
- `react`

### `app/layout.tsx` (layout)

**Direct Imports:**

- `components/a11y/ScreenReaderAnnouncer.tsx`
- `components/legacy-storage-bridge.tsx`
- `services/persistence/provider.tsx`

**Full Dependency Tree:**

- `components/a11y/ScreenReaderAnnouncer.tsx`
- `components/legacy-storage-bridge.tsx`
- `services/persistence/local-storage.ts`
- `services/persistence/provider.tsx`
- `services/persistence/types.ts`
- `store/index.ts`
- `types/quiz-types.ts`

**External Dependencies:**

- `@vercel/analytics`
- `geist`
- `next`

### `app/page.tsx` (page)

**Direct Imports:**

- `components/a11y/ScreenReaderAnnouncer.tsx`
- `components/ui/toaster.tsx`
- `components/welcome-screen.tsx`
- `features/dashboard/components/DashboardContainer.tsx`
- `features/dashboard/hooks/use-module-loader.ts`
- `features/quiz-session/components/QuizSessionContainer.tsx`
- `store/quiz-store.ts`

**Full Dependency Tree:**

- `components/a11y/AccessibleOptionList.tsx`
- `components/a11y/AccessibleQuestionGrid.tsx`
- `components/a11y/ScreenReaderAnnouncer.tsx`
- `components/chapter-card.tsx`
- `components/confirmation-modal-radix.tsx`
- `components/dashboard.tsx`
- `components/option-card.tsx`
- `components/progress-bar.tsx`
- `components/question-editor.tsx`
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
- `features/dashboard/components/DashboardContainer.tsx`
- `features/dashboard/hooks/use-module-loader.ts`
- `features/quiz-session/components/QuizSessionContainer.tsx`
- `features/quiz-session/hooks/use-quiz-session.ts`
- `lib/engine/srs.ts`
- `lib/markdown/pipeline.ts`
- `lib/quiz/generate-displayed-options.tsx`
- ... and 6 more

### `config/depcheck.config.cjs` (config)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `depcheck`

### `config/vitest.config.ts` (config)

**Direct Imports:**

- (none)

**Full Dependency Tree:**

- (none)

**External Dependencies:**

- `@vitejs/plugin-react`
- `path`
- `vitest`

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

### `scripts/convert-json-to-markdown.ts` (script)

**Direct Imports:**

- `types/quiz-types.ts`

**Full Dependency Tree:**

- `types/quiz-types.ts`

**External Dependencies:**

- `fs`
- `path`

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

---

## Dead Code Candidates (DELETION TARGETS)

> These files have NO non-test imports and are likely safe to delete.

### HIGH CONFIDENCE (Safe to Delete)

| File                                    | Reason            | Related Test |
| --------------------------------------- | ----------------- | ------------ |
| `components/quiz-complete.tsx`          | No imports at all | `N/A`        |
| `config/vitest.config.accessibility.ts` | No imports at all | `N/A`        |
| `config/vitest.config.integration.ts`   | No imports at all | `N/A`        |
| `lib/engine/index.ts`                   | No imports at all | `N/A`        |
| `next-env.d.ts`                         | No imports at all | `N/A`        |

### MEDIUM CONFIDENCE (Only imported by tests)

| File                                | Reason                    | Related Test                                        |
| ----------------------------------- | ------------------------- | --------------------------------------------------- |
| `components/all-questions-view.tsx` | No non-test imports found | `tests/unit/components/all-questions-view.test.tsx` |
| `components/ui/badge.tsx`           | No non-test imports found | `N/A`                                               |
| `components/ui/collapsible.tsx`     | No non-test imports found | `N/A`                                               |
| `components/ui/popover.tsx`         | No non-test imports found | `N/A`                                               |
| `components/ui/scroll-area.tsx`     | No non-test imports found | `N/A`                                               |
| `components/ui/skeleton.tsx`        | No non-test imports found | `N/A`                                               |
| `components/ui/slider.tsx`          | No non-test imports found | `N/A`                                               |
| `components/ui/switch.tsx`          | No non-test imports found | `N/A`                                               |
| `components/ui/tabs.tsx`            | No non-test imports found | `N/A`                                               |
| `hooks/use-mobile.tsx`              | No non-test imports found | `tests/unit/hooks/use-mobile.test.tsx`              |

---

## Duplicate Files

### Group 1: NAME

_Multiple files with base name 'page'_

- `app/page.tsx`
- `app/design-showcase/page.tsx`
- `app/design-showcase/theme-ankidroid/page.tsx`
- `app/design-showcase/theme-aptitude/page.tsx`
- `app/design-showcase/theme-brand/page.tsx`
- `app/design-showcase/theme-dark/page.tsx`
- `app/design-showcase/theme-minimal/page.tsx`
- `app/design-showcase/theme-playful/page.tsx`
- `app/design-showcase/theme-saas/page.tsx`

### Group 2: NAME

_Multiple files with base name 'index'_

- `lib/engine/index.ts`
- `store/index.ts`

---

## Component Usage Analysis

| Component                                    | Import Count | Imported By                                                                                                    |
| -------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `components/all-questions-view.tsx`          | 0            | NONE                                                                                                           |
| `components/quiz-complete.tsx`               | 0            | NONE                                                                                                           |
| `components/ui/badge.tsx`                    | 0            | NONE                                                                                                           |
| `components/ui/collapsible.tsx`              | 0            | NONE                                                                                                           |
| `components/ui/popover.tsx`                  | 0            | NONE                                                                                                           |
| `components/ui/scroll-area.tsx`              | 0            | NONE                                                                                                           |
| `components/ui/skeleton.tsx`                 | 0            | NONE                                                                                                           |
| `components/ui/slider.tsx`                   | 0            | NONE                                                                                                           |
| `components/ui/switch.tsx`                   | 0            | NONE                                                                                                           |
| `components/ui/tabs.tsx`                     | 0            | NONE                                                                                                           |
| `components/chapter-card.tsx`                | 1            | components/dashboard.tsx                                                                                       |
| `components/confirmation-modal-radix.tsx`    | 1            | components/question-editor.tsx                                                                                 |
| `components/dashboard.tsx`                   | 1            | features/dashboard/components/DashboardContainer.tsx                                                           |
| `components/legacy-storage-bridge.tsx`       | 1            | app/layout.tsx                                                                                                 |
| `components/question-editor.tsx`             | 1            | components/quiz-session.tsx                                                                                    |
| `components/quiz-session.tsx`                | 1            | features/quiz-session/components/QuizSessionContainer.tsx                                                      |
| `components/welcome-screen.tsx`              | 1            | app/page.tsx                                                                                                   |
| `components/a11y/AccessibleOptionList.tsx`   | 1            | components/quiz-session.tsx                                                                                    |
| `components/a11y/AccessibleQuestionGrid.tsx` | 1            | components/quiz-session.tsx                                                                                    |
| `components/ui/circular-progress.tsx`        | 1            | components/quiz-session.tsx                                                                                    |
| `components/ui/dialog.tsx`                   | 1            | components/confirmation-modal-radix.tsx                                                                        |
| `components/ui/input.tsx`                    | 1            | components/question-editor.tsx                                                                                 |
| `components/ui/label.tsx`                    | 1            | components/question-editor.tsx                                                                                 |
| `components/ui/textarea.tsx`                 | 1            | components/question-editor.tsx                                                                                 |
| `components/ui/toaster.tsx`                  | 1            | app/page.tsx                                                                                                   |
| `components/ui/use-toast.ts`                 | 1            | components/ui/toaster.tsx                                                                                      |
| `components/option-card.tsx`                 | 2            | components/all-questions-view.tsx, components/a11y/AccessibleOptionList.tsx                                    |
| `components/ui/toast.tsx`                    | 2            | components/ui/use-toast.ts, components/ui/toaster.tsx                                                          |
| `components/ui/tooltip.tsx`                  | 2            | components/all-questions-view.tsx, components/quiz-session.tsx                                                 |
| `components/a11y/ScreenReaderAnnouncer.tsx`  | 3            | app/page.tsx, components/quiz-session.tsx, app/layout.tsx                                                      |
| `components/progress-bar.tsx`                | 5            | components/dashboard.tsx, components/quiz-session.tsx, components/chapter-card.tsx +2 more                     |
| `components/rendering/MarkdownRenderer.tsx`  | 5            | components/question-editor.tsx, components/confirmation-modal-radix.tsx, components/option-card.tsx +2 more    |
| `components/ui/button.tsx`                   | 8            | components/question-editor.tsx, components/confirmation-modal-radix.tsx, components/welcome-screen.tsx +5 more |
| `components/ui/card.tsx`                     | 8            | components/question-editor.tsx, components/welcome-screen.tsx, components/option-card.tsx +5 more              |

---

## Hook Usage Analysis

| Hook                                                              | Import Count | Imported By                                                        |
| ----------------------------------------------------------------- | ------------ | ------------------------------------------------------------------ |
| `hooks/use-mobile.tsx`                                            | 0            | NONE                                                               |
| `tests/unit/features/dashboard/hooks/use-module-loader.test.ts`   | 0            | NONE                                                               |
| `tests/unit/features/quiz-session/hooks/use-quiz-session.test.ts` | 0            | NONE                                                               |
| `tests/unit/hooks/use-mobile.test.tsx`                            | 0            | NONE                                                               |
| `components/ui/use-toast.ts`                                      | 1            | components/ui/toaster.tsx                                          |
| `features/quiz-session/hooks/use-quiz-session.ts`                 | 1            | features/quiz-session/components/QuizSessionContainer.tsx          |
| `features/dashboard/hooks/use-module-loader.ts`                   | 2            | app/page.tsx, features/dashboard/components/DashboardContainer.tsx |

---

## Lib/Utils Usage Analysis

| File                                      | Import Count | Imported By                                                                                  |
| ----------------------------------------- | ------------ | -------------------------------------------------------------------------------------------- |
| `lib/engine/index.ts`                     | 0            | NONE                                                                                         |
| `lib/engine/srs.ts`                       | 1            | store/quiz-store.ts                                                                          |
| `lib/markdown/pipeline.ts`                | 1            | components/rendering/MarkdownRenderer.tsx                                                    |
| `lib/quiz/generate-displayed-options.tsx` | 1            | components/quiz-session.tsx                                                                  |
| `lib/quiz/parser.ts`                      | 1            | features/dashboard/hooks/use-module-loader.ts                                                |
| `lib/schema/quiz.ts`                      | 1            | scripts/validate-quiz.ts                                                                     |
| `utils/quiz-validation-refactored.ts`     | 2            | lib/quiz/parser.ts, features/dashboard/hooks/use-module-loader.ts                            |
| `lib/utils.ts`                            | 24           | app/design-showcase/shared.tsx, components/ui/label.tsx, components/ui/textarea.tsx +21 more |

---

## All Files Overview

<details>
<summary>Click to expand full file list</summary>

| File                                                        | Lines | Imports | Exports | Imported By |
| ----------------------------------------------------------- | ----- | ------- | ------- | ----------- |
| `app/design-showcase/page.tsx`                              | 128   | 2       | 2       | 0           |
| `app/design-showcase/shared.tsx`                            | 782   | 3       | 38      | 7           |
| `app/design-showcase/theme-ankidroid/page.tsx`              | 796   | 4       | 1       | 0           |
| `app/design-showcase/theme-aptitude/page.tsx`               | 700   | 4       | 1       | 0           |
| `app/design-showcase/theme-brand/page.tsx`                  | 886   | 4       | 1       | 0           |
| `app/design-showcase/theme-dark/page.tsx`                   | 818   | 4       | 1       | 0           |
| `app/design-showcase/theme-minimal/page.tsx`                | 731   | 4       | 1       | 0           |
| `app/design-showcase/theme-playful/page.tsx`                | 830   | 4       | 1       | 0           |
| `app/design-showcase/theme-saas/page.tsx`                   | 1086  | 4       | 1       | 0           |
| `app/layout.tsx`                                            | 44    | 7       | 2       | 1           |
| `app/page.tsx`                                              | 52    | 7       | 1       | 1           |
| `components/a11y/AccessibleOptionList.tsx`                  | 174   | 3       | 1       | 2           |
| `components/a11y/AccessibleQuestionGrid.tsx`                | 233   | 2       | 1       | 2           |
| `components/a11y/ScreenReaderAnnouncer.tsx`                 | 81    | 1       | 2       | 7           |
| `components/all-questions-view.tsx`                         | 281   | 9       | 1       | 1           |
| `components/chapter-card.tsx`                               | 124   | 4       | 1       | 2           |
| `components/confirmation-modal-radix.tsx`                   | 110   | 4       | 1       | 3           |
| `components/dashboard.tsx`                                  | 266   | 8       | 1       | 2           |
| `components/legacy-storage-bridge.tsx`                      | 91    | 2       | 1       | 1           |
| `components/option-card.tsx`                                | 98    | 5       | 1       | 3           |
| `components/progress-bar.tsx`                               | 86    | 0       | 1       | 6           |
| `components/question-editor.tsx`                            | 586   | 11      | 1       | 1           |
| `components/quiz-complete.tsx`                              | 213   | 4       | 1       | 0           |
| `components/quiz-session.tsx`                               | 938   | 15      | 1       | 4           |
| `components/rendering/MarkdownRenderer.tsx`                 | 108   | 3       | 1       | 18          |
| `components/ui/badge.tsx`                                   | 33    | 3       | 1       | 1           |
| `components/ui/button.tsx`                                  | 49    | 4       | 1       | 9           |
| `components/ui/card.tsx`                                    | 55    | 2       | 0       | 8           |
| `components/ui/circular-progress.tsx`                       | 55    | 1       | 1       | 2           |
| `components/ui/collapsible.tsx`                             | 11    | 1       | 0       | 1           |
| `components/ui/dialog.tsx`                                  | 104   | 4       | 0       | 1           |
| `components/ui/input.tsx`                                   | 22    | 2       | 0       | 1           |
| `components/ui/label.tsx`                                   | 21    | 4       | 0       | 1           |
| `components/ui/popover.tsx`                                 | 31    | 3       | 0       | 1           |
| `components/ui/scroll-area.tsx`                             | 46    | 3       | 0       | 1           |
| `components/ui/skeleton.tsx`                                | 7     | 1       | 0       | 1           |
| `components/ui/slider.tsx`                                  | 25    | 3       | 0       | 1           |
| `components/ui/switch.tsx`                                  | 29    | 3       | 0       | 1           |
| `components/ui/tabs.tsx`                                    | 55    | 3       | 0       | 1           |
| `components/ui/textarea.tsx`                                | 21    | 2       | 0       | 1           |
| `components/ui/toast.tsx`                                   | 124   | 5       | 0       | 2           |
| `components/ui/toaster.tsx`                                 | 29    | 2       | 1       | 1           |
| `components/ui/tooltip.tsx`                                 | 30    | 3       | 0       | 3           |
| `components/ui/use-toast.ts`                                | 194   | 2       | 1       | 1           |
| `components/welcome-screen.tsx`                             | 225   | 5       | 1       | 2           |
| `config/depcheck.config.cjs`                                | 63    | 2       | 0       | 0           |
| `config/vitest.config.accessibility.ts`                     | 19    | 3       | 1       | 0           |
| `config/vitest.config.integration.ts`                       | 19    | 3       | 1       | 0           |
| `config/vitest.config.ts`                                   | 66    | 3       | 1       | 0           |
| `features/dashboard/components/DashboardContainer.tsx`      | 331   | 4       | 2       | 2           |
| `features/dashboard/hooks/use-module-loader.ts`             | 333   | 5       | 2       | 4           |
| `features/quiz-session/components/QuizSessionContainer.tsx` | 144   | 5       | 2       | 2           |
| `features/quiz-session/hooks/use-quiz-session.ts`           | 184   | 4       | 2       | 2           |
| `hooks/use-mobile.tsx`                                      | 19    | 1       | 1       | 1           |
| `lib/engine/index.ts`                                       | 22    | 0       | 0       | 0           |
| `lib/engine/srs.ts`                                         | 252   | 0       | 11      | 3           |
| `lib/markdown/pipeline.ts`                                  | 227   | 11      | 5       | 4           |
| `lib/quiz/generate-displayed-options.tsx`                   | 104   | 1       | 2       | 3           |
| `lib/quiz/parser.ts`                                        | 260   | 2       | 1       | 6           |
| `lib/schema/quiz.ts`                                        | 181   | 1       | 27      | 6           |
| `lib/utils.ts`                                              | 6     | 2       | 1       | 25          |
| `next-env.d.ts`                                             | 5     | 0       | 0       | 0           |
| `next.config.mjs`                                           | 62    | 2       | 1       | 0           |
| `playwright.config.ts`                                      | 76    | 1       | 1       | 0           |
| `postcss.config.mjs`                                        | 9     | 1       | 1       | 0           |
| `scripts/audit-snapshot.mjs`                                | 109   | 3       | 0       | 0           |
| `scripts/batch-quiz-update.ts`                              | 106   | 2       | 0       | 0           |
| `scripts/codebase-analyzer.ts`                              | 826   | 2       | 0       | 0           |
| `scripts/codemods/fix-dot-to-spread.mjs`                    | 45    | 2       | 0       | 0           |
| `scripts/convert-json-to-markdown.ts`                       | 74    | 3       | 0       | 0           |
| `scripts/fix-quiz-json.ts`                                  | 39    | 2       | 0       | 0           |
| `scripts/merge-batches.ts`                                  | 148   | 2       | 0       | 0           |
| `scripts/validate-quiz.ts`                                  | 100   | 4       | 0       | 0           |
| `services/persistence/local-storage.ts`                     | 37    | 1       | 2       | 1           |
| `services/persistence/provider.tsx`                         | 27    | 3       | 2       | 1           |
| `services/persistence/types.ts`                             | 17    | 1       | 2       | 2           |
| `store/index.ts`                                            | 9     | 0       | 4       | 7           |
| `store/quiz-store.ts`                                       | 495   | 4       | 6       | 3           |
| `tailwind.config.ts`                                        | 101   | 1       | 1       | 0           |
| `types/quiz-types.ts`                                       | 100   | 0       | 11      | 37          |
| `utils/quiz-validation-refactored.ts`                       | 1419  | 1       | 11      | 17          |

</details>

---

## Cleanup Commands

### Delete High-Confidence Dead Code

```powershell
Remove-Item 'next-env.d.ts'
Remove-Item 'components/quiz-complete.tsx'
Remove-Item 'config/vitest.config.accessibility.ts'
Remove-Item 'config/vitest.config.integration.ts'
Remove-Item 'lib/engine/index.ts'
```
