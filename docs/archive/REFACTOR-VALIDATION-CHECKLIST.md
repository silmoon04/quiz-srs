# Refactor Validation Checklist

## Baseline Snapshot (Pre-Refactor)

Run these commands BEFORE starting any refactoring phase to establish baseline metrics.

### 1. Capture Test Baseline

```powershell
# Unit + Integration + Accessibility tests
npm run test 2>&1 | Tee-Object -FilePath "baseline-vitest.log"

# E2E tests
npm run test:e2e 2>&1 | Tee-Object -FilePath "baseline-e2e.log"

# Coverage report
npm run coverage 2>&1 | Tee-Object -FilePath "baseline-coverage.log"
```

### 2. Expected Baseline Values (Captured)

| Metric                 | Value                 |
| ---------------------- | --------------------- |
| Unit Tests (vitest)    | 353 passed            |
| Accessibility Tests    | 13 passed             |
| **Total Vitest**       | **366 passed**        |
| E2E Tests (playwright) | Capture from run      |
| Coverage               | Capture % from report |

---

## Phase 1: Extract SRS Engine (`lib/quiz/srs-engine.ts`)

### Scope

Extract pure SRS calculation functions from `utils/quiz-validation-refactored.ts` and `app/page.tsx` into `lib/quiz/srs-engine.ts`.

### Validation Commands

```powershell
# 1. Type check
npm run typecheck
# Expected: No errors

# 2. Run SRS-specific integration tests
npx vitest run tests/int/srs/srs-algorithm.test.ts
# Expected: 45 tests passed

# 3. Run full test suite
npm run test
# Expected: 366 tests passed (no decrease)

# 4. Check for console errors in tests
npm run test 2>&1 | Select-String "error|Error" | Select-String -NotMatch "error-|ErrorBoundary"
# Expected: No unexpected errors
```

### Validation Checklist

- [ ] **Type check passes**: `npm run typecheck` → 0 errors
- [ ] **SRS algorithm tests pass**: All 45 tests in `srs-algorithm.test.ts`
- [ ] **Full suite passes**: 366+ vitest tests
- [ ] **No new console errors**: No runtime errors during tests
- [ ] **Imports work**: Components using SRS functions compile successfully

### Manual Verification

1. Open [tests/int/srs/srs-algorithm.test.ts](../tests/int/srs/srs-algorithm.test.ts)
2. Verify tests still import from correct location
3. Check that `simulateSrsUpdate` function behavior matches new `lib/quiz/srs-engine.ts` exports

### Critical SRS Behaviors to Preserve

| Scenario                     | Expected Behavior                  |
| ---------------------------- | ---------------------------------- |
| Correct answer (srsLevel 0)  | srsLevel → 1, status → passed_once |
| Correct answer (srsLevel 1)  | srsLevel → 2, status → mastered    |
| Incorrect answer (any level) | srsLevel → 0, status → attempted   |
| Mastered question            | nextReviewAt → null                |
| Failed question              | nextReviewAt → +30 seconds         |

---

## Phase 2: Extract Module Operations (`lib/quiz/module-operations.ts`)

### Scope

Extract module/chapter/question manipulation functions into `lib/quiz/module-operations.ts`.

### Validation Commands

```powershell
# 1. Type check
npm run typecheck

# 2. Run state persistence tests
npx vitest run tests/int/state/state-persistence.test.ts
# Expected: 25 tests passed

# 3. Run full test suite
npm run test
# Expected: 366 tests passed

# 4. Coverage comparison
npm run coverage
# Compare with baseline - should not decrease
```

### Validation Checklist

- [ ] **Type check passes**: `npm run typecheck` → 0 errors
- [ ] **State persistence tests pass**: All 25 tests in `state-persistence.test.ts`
- [ ] **Validation tests pass**: Check `validateAndCorrectQuizModule` still works
- [ ] **Full suite passes**: 366+ vitest tests
- [ ] **Coverage maintained**: Same or better than baseline

### Manual Verification

1. Test import/export round-trip manually:
   - Load quiz from JSON
   - Make changes (answer questions)
   - Export to JSON
   - Re-import and verify state preserved

2. Verify chapter statistics recalculation works after refactor

### Critical Module Operations to Preserve

| Function                       | Expected Behavior                                                      |
| ------------------------------ | ---------------------------------------------------------------------- |
| `normalizeQuizModule`          | Adds default SRS fields to all questions                               |
| `recalculateChapterStats`      | Updates totalQuestions, answeredQuestions, correctAnswers, isCompleted |
| `validateAndCorrectQuizModule` | Validates structure + LaTeX correction                                 |

---

## Phase 3: Dead Code Removal

### Scope

Remove unused functions, variables, and imports identified during analysis.

### Validation Commands

```powershell
# 1. Type check (catch broken references)
npm run typecheck

# 2. Run ALL tests
npm run test
npm run test:e2e

# 3. Check unused exports
npm run prune:exports

# 4. Dependency check
npm run unused
```

### Validation Checklist

- [ ] **Type check passes**: No broken imports
- [ ] **All vitest tests pass**: 366 tests
- [ ] **All E2E tests pass**: Same as baseline
- [ ] **No new runtime errors**: Check browser console during E2E
- [ ] **Bundle size reduced or same**: `npm run size`

### Manual Verification

1. Run `npm run graph` to verify no orphan modules
2. Check that removed code wasn't secretly used via dynamic imports

---

## Phase 4: Bug Fixes

### Scope

Apply identified bug fixes while maintaining backward compatibility.

### Validation Commands

