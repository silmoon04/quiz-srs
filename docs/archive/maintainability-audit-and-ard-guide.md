# Maintainability Audit & ARD Execution Guide

This document combines the latest codebase audit, a refactor roadmap, and explicit Architecture/Refactor Decision (ARD) practices so we can reduce complexity without regressing behaviour. It replaces the retired `docs/maintainability-refactor-plan.md` and works alongside `docs/consolidated-audit-plan.md` to provide end-to-end guidance.

---

## Project Snapshot (Q1 2025)

- **Frameworks:** Next.js 15.2 (`app/` router), React 19, TypeScript modules.
- **Key entry points:** `app/page.tsx` (1,941 LOC) orchestrates navigation, spaced repetition, import/export, and toast UX. `components/quiz-session.tsx` (966 LOC) drives per-question flows. `utils/quiz-validation-refactored.ts` (1,357 LOC) owns parsing, validation, LaTeX cleanup, and SRS metrics.
- **Shared state:** Currently distributed through prop drilling; context providers are minimal.
- **Testing & quality commands:**  
  `npm run lint` ; `npm run typecheck` ; `npm test` (`vitest` unit + integration + accessibility) ; `npm run test:e2e` (`playwright`) ; `npm run depcheck` ; `npm run prune:exports` ; `npm run unused` (`knip`).
- **Fixtures:** Public markdown assets have been trimmed; active fixtures live under `public/advanced-test-quiz.md`, `public/default-quiz.json`, and the curated `/public/dsa` set.
- **Current docs:**  
  `docs/consolidated-audit-plan.md` (historic ARDs), `docs/TESTING.md` (pending updates), `README.md` (project overview).

---

## Audit Summary

### 1. Monolithic UI Shell (`app/page.tsx`)

- **Symptoms:** 15+ state hooks (`useState`, `useMemo`, `useCallback`) and command handlers co-located with JSX for dashboard, quiz, review, import/export, and modal flows.
- **Risks:** Hard-to-reason side effects, difficult testing, and brittle future changes (e.g., new review queues or editor UX).
- **Opportunity:** Extract state orchestration into hooks (`useQuizSessionState`, `useReviewQueue`, `useImportExport`) and prune view-specific JSX into focused components (`DashboardView`, `QuizView`, `ReviewView`, `AllQuestionsScreen` wrappers).

### 2. Oversized Session Component (`components/quiz-session.tsx`)

- **Symptoms:** Handles keyboard shortcuts, option selection, accessibility announcements, historical view, edit mode, import/export, and navigation toolbars in one file.
- **Risks:** Duplicate logic with `AccessibleOptionList`, high prop surface area, and limited reusability of accessibility widgets.
- **Opportunity:** Split into domain hooks (`useDisplayedOptions`, `useSessionHistory`) plus subcomponents (`SessionToolbar`, `StatsSidebar`, `OptionDeck`, `ExplanationPanel`). Remove vestigial code (commented imports like `QuestionNavigationMenu`) or revive intentionally.

### 3. Validation & Parsing Coupling (`utils/quiz-validation-refactored.ts`)

- **Symptoms:** JSON sanitisation, markdown parsing, schema validation, LaTeX correction (with verbose logging), and SRS statistics live together.
- **Risks:** Any change to validation touches multiple domains; console noise from `correctLatexInJsonContent` leaks into production.
- **Opportunity:** Modularise into `lib/quiz/parser/markdown-to-quiz.ts`, `lib/quiz/validator/quiz-schema.ts`, `lib/quiz/latex/normalize.ts`, `lib/quiz/srs/stats.ts` and re-export the current API from a thin facade.

### 4. Option Display Duplication

- **Symptoms:** `QuizSession` and `components/a11y/AccessibleOptionList.tsx` both rebuild `{ isSelected, isCorrect, isIncorrect }` flags; `components/all-questions-view.tsx` reimplements similar logic when reconstructing `displayedOptions` from history.
- **Risks:** Styling or correctness changes must be updated in three places; mismatches can desynchronise accessibility hints.
- **Opportunity:** Introduce `lib/quiz/get-option-display-state.ts` returning a canonical option state, and retrofit all renderers.

### 5. Logging Noise & Dev-Only Tooling

- **Symptoms:** Frequent `console.log` calls in validation and session handlers (e.g., `correctLatexInJsonContent`) fire in production builds.
- **Risks:** Polluted browser console, potential performance overhead.
- **Opportunity:** Add `lib/debug/log.ts` (environment-aware), promote `NEXT_PUBLIC_ENABLE_DEBUG`, and remove lingering `console.log` in factories.

### 6. Fixture & Docs Gaps

- **Symptoms:** Documentation still references removed fixtures; `docs/TESTING.md` is missing the Vitest/Playwright split and `.gitignore` rationale for Playwright artefacts.
- **Risks:** Onboarding confusion; regressions if contributors reintroduce legacy fixtures.
- **Opportunity:** Update docs, lock curated fixtures, and add QA checklist.

### 7. Additional Findings (Latest Pass)

