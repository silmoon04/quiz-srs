# Subagent 1: User Interaction Patterns - Iteration 1

## Focus Area

Clicks, typing, gestures, mouse movements, touch events, user behavior patterns

---

## Generated E2E Test Ideas

### SA1-001: Double-click on submit button causes duplicate submission

- **Scenario**: User double-clicks "Submit Answer" quickly
- **Risk**: Answer recorded twice, stats corrupted
- **Test**: Simulate rapid double-click, verify single submission

### SA1-002: Click-and-drag accidentally selects option text instead of selecting option

- **Scenario**: User tries to click option but drags slightly
- **Risk**: Selection doesn't register, user confused
- **Test**: Simulate click-drag on option, verify selection behavior

### SA1-003: Right-click context menu interferes with option selection

- **Scenario**: User right-clicks on an option
- **Risk**: May trigger selection or show broken menu
- **Test**: Right-click each option type, verify no side effects

### SA1-004: Long-press on mobile triggers text selection instead of option select

- **Scenario**: Mobile user long-presses to select answer
- **Risk**: Text selection overlay appears
- **Test**: Simulate long-press on touch device, verify selection works

### SA1-005: Scroll position resets when new question loads

- **Scenario**: User scrolls to see options, submits, next question loads
- **Risk**: Scroll jumps to top, disorienting
- **Test**: Submit while scrolled down, verify scroll position handling

### SA1-006: Pinch-to-zoom breaks layout on mobile quiz view

- **Scenario**: User zooms in to read small text
- **Risk**: Layout breaks, buttons off-screen
- **Test**: Zoom to 200%, verify all controls accessible

### SA1-007: Swipe navigation conflicts with quiz navigation

- **Scenario**: User swipes left/right to navigate questions
- **Risk**: Conflicts with OS gestures, unexpected behavior
- **Test**: Swipe gestures during quiz, verify intended behavior

### SA1-008: Copy-paste from question text includes hidden elements

- **Scenario**: User copies question to notes
- **Risk**: Hidden IDs or metadata copied
- **Test**: Copy question text, paste elsewhere, verify clean content

### SA1-009: Triple-click selects entire paragraph in option breaking selection

- **Scenario**: User triple-clicks to select text in option
- **Risk**: Selection logic confused by text selection
- **Test**: Triple-click in option, verify selection state

### SA1-010: Middle-click on navigation opens in new tab with broken state

- **Scenario**: User middle-clicks chapter to open in new tab
- **Risk**: New tab has no quiz loaded, shows error
- **Test**: Middle-click navigation items, verify proper handling
