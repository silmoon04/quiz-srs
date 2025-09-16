## 1. Executive Summary

Overall, MCQ Quiz Forge is feature-rich with clear UI flows and type models, but there are several high-risk issues concentrated in the Markdown parsing and text rendering pipeline. The live code imports the older parser (`utils/quiz-validation.ts`) that lacks the robust multi-line/code-fence handling and T/F support described in the README; the newer, more resilient implementation exists in `utils/quiz-validation-refactored.ts` but is not wired in. The `TextRenderer` manually transforms Markdown/HTML via regex and renders with `dangerouslySetInnerHTML` without a sanitizer, creating XSS risk and “markdown not working” symptoms in certain views. SRS logic is present but lightly tested and could be made more deterministic. Import/export paths mix LaTeX correction and validation, but the conservative LaTeX fixer is also present only in the refactored file. There is probable dead code and bundle bloat from client-only heavy components.

Top 5 fixes (Impact/Effort):
- Switch to refactored parser and LaTeX correction (Critical/Medium): Wire `utils/quiz-validation-refactored.ts` in all import paths; add tests for code fences/T-F/IDs.
- Centralize Markdown→HTML with sanitization (Critical/High): Replace custom `TextRenderer` regex rules with remark/rehype + `rehype-katex` and `rehype-sanitize`/DOMPurify; unify all text rendering.
- Enforce runtime schemas (Major/Medium): Introduce zod schemas for modules/questions/options at import/parse boundaries with strict checks for IDs and cross-references.
- Stabilize session history vs live view (Major/Medium): Add integration tests for navigation grid and history; fix race/option caching edge cases.
- Performance and bundle hygiene (Major/Medium): Code split renderer tools, lazy-load mermaid, audit unused deps/exports; memoize hotspots.

## 2. Architecture & Data Flow Snapshot

Current high-level (App Router):

```
app/
  layout.tsx
  page.tsx  (MCQQuizForge client app)
  test/page.tsx (parser tests UI)

components/
  dashboard.tsx            (Dashboard route body)
  quiz-session.tsx         (Session view + controls)
  all-questions-view.tsx   (Chapter overview)
  question-navigation-menu.tsx (grid nav)
  question-editor.tsx      (authoring modal)
  text-renderer.tsx        (Markdown/KaTeX/Mermaid renderer)
  ui/*                     (shadcn/ui primitives)

utils/
  quiz-validation.ts               (CURRENTLY USED)
  quiz-validation-refactored.ts    (NEWER, not wired)

types/
  quiz-types.ts

public/default-quiz.json (fixture)
```

ASCII data flow:

```
File (JSON/MD) -> app/page.tsx handlers
  - JSON: validateAndCorrectQuizModule (utils/quiz-validation.ts)
  - MD:   parseMarkdownToQuizModule (utils/quiz-validation.ts)
    -> normalizeQuizModule
      -> state (QuizModule)
        -> components/* (reads module/chapter/question)
          -> TextRenderer(content: string)
            - regex transforms -> KaTeX render -> Mermaid.run -> innerHTML
```

Client vs Server Components:
- Almost all page and feature components are Client Components (`"use client"`), including `app/page.tsx`, `dashboard.tsx`, `quiz-session.tsx`, `text-renderer.tsx`. Heavy libraries (KaTeX, mermaid) run client-side and are mostly dynamically imported except KaTeX CSS.
- Opportunity: keep data validation/parsing server-side (or in edge functions) for security and perf; currently parsing occurs on the client.

Data contracts (types vs runtime):
- TypeScript models: `types/quiz-types.ts` define `QuizModule`, `QuizChapter`, `QuizQuestion`, `QuizOption`.
- Runtime validation: custom imperative checks in `utils/quiz-validation.ts` and `…-refactored.ts`. No zod schemas in code yet despite `zod` in deps.

Suggested JSON schemas (concise):

