# Architecture and UX Audit (Detailed)

This document consolidates the architecture review, UX risks, redundancy cleanup, coupling/cohesion metrics, testing improvements, and decoupling guidance.

## Data sources and commands

- Deep codebase map: `python scripts/deep-codebase-analyzer.py` -> `docs/DEEP-CODEBASE-MAP.md`, `codebase-deep-analysis.json`
- Call graph + dead exports: `npx tsx scripts/codebase-analyzer.ts` -> `codebase-analysis.json`
- Coupling/cohesion metrics: `python scripts/architecture-metrics.py` -> `docs/ARCHITECTURE-METRICS.json`
- DAG visualization: `python scripts/visualize-dag.py` -> `docs/codebase-graph.dot`
- Call graph visualization: `python scripts/visualize-callgraph.py --focus app/page.tsx` -> `docs/callgraph.dot`
- Test suite: `npm test` (unit + integration + accessibility)

Note: `codebase-analysis.json` currently has an empty reverse call graph and does not emit a full import graph. The coupling metrics below are based on a local-import scan (relative imports + alias `@/`).

## Executive summary

- The codebase has a solid layered intent (app -> features -> components/hooks -> store/lib/utils) but key flows are disconnected after refactors.
- Largest UX blockers are wiring/routing gaps (review flow, completion view, editor, per-question actions) rather than missing UI components.
- Coupling hotspots are `types/quiz-types.ts`, `components/rendering/MarkdownRenderer.tsx`, and `components/quiz-session.tsx`, which makes changes ripple widely.
- Redundant code exists in design showcase pages, feature index stubs, and unused UI primitives. Removing or wiring these can shrink surface area and reduce confusion.

## Coupling and cohesion metrics (from `docs/ARCHITECTURE-METRICS.json`)

Summary:

- Files scanned: 190
- Local import edges: 258
- Nodes with fan-in: 69
- Nodes with fan-out: 147

Top fan-in (most depended-on):

- `types/quiz-types.ts` (37)
- `lib/utils.ts` (25)
- `components/rendering/MarkdownRenderer.tsx` (17)
- `tests/e2e/fixtures/quiz-data.ts` (15)
- `utils/quiz-validation-refactored.ts` (12)
- `components/ui/button.tsx` (9)
- `components/ui/card.tsx` (8)
- `store/index.ts` (8)

Top fan-out (most outgoing dependencies):

- `components/quiz-session.tsx` (12)
- `components/question-editor.tsx` (8)
- `app/page.tsx` (7)
- `components/all-questions-view.tsx` (7)
- `components/dashboard.tsx` (5)

Layer-to-layer edges (top counts):

- components -> components (45)
- tests -> components (40)
- tests -> types (20)
- features -> features (18)
- tests -> lib (18)
- components -> lib (17)
- app -> lib (8)
- app -> app (7)

Low cohesion candidates (many functions + large size):

- `utils/quiz-validation-refactored.ts` (76 functions, 47,546 bytes)
- `components/quiz-session.tsx` (16 functions, 42,122 bytes)
- `app/design-showcase/theme-saas/page.tsx` (11 functions, 43,024 bytes)
- `app/design-showcase/theme-brand/page.tsx` (11 functions, 33,173 bytes)
- `app/design-showcase/theme-playful/page.tsx` (11 functions, 32,565 bytes)
- `scripts/codebase-analyzer.ts` (40 functions, 23,612 bytes)
- `app/design-showcase/shared.tsx` (16 functions, 22,864 bytes)

Interpretation:

- `types/quiz-types.ts` is a hard coupling point. Any change ripples through many files. Consider splitting into domain-specific type modules (session, SRS, authoring).
- `components/quiz-session.tsx` has high fan-out and large size. It should be split into smaller view components and rely on a single shared option generation helper.
- `utils/quiz-validation-refactored.ts` is a low-cohesion "god file" and is a prime refactor target (parser, normalization, ID, LaTeX fixes should be separated).

## Redundancy and size reduction opportunities

High-confidence cleanup candidates (from analyzers):

- Design showcase pages (multiple `app/design-showcase/*` entries).
- Feature index stubs in `features/*/index.ts` that re-export nothing or are unused.
- Unused UI primitives in `components/ui/*` (several have zero non-test imports).

Codebase analyzer highlights:

- Dead exports: 102 (from `codebase-analysis.json` export usage flags).
- Duplicate name groups: `page.tsx` and `index.ts` families across multiple folders.
- Suggestions list length: 100+ (mostly delete/split recommendations for design showcase and large files).

Estimated size savings (very rough, no formatting/lint removal):

- Design showcase pages: 1500-2500 LOC.
- Unused UI primitives: 800-1200 LOC.
- Feature stubs/re-exports: 150-300 LOC.
- Session logic duplication (option generation in two places): 120-200 LOC.
  Total rough reduction: 2,500-4,200 LOC.

Risk note: delete only after verifying no dynamic imports or documentation references depend on these files.

## Architecture issues that block UX fixes

These are the architectural roots of the UX gaps captured in `docs/UX-ISSUES.md`.

- Incomplete state transitions: `app/page.tsx` does not route to "complete", "all-questions", or "review" states despite components existing.
- Incomplete feature wiring: editor and per-question import/export are defined but not connected in containers/stores.
- Duplicate session logic: option generation and session history are split between container and component, producing divergence and making review flow harder to fix.
- Validation split-brain: JSON uses `validateAndCorrectQuizModule`, Markdown uses `parseMarkdownToQuizModule` and then `validateQuizModule` again. Behavior is not guaranteed consistent.

