# Expanded E2E Test Suite - 200 Tests

## Selection Expansion

Expanded from 100 to 200 tests by including more valuable scenarios.

---

## Batch A: User Journeys & Workflows (40 tests)

### A1: Core User Journeys (15)

| ID    | Test                              | Priority |
| ----- | --------------------------------- | -------- |
| A1-01 | First-time user complete journey  | Critical |
| A1-02 | Return user resume exact position | Critical |
| A1-03 | Complete SRS cycle to mastery     | Critical |
| A1-04 | Export/clear/reimport cycle       | High     |
| A1-05 | Review session complete flow      | High     |
| A1-06 | Chapter navigation flow           | High     |
| A1-07 | Dashboard stats accuracy          | High     |
| A1-08 | Keyboard-only quiz completion     | High     |
| A1-09 | Theme persistence across sessions | Medium   |
| A1-10 | Quiz abandonment and fresh start  | Medium   |
| A1-11 | Question history review           | Medium   |
| A1-12 | Progress bar accuracy             | Medium   |
| A1-13 | Answer modification before submit | High     |
| A1-14 | Correct/incorrect feedback        | Critical |
| A1-15 | Explanation display after answer  | High     |

### A2: Extended Workflows (15)

| ID    | Test                              | Priority |
| ----- | --------------------------------- | -------- |
| A2-01 | Multi-chapter quiz completion     | High     |
| A2-02 | SRS level progression tracking    | High     |
| A2-03 | Review queue population           | High     |
| A2-04 | Mastered questions exclusion      | High     |
| A2-05 | Failed questions retry flow       | High     |
| A2-06 | Daily study routine simulation    | Medium   |
| A2-07 | Week-long study progression       | Medium   |
| A2-08 | Quick study session (5 questions) | Medium   |
| A2-09 | Long study session (50 questions) | Medium   |
| A2-10 | Mixed correct/incorrect session   | High     |
| A2-11 | All correct session               | Medium   |
| A2-12 | All incorrect session             | Medium   |
| A2-13 | Random navigation during quiz     | Medium   |
| A2-14 | Sequential navigation only        | Medium   |
| A2-15 | Jump to specific question         | Medium   |

### A3: Multi-Session Scenarios (10)

| ID    | Test                             | Priority |
| ----- | -------------------------------- | -------- |
| A3-01 | Continue after browser restart   | High     |
| A3-02 | Multiple quiz sessions same day  | Medium   |
| A3-03 | Session across midnight boundary | Medium   |
| A3-04 | Interrupted session recovery     | High     |
| A3-05 | Session with device sleep/wake   | Medium   |
| A3-06 | Tab backgrounded during session  | Medium   |
| A3-07 | Multiple browser windows         | High     |
| A3-08 | Incognito mode session           | Medium   |
| A3-09 | Session after cache clear        | High     |
| A3-10 | Session spanning DST change      | Low      |

---

## Batch B: Data Integrity & Security (40 tests)

### B1: Import/Export (15)

| ID    | Test                         | Priority |
| ----- | ---------------------------- | -------- |
| B1-01 | Valid JSON import            | Critical |
| B1-02 | Valid Markdown import        | Critical |
| B1-03 | Export complete state        | High     |
| B1-04 | Import/export round-trip     | Critical |
| B1-05 | Large quiz import (1000 Qs)  | High     |
| B1-06 | Unicode content preservation | High     |
| B1-07 | LaTeX content preservation   | High     |
| B1-08 | Code block preservation      | High     |
| B1-09 | Special characters in names  | Medium   |
| B1-10 | Empty file rejection         | Medium   |
| B1-11 | Binary file rejection        | Medium   |
| B1-12 | Malformed JSON handling      | High     |
| B1-13 | Malformed Markdown handling  | High     |
| B1-14 | Missing required fields      | High     |
| B1-15 | Extra unknown fields ignored | Medium   |

### B2: Persistence & Recovery (15)

| ID    | Test                             | Priority |
| ----- | -------------------------------- | -------- |
| B2-01 | LocalStorage corruption recovery | Critical |
| B2-02 | Partial localStorage corruption  | High     |
| B2-03 | localStorage cleared by user     | High     |
| B2-04 | localStorage quota exceeded      | Medium   |
| B2-05 | Concurrent tab state handling    | Critical |
| B2-06 | State sync between tabs          | High     |
| B2-07 | State migration on app update    | Medium   |
| B2-08 | Autosave frequency               | High     |
| B2-09 | Save during navigation           | High     |
| B2-10 | Save on browser close            | High     |
| B2-11 | Recover half-written state       | High     |
| B2-12 | Duplicate question ID handling   | High     |
| B2-13 | Invalid state reset option       | High     |
| B2-14 | Progress merge on conflict       | Medium   |
| B2-15 | Version mismatch handling        | Medium   |

### B3: Security (10)

