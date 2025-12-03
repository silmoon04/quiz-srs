# E2E Bug Brainstorming - Master List

## Process Overview

- 10 iterations of brainstorming
- 5 subagents per iteration, each generating 10 ideas
- Critical evaluation after each iteration
- Target: Keep best 100 e2e tests

## Final Results

- **Total Ideas Generated**: 510
- **Ideas Evaluated**: 510
- **Final Tests Selected**: 100
- **Selection Rate**: 19.6%

## Iteration Tracking

| Iteration | Focus Area                         | Ideas Generated | Quality Score |
| --------- | ---------------------------------- | --------------- | ------------- |
| 1         | Initial + 5 Core Perspectives      | 60              | High          |
| 2         | User Journeys, Errors, Transitions | 50              | High          |
| 3         | Content, Session, Formats          | 50              | Medium-High   |
| 4         | Behavior, Feedback, Progress       | 50              | Medium-High   |
| 5         | Load, Rapid, Memory                | 50              | Medium        |
| 6         | Workflows, Integration             | 50              | Medium        |
| 7         | Failure Modes                      | 50              | Medium-High   |
| 8         | Completeness Checks                | 50              | Medium        |
| 9         | Real-World Scenarios               | 50              | High          |
| 10        | Final Comprehensive                | 50              | High          |

## Final Test Distribution

| Category         | Tests   | Critical | High   | Medium |
| ---------------- | ------- | -------- | ------ | ------ |
| User Journeys    | 15      | 5        | 7      | 3      |
| Data Integrity   | 15      | 3        | 9      | 3      |
| UI/UX            | 15      | 2        | 9      | 4      |
| Accessibility    | 15      | 0        | 10     | 5      |
| Security         | 10      | 3        | 6      | 1      |
| Error Handling   | 10      | 1        | 7      | 2      |
| State Management | 10      | 0        | 5      | 5      |
| Performance      | 5       | 0        | 2      | 3      |
| Edge Cases       | 5       | 0        | 0      | 5      |
| **Total**        | **100** | **14**   | **55** | **31** |

---

## Initial 10 E2E Bugs (Coordinator)

### E2E-001: Race condition when rapidly switching chapters during quiz loading

- **Category**: Timing/Async
- **Severity**: High
- **Test**: Load quiz, immediately click through chapters before load completes
- **Expected**: Should queue navigation or show loading state

### E2E-002: State desync with browser back/forward during quiz session

- **Category**: Navigation
- **Severity**: High
- **Test**: Answer questions, use browser back, then forward
- **Expected**: State should remain consistent or show confirmation

### E2E-003: Lost progress on browser tab crash during answer submission

- **Category**: Data Integrity
- **Severity**: Critical
- **Test**: Simulate crash mid-submission, reload
- **Expected**: Should auto-save or recover partial state

### E2E-004: Incorrect SRS scheduling with timezone/clock manipulation

- **Category**: Time-based Logic
- **Severity**: Medium
- **Test**: Change system timezone mid-session, check review times
- **Expected**: UTC-based calculations should be immune

### E2E-005: Memory leak from MarkdownRenderer with complex LaTeX

- **Category**: Performance
- **Severity**: Medium
- **Test**: Mount/unmount renderer 100+ times with heavy content
- **Expected**: Memory should stabilize, not grow unbounded

### E2E-006: Mobile file upload fails silently on MIME type differences

- **Category**: Cross-Platform
- **Severity**: High
- **Test**: Upload .md file from iOS Safari
- **Expected**: Should handle various MIME types or show clear error

### E2E-007: Review queue corruption from multi-tab concurrent answers

- **Category**: Concurrency
- **Severity**: Critical
- **Test**: Open 2 tabs, answer same question differently
- **Expected**: Should lock or merge states properly

### E2E-008: Keyboard focus trap in modal dialogs

- **Category**: Accessibility
- **Severity**: High
- **Test**: Tab through all elements when confirmation modal opens
- **Expected**: Focus should cycle within modal only

### E2E-009: Export file corruption with Unicode characters

- **Category**: Data Integrity
- **Severity**: Medium
- **Test**: Create quiz with emoji/CJK/RTL text, export, reimport
- **Expected**: All characters preserved correctly

### E2E-010: Progress bar animation overlap on rapid answers

- **Category**: Visual/UX
- **Severity**: Low
- **Test**: Answer 10 questions in < 2 seconds
- **Expected**: Animations should complete or skip gracefully
