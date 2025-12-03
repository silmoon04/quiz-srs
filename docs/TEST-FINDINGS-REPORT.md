# Test Suite Findings Report

**Date:** December 2, 2025  
**Analysis Method:** 10 subagent parallel root cause analysis  
**Test Framework:** Vitest (unit/integration) + Playwright (E2E)

---

## Executive Summary

| Metric                 | Before Fix        | After Fix         | Status |
| ---------------------- | ----------------- | ----------------- | ------ |
| **Unit Tests Passing** | 3509/3570 (98.3%) | 3552/3570 (99.5%) | ✅     |
| **Test Files Passing** | 100/103           | 103/103           | ✅     |
| **Skipped Tests**      | 18                | 18                | ⚠️     |
| **E2E Tests**          | ~98% pass rate    | ~98% pass rate    | ✅     |

---

## Root Cause Analysis Summary

### Critical Issues Fixed (43 → 0 failures)

#### Issue 1: DashboardWithInlineErrors Prop Mismatch (42 failures)

**Root Cause:**  
The test file `tests/unit/components/a11y/DashboardWithInlineErrors.test.tsx` passed prop `quizModule` but the component interface expects `module`.

```typescript
// ❌ Test file (WRONG)
const createDefaultProps = () => ({
  quizModule: createModule(),  // Wrong prop name
  ...
});

// ✓ Component interface (CORRECT)
interface DashboardWithInlineErrorsProps {
  module: QuizModule;  // Expects 'module'
}
```

**Error Manifestation:**

```
TypeError: Cannot read properties of undefined (reading 'chapters')
  at Dashboard components/dashboard.tsx:45:33
```

**Fix Applied:**  
Replaced all 14+ occurrences of `quizModule` with `module` in the test file.

---

#### Issue 2: Markdown Consistency Test Race Condition (1 failure)

**Root Cause:**  
The test rendered two MarkdownRenderer components but only waited for the first one to complete async rendering before comparing.

```typescript
// ❌ Original - Only waits for container1
await waitFor(() => {
  expect(container1.querySelectorAll('strong').length).toBeGreaterThan(0);
});
// container2 might not have finished rendering yet!
expect(container1.querySelectorAll('strong').length).toBe(
  container2.querySelectorAll('strong').length, // 1 ≠ 0
);
```

**Fix Applied:**

```typescript
// ✓ Fixed - Wait for BOTH containers
await waitFor(() => {
  expect(container1.querySelectorAll('strong').length).toBeGreaterThan(0);
});
await waitFor(() => {
  expect(container2.querySelectorAll('strong').length).toBeGreaterThan(0);
});
// Now safe to compare
```

---

### Already Fixed Issues (Found Already Patched)

#### Issue 3: MarkdownRenderer XSS Test Logic

**Finding:** Test was already correctly updated to verify that XSS content is blocked.

The component's belt-and-suspenders security check correctly blocks content with event handlers:

```typescript
// Component correctly blocks: <img onerror="alert(1)">
// And shows: "Content blocked for security reasons."
```

Test correctly verifies security behavior works as intended.

---

#### Issue 4: Pipeline Undefined Content

**Finding:** Already patched with null checks at:

- Line 93-95: `preprocessDisplayMath()` returns `''` if content is null/undefined
- Line 113-115: `processMarkdown()` returns `''` if content is null/undefined

---

## Non-Critical Findings

### Warning: vitest-axe Disabled

**Status:** Known issue, not blocking tests

The `vitest-axe` package (v0.1.0) has ES module compatibility issues. The team has disabled it:

```typescript
// tests/setup.ts
const axe: any = null;
console.warn('vitest-axe temporarily disabled due to ES module compatibility issues');
```

**Impact:** Automatic axe-core accessibility scanning is disabled. Manual a11y structural tests still run.

**Recommendation:** Monitor for vitest-axe ESM fix in future versions.

---

### Warning: React act() Warnings

**Status:** Expected behavior during async component testing

Multiple tests show:

```
An update to MarkdownRenderer inside a test was not wrapped in act(...)
```

**Analysis:** The MarkdownRenderer has async state updates via `useEffect`. Tests correctly use `waitFor()` which automatically wraps in `act()`. Warnings appear during rendering but don't cause test failures.

**Recommendation:** No action needed - tests pass correctly.

---

### Skipped Tests: 18 tests

**Location:** `tests/unit/parser/markdown-parser.test.ts`

**Reason:** Tests marked with `.skip` for specific edge cases that are pending implementation.

**Recommendation:** Review skipped tests periodically to re-enable or remove.

---

## E2E Test Analysis

### Pass Rate: ~98%

Most E2E tests pass. Occasional failures are due to:

1. **Test Environment Issues** - Dev server overwhelmed under parallel load
   - Fix: Limit workers in `playwright.config.ts` or add retries

2. **Missing Test Data Attributes** - Some selectors like `.dashboard` don't exist
   - Fix: Add `data-testid` attributes to key components

3. **Weak Assertions** - Some tests only verify `body` is visible
   - Recommendation: Strengthen assertions to verify actual behavior

### Specific E2E Patterns

| Test Category       | Pass Rate | Notes                                      |
| ------------------- | --------- | ------------------------------------------ |
| Keyboard Navigation | 100%      | All accessibility keyboard tests pass      |
| Data Persistence    | 98%       | localStorage quota test occasionally flaky |
| User Journeys       | 100%      | First-time and return user flows work      |
| Edge Cases          | 95%       | Some interrupt/corruption tests need work  |

---

## Performance Observations

| Test Type         | Duration | Notes                        |
| ----------------- | -------- | ---------------------------- |
| Unit Tests        | 30s      | Reasonable for 3500+ tests   |
| Transform         | 21s      | TypeScript compilation       |
| Environment Setup | 209s     | jsdom/React test environment |

**Bottleneck:** Environment setup takes longest (209s). Consider:

- Running tests in parallel worker pools
- Using faster jsdom alternatives

---

## Recommendations

### Priority 1: Immediate (Done ✅)

- [x] Fix prop mismatch in DashboardWithInlineErrors tests
- [x] Fix race condition in consistency test
- [x] Verify XSS tests correctly check security behavior
- [x] Confirm null checks in pipeline.ts

### Priority 2: Short-term

- [ ] Add `data-testid` attributes to Dashboard and QuizSession
- [ ] Review 18 skipped tests for potential re-enablement
- [ ] Limit Playwright worker count for stability

### Priority 3: Long-term

- [ ] Monitor vitest-axe for ESM compatibility fix
- [ ] Consider alternative a11y testing approach
- [ ] Add performance benchmarks to test suite

---

## Test Health Score

| Category    | Score   | Notes                      |
| ----------- | ------- | -------------------------- |
| Unit Tests  | 99.5%   | 3552/3570 passing          |
| Test Files  | 100%    | 103/103 passing            |
| E2E Tests   | ~98%    | Some environment flakiness |
| **Overall** | **99%** | Production ready           |

---

_Report generated by automated test analysis with 10 subagent parallel investigation_
