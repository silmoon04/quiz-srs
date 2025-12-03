# Iteration 1 Evaluation Results

## Summary

- Total generated: 60 ideas
- Kept: 32 ideas
- Filtered out: 28 ideas (duplicates, low-value, not e2e-testable)

## Kept Ideas (32)

### Critical Priority (Must Test)

| ID      | Description                                   | Category       |
| ------- | --------------------------------------------- | -------------- |
| E2E-007 | Multi-tab concurrent answers corrupt state    | Concurrency    |
| SA2-002 | Corrupted localStorage causes crash           | Data Integrity |
| SA2-004 | Import overwrites progress without warning    | Data Integrity |
| E2E-002 | Browser back/forward state desync             | Navigation     |
| SA5-010 | Duplicate question IDs cause state corruption | Data Integrity |

### High Priority

| ID      | Description                             | Category         |
| ------- | --------------------------------------- | ---------------- |
| E2E-001 | Race condition on rapid chapter switch  | Timing           |
| SA1-001 | Double-click submit causes duplicate    | User Interaction |
| E2E-008 | Keyboard focus trapped in modal         | Accessibility    |
| SA4-001 | Focus not moved after answer submit     | Accessibility    |
| SA4-002 | Live region doesn't announce feedback   | Accessibility    |
| SA4-004 | Escape key doesn't close modal          | Accessibility    |
| SA4-010 | Focus returns to body after modal close | Accessibility    |
| SA5-001 | Quiz with 0 questions causes crash      | Edge Case        |
| SA5-002 | Question with 0 options breaks UI       | Edge Case        |

### Medium Priority

| ID      | Description                               | Category       |
| ------- | ----------------------------------------- | -------------- |
| SA1-005 | Scroll position resets on new question    | UX             |
| SA3-001 | Theme flash on initial load               | UX             |
| SA3-009 | Concurrent file imports race condition    | Timing         |
| E2E-004 | Timezone affects SRS scheduling           | Time Logic     |
| E2E-009 | Unicode/emoji corruption on export        | Data Integrity |
| SA2-005 | Export during active session inconsistent | Data Integrity |
| SA2-007 | Special filename chars break export       | Data Integrity |
| SA2-010 | Emoji in IDs breaks serialization         | Data Integrity |
| SA3-003 | Navigation during file parse leaks        | Memory         |
| SA3-010 | Large markdown causes timeout             | Performance    |
| SA4-003 | Tab order skips options                   | Accessibility  |
| SA4-005 | Screen reader reveals correct answer      | Accessibility  |
| SA4-007 | Heading hierarchy incorrect               | Accessibility  |
| SA5-003 | All options correct edge case             | Edge Case      |
| SA5-005 | 1000+ options performance                 | Performance    |
| SA5-006 | Extremely long chapter name               | Edge Case      |
| SA5-007 | 1000 chapters navigation                  | Performance    |

### Deferred (Harder to Test E2E)

| ID      | Description        | Reason                     |
| ------- | ------------------ | -------------------------- |
| E2E-003 | Crash recovery     | Hard to simulate crash     |
| E2E-005 | Memory leak        | Performance test territory |
| SA2-001 | localStorage quota | Hard to fill quota in test |

## Removed Ideas (28)

| ID      | Reason for Removal                                 |
| ------- | -------------------------------------------------- |
| E2E-006 | Mobile MIME types - platform specific, manual test |
| E2E-010 | Animation overlap - minor visual, not breaking     |
| SA1-002 | Click-drag - very edge case                        |
| SA1-003 | Right-click - edge case, browser handles           |
| SA1-004 | Long-press mobile - platform specific              |
| SA1-006 | Pinch-zoom - CSS fix, not e2e                      |
| SA1-007 | Swipe navigation - not implemented feature         |
| SA1-008 | Copy-paste hidden elements - minor                 |
| SA1-009 | Triple-click - very edge case                      |
| SA1-010 | Middle-click - SPA, no navigation                  |
| SA2-003 | Circular refs - validation, unit test              |
| SA2-006 | 50KB text - unlikely real scenario                 |
| SA2-008 | Concurrent localStorage - unit test                |
| SA2-009 | Binary file upload - unit test validation          |
| SA3-002 | Click before render - timing window too small      |
| SA3-004 | Background timer - browser handles                 |
| SA3-005 | Debounced search - no search feature               |
| SA3-006 | SSR hydration - Next.js handles                    |
| SA3-007 | Stale closure - React handles                      |
| SA3-008 | Animation unmount - warning only                   |
| SA4-006 | High contrast focus - OS handles                   |
| SA4-008 | Timeout announcement - no timer feature            |
| SA4-009 | Decorative images - static analysis                |
| SA5-004 | Single char text - unlikely issue                  |
| SA5-008 | Max integer overflow - unrealistic                 |
| SA5-009 | Year 3000 date - edge but harmless                 |
