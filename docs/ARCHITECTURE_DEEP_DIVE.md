# Deep-Dive Architecture & Engineering Decisions

> **Document Status**: Live / Maintaining
> **Last Updated**: 2025-12-27
> **Scope**: Comprehensive audit of architectural decisions, tradeoffs, and system design for the Quiz-SRS platform.

## 1. Executive Summary

Quiz-SRS is a **local-first, static-deployable web application** designed for active recall learning through spaced repetition. Unlike typical CRUD apps, it emphasizes:

- **Zero-Latency Interactions**: State is local; UI is optimistic.
- **Portability**: Content is just Markdown/JSON; no database lock-in.
- **Accessibility (a11y)**: WCAG 2.1 AA compliance as a strict gate, not an afterthought.

This document serves as the "black box" recording of why the system is built the way it is, referencing comparable architectures in the ecosystem (e.g., Anki, Obsidian, Flashcard apps) and justifying our deviations.

---

## 2. Tech Stack Selection & Tradeoffs

### 2.1 Framework: Next.js 15 (App Router) vs. Vite/React vs. Remix

| Candidate      | Pros                                                                                                   | Cons                                                                                           | Decision   |
| :------------- | :----------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :--------- |
| **Next.js 15** | Standard-bearer, excellent static export (`output: export`), strictly guarded routing, rich ecosystem. | Heavyweight for small apps, strict conventions can be limiting.                                | **CHOSEN** |
| **Vite SPA**   | Extremely lightweight, fast dev server, simple build.                                                  | "Use Client" by default (no server/client split discipline), routing is manual (React Router). | Rejected   |
| **Remix**      | Best-in-class data mutation, web standards focused.                                                    | Static export story is less mature than Next.js for GitHub Pages deployment.                   | Rejected   |

**Analysis**:
We selected Next.js 15 primarily for its robust **Static Export** capabilities combined with the **App Router structure**. Even though we don't use SSR, the App Router enforces a clean separation between "layout" and "page" logic, and the folder-based routing is intuitive. The strict separation of client/server components (even in static export) encourages better code organization (keeping heavy interactive logic at the leaves).

### 2.2 State Management: Zustand vs. Redux vs. Context

| Candidate           | Pros                                                                                                      | Cons                                                                           | Decision   |
| :------------------ | :-------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- | :--------- |
| **Zustand**         | Minimal boilerplate, hook-based, easy persistence middleware, transient updates without render thrashing. | Less "strict" than Redux; requires discipline.                                 | **CHOSEN** |
| **Redux (Toolkit)** | Industry standard, robust DevTools, time-travel debugging.                                                | Massive boilerplate, steep learning curve, overkill for < 50 discrete actions. | Rejected   |
| **React Context**   | Built-in, no dependencies.                                                                                | Performance pitfalls (re-renders everything on update), "Provider Hell".       | Rejected   |

**Deep Dive**:
We use Zustand because the quiz app requires frequent, granular updates (e.g., selecting an option, timer ticks, progress bar updates) that would cause massive re-renders in a naive Context implementation. Zustand's atomic selectors allow us to subscribe a component to _just_ `state.currentQuestionIndex` without re-rendering when `state.sessionHistory` changes.
_See `store/quiz-store.ts` for the implementation of the `persist` middleware which handles `localStorage` synchronization seamlessly._

### 2.3 Styling: Tailwind CSS vs. CSS-in-JS vs. CSS Modules

**Decision**: **Tailwind CSS**.

- **Rationale**: The "Utility-First" approach speeds up prototyping of complex states (hover, focus, dark mode).
- **Performance**: Zero runtime overhead (unlike Emotion/Styled-Components). Critical for a static site targeting mobile performance.
- **Maintainability**: `shadcn/ui` (which we use) is built on Tailwind, providing accessible, copy-pasteable components that we own.

---

## 3. System Architecture (C4 Model)

### 3.1 Context Level

- **User**: The learner using the app.
- **Quiz-SRS System**: The browser-based application.
- **Content Source**: Local filesystem (Markdown/JSON files) uploaded by the user.

### 3.2 Container Level

The application is a **Single Page Application (SPA)** delivered as static HTML/JS/CSS assets.

**Core Modules**:

1.  **Module Loader (`features/dashboard`)**:
    - _Input_: Raw File Object (JSON/MD).
    - _Process_: Validation -> Parsing -> Normalization -> Store Hydration.
    - _Output_: Clean `QuizModule` object in Zustand Store.