## Deeper cleanup ideas (beyond quick deletions)

- Consolidate state transitions into a small explicit state machine (welcome -> dashboard -> quiz -> complete; review as a mode).
- Move all question state transitions (submit, retry, edit, review pick) into a domain layer (pure functions), with the store calling those functions only.
- Split `QuizModule` into content (immutable) + progress state keyed by `questionId` for simpler imports and safer persistence.
- Move Markdown validation and normalization into smaller modules with single responsibility (parser, ID generation, correctness checks).

## Decoupling frontend from backend (even if backend is not yet present)

The app is currently client-only with localStorage persistence. To decouple for future backends:

- Introduce a `services` layer with a `QuizRepository` interface (load/save/import/export).
- Keep store actions calling the repository, not direct fetch/localStorage.
- Use DTOs for API payloads; map DTOs to internal domain models at the boundary.
- Add a persistence adapter for localStorage and another for HTTP (e.g., `/api/quizzes`).
- Keep parsing/validation in shared domain code so both backend and frontend enforce the same rules.
- Make the UI depend on the repository contract, not the storage mechanism.

Benefits:

- Easier to swap localStorage for server sync without rewriting UI.
- Cleaner tests (mock repository rather than mocking fetch/localStorage).
- Reduced coupling between validation and UI components.

## Testing improvements to prevent regression

Guardrail tests to add before refactors:

1. Review flow: start review -> due queue -> return to dashboard.
2. Completion flow: last question -> complete screen -> CTA to dashboard.
3. Partial import: invalid question warns but loads the rest.
4. Deterministic option generation: order stable per questionId; no reshuffle after submit.
5. Stats recompute: dashboard accuracy updates after submission.
6. Persistence migration: old data resets or migrates cleanly.

These cover the highest-risk changes and ensure UX flows remain intact.

Additional UX regression tests to add:

- Dialog description rendering: ensure no `<div>` within `<p>` from Markdown content (prevents hydration warnings in modals).
- Keyboard navigation focus tests should rely on userEvent or act-wrapped focus, to avoid false positives.
- Session history view: verify historical entries render without reshuffle and without enabling submit.
- Question import/export (per-question): once wired, verify serialization and overwrite confirmation behavior.

Expanded regression matrix (high ROI):

- End-to-end flow: onboarding -> import -> quiz -> review -> complete -> dashboard (assert state transitions, score, and progress reset).
- Import resilience: Markdown/JSON with partial errors loads valid questions, surfaces warnings, and does not corrupt storage.
- Editing safety: edit question text/options mid-session and ensure history, correctness, and progress recompute correctly.
- Deterministic randomization: option order stable per questionId and preserved in review/history views.
- Storage migration: older localStorage shapes migrate or prompt reset without crashing.
- Cross-session consistency: review due queue respects scheduling rules after app reload.
- Focus + a11y: roving tab index in grids and lists, focus trap restoration, and no hidden focusable elements.
- Performance guardrails: large question set renders within budget (add a perf test or a smoke test with a 500+ item fixture).
- Error boundaries: import/parse failures show recovery UI and allow retry without hard reload.
- Analytics integrity: accuracy and streak updates reflect latest submission and reset correctly.

Execution guidance (to avoid resource hogging):

- For e2e, cap workers (ex: `--workers=2` or `--max-workers=50%`) and prefer headless mode.
- Split long suites into smoke + full, and run smoke in CI by default.

## Risks and considerations

- State migration: any storage shape change must include a reset/migration prompt.
- Randomization changes: seeded option order can change behavior; adjust tests accordingly.
- Validation strictness: consolidating validation can break legacy decks; provide warnings and partial import.
- Dead code removal: some UI primitives may be used in storybooks or local experiments not tracked in tests.

## Recommended phased approach

Phase 0 (safety):

- Add guardrail tests listed above.
- Snapshot current behavior with integration tests.

Phase 1 (cleanup):

- Remove or wire dead feature stubs and design showcase pages.
- Consolidate option generation into a single helper.

Phase 2 (architecture):

- Introduce domain layer for state transitions.
- Consolidate validation/normalization modules.

Phase 3 (decoupling):

- Add repository interface and adapters (localStorage + API).
- Move UI to use repository abstraction.

## Recent maintainability fixes

- Option generation is now centralized on `lib/quiz/generate-displayed-options.tsx`; the duplicate generator in `features/quiz-session/components/QuizSessionContainer.tsx` has been removed.
- `components/quiz-session.tsx` now uses the shared helper and falls back safely when invalid correct options are detected.
- Removed unused store hooks in `features/dashboard/components/DashboardContainer.tsx` and debug logs in `app/page.tsx`.
- Modal descriptions now render Markdown inside `DialogDescription` safely to avoid nested `<p>` hydration issues.
- Test focus helpers now wrap `element.focus()` in `act` to avoid warnings and flaky a11y tests.

## Related documents

- UX backlog: `docs/UX-ISSUES.md`
- Deep map: `docs/DEEP-CODEBASE-MAP.md`
- Architecture overview: `docs/ARCHITECTURE.md`
- Architecture evaluation notes: `docs/ARCHITECTURE_EVALUATION.md`