```json
{
  "$id": "QuizOption",
  "type": "object",
  "required": ["optionId", "optionText"],
  "properties": {
    "optionId": { "type": "string", "minLength": 1 },
    "optionText": { "type": "string" }
  },
  "additionalProperties": false
}
```

```json
{
  "$id": "QuizQuestion",
  "type": "object",
  "required": ["questionId", "questionText", "options", "correctOptionIds", "explanationText"],
  "properties": {
    "questionId": { "type": "string", "minLength": 1 },
    "type": { "type": "string", "enum": ["mcq", "true_false"] },
    "questionText": { "type": "string" },
    "options": { "type": "array", "items": { "$ref": "QuizOption" }, "minItems": 1 },
    "correctOptionIds": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
    "explanationText": { "type": "string" }
  },
  "additionalProperties": true
}
```

```json
{
  "$id": "QuizChapter",
  "type": "object",
  "required": ["id", "name", "questions"],
  "properties": {
    "id": { "type": "string", "minLength": 1 },
    "name": { "type": "string", "minLength": 1 },
    "description": { "type": "string" },
    "questions": { "type": "array", "items": { "$ref": "QuizQuestion" }, "minItems": 1 },
    "totalQuestions": { "type": "number" },
    "answeredQuestions": { "type": "number" },
    "correctAnswers": { "type": "number" },
    "isCompleted": { "type": "boolean" }
  },
  "additionalProperties": true
}
```

```json
{
  "$id": "QuizModule",
  "type": "object",
  "required": ["name", "chapters"],
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "description": { "type": "string" },
    "chapters": { "type": "array", "items": { "$ref": "QuizChapter" }, "minItems": 1 }
  },
  "additionalProperties": true
}
```

Where enforced: currently only in TypeScript and custom validators. Plan introduces zod schemas at import/parse boundaries and asserts during hydration.

## 3. Issue Inventory (Exhaustive)

Each item includes code pointers and test references. Routes: main app `/` via `app/page.tsx`; parser test page `/test` via `app/test/page.tsx`.

- ISS-001 • Title: Live code uses legacy Markdown parser (no T/F, brittle blocks)
  - Severity: Critical • Area: Parser
  - Symptoms & Repro:
    - Import a Markdown with `### T/F:` or code fences containing lines like `**Correct:**` inside. In `/` → Welcome → Import MD. Parsing fails or loses content; warnings/errors.
  - Root Cause Hypothesis:
    - `app/page.tsx` imports from `"@/utils/quiz-validation"` which is `utils/quiz-validation.ts` (older). The robust parser is in `utils/quiz-validation-refactored.ts` but unused.
    - Pointers:
      - `app/page.tsx` lines importing validation: `12-18:app/page.tsx`
      - Old parser `602-1177:utils/quiz-validation.ts` (no T/F handling, naive block reads)
      - New parser `659-1177:utils/quiz-validation-refactored.ts` (has `parseBlockContent`, T/F, recovery, ID checks)
  - Proposed Fix:
    - Replace imports to use `utils/quiz-validation-refactored.ts` or merge refactor into `quiz-validation.ts` and re-export. Ensure `parseMarkdownToQuizModule` and `validateAndCorrectQuizModule` use the conservative LaTeX fixer from refactor.
  - Risk/Blast Radius: Medium; parser behavior changes. Lock fixtures before swapping; document deltas.
  - Rollback: Revert import change to legacy parser.
  - Acceptance Tests: TM-PR-01, TM-PR-02, TM-PR-05, TM-PR-06.