2.  **Quiz Engine (`features/quiz-session`)**:
    - _State Machine_: Welcome -> Dashboard -> Question -> Feedback -> Summary.
    - _Logic_: Answer verification, SRS calculation (SM-2 simplified), History tracking.
3.  **Components Library (`components/ui`)**:
    - Atomic, accessible UI primitives (Button, Card, Toast).

---

## 4. Module & Data Design (The "Content Pipeline")

One of the most complex parts of this architecture is handling user content safely and robustly.

### 4.1 The Markdown Parser (`lib/quiz/parser.ts`)

We accept a custom Markdown flavor that is "human-readable first".
**Tradeoff**:

- _Option A_: Strict Frontmatter + Content. (Too rigid for casual users).
- _Option B_: Custom AST parser. (Hard to maintain).
- **Selected**: **Regex-enhanced Line Processing + Unified Pipeline**.
  - We use regex to identify "blocks" (Question, Options, Explanation).
  - We use `unified` / `remark` / `rehype` only for rendering the _content_ of those blocks. This gives us the best of both worlds: structure detection is simple/fast, content rendering is robust/secure.

### 4.2 Validation Layer

Before any data hits the State Store, it passes through `utils/quiz-validation-refactored.ts`.
**Safety Checks**:

- **Schema Validation**: Ensures all required fields (ID, Text, Options) exist.
- **Logical Validation**: Ensures `correctOptionIds` actually exist in `options`.
- **Sanitization**: All HTML is stripped or sanitized via `rehype-sanitize` to prevent XSS from malicious quiz files.

---

## 5. Security & Safety Model

### 5.1 Content Security Policy (CSP)

Since we deployed to GitHub Pages (static), we cannot use HTTP headers.
**Solution**: We inject `<meta http-equiv="Content-Security-Policy">` (Ref: `next.config.mjs` comments, implemented in `app/layout.tsx`).
**Policy**:

- `script-src 'self' 'unsafe-inline'` (Required for Next.js hydration).
- `connect-src 'self'` (No external API calls permitted).
- `img-src 'self' data:` (Allow local assets and base64 images).

### 5.2 XSS Prevention

We render user content (Quiz Questions) which may contain Markdown/HTML.
**Defense in Depth**:

1.  **React**: Escapes content by default.
2.  **Markdown Renderer**: Uses `rehype-sanitize` with a strict whitelist (allows `<b>, <i>, <code>, <math>`, blocks `<script>, <iframe, <object>`).
3.  **Latex**: `rehype-katex` renders math safely to HTML/CSS, no JavaScript execution involved in the rendering output.

---

## 6. Testing Strategy ("Test Pyramid")

The repository enforces a strict testing culture using **Vitest** (fast, Vite-compatible) and **Playwright** (browser automation).

1.  **Unit Tests (`tests/unit`)**:
    - _Target_: Utility functions, Hooks, transformation logic.
    - _Tool_: Vitest + React Testing Library.
    - _Coverage_: ~80% of `lib/` and `features/`.
2.  **Integration Tests (`tests/integration`)**:
    - _Target_: Component combinations (e.g., `QuizSession` + `useQuizStore`).
    - _Goal_: Ensure state updates reflect correctly in the UI.
3.  **E2E Tests (`tests/e2e`)**:
    - _Target_: Critical User Journeys (Import File -> Finish Quiz -> Check Score).
    - _Tool_: Playwright.
    - _Note_: These run against the _build_ artifact to catch production-only issues.
4.  **Accessibility Tests (`tests/access`)**:
    - _Tool_: `axe-core` injected into Vitest and Playwright.
    - _Gate_: Development builds fail if any `critical` or `serious` A11y violations are detected.

---

## 7. CI/CD Pipeline Audit

**Current Workflow** (`.github/workflows/deploy.yml`):
A single, linear pipeline ensures broken code never reaches `gh-pages`.

### 7.1 Stages

1.  **Test & Validate**:
    - `npm ci`: Clean install.
    - `npm run lint -- --max-warnings 0`: Zero tolerance for lint errors.
    - `npm run typecheck`: TypeScript compilation check.
    - `npm run test:unit`: Logic verification.
    - `npm run size`: **Performance Guardrail**. Ensures the main bundle doesn't exceed 1.5MB (adjusted for rich text support).
2.  **Build**:
    - `npm run build`: Generates the `out/` directory.
    - _Env_: `GITHUB_ACTIONS=true` sets `basePath` correctly for strict path resolution.
3.  **Deploy**:
    - Uses `actions/deploy-pages` to securely upload the artifact.

**Why this is robust**:

- It separates "Verification" from "Build". Verification is cheap; Build is expensive.
- It uses `deployment` environments in GitHub for audit trails.
- It blocks deployment on _any_ failure (`needs: [test, build]`).

