# Quiz SRS Issue Audit

This document captures a deep-dive analysis of the critical and high-priority defects that were reported. For each item we document the observed behaviour, the code paths responsible, side-effects to watch for, and recommendations for remediation together with dependency risks.

## A1. KaTeX / Math Rendering Failures

### Observations

- Inline and block math render as raw text duplicated alongside KaTeX output (e.g. `O(n2)O(n^2)O(n2)`), and relation symbols such as `\\le`, `\\rightarrow`, `\\cdot` show up escaped instead of as glyphs.
- Pseudo-code is displayed as inline text with `<br>` separators instead of fenced blocks, so structured examples (e.g. the recursive `Power` sample) lose formatting.【F:public/default-quiz.json†L2738-L2755】

### Root Causes

1. **Sanitizer strips KaTeX MathML and attributes.** The unified pipeline renders math via `rehype-katex`, but the custom sanitize schema whitelists only generic HTML tags (`p`, `span`, `div`, etc.) and attributes (`class`, limited `data-*`). KaTeX injects MathML tags such as `<math>`, `<semantics>`, `<mrow>` plus structural attributes (`aria-hidden`, `style`) inside `<span class="katex-mathml">`. Because those tags/attributes are absent from the schema, sanitization removes the MathML wrapper while leaving the fallback text in place, so both the raw text and the HTML rendering survive, causing duplicates and leaking TeX commands.【F:lib/markdown/pipeline.ts†L18-L109】
2. **Post-processing mutates math content.** `processExplanationText` rewrites explanation strings by injecting `<strong>` wrappers and raw option text. This runs _after_ markdown parsing and replaces IDs with quoted option text without escaping. Any option containing TeX (e.g. `$O(n^2)$`) is interpolated verbatim into an HTML string, bypassing remark/rehype, so TeX delimiters become regular text and are no longer tokenised by the math plugin.【F:components/quiz-session.tsx†L374-L410】
3. **Source content mixes HTML and bare TeX.** Large portions of the default quiz use manual `<br>` tags and raw `\\le` outside math delimiters. Even with the pipeline fixed, these inputs will never parse as math because remark-math only recognises `$...$`, `$$...$$`, `\\(...\\)`, `\\[...\\]`.【F:public/default-quiz.json†L2738-L2755】
4. **Aggressive “auto-correction” risks double escaping.** The import path calls `correctLatexInJsonContent` whenever JSON parsing fails. That helper iterates through an enormous list of LaTeX commands and forcefully inserts extra backslashes (`\\` → `\\\\`) inside any JSON string containing `$`. Legitimate content already escaped for JSON ends up double escaped (`\\le` → `\\\\le`), which renders as literal `\le` after markdown processing.【F:utils/quiz-validation-refactored.ts†L20-L220】

### Remediation Plan

- Extend the sanitize schema to explicitly allow KaTeX’s MathML tags (`math`, `semantics`, `mrow`, etc.) and accessibility attributes (`aria-hidden`, `role`, `style`). Alternatively, run `rehype-katex` **after** sanitisation using a `rehype-raw` pass restricted to math nodes.
- Stop string-mangling explanations. Instead of `processExplanationText`, detect option references during markdown parsing (e.g. via a remark plugin) so replacements stay inside the AST and pass back through the KaTeX/markdown renderers.
- Remove or dramatically limit `correctLatexInJsonContent`; prefer schema validation that surfaces errors to the author rather than mutating content. If a normalisation step is retained, ensure it only patches known bad patterns and keeps a reversible diff for user review.
- Update authoring guidelines and content lint (unit tests already exist) to enforce consistent math delimiters and fenced code blocks.

### Non-Breaking Implementation Safeguards

- Gate the sanitiser/schema changes behind a feature flag (for example `enableSafeMathHtml`) so production can fall back to the existing pipeline until regression tests and manual QA finish. Use staging snapshots to verify rendered HTML before rollout.
- Add snapshot tests for canonical math-heavy questions (Big-O, recursive definitions) prior to refactoring. After the change, assert the same textual content remains while KaTeX MathML nodes are preserved to guarantee no functional loss.
- Keep the old `processExplanationText` implementation temporarily as `legacyProcessExplanationText` and guard it behind a prop on `MarkdownRenderer`. Remove it only after AST-based interpolation is validated across history playback and exports.
- Before deleting `correctLatexInJsonContent`, ship a CLI/content lint that scans existing quiz JSON for patterns currently “fixed” by the helper. Once telemetry shows no live dependence, remove the helper in a separate, low-risk commit.

