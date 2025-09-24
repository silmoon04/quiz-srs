# Test & Verification Report (how to run locally)

> Commands (npm):

```
npm run typecheck
npm run lint
npm run test:unit
npm run test:int
npm run test:access
npm run test:e2e     # ensure browsers installed
npm run analyze      # bundle snapshot
npm run size         # check budget (500 KB)
```

- Expect `typecheck` to pass after patches 001–004.
- Playwright projects will boot after the config fix (Patch 004).

## Coverage thresholds (Vitest)

- Global: 80%; Parser: 90%; Components: 80% (configured). fileciteturn14file8

## Accessibility

- ScreenReaderAnnouncer present and used in layout; include axe checks in CI. fileciteturn14file0

## Bundle & Size budgets

- `size-limit` configured at 500 KB for chunks; analyzer available behind `ANALYZE=true`. fileciteturn15file5
