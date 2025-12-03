# Subagent 5: Edge Cases & Boundaries - Iteration 1

## Focus Area

Extreme inputs, boundary conditions, empty states, unusual configurations

---

## Generated E2E Test Ideas

### SA5-001: Quiz with 0 questions loads without error

- **Scenario**: Malformed quiz has chapters but no questions
- **Risk**: Division by zero in progress calc, or crash
- **Test**: Import empty quiz, verify graceful empty state

### SA5-002: Question with 0 options shows appropriate error

- **Scenario**: Question exists but options array empty
- **Risk**: UI breaks trying to render no options
- **Test**: Load question with no options, verify error/skip

### SA5-003: All options marked as correct handles properly

- **Scenario**: correctOptionIds includes all option IDs
- **Risk**: UI logic for showing incorrect fails
- **Test**: Answer question where all are correct, verify feedback

### SA5-004: Single character question/option text renders correctly

- **Scenario**: Question text is just "?"
- **Risk**: Layout issues, text disappears
- **Test**: Load minimal text quiz, verify readable

### SA5-005: 1000+ options per question doesn't crash

- **Scenario**: Stress test with massive options array
- **Risk**: Browser hangs rendering DOM nodes
- **Test**: Load question with 1000 options, verify scrollable

### SA5-006: Chapter name with 10,000 characters breaks layout

- **Scenario**: Extremely long chapter title
- **Risk**: Sidebar expands infinitely, layout broken
- **Test**: Import long-named chapter, verify truncation/scroll

### SA5-007: Quiz with 1000 chapters navigates correctly

- **Scenario**: Large quiz with many chapters
- **Risk**: Navigation becomes unusable, performance issues
- **Test**: Import 1000-chapter quiz, navigate through all

### SA5-008: srsLevel at max integer value overflows

- **Scenario**: srsLevel = Number.MAX_SAFE_INTEGER
- **Risk**: Calculations overflow, weird behavior
- **Test**: Import quiz with extreme srsLevel, verify handling

### SA5-009: Review scheduled for year 3000 shows correctly

- **Scenario**: nextReviewAt far in the future
- **Risk**: Date formatting breaks, "Invalid Date"
- **Test**: Set future review date, verify display

### SA5-010: Quiz with duplicate question IDs deduplicates

- **Scenario**: Multiple questions share same questionId
- **Risk**: State corruption, wrong question updated
- **Test**: Import duplicate-ID quiz, verify handling/error
