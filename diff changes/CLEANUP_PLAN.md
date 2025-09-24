# Cleanup & Refactor Plan (phased, stop-rules respected)

## Phase 0 — Re-baseline (no functional changes)

- Run: `npm run typecheck && npm run lint && npm run analyze` to capture the current state.
- Snapshot dep/bundle/report via existing audit script.

## Phase 1 — Build breakers

- Patch 001: fix spread operator regressions in core UI files + cn helper; align toast wiring to `components/ui/use-toast`. Add targeted unit test for `<Toaster />`.
- Patch 002: brand metadata title/description in `app/layout.tsx`.
- Patch 003: import KaTeX CSS in `app/globals.css` to style math consistently.
- Patch 004: Playwright config syntax fix.

**Exit:** `typecheck`, `lint`, `build` green; `/` boots; toasts work.

## Phase 2 — Security & correctness

- Patch 005: Add CSP headers in `next.config.mjs` with least privilege.
- Confirm only the secure MarkdownRenderer is referenced. Remove legacy ad‑hoc sanitizer paths, or wrap behind flag.

## Phase 3 — TS strict (staged)

- Flip `"strict": true` in `tsconfig.json` with CI gate. If friction: keep local `typecheck` green and stage per folder.
- Re-enable `@typescript-eslint/no-explicit-any` to `warn` after first pass.
- Add narrow `@ts-expect-error` only with in-file reason + TODO.

## Phase 4 — Dead code & perf

- Run `depcheck`, `ts-prune`, `knip`, and `madge`. Prune unused shadcn components and duplicate hooks.
- Keep mermaid/charts lazily loaded. Re-run `npm run analyze` and confirm size-limit (500 KB) holds.

## Phase 5 — A11y & tests

- Axe smoke on components + e2e; confirm SR announcements and keyboard traversal.
- Strengthen renderer tests (math, links protocol allowlist).

## Stop rules

- Don’t widen sanitizer allowlist unless a specific tag/attr is proven necessary.
- If strict mode explodes, scope enable for `lib/` and `components/` first (tsconfig references) and iterate.