### Dependency Risks

- `MarkdownRenderer` is the single entry point for rendering markdown (`QuizSession`, `OptionCard`, editor previews, All Questions view). Schema changes affect every consumer, so regression tests (unit + integration) must be updated alongside CSS expectations (`katex` styles in `app/globals.css`).【F:components/quiz-session.tsx†L759-L793】【F:components/option-card.tsx†L3-L85】【F:app/globals.css†L216-L264】
- Replacing explanation post-processing touches history playback and import/export (snapshots in `SessionHistoryEntry` assume plain strings). Any AST-level solution must keep those snapshots serialisable.
- Taming the LaTeX “correction” routine affects both quiz/module imports and state imports (`handleLoadQuiz`, `handleImportState`); expect to adjust validation messaging and possibly the import UI flows.【F:app/page.tsx†L648-L799】【F:app/page.tsx†L793-L897】

### Code Removal & Dependency Map

- **Delete `processExplanationText`.** The helper rewrites HTML strings, leaks TeX, and is invoked directly before rendering explanations. Remove it once explanation interpolation moves into the markdown AST; every caller (`MarkdownRenderer` in the explanation card) already accepts pure markdown.【F:components/quiz-session.tsx†L374-L410】【F:components/quiz-session.tsx†L781-L793】
- **Retire `sanitizeFallback`.** The fallback emits `<br>` replacements and bypasses KaTeX entirely, reintroducing the duplication issue. After tightening schemas, surface errors instead of silently returning escaped HTML; only keep a telemetry hook for observability.【F:lib/markdown/pipeline.ts†L124-L135】
- **Sunset `correctLatexInJsonContent`.** The mutation-heavy pass should be removed once imports rely on schema validation and author feedback. Its current breadth touches more than 200 LaTeX commands and double-escapes valid input.【F:utils/quiz-validation-refactored.ts†L20-L260】
- **Consolidate KaTeX sanitisation in one place.** Today both the pipeline schema and the post-render regex guard in `MarkdownRenderer` attempt to police HTML. Once KaTeX tags are whitelisted, keep sanitation exclusively inside the unified pipeline and convert the regex guard into logging only.【F:components/rendering/MarkdownRenderer.tsx†L24-L86】

## A2. Import / Export Dead Ends

### Observations

- “Load New Module” does nothing besides logging “not implemented yet”.
- Import Question(s) never updates the quiz even when the JSON validates.
- Import/Export state relies on success toasts but users do not see downloaded files consistently.

### Root Causes

1. **Unimplemented module loader.** `handleLoadNewModule` is explicitly a placeholder that only logs to console. Buttons in the dashboard and completion screen call into this no-op handler, so the UI appears broken.【F:app/page.tsx†L1127-L1134】
2. **Question import stops at TODO.** `handleInitiateImportCurrentQuestionState` parses and validates the payload, but after staging data in `questionsToReviewForAppend` it never applies the mutations because the append/overwrite flow is left as “TODO”. The user only gets informational toasts, so no questions change.【F:app/page.tsx†L941-L1013】
3. **State import/export robustness gaps.** `readFileAsText` assigns `reader.onload` twice, and there is no schema versioning or transactional merge. More importantly, the same mutation-heavy LaTeX “correction” runs during import, risking hidden data corruption.【F:app/page.tsx†L626-L646】【F:utils/quiz-validation-refactored.ts†L20-L220】

### Remediation Plan

- Implement `handleLoadNewModule` to surface a file picker (reuse the dashboard import input), validate via `validateQuizModule`, and reset module/session state once confirmed.
- Finish the import append/overwrite workflow: present a review modal, support true append (with ID reconciliation), and flush staged data into `currentModule` with stat recalculation (`recalculateChapterStats`).
- Harden state import/export:
  - Refactor `readFileAsText` to set `onload` once and reject properly.
  - Add JSON schema versioning and deep validation (ideally using `zod`/`ajv`) so users get actionable errors instead of silent mutation.
  - Emit downloads via an anchored element added to the DOM (to cover Safari/iOS) and delay `URL.revokeObjectURL` via `requestAnimationFrame` to prevent race conditions.

### Non-Breaking Implementation Safeguards