- ISS-002 • Title: `TextRenderer` lacks sanitization; XSS possible
  - Severity: Critical • Area: Security | UI | LaTeX
  - Symptoms & Repro:
    - Import JSON/MD with HTML such as `<img src=x onerror=alert(1)>` or `<a href="javascript:alert(1)">`. See explanation or question text rendered with `dangerouslySetInnerHTML`. Triggers script or unsafe URL.
  - Root Cause Hypothesis:
    - `components/text-renderer.tsx` builds HTML via regex and sets `dangerouslySetInnerHTML` without sanitization. Only code blocks are escaped; simple HTML tags are preserved; others may pass through.
    - Pointers: `1-616:components/text-renderer.tsx` (no sanitizer; `dangerouslySetInnerHTML`).
  - Proposed Fix:
    - Replace custom pipeline with unified stack: `remark-parse` → `remark-gfm` → `remark-math` → `rehype-katex` → `rehype-raw` (if needed) → `rehype-sanitize` (custom schema) → `rehype-stringify`. Or DOMPurify if retaining HTML strings. Keep KaTeX with `trust: false`.
  - Risk/Blast Radius: High; rendering may differ; but security improved. Provide snapshot tests for stable fragments.
  - Rollback: Feature-flag new renderer; switch back on regressions.
  - Acceptance Tests: TM-RN-01, TM-SC-01, TM-SC-02, TM-LX-01.

- ISS-003 • Title: Markdown “stopper” parsing fails inside code fences
  - Severity: Major • Area: Parser
  - Symptoms & Repro:
    - A fenced block containing `**Exp:**` or `**Correct:**` prematurely ends the section. Content after is mangled. Use `/test` page with fixture including code block.
  - Root Cause:
    - Legacy parser scans lines and stops at tokens, ignoring code fence state.
    - Pointers: `769-899:utils/quiz-validation.ts` question text/options/explanation accumulation.
  - Proposed Fix:
    - Adopt `parseBlockContent` state machine from refactored parser (`672-721:utils/quiz-validation-refactored.ts`).
  - Risk: Low once refactored parser is used.
  - Rollback: None beyond parser import revert.
  - Acceptance Tests: TM-PR-03.

- ISS-004 • Title: T/F parsing unsupported in live code
  - Severity: Major • Area: Parser
  - Symptoms & Repro: Markdown with `### T/F:` errors expecting Options.
  - Root Cause: Legacy parser only supports `### Q:` and options.
  - Pointers: `940-1005:utils/quiz-validation-refactored.ts` shows T/F branch; missing in old.
  - Proposed Fix: Use refactored parser.
  - Risk: Low.
  - Acceptance Tests: TM-PR-04.

- ISS-005 • Title: ID uniqueness not strictly enforced at import
  - Severity: Major • Area: Validation | Parser
  - Symptoms & Repro: Duplicate `Q_ID`/`CH_ID` allowed without clear warnings; later collisions in edit/append.
  - Root Cause: Legacy parser generates defaults and lacks Set-based checks; validators don’t check global uniqueness across chapters.
  - Pointers: `820-861, 928-934:utils/quiz-validation-refactored.ts` (seen sets), absent in `utils/quiz-validation.ts`.
  - Proposed Fix: Use refactored parser; add post-parse zod refinement to ensure global uniqueness; fail import or warn with remediation.
  - Risk: Medium; may reject legacy content; provide warnings path first.
  - Acceptance Tests: TM-VL-03.

- ISS-006 • Title: KaTeX/Markdown escaping in JSON imports can over/under-correct
  - Severity: Major • Area: LaTeX | Import/Export
  - Symptoms & Repro: Backslash-heavy content either broken or over-escaped; conservative correction needed.
  - Root Cause: Current `correctLatexInJsonContent` in `utils/quiz-validation.ts` uses broad regex; refactored version limits to `$...$`/`$$...$$` contexts.
  - Pointers: `19-237:utils/quiz-validation.ts` vs `20-370:utils/quiz-validation-refactored.ts`.
  - Proposed Fix: Replace with refactored conservative implementation.
  - Risk: Low.
  - Acceptance Tests: TM-LX-02.