| ID    | Test                        | Priority |
| ----- | --------------------------- | -------- |
| B3-01 | XSS script tags blocked     | Critical |
| B3-02 | XSS event handlers stripped | Critical |
| B3-03 | JavaScript URLs blocked     | Critical |
| B3-04 | HTML injection sanitized    | High     |
| B3-05 | SVG script content blocked  | High     |
| B3-06 | CSS injection prevented     | Medium   |
| B3-07 | Prototype pollution blocked | High     |
| B3-08 | Form elements disabled      | Medium   |
| B3-09 | External resource loading   | Medium   |
| B3-10 | Sensitive data not logged   | Medium   |

---

## Batch C: UI/UX & Visual (40 tests)

### C1: Visual Feedback (15)

| ID    | Test                        | Priority |
| ----- | --------------------------- | -------- |
| C1-01 | Selected option visibility  | Critical |
| C1-02 | Correct answer highlighting | Critical |
| C1-03 | Incorrect answer indication | Critical |
| C1-04 | Disabled button appearance  | High     |
| C1-05 | Loading state indicators    | High     |
| C1-06 | Progress bar rendering      | High     |
| C1-07 | Toast notification display  | High     |
| C1-08 | Toast stacking behavior     | Medium   |
| C1-09 | Modal backdrop              | High     |
| C1-10 | Theme toggle visual update  | High     |
| C1-11 | Hover states                | Medium   |
| C1-12 | Focus ring visibility       | High     |
| C1-13 | Active state indication     | Medium   |
| C1-14 | Error state styling         | High     |
| C1-15 | Success state styling       | High     |

### C2: Content Rendering (15)

| ID    | Test                        | Priority |
| ----- | --------------------------- | -------- |
| C2-01 | Long question text handling | High     |
| C2-02 | Long option text handling   | High     |
| C2-03 | Long explanation handling   | High     |
| C2-04 | Code block rendering        | High     |
| C2-05 | LaTeX inline rendering      | High     |
| C2-06 | LaTeX block rendering       | High     |
| C2-07 | Markdown bold/italic        | Medium   |
| C2-08 | Markdown lists              | Medium   |
| C2-09 | Markdown links              | Medium   |
| C2-10 | Markdown images             | Medium   |
| C2-11 | Markdown tables             | Medium   |
| C2-12 | Markdown blockquotes        | Medium   |
| C2-13 | Nested markdown             | Medium   |
| C2-14 | Mixed content types         | High     |
| C2-15 | Content overflow handling   | High     |

### C3: Responsive & Layout (10)

| ID    | Test                    | Priority |
| ----- | ----------------------- | -------- |
| C3-01 | Desktop layout (1920px) | High     |
| C3-02 | Tablet layout (768px)   | High     |
| C3-03 | Mobile layout (375px)   | High     |
| C3-04 | Small mobile (320px)    | Medium   |
| C3-05 | Large desktop (2560px)  | Medium   |
| C3-06 | Browser zoom 150%       | Medium   |
| C3-07 | Browser zoom 200%       | Medium   |
| C3-08 | Orientation change      | Medium   |
| C3-09 | Dynamic viewport resize | Medium   |
| C3-10 | Print layout            | Low      |

---

## Batch D: Accessibility & Keyboard (40 tests)

### D1: Keyboard Navigation (15)

| ID    | Test                        | Priority |
| ----- | --------------------------- | -------- |
| D1-01 | Tab order logical           | Critical |
| D1-02 | All elements reachable      | Critical |
| D1-03 | Arrow key option navigation | High     |
| D1-04 | Enter/Space selection       | High     |
| D1-05 | Escape modal close          | High     |
| D1-06 | Tab trap in modals          | High     |
| D1-07 | Skip to content link        | Medium   |
| D1-08 | Keyboard shortcuts          | Medium   |
| D1-09 | No keyboard traps           | High     |
| D1-10 | Focus after submission      | High     |
| D1-11 | Focus return after modal    | High     |
| D1-12 | Roving tabindex pattern     | Medium   |
| D1-13 | Keyboard chapter navigation | Medium   |
| D1-14 | Keyboard question jump      | Medium   |
| D1-15 | Keyboard theme toggle       | Medium   |

### D2: Screen Reader Support (15)

| ID    | Test                        | Priority |
| ----- | --------------------------- | -------- |
| D2-01 | ARIA live announcements     | Critical |
| D2-02 | Correct/incorrect announced | Critical |
| D2-03 | Question number announced   | High     |
| D2-04 | Progress announced          | High     |
| D2-05 | Options accessible names    | High     |
| D2-06 | Button accessible names     | High     |
| D2-07 | Modal accessible names      | High     |
| D2-08 | Form labels present         | High     |
| D2-09 | Error messages linked       | High     |
| D2-10 | Image alt text              | Medium   |
| D2-11 | Heading hierarchy           | High     |
| D2-12 | Landmark regions            | Medium   |
| D2-13 | Role attributes correct     | High     |
| D2-14 | State changes announced     | High     |
| D2-15 | Context preserved           | Medium   |

