# Subagent 4: Accessibility Issues - Iteration 1

## Focus Area

Keyboard navigation, screen readers, ARIA, focus management, color contrast

---

## Generated E2E Test Ideas

### SA4-001: Focus not moved to question after submitting answer

- **Scenario**: Screen reader user submits, focus stays on button
- **Risk**: User doesn't know question changed
- **Test**: Submit answer, verify focus moves to new question heading

### SA4-002: Live region doesn't announce correct/incorrect feedback

- **Scenario**: Visual feedback shown but not announced
- **Risk**: Screen reader users miss feedback
- **Test**: Submit answer, verify aria-live region announces result

### SA4-003: Tab order skips options when using roving tabindex

- **Scenario**: Options use roving tabindex pattern
- **Risk**: Some options unreachable via Tab
- **Test**: Tab through all options, verify all are reachable

### SA4-004: Escape key doesn't close modal, focus stuck

- **Scenario**: Modal opens, user presses Escape
- **Risk**: Modal stays open, focus trapped
- **Test**: Open each modal type, press Escape, verify closure

### SA4-005: Screen reader reads option marked correct before submission

- **Scenario**: Correct option has hidden indicator
- **Risk**: Reveals answer before user submits
- **Test**: Navigate options with screen reader, verify no spoilers

### SA4-006: Focus visible ring missing on high contrast mode

- **Scenario**: Windows High Contrast mode enabled
- **Risk**: Focus invisible, keyboard nav impossible
- **Test**: Enable high contrast, tab through UI, verify focus visible

### SA4-007: Heading hierarchy skips levels (h1 to h4)

- **Scenario**: Page structure has incorrect heading levels
- **Risk**: Screen reader navigation confusing
- **Test**: Analyze heading structure, verify sequential levels

### SA4-008: Timeout on quiz completion not announced

- **Scenario**: Timed quiz ends, results shown silently
- **Risk**: Screen reader user doesn't know time's up
- **Test**: Let timer expire, verify announcement

### SA4-009: Decorative images missing empty alt or aria-hidden

- **Scenario**: Icons and decorations have meaningless alt text
- **Risk**: Screen reader announces "image" repeatedly
- **Test**: Scan all images, verify appropriate alt/aria-hidden

### SA4-010: Focus returns to body instead of trigger after modal close

- **Scenario**: User opens modal, closes it
- **Risk**: Focus lost, user must find their place again
- **Test**: Open/close modal, verify focus returns to trigger element