- ISS-007 • Title: Mixed HTML/Markdown handling is inconsistent; “markdown not working” in some views
  - Severity: Major • Area: UI | Rendering
  - Symptoms & Repro: Bold/italic/list rendering differs between question vs explanation; `_` emphasis, lists, or inline code sometimes mis-parsed.
  - Root Cause: `TextRenderer` performs partial markdown conversion only for text segments and preserves limited HTML tags (`b|i|em|strong|code|br`), causing inconsistencies.
  - Pointers: `495-575:components/text-renderer.tsx`.
  - Proposed Fix: Move to unified remark/rehype pipeline consistently; render both question and explanation via same component; snapshot stable parts.
  - Risk: Medium.
  - Acceptance Tests: TM-RN-02, TM-RN-03.

- ISS-008 • Title: Session history vs live state edge cases
  - Severity: Major • Area: UI | SRS | Navigation
  - Symptoms & Repro: Jumping via grid to a question already answered shows inconsistent option highlights or fails to show correct target when user was wrong.
  - Root Cause: Multiple caches of displayed options and history overlays; reliance on indices; need deterministic mapping.
  - Pointers: `105-225, 227-293, 722-873:components/quiz-session.tsx`; `28-78:components/question-navigation-menu.tsx`.
  - Proposed Fix: Add tests for history navigation transitions; ensure displayed options derive from stored snapshot when in history; already partially handled—expand tests and fix any discovered deltas.
  - Risk: Low.
  - Acceptance Tests: TM-NV-01, TM-NV-02.

- ISS-009 • Title: SRS scheduling opacity and determinism
  - Severity: Minor • Area: SRS
  - Symptoms & Repro: 30s retry, 10m next intervals hard-coded; learning count includes all level 1 items regardless of due time.
  - Root Cause: Simplistic logic; may be fine but must be asserted.
  - Pointers: `1569-1616, 1581-1587:app/page.tsx` and review counts `595-636`.
  - Proposed Fix: Add tests for transitions and counts; optionally extract to utility and allow config.
  - Risk: Low.
  - Acceptance Tests: TM-SRS-01..03.

- ISS-010 • Title: Import/Export guardrails and dry-run preview missing
  - Severity: Minor • Area: Import/Export | DX
  - Symptoms: Importing multiple questions overwrites without comprehensive preview diff.
  - Root Cause: Basic modals exist; no dry-run diff or duplicate strategy selection.
  - Pointers: `1045-1140, 1168-1208, 1210-1285:app/page.tsx`.
  - Proposed Fix: Add dry-run mode showing changes and conflicts; offer overwrite/skip/rename.
  - Risk: Low.
  - Acceptance Tests: TM-IE-01..02.

- ISS-011 • Title: Accessibility gaps likely (no automated checks)
  - Severity: Major • Area: Accessibility
  - Symptoms: Unknown; keyboard/focus looks considered but not audited.
  - Proposed Fix: Add axe-core automated checks in component tests and Playwright a11y scans; fix violations.
  - Risk: Low.
  - Acceptance Tests: TM-AC-01..02.

- ISS-012 • Title: Bundle bloat and client-only heavy libs
  - Severity: Major • Area: Performance
  - Symptoms: Larger initial bundle due to client components and mermaid/katex presence, plus many Radix imports.
  - Root Cause: Renderer and UI are client-only; KaTeX CSS global; mermaid initialized per render; no code splitting metrics.
  - Pointers: `components/text-renderer.tsx` (import CSS at top; dynamic import ok), `package.json` heavy deps.
  - Proposed Fix: Dynamic import mermaid on demand; SSR-render KaTeX server-side when possible; split `TextRenderer` by feature; run bundle analyzer and set budgets.
  - Risk: Low.
  - Acceptance Tests: TM-PF-01..02.

## 4. Code Bloat & Dead Code Report

- Unused/duplicated modules:
  - `utils/quiz-validation-refactored.ts` appears not imported anywhere, yet it is the desired implementation per README. Action: make it authoritative and remove duplicated logic in `quiz-validation.ts` after merge.
  - Potential duplication: two separate test pages `app/test/page.tsx` and `test-markdown-parser.tsx` (standalone component). Consider consolidating.

- Unused deps (hypotheses to verify via depcheck):
  - Many Radix UI packages are installed; some may be unused. Action: run depcheck and prune.

