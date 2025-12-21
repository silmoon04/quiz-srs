# Architecture Overview

Last updated: 2025-12-21

## Summary

Quiz-SRS is a Next.js 15 app with a layered structure:

- App layer: routing and top-level state orchestration.
- Feature layer: container components that wire store state to UI.
- Shared components: reusable UI and accessibility widgets.
- Domain logic: parsing, validation, SRS, and rendering pipeline.
- Persistence: local storage adapter behind a service interface.

## Key Directories

- `app/`: App Router entrypoints (`app/layout.tsx`, `app/page.tsx`).
- `features/`: Feature modules (dashboard, quiz-session).
- `components/`: Shared UI and quiz views (session UI, dashboard cards, renderers).
- `lib/`: Domain logic (markdown pipeline, SRS engine, quiz helpers).
- `store/`: Zustand state and persistence wiring.
- `services/`: Persistence interfaces and local storage implementation.
- `types/`: Shared type definitions.
- `tests/`: Unit, integration, accessibility, and E2E suites.

## Main Flow (Current)

1. `app/page.tsx` chooses between welcome, dashboard, and session views based on store state.
2. `features/dashboard/...` loads modules (default or user import) and starts a session.
3. `components/quiz-session.tsx` renders questions, options, feedback, and history navigation.
4. Persistence flows through `services/persistence/local-storage.ts` via the store.

## Boundaries and Responsibilities

- Parsing and validation live in `lib/quiz/` and `utils/` (import boundaries).
- Rendering is handled by `components/rendering/MarkdownRenderer.tsx` and `lib/markdown/pipeline.ts`.
- SRS scheduling is isolated in `lib/engine/srs.ts`.

## Notes

- The main session flow currently routes between the welcome screen, dashboard, and quiz session.
- For dependency maps and audits, see `docs/CODEBASE-MAP-GUIDE.md` and `docs/ARCHITECTURE_AUDIT.md`.
