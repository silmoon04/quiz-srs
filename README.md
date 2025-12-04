# Quiz-SRS

Quiz-SRS is a Next.js 15 + TypeScript learning environment for studying and authoring spaced-repetition multiple-choice quizzes. It loads quiz modules from JSON or Markdown, normalizes the data for review workflows, and renders content safely with KaTeX-backed components and strong accessibility defaults.

## Features

- Multi-chapter MCQ and true/false engine with spaced-repetition queues, answer history, incorrect-answer exports, and inline editing tools.
- Markdown importer with resilient block parsing, ID generation/deduplication, LaTeX correction, and warning reporting so malformed entries do not halt a full module import.
- Secure rendering pipeline built on unified/remark/rehype with KaTeX, sanitization, and mermaid detection to keep math-rich content safe.
- Rich interface composed with Radix UI and Tailwind, including accessible option grids, dashboards, confirmation modals, and an all-questions review surface.
- Comprehensive tooling: strict typing, ESLint/Prettier, Vitest suites, Playwright E2E tests, axe accessibility checks, bundle analysis, and dependency audits.

## Architecture Overview

| Area                                                             | Purpose                                                                                                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/page.tsx`                                                   | Lightweight entry point that orchestrates feature containers (`DashboardContainer`, `QuizSessionContainer`) based on global state.                |
| `store/quiz-store.ts`                                            | Centralized Zustand store managing quiz data, session state, SRS progress, and persistence (via `persist` middleware).                            |
| `features/`                                                      | Feature-based modules (Dashboard, Quiz Session, Editor) containing logic-heavy Containers and pure UI Views.                                      |
| `components/quiz-session.tsx`                                    | Core quiz UI (answer submission, history navigation, review mode, inline question editor, import/export actions).                                 |
| `components/all-questions-view.tsx`                              | Read-only chapter summary with option reveal toggles and score breakdowns.                                                                        |
| `components/rendering/MarkdownRenderer.tsx`, `components/a11y/*` | Markdown display helpers and accessible widgets, including `AccessibleOptionList` and `ScreenReaderAnnouncer`.                                    |
| `utils/quiz-validation-refactored.ts`                            | Markdown-to-module parser, LaTeX correction, normalization helpers, and duplicate ID validation.                                                  |
| `utils/quiz-validation.ts`                                       | Runtime validators/normalizers used when importing modules or editing questions within the UI.                                                    |
| `lib/markdown/pipeline.ts`                                       | Unified remark/rehype pipeline with KaTeX rendering, sanitization, mermaid extraction, and display-math normalization.                            |
| `types/quiz-types.ts`                                            | Shared type definitions for questions, chapters, SRS progress, incorrect-answer logs, and session history snapshots.                              |
| `tests/**`                                                       | Vitest suites covering Markdown parsing, validation logic, rendering, and accessibility; Playwright configuration sits in `playwright.config.ts`. |
| `public/`                                                        | Default quiz JSON and Markdown fixtures for manual testing (`public/default-quiz.json`, `public/advanced-test-quiz.md`, etc.).                    |

## Getting Started

### Requirements

- Node.js 20 LTS (Next.js 15 requires >=18.17; 20.x is recommended).
- npm 10+ (a `package-lock.json` is committed; pnpm/yarn also work with their respective locks).

### Installation

```bash
npm install
```

### Development

```bash
npm run dev      # start Next.js dev server on http://localhost:3000
npm run lint     # ESLint with project rules
npm run typecheck
npm run format   # Prettier across the repo
```

### Production Build

```bash
npm run build
npm run start
```

For bundle and dependency insight:

```bash
npm run analyze  # next build with bundle analyzer
npm run graph    # generate dependency graph with madge (writes graph.png, git-ignored)
npm run size     # check size-limit budget
npm run depcheck # detect unused dependencies
```

## Testing & Quality Gates

Vitest drives unit, integration, and accessibility suites; Playwright covers E2E flows; axe ensures WCAG hygiene.

```bash
npm run test:unit        # unit tests (Vitest)
npm run test:int         # integration tests (Vitest)
npm run test:access      # accessibility tests (Vitest + axe)
npm run test:e2e         # Playwright CLI (headless)
npm run test:e2e:ui      # Playwright UI runner
npm run test             # run unit + integration + accessibility
npm run coverage         # Vitest coverage report
npm run typecheck:strict # optional strict TS project
```

See `docs/TESTING.md` for the full strategy, tooling rationale, and AI-agent checklist.

## Quiz Content Formats

Quiz modules can be loaded via the welcome screen or the in-session import controls.

### JSON modules

The schema matches `types/quiz-types.ts`:

```json
{
  "name": "Sample Quiz",
  "description": "Short description",
  "chapters": [
    {
      "id": "ch_intro",
      "name": "Chapter 1: Introduction",
      "questions": [
        {
          "questionId": "ch_intro_q1",
          "questionText": "Which statement is true?",
          "options": [
            { "optionId": "opt1", "optionText": "Choice A" },
            { "optionId": "opt2", "optionText": "Choice B" }
          ],
          "correctOptionIds": ["opt2"],
          "explanationText": "Why choice B is correct.",
          "status": "not_attempted",
          "srsLevel": 0
        }
      ]
    }
  ]
}
```

Sample files live in `public/default-quiz.json` and `public/advanced-test-quiz.md` for manual validation.

### Markdown modules

The Markdown importer (`utils/quiz-validation-refactored.ts`) accepts a structured, comment-annotated format:

```markdown
# Sample Quiz

_Optional module description_

---

## Chapter 1: Fundamentals <!-- ID:ch_fundamentals -->

### Q: What is the time complexity of binary search? <!-- ID:ch_fundamentals_q1 -->

**Options:**

- **A1:** O(log n)
- **A2:** O(n)
- **A3:** O(n log n)

**Correct:** A1
**Exp:** Binary search halves the search space each step.

---

### T/F: Stable sorts keep equal items in order. <!-- ID:ch_fundamentals_tf1 -->

True/False questions do not declare options.

**Ans:** True
**Exp:** Stability preserves relative ordering.
```

Parser highlights:

- `<!-- ID:... -->` comments keep chapter/question IDs; they are auto-generated when omitted and deduped if conflicts occur.
- `### Q:` denotes MCQs (requires an `**Options:**` or `**Opt:**` list plus `**Correct:**`/`**Ans:**` and `**Exp:**` sections).
- `### T/F:` builds canonical True/False options automatically and rejects custom `**Options:**` blocks.
- Multi-line text, fenced code, and LaTeX are preserved via the internal `parseBlockContent` helper.
- Errors and warnings include approximate line numbers, and invalid questions are skipped so the rest of the file can import.
- LaTeX token fixes (for escaped characters, math delimiters, etc.) run via `correctLatexInJsonContent` before validation.

## Spaced Repetition & Session Flow

The main session state machine (`app/page.tsx`) tracks:

- Loading default modules or user uploads (JSON or Markdown).
- Per-chapter stats with SRS readiness counts.
- Review sessions that surface due questions ahead of fresh ones.
- Answer history with backward/forward navigation.
- Export/import of the current question state and incorrect-answer logs.
- Optional edit mode for tweaking questions in-place with ID helpers.

`components/quiz-session.tsx` and `components/all-questions-view.tsx` expose these features with keyboard-navigable controls, screen-reader announcements, and progress widgets.

## Secure Rendering & Content Safety

- `lib/markdown/pipeline.ts` runs unified -> remark -> rehype with math and GFM support, normalizes inline display math, renders KaTeX, sanitizes output (extended MathML schema, safe attributes), and extracts mermaid blocks when present.
- `components/rendering/MarkdownRenderer.tsx` uses that pipeline to render prompts, options, and explanations without a `dangerouslySetInnerHTML` escape hatch.
- `app/layout.tsx` sets strict security headers (CSP, referrer policy, content-type options, permissions policy) and wraps the app in a screen-reader announcer for accessibility.

## Scripts & Tooling

- `scripts/audit-snapshot.mjs` produces `docs/Gate-0.5 Audit Snapshot.md` summarizing risky patterns and bundle size.
- `npm run prune:exports`, `npm run unused`, and `npm run depcheck` help trim dead code and dependencies.
- Husky + lint-staged enforce ESLint/Prettier on staged files (`npm run prepare` installs hooks).

## Repository Layout

- `app/` - Next.js App Router pages and layouts.
- `features/` - Feature-based modules (Dashboard, Quiz Session, Editor).
- `store/` - Zustand state management.
- `components/` - UI primitives, quiz flows, accessibility helpers, editor modals.
- `hooks/` - Shared hooks (announcers, timers, etc.).
- `lib/` - Markdown pipeline and shared utilities.
- `public/` - Static assets plus sample quiz modules.
- `tests/` - Vitest suites and fixtures (`tests/fixtures` holds Markdown samples).
- `types/` - Type definitions shared across UI, parsers, and tests.
- `utils/` - Validation, normalization, import/export helpers.
- `docs/` - Deep-dive documentation (`SecureTextRenderer.md`, `TESTING.md`, audit notes).
- `scripts/` - Developer scripts and codemods.

## Documentation

- `docs/TESTING.md` - Testing plans, release gates, and automation guidance.
- `docs/SecureTextRenderer.md` - API and migration details for the secure Markdown renderer.
- `WORK_SUMMARY.md` - Recent engineering updates and outstanding issues.

## License

This project is licensed under the MIT License. See `LICENSE` for the full text.