- Ship schema validation in “warn” mode initially: log detailed validation errors without blocking imports, and capture telemetry on how often users would have been blocked. Promote warnings to hard failures only after usage data confirms minimal disruption.
- Preserve the current export button UX by keeping toast messaging identical while layering in the Blob download behaviour. Hide the new download anchor behind a capability check so legacy browsers still succeed.
- When loading a module, stage the existing `currentModule` and session progress in memory. If validation fails or the user cancels, immediately restore the prior state to avoid data loss.
- Build the append/overwrite flow with a dry-run preview that highlights intended mutations. Reuse the dry-run both in the UI and automated tests to ensure ID reconciliation and stat recalculation remain safe before enabling destructive writes.

### Dependency Risks

- Module load/import touches all session state: resetting chapter/question indices, review queues, edit mode flags, and toast notifications. Regression tests for dashboard metrics and review counts must run after each change (`recalculateChapterStats` is widely called).【F:app/page.tsx†L1269-L1397】
- Implementing append/overwrite alters how IDs are generated; ensure helper utilities (`generateUniqueOptionId`, `generateUniqueQuestionId`) remain consistent with imported data.【F:app/page.tsx†L300-L345】
- Import/export flows interact with both dashboard actions and in-quiz quick export buttons (`QuizSession` top-right). The accessible tooltips and button enablement need to stay in sync.【F:components/quiz-session.tsx†L798-L819】

### Code Removal & Dependency Map

- **Eliminate duplicate FileReader handlers.** `readFileAsText` assigns `reader.onload` twice, clobbering the first handler and masking errors. Replace it with a single resolver and extract to a shared utility used by every import path.【F:app/page.tsx†L626-L645】
- **Remove the console-driven placeholders.** `handleLoadNewModule` and the append/overwrite TODOs should be replaced with actual state mutations. Once implemented, delete the surrounding `console.log` scaffolding to avoid leaking progress data in production builds.【F:app/page.tsx†L941-L1134】
- **Deprecate LaTeX auto-correction on imports.** As noted in A1, removing `validateAndCorrectQuizModule`’s mutation step will require the import/export UI to display validation errors instead. Update both dashboard and in-session importers to consume the stricter validator so behaviour stays consistent.【F:app/page.tsx†L703-L909】【F:utils/quiz-validation-refactored.ts†L406-L455】
- **Centralise download triggers.** The per-feature blob download snippets (state export, question export, mistake export) should call a shared `downloadBlob` helper that handles Safari-safe revocation timing; this allows removal of inline DOM mutation in multiple components.【F:app/page.tsx†L910-L937】

## A3. Answer Status Flips When Viewing History

### Root Causes

1. **History view reads the wrong answer key.** `QuizSession` swaps question text and options to the historical snapshot (`displayQuestion = historicalEntry.questionSnapshot`) but still passes `question.correctOptionIds` (the _current_ live question) to `AccessibleOptionList`. When you review an earlier answer, the renderer compares your stored selection against the answer key for whatever live question is in context (often the next question), marking even correct selections as wrong.【F:components/quiz-session.tsx†L770-L777】
2. **Global selection leaks between contexts.** `handleViewPreviousAnswer` / `handleViewNextInHistory` set the shared `selectedOptionId` and `isSubmitted` states to the historical values but no code clears them when you leave history mode (e.g., by dismissing the history view or navigating elsewhere). Those stale IDs survive into the next live question, so the Submit button becomes enabled with an option ID that does not belong to the new question; scoring treats it as incorrect.【F:app/page.tsx†L1542-L1584】

### Remediation Plan

- Drive `AccessibleOptionList` from `displayQuestion.correctOptionIds` so historical renders rely on the same snapshot already used for text/options.
- Introduce an explicit “exit history view” path that clears `selectedOptionId`/`isSubmitted` (or store separate history-only state). On every `currentHistoryViewIndex` change back to `null`, reset the shared selection.
- Consider storing `selectedOptionId` per question (e.g., keyed by `questionId`) instead of globally; the module data already tracks `lastSelectedOptionId`, which could seed the UI when revisiting.

### Dependency Risks

- Changes to `AccessibleOptionList` inputs affect accessibility expectations (aria attributes, keyboard nav). Verify behaviour across history mode, live quizzes, and review sessions because the same component serves all paths.【F:components/a11y/AccessibleOptionList.tsx†L1-L148】
- Clearing selection on history exit must respect review sessions and edit mode toggles. Review mode currently relies on reusing the same `selectedOptionId` state when stepping through due cards.【F:app/page.tsx†L580-L624】