- **`components/all-questions-view.tsx`:** Recomputes displayed options from history. Consider sharing logic via the helper above and memoising heavy transforms.
- **`lib/files.ts`:** Empty placeholder; either implement (e.g., shared file import/export helpers) or delete to prevent dead references.
- **Markdown pipeline (`lib/markdown/pipeline.ts`):** Confirm it exports minimal surface area; evaluate splitting I/O vs transformation layers to ease testing.
- **Test organisation:** `tests/debug-math-parsing.ts` and `test-katex-output.mjs` act as manual probes. Wrap their scenarios in automated tests (Vitest or Playwright) so they run during CI.
- **Dead comments:** Remove commented imports/blocks in `QuizSession`, `app/page.tsx`, and `AllQuestionsView` to cut noise.

---

## Refactor Workstreams (Detailed Playbook)

### Workstream 1 - Session Shell Decomposition

- **Objective:** Separate orchestration logic from UI in `app/page.tsx`.
- **Steps:**
  1. Extract `useQuizSessionState` under `lib/quiz/` to encapsulate state, derived selectors, and handlers (`handleSelectOption`, `handleSubmitAnswer`, history navigation, import/export).
  2. Add lightweight view wrappers (`DashboardScreen.tsx`, `QuizScreen.tsx`, `ReviewScreen.tsx`, `AllQuestionsScreen.tsx`) that receive props from the hook.
  3. Replace inline JSX with the new components; keep prop contracts identical.
- **Safety:** Unit-test the hook (`tests/unit/hooks/use-quiz-session-state.test.ts`) using `@testing-library/react`'s `renderHook`. Snapshot key prop shapes before/after extraction.
- **Verification:** `npm run lint`, `npm run typecheck`, `npm test`, manual smoke (welcome -> quiz -> review). Ensure import/export still works with sample fixtures.
- **Rollback:** Each extraction is its own commit. Revert the latest commit to restore previous behaviour if regressions appear.

### Workstream 2 - Quiz Session Modularisation

- **Objective:** Make `components/quiz-session.tsx` composable.
- **Steps:**
  1. Identify cohesive regions (toolbar, option grid, sidebar stats, explanation drawer, history controls) and move them into `components/quiz-session/` subfolder.
  2. Extract shared state into hooks (`useOptionRandomizer`, `useSessionHistory`, `useKeyboardShortcuts`).
  3. Replace duplicated computations with shared helpers (option display state, progress percentages).
- **Safety:** Add component-level tests (Vitest + React Testing Library) covering keyboard navigation, selection, and edit mode toggles.
- **Verification:** Run `npm test` and ensure Playwright's key navigation suite (if any) still passes; consider adding a targeted Playwright test for session history navigation.

### Workstream 3 - Validation & Parsing Modules

- **Objective:** Split `utils/quiz-validation-refactored.ts` into reusable packages without modifying the exported API.
- **Steps:**
  1. Create `lib/quiz/parser/markdown-to-quiz.ts` (markdown -> intermediate model).
  2. Create `lib/quiz/validator/quiz-schema.ts` (Zod schema + helpers) and `lib/quiz/latex/normalize.ts` (LaTeX sanitation, now silent by default).
  3. Wire them through an `index.ts` (`export * from './modules'`) and update `utils/quiz-validation.ts` (facade) to import from the new modules.
- **Safety:** Existing tests (`tests/unit/validation/*.ts`, `tests/unit/parser/*.ts`, `tests/unit/renderer/latex-functionality.test.tsx`) must pass unchanged. Add regression tests for LaTeX correction logging toggles.
- **Verification:** `npm test`, manual import of markdown fixtures, log inspection in prod build (`npm run build && npm run start`).

### Workstream 4 - Shared Option Display State

- **Objective:** Guarantee consistent state derivation across quiz renderers.
- **Steps:**
  1. Add `lib/quiz/get-option-display-state.ts` with pure helpers (no React). Accepts inputs `option`, `selectedOptionId`, `correctOptionIds`, `isSubmitted`.
  2. Update `QuizSession`, `AccessibleOptionList`, and `AllQuestionsView` to consume the helper.
- **Safety:** Create `tests/unit/quiz/get-option-display-state.test.ts` covering correct/incorrect selections, multi-answer, and unsubmitted flow.
- **Verification:** `npm test`, manual QA for keyboard + pointer interactions to confirm styling.

### Workstream 5 - Debug Logging Guardrail

- **Objective:** Silence noisy logs outside development.
- **Steps:** Introduce `debugLog(message, ...args)` that only writes when `process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true'` or `NODE_ENV !== 'production'`. Replace direct logs in validation and session files.
- **Safety:** Provide a unit test toggling the env var to assert behaviour. Ensure `console.error` for real failures remains.
- **Verification:** `npm run build` should output zero unwanted logs in the browser console.

### Workstream 6 - Documentation & Fixture Hygiene

- **Objective:** Align docs with curated assets and new workflows.
- **Steps:** Update `docs/TESTING.md` with latest commands, note Playwright artefacts to keep out of git, list supported fixtures, and link to ARD template (below). Add CI checklist for contributors.
- **Verification:** Run `npm run lint` (docs formatted via Prettier). Confirm no stale fixture references with `rg 'linked-lists-quiz' docs tests`.