- Oversized components:
  - `components/text-renderer.tsx` is large and handles many concerns (markdown parsing, code highlight, mermaid, katex). Action: split into pipeline utilities and renderer; adopt unified libraries.

- Bundle analysis findings (anticipated):
  - Heavy contributors: `mermaid`, `katex`, `recharts`, `radix-ui`, `lucide-react`.
  - Actionable: Lazy-load `mermaid`; keep KaTeX as dynamic import; only import icons used (already tree-shaken); consider removing `recharts` if not used.

Actionable deletions/splits:
- Merge `quiz-validation-refactored.ts` into `quiz-validation.ts` and delete the refactored file after migration.
- Replace `TextRenderer` custom markdown with remark/rehype pipeline modules; split KaTeX/Mermaid plugins into separate dynamic modules.

Measured impact (target):
- Reduce initial bundle by 20-30% by deferring mermaid and SSR-rendering KaTeX where possible; exact numbers to be recorded after analyzer.

## 5. Test Strategy (Full-stack)

Coverage goals:
- ≥90% statements/branches for parser/validators.
- ≥80% for routes/components.
- Mutation score target ≥60% on parser normalization (stryker or equivalent).

Test types & tools:
- Unit: Vitest + @testing-library/react.
- Property-based: fast-check for parser normalization rules.
- Contract: zod schemas for module/question/option; assert parse/normalize.
- Integration: Next.js component tests with App Router; DOM assertions for KaTeX/Markdown.
- E2E: Playwright for critical flows (Welcome → Dashboard → Quiz → History → Export).
- Accessibility: axe-core automated checks in component and E2E.
- Snapshot: only for stable render fragments after sanitizer pipeline.

Fixtures:
- Minimal, realistic JSON/MD covering MCQ, T/F, multi-line, fenced code with stopper strings, LaTeX heavy, duplicate/missing IDs, invalid answers.

## 6. Test Matrix (Traceability)

| ID | Feature/Rule | Input Fixture | Steps | Expected DOM/State | Type (Unit/Int/E2E) |
|---|---|---|---|---|---|
| TM-PR-01 | MD: MCQ basic Options/Correct/Exp | md-mcq-basic.md | Import MD → Dashboard | Module with 1 chapter, 1+ questions; no errors | Unit/Int |
| TM-PR-02 | MD: “Opt/Ans” aliases | md-mcq-aliases.md | Import → Dashboard | Options parsed; correct IDs mapped | Unit/Int |
| TM-PR-03 | MD: Fenced code with stopper inside | md-code-stoppers.md | Import → Dashboard | Full code block preserved; no premature stop | Unit |
| TM-PR-04 | MD: True/False without Options | md-tf.md | Import → Dashboard | T/F options auto-generated; Correct requires True/False | Unit/Int |
| TM-PR-05 | ID: Missing IDs generate unique, warnings | md-missing-ids.md | Import → Console/Toasts | Warnings emitted; unique IDs generated | Unit/Int |
| TM-PR-06 | ID: Duplicate detection | md-duplicate-ids.md | Import → Console/Toasts | Duplicate warnings; parse continues | Unit/Int |
| TM-LX-01 | KaTeX: inline vs display | json-katex.json | Render question/explanation | Correct KaTeX DOM; no throw | Int |
| TM-LX-02 | LaTeX correction conservative | json-bad-latex.json | Import JSON | Corrections applied only inside $…$; valid JSON | Unit |
| TM-VL-01 | Schema validation required fields | json-missing-fields.json | Import → Error | Clear validation errors | Unit |
| TM-VL-02 | Cross-refs: correctOptionIds exist | json-bad-refs.json | Import → Error | Error referencing missing option IDs | Unit |
| TM-VL-03 | Global uniqueness of IDs | json-dup-ids.json | Import → Warning/Error | Uniqueness enforced across chapters | Unit |
| TM-RN-01 | XSS sanitize HTML | json-xss.html | Render | No script execution; sanitized attributes | Int/E2E |
| TM-RN-02 | Markdown lists/tables/inline code | md-markdown-rich.md | Render | Correct DOM structure | Int |
| TM-RN-03 | Explanation ID replacement | json-expl-optids.json | Submit answer → render | Explanation replaces IDs w/ texts | Int |
| TM-NV-01 | Dashboard → Chapter → Quiz | default-quiz.json | Click flows | Correct question index and progress | E2E |
| TM-NV-02 | History navigation correctness | run quiz 3 Qs | Submit wrong/correct; navigate grid | Stable highlights per snapshot | E2E |
| TM-SRS-01 | Level transitions | simulate correct twice | Submit answers | 0→1→2; mastered at 2 | Unit/Int |
| TM-SRS-02 | Due scheduling | incorrect then 30s | Check due count | Included in queue after 30s | Unit/Int |
| TM-SRS-03 | Queue ordering priority | mixed due set | Fetch next review | Recent failures prioritized | Unit/Int |
| TM-IE-01 | JSON→Export→Import round-trip | default-quiz.json | Export, re-import | State preserved | E2E |
| TM-IE-02 | LaTeX correction utility idempotence | json-bad-latex.json (run twice) | Import twice | Same normalized output | Unit |
| TM-PF-01 | Bundle size budget | prod build | Analyze | <= budget per page | CI |
| TM-PF-02 | Mermaid lazy loading | render with/without mermaid | Inspect network | Mermaid loaded only when needed | Int |
| TM-AC-01 | Axe checks on quiz routes | default module | Run axe | No serious violations | E2E |
| TM-AC-02 | Keyboard navigation | quiz session | Tab/Enter flow | Operable via keyboard | E2E |