```powershell
# 1. Run bug-specific tests
npx vitest run tests/int/bugs/bug-detection.test.ts
# Expected: 41 tests passed

# 2. Run error boundary E2E tests
npx playwright test tests/e2e/edge-cases/error-recovery.spec.ts

# 3. Full test suite
npm run test
npm run test:e2e
```

### Validation Checklist

- [ ] **Bug detection tests pass**: All 41 tests in `bug-detection.test.ts`
- [ ] **Error recovery E2E passes**: All tests in `error-recovery.spec.ts`
- [ ] **Full suite passes**: No regressions
- [ ] **TypeScript strict check**: `npm run typecheck:strict`

### Specific Bug Fixes to Validate

| Bug ID | Fix Description                               | Validation Test                             |
| ------ | --------------------------------------------- | ------------------------------------------- |
| D3     | NoCorrectOptionsError thrown for invalid data | `generate-displayed-options.tsx` validation |
| D4     | srsLevel clamped to [0, 2]                    | `normalizeSingleQuestion` tests             |

---

## Phase 5: Type Re-exports (`lib/schema/` → `types/`)

### Scope

Ensure types are correctly re-exported from `lib/schema/` while keeping canonical source in `types/quiz-types.ts`.

### Validation Commands

```powershell
# 1. Type check
npm run typecheck

# 2. Build check
npm run build

# 3. Full test suite
npm run test
```

### Validation Checklist

- [ ] **Type imports work from both locations**:
  - `import { QuizModule } from '@/types/quiz-types'`
  - `import { QuizModule } from '@/lib/schema'` (if re-exported)
- [ ] **Build succeeds**: `npm run build` → no errors
- [ ] **All tests pass**: 366+ vitest tests

---

## Post-Refactor Final Validation

Run this complete validation AFTER all phases are complete.

### Commands

```powershell
# Full test suite
npm run test 2>&1 | Tee-Object -FilePath "final-vitest.log"
npm run test:e2e 2>&1 | Tee-Object -FilePath "final-e2e.log"

# Coverage
npm run coverage 2>&1 | Tee-Object -FilePath "final-coverage.log"

# Type checks
npm run typecheck
npm run typecheck:strict

# Build
npm run build

# Linting
npm run lint
```

### Final Checklist

| Check             | Command                    | Expected                       |
| ----------------- | -------------------------- | ------------------------------ |
| Unit + Int Tests  | `npm run test`             | 366+ passed, 0 failed          |
| E2E Tests         | `npm run test:e2e`         | Same as baseline, 0 failed     |
| Coverage          | `npm run coverage`         | ≥ baseline %                   |
| TypeScript        | `npm run typecheck`        | 0 errors                       |
| Strict TypeScript | `npm run typecheck:strict` | 0 errors (or same as baseline) |
| Build             | `npm run build`            | Success                        |
| Lint              | `npm run lint`             | 0 errors                       |

### Comparison Script

```powershell
# Compare baseline vs final
Write-Host "=== TEST COMPARISON ==="
Write-Host "Baseline:" (Select-String "passed" baseline-vitest.log | Select-Object -First 1)
Write-Host "Final:" (Select-String "passed" final-vitest.log | Select-Object -First 1)

Write-Host "`n=== COVERAGE COMPARISON ==="
Write-Host "Baseline:" (Select-String "All files" baseline-coverage.log | Select-Object -First 1)
Write-Host "Final:" (Select-String "All files" final-coverage.log | Select-Object -First 1)
```

---

## Integration Test Requirements Summary

### Existing Tests That MUST Pass

| Test File                                                                 | Test Count | Purpose                                   |
| ------------------------------------------------------------------------- | ---------- | ----------------------------------------- |
| [srs-algorithm.test.ts](../tests/int/srs/srs-algorithm.test.ts)           | 45         | SRS calculations correctness              |
| [state-persistence.test.ts](../tests/int/state/state-persistence.test.ts) | 25         | Import/export round-trip, state integrity |
| [bug-detection.test.ts](../tests/int/bugs/bug-detection.test.ts)          | 41         | Bug regression tests                      |
| [error-recovery.spec.ts](../tests/e2e/edge-cases/error-recovery.spec.ts)  | ~15        | Error boundary activation                 |

### New Tests to Add (if not covered)

1. **SRS Engine Unit Tests** (`tests/unit/lib/srs-engine.test.ts`)
   - Test each pure function in isolation
   - Property-based tests with fast-check

2. **Module Operations Unit Tests** (`tests/unit/lib/module-operations.test.ts`)
   - Test normalization functions
   - Test validation functions

3. **Integration Contract Tests**
   - Verify re-exported types match original types
   - Verify function signatures unchanged

---

## Rollback Procedure

If validation fails at any phase:

1. **Revert changes**: `git checkout -- .` or `git reset --hard HEAD~1`
2. **Re-run baseline tests**: Confirm tests pass again
3. **Document failure**: Note which tests failed and why
4. **Adjust approach**: Break phase into smaller increments

---

## Sign-Off

| Phase                    | Date | Tester | Pass/Fail | Notes |
| ------------------------ | ---- | ------ | --------- | ----- |
| Baseline                 |      |        |           |       |
| Phase 1: SRS Engine      |      |        |           |       |
| Phase 2: Module Ops      |      |        |           |       |
| Phase 3: Dead Code       |      |        |           |       |
| Phase 4: Bug Fixes       |      |        |           |       |
| Phase 5: Type Re-exports |      |        |           |       |
| **Final Validation**     |      |        |           |       |
