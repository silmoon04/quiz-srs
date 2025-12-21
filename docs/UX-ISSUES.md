# UX Issues & Opportunities (Prioritized)

## P0 — Must Fix

- **Review flow disconnected**: Dashboard "Start Review Session" stops at console log; no queue seeded, no review navigation in session. (app/page.tsx, DashboardContainer, useQuizSession)
- **Completion path missing**: Finishing last question never sets `appState='complete'`; `QuizComplete` unused. Users get stuck in-session with no summary/CTA. (QuizSessionContainer, app/page.tsx)
- **Editing UI dead**: QuestionEditor feature stubs; no trigger to open/save/delete. Inline edits impossible post-refactor. (components/quiz-session.tsx, features/question-editor/\*)
- **Per-question import/export/retry noop**: Handlers log TODOs; buttons absent. Users cannot manage single-question state or redo chapters. (QuizSessionContainer TODO handlers)
- **Stats drift risk**: Chapter/module counters (`totalQuestions/answeredQuestions/correctAnswers`) are not recomputed after import or answer submission; dashboard accuracy can be wrong. (lib/quiz/parser.ts, store/quiz-store.ts)
- **All-questions/summary views unreachable**: `all-questions-view.tsx` and `quiz-complete.tsx` are effectively dead code; app/page never routes to them. Users cannot get holistic progress or navigate by list. (app/page.tsx, docs map dead-code list)
- **Hydration/semantics bugs in modals**: Radix dialog content nests `<div>` inside `<p>` via `MarkdownRenderer`, causing hydration warnings; risk of a11y regressions. (dialog usage in confirmation modals, test logs)
- **LocalStorage fragility**: Persisted state lacks schema version/migration; any shape change can brick returning users with no reset prompt. (store/quiz-store.ts)

## P1 — High Impact

- **Partial import UX**: Any invalid question aborts with a generic error; no per-line warnings or partial load. Add warning list + “skip invalid” pathway. (useModuleLoader, validate/parse)
- **Option shuffling inconsistency**: Two implementations, both random; options can reshuffle mid-question. Unify to deterministic helper seeded by questionId and ensure at least one correct option. (QuizSessionContainer.generateDisplayedOptions, components/quiz-session.tsx)
- **SRS clarity**: No in-session due/learn counts, no “review next due” entry, shallow 0/1/2 intervals with no feedback on scheduling. Surface SRS state and queue actions in UI. (DashboardContainer, useQuizSession)
- **History/All-questions routing**: Components/tests exist but no navigation from session; progress views unusable. Wire app state and callbacks. (app/page.tsx, components/quiz-session.tsx)
- **Persistence resilience**: LocalStorage persist lacks version/migration; schema changes can brick returning users. Add versioning + reset/merge prompt. (store/quiz-store.ts)
- **Authoring speed**: No bulk paste/import-in-place; question IDs and stats not recomputed on edits/imports. Add paste modal + ID/stats rebuild so editors trust what they see. (WelcomeScreen/Dashboard + validation helpers)
- **Dead-code confusion**: Many shadcn primitives + feature indexes show zero importers (per DAG). Leaving them visible in UI lists/tests but unused increases cognitive load; either wire them or prune. (docs/DEEP-CODEBASE-MAP.md dead code table)

## P2 — Medium

- **Onboarding friction**: File-only import; no “paste Markdown/JSON” modal, drag-drop, or AI prompt copier. Add quick-start templates and paste-to-preview. (WelcomeScreen, Dashboard)
- **Error log review**: Mistake export exists but no in-app drill-down/retry from that data. Add “Review mistakes” list → queue. (DashboardContainer export hook, QuizSession routing)
- **Accessibility gaps**: Missing aria-describedby targets and double key handlers in a11y components; ensure semantics and avoid duplicate firing. (AccessibleOptionList, AccessibleQuestionGrid)
- **Mobile polish**: Large dashboard cards and multi-column grids lack small-screen layout; add responsive stacking and sticky submit bar. (Dashboard, QuizSession)
- **Dead-code confusion**: Many shadcn primitives + feature indexes show zero importers (per DAG). Leaving them visible in UI lists/tests but unused increases cognitive load; either wire them or prune. (docs/DEEP-CODEBASE-MAP.md dead code table)
- **Design showcase pages orphaned**: Multiple `app/design-showcase/*` entry points exist but are not linked from main flows; they bloat navigation without value for learners. (DAG entry points list)
- **Test-only flows**: Some components exist only for tests (e.g., AllQuestionsView) and not reachable in UI, creating mismatch between test coverage and real UX. Align coverage with shipped paths or expose the feature.

## P3 — Later/Nice-to-have

- **SRS configurability**: Allow interval presets (“again/hard/good/easy”), snooze, or reschedule controls.
- **Motivation layer**: Daily goals, streaks, gentle reminders.
- **Collab/sync**: Cloud share/import links for decks; multi-device persistence.

## Test/Debug Targets

- Add integration covering review start → due queue traversal and completion screen transition.
- Unit for deterministic option generation (seeded) and guard against zero-correct-option display.
- Contract test for partial-import warnings (skip invalid questions, load rest).
- Flow test for inline edit save/delete updating chapter stats.
