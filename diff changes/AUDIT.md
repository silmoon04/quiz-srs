# Quiz‑SRS — Deep Audit (second pass)

**Date:** 2025-09-24

## Toolchain & Key Versions

- **Next.js:** 15.2.4 · **React:** ^19 · **TypeScript:** ^5 · **Tailwind:** 3.4.x. Confirmed in `package.json`. fileciteturn15file13
- **Size budget:** size-limit capped at **500 KB** for chunks. fileciteturn15file5
- **Scripts (partial):** `typecheck`, `lint`, `test:unit`, `test:int`, `test:access`, `test:e2e`, `analyze`, `depcheck`, `prune:exports`, `size`. fileciteturn15file0

## App Entry & Metadata

- App entry is `app/page.tsx`; layout metadata title is currently **"v0 App"** and should be branded. fileciteturn14file0
- Global styles at `app/globals.css`; no KaTeX CSS imported (math is rendered but styles may be missing). fileciteturn14file1

## Security-Sensitive Rendering

- `components/rendering/MarkdownRenderer.tsx` uses a **secure pipeline** via `lib/markdown/pipeline` with `remark-parse/gfm/math` → `rehype-katex` → `rehype-sanitize`; final belt-and-suspenders regex rejects `<script>`, `on*`, and `javascript:` before `dangerouslySetInnerHTML`. This is good. fileciteturn16file17
- Legacy ad‑hoc sanitizer code still appears in another variant of the renderer in the code listing (uses `remark-html` and string checks). Ensure only the secure renderer is used everywhere. fileciteturn16file19

## Parser & Validation

- `utils/quiz-validation/index.ts` re-exports the refactored implementation; Zod schemas live in `lib/schema/quiz.ts`. (Schemas expose `safeParse*` helpers.) fileciteturn15file6 fileciteturn15file16

## TypeScript & Lint

- **TS strict is OFF** (`strict: false`) in `tsconfig.json`. Needs enabling with staged fixes. fileciteturn14file10
- ESLint exists; currently `@typescript-eslint/no-explicit-any` is disabled (temporary). Consider re-enabling after strict migration. fileciteturn14file8

## Test Infra

- Vitest unit/int/access configs + Playwright e2e are present. fileciteturn14file8 fileciteturn14file9
- There’s a meta audit test + a script `scripts/audit-snapshot.mjs` producing pattern snapshots & bundle budget notes. fileciteturn15file4

## What’s Broken (must-fix)

1. **Spread operator regressions**—many UI files accidentally use `.props`, `.prev`, `.state`, etc. instead of spread (`...props`). That’s a hard build break. Examples:
   - `components/ui/command.tsx` has `({ className, .props }, ref)` and `{.props}`. fileciteturn15file8
   - `components/ui/toast.tsx` / `toaster.tsx` / `textarea.tsx` / `toggle-group.tsx` / `tooltip.tsx` / `theme-provider.tsx` show the same pattern. fileciteturn16file11 fileciteturn16file11 fileciteturn16file13 fileciteturn16file12 fileciteturn16file15 fileciteturn16file14
   - `hooks/use-toast.ts` has `{ .toast, id }` and `[.prev, newToast]`. fileciteturn16file0

2. **Toast wiring duplication**—there are two parallel toast systems:
   - `components/ui/use-toast.ts` (shadcn-style reducer/store, expected by the Radix UI `<Toast>` components), and
   - `hooks/use-toast.ts` (custom stateful hook).  
     `components/ui/toaster.tsx` imports the **custom** hook; `app/page.tsx` also imports the custom one. This mismatch risks broken UI + types. We should align all imports to `components/ui/use-toast`. fileciteturn16file11 fileciteturn15file0

3. **lib/utils.ts → cn helper typo**—currently `export function cn(.inputs: ClassValue[])` which doesn’t parse. Should be `...inputs`. fileciteturn15file16

4. **E2E config syntax**—`playwright.config.ts` uses `use: { .devices['Desktop Chrome'] }` etc.; must be `use: {{...devices['Desktop Chrome']}}`. fileciteturn14file19

5. **Branding**—`app/layout.tsx` still advertises “v0 App”. Update to the actual product name. fileciteturn14file0

6. **KaTeX styles**—math renders, but global CSS doesn’t import KaTeX styles; add `@import "katex/dist/katex.min.css";` to `app/globals.css` to ensure consistent math styling. fileciteturn14file1

7. **CSP hardening**—no custom headers configured. We can add a conservative CSP via `next.config.mjs` headers to reduce XSS blast radius (links allowed, images data/http/https, no inline scripts). fileciteturn14file10

## Route & Component Map (high-level)

- **/ (app/page.tsx)** → orchestrates `WelcomeScreen`, `Dashboard`, `QuizSession`, `AllQuestionsView`, and toast system. fileciteturn14file0
- **MarkdownRenderer** is the **single** source of `dangerouslySetInnerHTML` (good). Ensure other legacy renderers aren’t used. fileciteturn16file17

## Risks & Priorities

- **P0**: Spread-operator regressions + toast mismatch (build blocker).
- **P1**: Branding + KaTeX CSS + Playwright config fix.
- **P2**: TS strict migration (flip + staged allowlist), CSP headers.
- **P3**: Dead code & dependency surface (depcheck/knip), perf budgets.
