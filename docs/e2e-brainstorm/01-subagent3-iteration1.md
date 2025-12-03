# Subagent 3: Timing & Async Issues - Iteration 1

## Focus Area

Race conditions, loading states, debouncing, async operations, timeouts

---

## Generated E2E Test Ideas

### SA3-001: Quiz loads before theme preference, causes flash

- **Scenario**: App loads, shows default theme, then switches
- **Risk**: Jarring visual flash, poor UX
- **Test**: Load app with dark theme preference, verify no flash

### SA3-002: Answer submitted before options fully render

- **Scenario**: User memorizes position, clicks before render complete
- **Risk**: Wrong option selected or no selection
- **Test**: Rapid click on option area during render, verify behavior

### SA3-003: Navigation during file parsing leaves app in limbo

- **Scenario**: User clicks away while large file parsing
- **Risk**: Parsing continues, state update to unmounted component
- **Test**: Start file import, navigate away, verify cleanup

### SA3-004: Review timer continues when tab is backgrounded

- **Scenario**: User tabs away during timed review
- **Risk**: Timer completes in background, unexpected behavior
- **Test**: Start review, background tab, return, verify timer state

### SA3-005: Debounced search doesn't fire on immediate navigate away

- **Scenario**: User types search, immediately closes modal
- **Risk**: Search never executes, stale results next open
- **Test**: Type search, close modal quickly, reopen, verify fresh results

### SA3-006: Promise rejection during hydration causes SSR mismatch

- **Scenario**: Async data fetch fails during Next.js hydration
- **Risk**: Hydration error, broken interactivity
- **Test**: Simulate failed fetch during initial load, verify recovery

### SA3-007: Stale closure in event handler after rapid re-renders

- **Scenario**: State updates faster than handler closure
- **Risk**: Handler uses stale state value
- **Test**: Rapid answer/undo cycles, verify correct state captured

### SA3-008: Animation callback fires after component unmount

- **Scenario**: User navigates away during progress animation
- **Risk**: setState on unmounted component warning/error
- **Test**: Navigate during animation, check console for errors

### SA3-009: Concurrent file imports race to set quiz state

- **Scenario**: User drag-drops multiple files simultaneously
- **Risk**: Unpredictable which file wins, partial merge
- **Test**: Drop 3 quiz files at once, verify deterministic behavior

### SA3-010: Markdown rendering timeout on extremely large content

- **Scenario**: Question has 100KB of markdown with nested lists
- **Risk**: Renderer hangs, UI freezes
- **Test**: Load question with massive markdown, verify timeout/chunking