---

## 8. Performance & Optimization Strategy

### 8.1 The "Heavy" Dependencies Tradeoff

Our bundle size analysis (`npm run analyze`) reveals a large initial chunk (~1MB).
**Culprits**:

- `katex`: Mathematical rendering engine.
- `mermaid`: Diagramming tool.
- `highlight.js`: Syntax highlighting.

**Decision**:
We bundle these in the main entry point for _reliability_ in the static export verification phase.

- **Tradeoff**: Slower First Contentful Paint (FCP) vs. Zero Layout Shift (CLS) + Offline capability.
- **Mitigation Strategy (Roadmap)**:
  - We plan to move `QuizSession` to use `next/dynamic` for lazy-loading the Markdown Renderer. This would drop the initial bundle back to <200KB.
  - Currently, we accept the 1MB bundle because the app is a long-lived "Session" (users stay for 10-20 minutes). The initial load penalty is amortized over the session duration.

### 8.2 Rendering Optimization

- **Memoization**: Heavy components like `MarkdownRenderer` are wrapped in `React.memo` to prevent re-parsing the regex/AST on every timer tick.
- **Virtualization**: The `AllQuestionsView` uses `radix-ui` primitives, but for chapters > 100 questions, we would introduce `react-window`.

---

## 9. Future Roadmap & Scalability

### 9.1 PWA (Progressive Web App)

Since the architecture is already "Local-First" and "Offline-Ready" (static assets), turning this into a PWA is a `manifest.json` + Service Worker away.
**Why not yet?**

- Service Workers can complicate the GitHub Pages cache invalidation strategy. We paused this to ensure the "Update Workflow" via Git remains simple.

### 9.2 Backend Integration

The `useQuizStore` is built with the **Facade Pattern**.

- Currently: `hooks/use-srs.ts` calculates schedules locally.
- Future: We can swap the implementation of `saveProgress` to hit a Supabase/Firebase endpoint without changing any UI components.

---

## 10. Audit of Architectural Decisions vs. Industry Standard

| Feature     | Standard Next.js App                | Quiz-SRS           | Reason                                                                                           |
| :---------- | :---------------------------------- | :----------------- | :----------------------------------------------------------------------------------------------- |
| **API**     | `/api` routes with Server Functions | None (Client-only) | Zero-cost hosting; Total privacy (no data leaves device).                                        |
| **Auth**    | NextAuth.js                         | None               | Personal tool; Git repository access _is_ the auth.                                              |
| **Images**  | `next/image` Optimization           | Unoptimized        | GitHub Pages does not support the sharp/image-optimization server.                               |
| **Testing** | Cypress                             | Playwright         | Playwright's distinct separation of browser contexts matches our "Session" testing needs better. |

---

## 11. Data Structures & Logic Deep Dive

### 11.1 The SRS Algorithm (Spaced Repetition)

We implement a modified SM-2 algorithm.

- **Location**: `lib/engine/srs.ts`.
- **Inputs**: `srsLevel` (0-5), `isCorrect` (bool).
- **Outputs**: `nextReviewDate`, `newStatus`.
- **Logic**:
  - Correct: `interval = 6 * 2^(level-1)`.
  - Incorrect: `level = 0`, `interval = 0` (Impact: Immediate review required).

### 11.2 The "Transient" Chapter Strategy

For "Review Mistakes", we don't just filter the list. We generate a **Transient Chapter**.

- **Why?** The `QuizSession` component expects a valid `chapterId` and `Question[]` array.
- **Process**:
  1.  User clicks "Review Mistakes".
  2.  `QuizCompleteContainer` filters the _wrong_ questions.
  3.  It constructs a temporary `QuizChapter` object in memory.
  4.  It calls `startQuiz(transientChapter.id)`.
  - _Result_: The existing Quiz UI works perfectly without "Mode Checking" logic (e.g., `if (mode === 'review')`). It's just another chapter.

---

## 12. Conclusion & Maintenance Guide

This architecture prioritizes **Survival** and **Simplicity**.

- **Survival**: Pure static files means this app will work 10 years from now, even if Vercel/Netlify disappear.
- **Simplicity**: No database migrations. No detailed API schemas.
- **Verification**: The types (`types/quiz-types.ts`) are the contract. As long as `tsc` passes, the app logic is likely sound.

**To Maintain**:

1.  Run `npm run test` before every push.
2.  Keep `next.config.mjs` clean of server-only features.
3.  Respect the "No-Any" rule to ensure refactors are safe.