### Code Removal & Dependency Map

- **Delete history-specific branching in `AccessibleOptionList`.** Once selections are stored per question, the component no longer needs to juggle `displaySelectedOptionId` vs. live state; use a single source of truth and remove the bespoke focus bookkeeping that pre-selects index 0 on mount.【F:components/a11y/AccessibleOptionList.tsx†L85-L109】
- **Fold history view state into a dedicated reducer/store.** Extract the history navigation (`currentHistoryViewIndex`, `isViewingHistoricalEntry`, `displayQuestion`) into a separate slice so the main session state does not leak selections. This enables removing the conditional branches in `QuizSession` that thread `display*` props around live components.【F:components/quiz-session.tsx†L750-L799】【F:app/page.tsx†L1542-L1584】
- **Retire global `selectedOptionId` for per-question cache.** Use the existing `lastSelectedOptionId` on each question and drop the top-level React state. This prevents accidental reuse when navigating and lets us delete the manual resets sprinkled across navigation handlers.【F:app/page.tsx†L600-L624】【F:components/quiz-session.tsx†L770-L777】

## A4. Options Appear Pre-Selected on First Load

### Root Causes

1. **Shared selection state is reused for multiple contexts.** As noted above, history navigation writes into the main `selectedOptionId` without guaranteeing cleanup. If you view a previous answer and then switch back to a new question, the radio group receives a non-null `selectedOptionId` whose value does not match any displayed option. The UI shows no highlight, but the submit button is enabled and pressing it immediately counts as a wrong answer, giving the impression that an answer was auto-selected.【F:app/page.tsx†L1542-L1584】【F:components/quiz-session.tsx†L770-L777】
2. **Option list autofocus can be misinterpreted as selection.** `AccessibleOptionList` always calls `focusOption(0)` when options change, placing keyboard focus on the first choice. Combined with the styling in `OptionCard`, this focus ring can look like an active selection—especially for keyboard/screen-reader users—despite `aria-checked="false"`.【F:components/a11y/AccessibleOptionList.tsx†L85-L100】【F:components/option-card.tsx†L31-L67】

### Remediation Plan

- Resolve the shared state leak per A3 so new questions start with `selectedOptionId = null`.
- Differentiate focus from selection visually (e.g., use an outline instead of filled background) and only move focus automatically when accessibility requires it. Alternatively, delay `focusOption(0)` until the user tabs into the group.

### Dependency Risks

- Visual tweaks to `OptionCard` affect every quiz view (dashboard previews, All Questions, editor review). Regression snapshots may need updates.
- Adjusting focus management must be validated against existing a11y tests (keyboard navigation suite in `tests/a11y`).

### Code Removal & Dependency Map

- **Separate focus visuals from selection styling.** Move the gradient background to a `[data-selected="true"]` CSS rule and leave focus outlines to the radiogroup wrapper, allowing removal of hover/active gradients that mimic selection.【F:components/option-card.tsx†L28-L55】【F:components/a11y/AccessibleOptionList.tsx†L117-L135】
- **Gate automatic focus.** After per-question state is introduced (A3), drop the unconditional `focusOption(0)` effect so the first option is not programmatically focused until the user enters the group. This prevents perceived auto-selection and simplifies keyboard handling.【F:components/a11y/AccessibleOptionList.tsx†L85-L109】

## B1. “All Questions” View Resets Progress

### Root Cause

`AllQuestionsView` initialises its own `questionStates` map inside a `useEffect` that runs on every `chapter.questions` change. Each entry starts with `isSubmitted: false`, `isCorrect: null`, and a freshly shuffled option list, ignoring the canonical stats stored in `QuizChapter` / `QuizQuestion`. As soon as the component mounts, the user-visible progress is reset to zero because the derived `scoreData` counts only these local submissions.【F:components/all-questions-view.tsx†L45-L169】

### Remediation Plan

- Drive the All Questions grid from the shared module state: seed each question with `question.status`, `lastSelectedOptionId`, and `timesAnsweredCorrectly` instead of a blank slate. Presenting historical answers should use the same snapshots as the main session history.
- If ad-hoc practice is desired, keep it behind an explicit “reset” action so the user understands progress is temporary.

### Dependency Risks