## 7. TDD Refactor Plan (Phased)

### Phase 0: Harness & Safety Net
- Entry: Repo builds; install test tooling.
- Tasks:
  - Add ESLint (strict), Prettier, TypeScript strict mode.
  - Add scripts: `typecheck`, `lint`, `test:unit`, `test:int`, `test:e2e`, `test:access`, `coverage`, `mutation`.
  - Introduce zod schemas for `QuizModule`/`QuizChapter`/`QuizQuestion`/`QuizOption` and use at import/parse.
  - Add Playwright and basic E2E skeleton.
- Exit: Lint/typecheck clean; base tests pass on current behavior.

### Phase 1: Parser Hardening First
- Entry: Golden fixtures established from current behavior.
- Tasks:
  - Port/wire `utils/quiz-validation-refactored.ts` as the canonical module (or merge into `quiz-validation.ts`).
  - Add property-based tests (fast-check) for block parsing, code fences, A1…An labels, T/F rules, ID uniqueness.
  - Replace legacy LaTeX fixer with conservative version; tests for idempotence.
- Exit: TM-PR-01..06, TM-LX-02 green; ≥90% coverage in parser.

### Phase 2: Rendering & Sanitization
- Entry: Parser green.
- Tasks:
  - Swap `TextRenderer` to unified pipeline (remark/rehype with sanitize + katex). Keep `trust: false`.
  - Add XSS tests (malicious HTML/links), KaTeX correctness tests.
- Exit: TM-RN-01..03, TM-LX-01 green; no XSS; snapshot tests updated.

### Phase 3: Navigation & Session Logic
- Entry: Rendering stable.
- Tasks:
  - Add integration tests for question navigation grid, historical vs live view state.
  - Ensure displayed options in history use snapshot only; remove accidental recomputation.
- Exit: TM-NV-01..02 green.

### Phase 4: Import/Export & LaTeX Correction Utility
- Entry: Core flows stable.
- Tasks:
  - Add dry-run preview for imports (overwrite/skip/rename), idempotent LaTeX corrections; persist progress.
- Exit: TM-IE-01..02 green.

