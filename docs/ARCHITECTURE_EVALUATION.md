# Architecture Evaluation and Recommendations

Last updated: 2025-12-21

## Current Strengths

- Rendering pipeline is synchronous and sanitized, which avoids hydration and click timing issues.
- Feature containers separate state wiring from UI components.
- SRS logic is isolated in `lib/engine`, enabling unit testing.

## Current Constraints

- Markdown parsing is still a custom state machine; edge cases can slip through and error reporting is coarse.
- Review and editor features are only partially wired, which creates UX gaps.
- High fan-in files (`types/quiz-types.ts`, `components/rendering/MarkdownRenderer.tsx`) amplify change risk.

## Recommendations (High ROI)

1. Migrate parser to AST-based parsing with unified/remark to reduce edge-case failures.
2. Introduce an explicit state machine for `app/page.tsx` transitions (welcome -> dashboard -> quiz -> complete).
3. Formalize a repository interface for persistence to decouple storage from UI and tests.

## Rendering Pipeline Status

- Syntax highlighting is enabled via `rehype-highlight`.
- Highlight.js CSS is included in `app/layout.tsx` and `app/globals.css`.
- Mermaid blocks are transformed to `.mermaid` divs for client-side rendering.

## Verification Checklist

- Focus stability: clicking options immediately after render should work without missed clicks.
- Markdown safety: XSS payloads should be sanitized in renderer tests.
- Import resilience: partial errors should not block the entire module load.