- The component currently duplicates the option sampling logic from `QuizSession`. Consolidating that logic would reduce divergence but requires careful treatment of SRS fields like `shownIncorrectOptionIds` to avoid corrupting review queues.

### Code Removal & Dependency Map

- **Drop local `questionStates`.** Replace the component-level `useState` map with selectors into the canonical module state so option selection reflects persisted progress. Once live data drives the UI, delete `generateDisplayedOptionsForQuestion` and reuse the same presenter used by the quiz session.【F:components/all-questions-view.tsx†L31-L139】
- **Unify progress calculations.** Remove the bespoke `scoreData` memo and defer to the shared progress utilities already used on the dashboard, preventing drift in percentage calculations. This will also remove the need for duplicated `ProgressBar` wiring inside the component.【F:components/all-questions-view.tsx†L120-L139】

### Non-Breaking Implementation Safeguards

- Introduce the new centralised selectors behind an experiment flag while continuing to derive UI from the legacy local state. Render the flag-controlled data to a hidden dev-only inspector in staging to confirm parity before deleting the legacy path.
- Before removing `generateDisplayedOptionsForQuestion`, port its unit tests to the shared presenter helper and run them in both implementations to ensure option ordering and weighting remain unchanged.
- When persisting answer status, version the stored shape and support deserialising both the legacy boolean fields and the new structured object. Provide a migration function that runs during hydration to keep existing saved sessions functional.

## B2/B3. Editor & UI Consistency Gaps

While not requested for immediate fixes, note that:

- The question editor and import workflows share validation helpers (`validateSingleQuestion`, `normalizeSingleQuestion`). Any improvements to import should be mirrored in the editor to avoid inconsistent rules.【F:utils/quiz-validation-refactored.ts†L458-L607】
- Button labelling/toast consistency relies on central handlers in `app/page.tsx`; introducing a copy audit will likely require extracting these strings into a shared config to keep dashboard, quiz session, and completion views synchronised.【F:components/quiz-complete.tsx†L150-L199】【F:components/dashboard.tsx†L45-L120】

### Code Removal & Dependency Map

- **Cull duplicated validation logic.** `utils/quiz-validation-refactored.ts` re-implements logic present in `utils/quiz-validation/index.ts`. After consolidating schema validation (A2), delete the refactored file and re-export consistent validators from a single module to avoid divergence.【F:utils/quiz-validation-refactored.ts†L1-L520】
- **Extract toast copy constants.** Remove scattered string literals inside `app/page.tsx`, `quiz-session.tsx`, and `quiz-complete.tsx` in favour of a shared locale file so button labels and notifications stay aligned across routes.【F:app/page.tsx†L621-L909】【F:components/quiz-session.tsx†L798-L838】【F:components/quiz-complete.tsx†L150-L199】

## Additional Maintainability Concerns

- The validation/correction module (`utils/quiz-validation-refactored.ts`) is monolithic (~1.4k LOC) with side effects (`console.log` spam) baked in. Splitting it into smaller utilities (schema validation, LaTeX linting, import normalisation) will simplify testing and reduce the blast radius of future fixes.
- Markdown rendering is tightly coupled to client-side async effects (`useEffect` in `MarkdownRenderer`). Consider pre-processing markdown server-side or memoising processed HTML to avoid repeated pipeline runs on every render.
- Session state management in `app/page.tsx` has grown organically; extracting a store (e.g., Zustand or Redux) or even React Context reducers would make features like history view isolation (A3/A4) easier to implement and test.

## Shared Dependency Impact & Sequencing

1. **Start with markdown pipeline hardening.** Expanding the sanitisation schema and removing mutation helpers must precede import/export changes so that the same AST guarantees apply everywhere. Update KaTeX CSS only after verifying the new markup to avoid regressions in dark-mode theming.【F:lib/markdown/pipeline.ts†L18-L135】【F:app/globals.css†L216-L264】
2. **Refactor state/import flows next.** Once markdown is stable, replace `correctLatexInJsonContent` and the FileReader helper so every import path feeds through the same validator. This change should land with integration tests covering dashboard import, in-session import, and review-session state restoration.【F:app/page.tsx†L626-L909】【F:utils/quiz-validation-refactored.ts†L20-L455】
3. **Finally address answer-state persistence.** After centralising imports, move session state into a dedicated store and delete global selection state. This sequencing reduces the chance of conflicts because history snapshots and import/export share question models.【F:components/quiz-session.tsx†L750-L799】【F:components/a11y/AccessibleOptionList.tsx†L85-L140】