### Phase 5: Performance & Bloat
- Entry: Functional tests green.
- Tasks:
  - Code split renderer; lazy-load mermaid; SSR KaTeX where viable.
  - Run analyzer; prune unused deps/exports; memoize hotspots.
- Exit: TM-PF-01..02 green; bundle budgets enforced.

### Phase 6: Accessibility polish
- Entry: Budgets enforced.
- Tasks:
  - Axe pass across quiz routes; fix issues; ensure keyboard flows and focus order.
- Exit: TM-AC-01..02 green.

## 8. CI/CD & Developer Experience

- Workflow (GitHub Actions): typecheck → lint → unit → integration (JSDOM/React Testing Library) → e2e (Playwright) → build → upload artifacts.
- Coverage thresholds: 90% parser; 80% components; fail PR on drop.
- Playwright artifacts on failure: videos, traces, screenshots.
- Preview deploys (Vercel) for PRs.
- Danger/PR checks: block on increased bundle size beyond budget or reduced coverage; note lighthouse/axe deltas.

## 9. Definitions of Done (DoD)

- All Critical/Blocker issues closed (ISS-001, ISS-002) and Major items addressed.
- All Test Matrix rows implemented and passing.
- Lighthouse perf ≥90 on quiz routes; axe automated checks pass.
- Bundle within budget per page (e.g., initial `app/` route < 250KB gzip, `quiz` route < 350KB gzip; tunable).
- No TODOs in critical paths; types strict; zero runtime type errors in logs.

## 10. Appendices

Commands to run tests (to be added to `package.json`):

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:int
npm run test:e2e
npm run test:access
npm run coverage
npm run mutation
```

Example minimal fixtures (inline):

```markdown
# Module Title
_Optional description_
---
## Algorithms <!-- CH_ID: algos -->
---
### Q: What is 2+2? <!-- Q_ID: q1 -->

**Options:**
**A1:** 3
**A2:** 4

**Correct:** A2

**Exp:** `q1_opt2` is “4”.
---
### T/F: The earth is flat. <!-- Q_ID: tf1 -->

**Correct:** False

**Exp:** It is an oblate spheroid.
---
```

```markdown
### Q: Code fence should not stop sections

**Options:**
**A1:** ```python\nprint("**Correct:** shouldn't stop")\n```
**A2:** another

**Correct:** A2

**Exp:** Fence above is preserved.
```

Risk register & rollback notes:
- Parser swap may alter edge parsing; mitigate by golden fixtures and feature flag.
- Sanitizer may strip previously allowed HTML; provide allowlist and migration guidance.
- Performance changes may affect layout timing; use visual regression where needed.

Proposed file moves/renames map:
- Merge `utils/quiz-validation-refactored.ts` → `utils/quiz-validation.ts` (keep exports stable).
- Create `lib/markdown/` with `pipeline.ts` (remark/rehype config) and `TextRenderer.tsx` using it.

Code pointers (selected):

```12:18:app/page.tsx
import {
  validateQuizModule,
  normalizeQuizModule,
  validateSingleQuestion,
  normalizeSingleQuestion,
  recalculateChapterStats,
  validateAndCorrectQuizModule, // Add this new import
} from "@/utils/quiz-validation"
```

```602:959:utils/quiz-validation.ts
export function parseMarkdownToQuizModule(markdownContent: string) {
  // Legacy parser: lacks code fence awareness and T/F support
}
```

```659:721:utils/quiz-validation-refactored.ts
function parseBlockContent(lines: string[], lineIndexRef: LineIndexRef, stopperKeywords: string[]): string {
  // Code-fence aware block parser
}
```

```783:1177:utils/quiz-validation-refactored.ts
export function parseMarkdownToQuizModule(markdownContent: string) {
  // Refactored parser: code fences, T/F, ID sets, recovery
}
```

```1:40:types/quiz-types.ts
export interface QuizQuestion { /* includes optional type: 'mcq' | 'true_false' */ }
```

```1:90:components/text-renderer.tsx
// No sanitizer; uses dangerouslySetInnerHTML
```

