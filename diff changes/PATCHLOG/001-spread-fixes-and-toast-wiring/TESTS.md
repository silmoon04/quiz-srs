## Tests

- `npm run typecheck` should pass (no TS parse errors in modified files).
- Render a simple `<Toaster />` and trigger a toast using the store; expect title to appear.
- `npm run test:e2e` boots browsers after Playwright fix.

### Manual

- Launch `npm run dev` → load `/` → perform any action that shows a toast; verify it renders.