### D3: Visual Accessibility (10)

| ID    | Test                   | Priority |
| ----- | ---------------------- | -------- |
| D3-01 | Color contrast (text)  | High     |
| D3-02 | Color contrast (UI)    | High     |
| D3-03 | Non-color indicators   | High     |
| D3-04 | Focus visible on all   | High     |
| D3-05 | Text resizable 200%    | Medium   |
| D3-06 | Reduced motion respect | Medium   |
| D3-07 | High contrast mode     | Medium   |
| D3-08 | Touch target 44px      | Medium   |
| D3-09 | Spacing adequate       | Medium   |
| D3-10 | No flashing content    | High     |

---

## Batch E: Error Handling & Edge Cases (40 tests)

### E1: Error Recovery (15)

| ID    | Test                         | Priority |
| ----- | ---------------------------- | -------- |
| E1-01 | Error boundary fallback UI   | Critical |
| E1-02 | Parse error message          | High     |
| E1-03 | Validation error detail      | High     |
| E1-04 | Network error handling       | High     |
| E1-05 | Timeout handling             | Medium   |
| E1-06 | Silent failure prevention    | High     |
| E1-07 | Retry mechanism              | Medium   |
| E1-08 | Recovery from any error      | High     |
| E1-09 | Error dismissal              | High     |
| E1-10 | Error logging (no sensitive) | Medium   |
| E1-11 | Multiple errors handling     | Medium   |
| E1-12 | Error during save            | High     |
| E1-13 | Error during load            | High     |
| E1-14 | Error during export          | High     |
| E1-15 | Component error isolation    | High     |

### E2: State Edge Cases (15)

| ID    | Test                    | Priority |
| ----- | ----------------------- | -------- |
| E2-01 | Empty quiz handling     | High     |
| E2-02 | Single question quiz    | Medium   |
| E2-03 | Single option question  | Medium   |
| E2-04 | All options correct     | Medium   |
| E2-05 | No correct options      | High     |
| E2-06 | 100+ options question   | Medium   |
| E2-07 | 1000+ questions quiz    | High     |
| E2-08 | Deeply nested content   | Medium   |
| E2-09 | Circular references     | Medium   |
| E2-10 | Missing optional fields | High     |
| E2-11 | Null/undefined values   | High     |
| E2-12 | Empty strings handling  | Medium   |
| E2-13 | Whitespace-only content | Medium   |
| E2-14 | Very long strings       | High     |
| E2-15 | Unicode edge cases      | Medium   |

### E3: Interaction Edge Cases (10)

| ID    | Test                      | Priority |
| ----- | ------------------------- | -------- |
| E3-01 | Double-click prevention   | High     |
| E3-02 | Rapid clicking handling   | High     |
| E3-03 | Click during animation    | Medium   |
| E3-04 | Scroll during interaction | Medium   |
| E3-05 | Resize during interaction | Medium   |
| E3-06 | Theme toggle mid-action   | Medium   |
| E3-07 | Navigation during save    | High     |
| E3-08 | Import during quiz        | Medium   |
| E3-09 | Export during import      | Medium   |
| E3-10 | Concurrent operations     | High     |

---

## Implementation Priority Order

### Phase 1: Critical Path (30 tests)

All Critical priority tests from each batch.

### Phase 2: High Priority (90 tests)

All High priority tests from each batch.

### Phase 3: Medium Priority (70 tests)

All Medium priority tests from each batch.

### Phase 4: Low Priority (10 tests)

All Low priority tests and additional edge cases.

---

## Test File Structure

```
tests/e2e/
├── fixtures/
│   ├── quiz-data.ts       # Test quiz data
│   ├── malicious-data.ts  # Security test data
│   └── helpers.ts         # Common utilities
├── journeys/
│   ├── first-time-user.spec.ts
│   ├── return-user.spec.ts
│   ├── srs-cycle.spec.ts
│   ├── review-session.spec.ts
│   └── extended-workflows.spec.ts
├── data/
│   ├── import-json.spec.ts
│   ├── import-markdown.spec.ts
│   ├── export.spec.ts
│   ├── persistence.spec.ts
│   └── validation.spec.ts
├── security/
│   ├── xss-prevention.spec.ts
│   └── injection-prevention.spec.ts
├── ui/
│   ├── feedback-states.spec.ts
│   ├── content-rendering.spec.ts
│   ├── responsive.spec.ts
│   └── theme.spec.ts
├── a11y/
│   ├── keyboard-navigation.spec.ts
│   ├── screen-reader.spec.ts
│   └── visual-a11y.spec.ts
└── edge-cases/
    ├── error-recovery.spec.ts
    ├── state-edge-cases.spec.ts
    └── interaction-edge-cases.spec.ts
```