## Observability & Testing Notes

- Add logging or telemetry around the markdown processor (e.g., counts of stripped tags) before removing `sanitizeFallback` so regressions can be detected quickly in production.【F:components/rendering/MarkdownRenderer.tsx†L30-L86】
- Extend the unit test suite to assert that KaTeX MathML nodes survive sanitisation, that imports reject malformed JSON without mutation, and that navigating history does not change `selectedOptionId`. These tests should live alongside existing integration specs in `tests` and mirror the production flows (`QuizSession`, All Questions, dashboard).【F:components/quiz-session.tsx†L750-L799】【F:components/all-questions-view.tsx†L45-L139】

---

Addressing the A-level issues above should stabilise math rendering, restore import/export functionality, and prevent answer state regressions, unblocking downstream UX fixes in the B/C backlog.

## Maintainability Deep Dive (Cross-Cutting)

### 1. Break Up `app/page.tsx`

- The root page file now exceeds 1.6k LOC and mixes toast helpers, import/export orchestration, SRS review logic, editor CRUD, and UI routing in a single component. This makes it difficult to reason about side effects and to write focused unit tests.【F:app/page.tsx†L58-L1720】
- Refactor into feature modules:
  - `useModuleStore` (Zustand/Redux or React context reducer) for session state, separating quiz flow, review flow, history, and editor concerns. Extracting state unlocks per-question caches (see A3/A4) and simplifies resetting when importing modules.【F:app/page.tsx†L58-L200】【F:app/page.tsx†L1600-L1719】
  - `useImportExportService` wrapping `readFileAsText`, schema validation, and Blob downloads so the UI layer just calls `await service.importState(file)`. This allows swapping implementations without touching the UI.
  - `useReviewScheduler` for the SRS prioritisation algorithm to eliminate console-driven debugging logic and enable isolated testing of due-selection heuristics.【F:app/page.tsx†L514-L620】

### 2. Eliminate Duplicate Validation Implementations

- `utils/quiz-validation/index.ts` simply re-exports the monolithic `quiz-validation-refactored` module, so every consumer imports hundreds of lines of LaTeX heuristics and console noise even when only normalization is required.【F:utils/quiz-validation/index.ts†L1-L28】【F:utils/quiz-validation-refactored.ts†L1-L200】
- Split validation into composable pieces (schema validation, correction heuristics, stats recalculation). Once schemas are authoritative (A2), retire `correctLatexInJsonContent` and keep the heavy correction logic behind an explicit, opt-in utility for legacy migrations.【F:utils/quiz-validation-refactored.ts†L20-L200】
- Move side-effect-free helpers into `lib/` so shared logic (e.g., `recalculateChapterStats`) can be tree-shaken by bundlers instead of bundling the entire refactored file.

### 3. Centralise Option Presentation

- `QuizSession` hand-rolls option sampling, caches displayed options, and logs extensively; All Questions recreates similar logic, and future editor previews will likely do the same.【F:components/quiz-session.tsx†L94-L213】【F:components/all-questions-view.tsx†L31-L169】
- Extract a `buildDisplayedOptions(question, rng)` helper that returns deterministic option sets. By moving this to a shared module, you can delete duplicated state and ensure import/export/history all use the same derived data. Unit tests then only need to target that helper.
- With shared derivation, `AccessibleOptionList` no longer needs bespoke history props; it can accept a single `options` array with metadata, reducing prop surface area and simplifying keyboard handling (see A3/A4).

### 4. Remove Debug Logging & Harden Instrumentation

- The app currently logs almost every action (`console.log` in edit mode, import/export flows, quiz submission, review queue processing). This is noisy in production and leaks internal state to the console.【F:app/page.tsx†L132-L155】【F:app/page.tsx†L653-L678】【F:components/quiz-session.tsx†L94-L140】
- Replace ad hoc logging with scoped debug utilities (e.g., `debugStore.log()` gated behind `process.env.NODE_ENV !== 'production'`). Use toast + telemetry events for user-facing feedback instead of console output.
- Ensure reusable utilities like `readFileAsText` resolve/reject predictably; today the double `reader.onload` assignment hides error cases and should be removed in favour of a single handler and timeout guard.【F:app/page.tsx†L626-L646】

### Cross-Cutting Regression Guardrails