### Workstream 7 - Tooling-Based Footprint Reduction

- **Objective:** Quantitatively trim unused code and dependencies.
- **Steps:** Schedule periodic runs of `npm run depcheck`, `npm run prune:exports`, `npm run unused`, and `npm run graph`. Capture outputs in ARDs and remove dead modules.
- **Verification:** After each removal, run the full test suite and manual smoke.
- **Rollback:** Reinstall dependency (`npm install <pkg>`) or restore files from git if removal was premature.

---

## ARD Workflow & Template

To prevent regressions while refactoring, every significant change should ship with an ARD entry under `docs/consolidated-audit-plan.md` (or a new dated file linked from there).

### When to Write an ARD

- Creating or moving shared hooks/components.
- Adjusting validation, parsing, or state management.
- Deleting/renaming public exports or CLI commands.
- Introducing new tooling or test coverage that changes contributor workflows.

### Required ARD Sections

1. **Context** - What pain point is being addressed? Reference file paths (e.g., `app/page.tsx:1-1941`) and metrics (LOC, performance, coverage).
2. **Decision** - Concise statement of the chosen approach. Enumerate sub-decisions if multiple slices land together.
3. **Alternatives Considered** - Optional but encouraged for major shifts. Include the status quo as a baseline.
4. **Consequences**
   - _Positive_ - e.g. "Extracted `useQuizSessionState` reduces app/page.tsx by 800 LOC."
   - _Risks & Mitigations_ - e.g. "Potential mismatch between hook and UI; covered by new hook tests."
5. **Verification** - Exact commands executed (`npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, manual scenarios).
6. **Rollback Plan** - Specify the commit(s) to revert or feature flag to disable.
7. **Follow-ups** - Deferred tasks, open bugs, or documentation updates.

### ARD Template Snippet

```md
### ARD: Extract `useQuizSessionState` (2025-02-12)

- **Context:** `app/page.tsx` is 1,941 LOC with intertwined state and UI.
- **Decision:** Move state orchestration into `lib/quiz/useQuizSessionState.ts` while keeping public props intact.
- **Consequences:**
  - [pass] Decreases `app/page.tsx` by 820 LOC; hook now unit-tested.
  - [risk] Hook introduces new dependency graph; mitigated by adding tests and storybook coverage.
- **Verification:** `npm run lint`, `npm run typecheck`, `npm test`, manual walkthrough (import default quiz, complete session).
- **Rollback:** Revert commits `abc1234` and `def5678`.
- **Follow-ups:** Evaluate context provider once rest of shell is modularised.
```

Store each ARD chronologically; link forward to related ARDs (e.g., Option Display helper) so future maintainers can trace the history.

---

## Verification & Regression Safety Net

- **Automated:**  
  `npm run lint` -> ESLint/Next checks  
  `npm run typecheck` -> TypeScript structural assurances  
  `npm test` -> Vitest unit + integration + accessibility suites  
  `npm run test:e2e` -> Playwright flows (Chromium/Firefox/WebKit)  
  Optional: `npm run coverage`, `npm run analyze`, `npm run size` prior to release.

- **Manual QA:**
  1. Boot `npm run dev`, load `/`.
  2. Walk through Welcome -> Dashboard -> Quiz session -> Review screen, toggling All Questions View.
  3. Import curated markdown fixtures, including LaTeX-heavy samples (`public/advanced-test-quiz.md`).
  4. Export incorrect answers JSON, re-import, verify state persistence.
  5. Toggle debug flag (`NEXT_PUBLIC_ENABLE_DEBUG=true`) and confirm logs appear only when expected.

- **Tooling Checks:**
  - `npm run depcheck`, `npm run prune:exports`, `npm run unused` after large refactors.
  - `npm run graph` (Madge) to visualise dependency cycles, ensuring new hooks do not introduce circular imports.

Record the above in each ARD to document evidence.

---

## Rollback & Contingency Planning

- **Commit Discipline:** Ship each workstream slice in its own commit (or small stack). Avoid cross-cutting changes in a single diff.
- **Revert Strategy:** If an issue appears post-merge, use `git revert <sha>` rather than force rewrites; this preserves audit history.
- **Feature Flags:** For risky shifts (e.g., new import/export implementation), consider gating behind an environment variable so you can toggle behaviour without redeploying.
- **Backup Artefacts:** Before deleting fixtures or modules, log their paths in ARDs and archive them under `docs/archive/` if future reference might be required.

---

## Backlog & Next Actions

1. Implement Workstream 1 (`useQuizSessionState`) and capture ARD.
2. Parallelise Workstream 3 (validation modules) with shared helper extraction (Workstream 4) to unblock unit tests.
3. Update `docs/TESTING.md` (and optionally `README.md`) to link to this guide for future contributors.
4. Schedule a `depcheck`/`knip` run once modularisation lands to prune unused Radix imports and placeholder files (`lib/files.ts`).
5. Convert `tests/debug-math-parsing.ts` into a formal Vitest suite and delete manual scripts once covered.

Following this playbook keeps behaviour stable, shrinks hotspots, and guarantees every decision is justified, test-backed, and reversible.