- Automate happy-path and failure-path E2E tests (Playwright/Cypress) for import/export, answering questions, and viewing history before large refactors. Run them in CI with both legacy and refactored feature flags enabled to catch behavioural differences early.
- Publish a `docs/regression-checklist.md` that enumerates manual QA steps (KaTeX rendering, download triggers across browsers, answer persistence) and require it for sign-off when deleting legacy helpers.
- Add Storybook stories or visual regression tests for `MarkdownRenderer`, answer cards, and the All Questions view so layout/UX polishing does not accidentally break component structure on different breakpoints.

### 5. Make Rendering Deterministic

- `MarkdownRenderer` reprocesses markdown on every render via `useEffect`, making it hard to memoise large questions/explanations and complicating server rendering.【F:components/rendering/MarkdownRenderer.tsx†L27-L86】
- Consider pre-processing markdown when loading modules (during import or API fetch) and storing the HTML in state. A deterministic pipeline allows diffable snapshots and avoids re-running KaTeX for every render.
- Memoise option/explanation rendering by keying on content hashes instead of `key` props that combine transient state (`isSelected`, `isSubmitted`), which forces remounts and defeats React memoisation.【F:components/option-card.tsx†L76-L83】

## Additional UX & Accessibility Issues to Prioritise

### Missing Loading and Error Surfaces

- Quiz and dashboard fall back to plain "Loading" divs without skeletons, ARIA announcements, or retry CTAs. Users have no feedback when file parsing stalls or review queues finish.【F:app/page.tsx†L1655-L1685】
- Add dedicated loading components with `role="status"`, progress indicators, and cancel/retry actions. Pair with an empty-state view when a chapter has no questions so the quiz UI does not render blank cards.

### File Import/Export Feedback Gaps

- Export uses a programmatically clicked anchor but revokes the object URL immediately, which can interrupt downloads in Safari/iOS. Provide explicit success/failure messaging and delay revocation until the next animation frame.【F:app/page.tsx†L1604-L1617】
- Import flows lack progress indicators; the UI stays interactive while parsing large files, so users can trigger multiple reads. Disable relevant buttons during import and show inline validation errors tied to the offending field.

### Focus & Contrast Concerns

- `AccessibleOptionList` force-focuses the first option on mount, leading to perceived auto-selection and confusing keyboard order when options change. Gate focus until the radiogroup itself receives focus and persist a per-question selection so history navigation does not hijack live state.【F:components/a11y/AccessibleOptionList.tsx†L24-L83】
- Unselected options use dark gradients similar to the selected state; focus outlines are subtle and blend with the background, which fails WCAG contrast guidelines for low-vision users. Split focus vs. selection styling and lighten hover backgrounds to maintain contrast.【F:components/option-card.tsx†L28-L55】

### Toasts, Tooltips, and Copy Consistency

- Toast helpers (`showSuccess`, `showError`, etc.) are duplicated across files with inconsistent variants; `showWarning` uses the same neutral styling as `showInfo`, so severity is unclear.【F:app/page.tsx†L85-L113】
- Tooltip buttons in `QuizSession` expose icon-only actions without aria-label fallbacks, hurting screen reader usability. Promote shared button components that include `aria-label` and consistent copy (aligning with the B3 recommendation).【F:components/quiz-session.tsx†L14-L108】【F:components/quiz-session.tsx†L798-L819】

### History & Review Discoverability

- Entering history view silently changes submit/next behaviour without an obvious exit path; users are left in a read-only state with the same visual chrome. Provide a sticky banner or mode switcher that clearly communicates "Viewing attempt N" and offers a "Return to live question" button.【F:components/quiz-session.tsx†L94-L180】
- Review sessions end abruptly by bouncing back to the dashboard with a toast; add a transitional screen summarising what was reviewed, offering follow-up actions (retry misses, switch to new material) to close the loop.【F:app/page.tsx†L514-L620】

### Responsive Layout & Overflow

- Long math-heavy questions overflow card boundaries on small screens because the container uses fixed padding and lacks horizontal scrolling. Introduce responsive typography and allow code/math blocks to wrap or scroll inside the card to prevent layout shifts.【F:components/quiz-session.tsx†L188-L213】【F:components/option-card.tsx†L74-L83】
- Modals (editor, confirmation) lack focus traps and body scroll locking, so on mobile the background scrolls underneath and focus can escape to hidden content. Adopt a modal primitive that enforces trapping and `aria-modal="true"` semantics.

---
