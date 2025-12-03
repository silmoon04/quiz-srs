# Subagent 2: Error Recovery - Iteration 2

## Focus Area

How the application handles and recovers from various failure conditions

---

## Generated E2E Test Ideas

### SA2-011: App recovers gracefully after JavaScript error

- **Scenario**: Component throws error, error boundary catches
- **Risk**: White screen of death, no recovery path
- **Test**: Trigger error, verify error boundary UI, verify recovery

### SA2-012: Network failure during quiz file fetch shows helpful message

- **Scenario**: User clicks sample quiz but network down
- **Risk**: Silent failure, spinning loader forever
- **Test**: Block network, attempt load, verify error message

### SA2-013: Markdown parsing failure shows original content

- **Scenario**: Markdown has syntax that breaks parser
- **Risk**: Question invisible or garbled
- **Test**: Load broken markdown, verify fallback rendering

### SA2-014: Invalid answer submission handled without data loss

- **Scenario**: Somehow submit answer to non-existent question
- **Risk**: State corruption, crash
- **Test**: Manipulate DOM to submit bad answer, verify handling

### SA2-015: File import partial success shows what worked

- **Scenario**: Quiz file has 10 chapters, 2 are malformed
- **Risk**: Entire import fails for 2 bad chapters
- **Test**: Import mixed-validity file, verify partial import with warnings

### SA2-016: Review session continues after single question error

- **Scenario**: One question in review queue is corrupted
- **Risk**: Entire review session fails
- **Test**: Corrupt one review question, verify others still work

### SA2-017: App restarts cleanly after localStorage cleared by user

- **Scenario**: User clears browser data
- **Risk**: App crashes expecting data that's gone
- **Test**: Clear localStorage, reload, verify clean start

### SA2-018: Toast/notification system handles rapid errors

- **Scenario**: Multiple errors occur quickly
- **Risk**: Notifications overlap, become unreadable
- **Test**: Trigger 5 errors rapidly, verify proper queuing/display

### SA2-019: Undo action available after accidental import overwrite

- **Scenario**: User accidentally overwrites progress
- **Risk**: No undo, data permanently lost
- **Test**: Overwrite progress, check for undo option

### SA2-020: Recovery from half-written localStorage entry

- **Scenario**: App crashed mid-write to localStorage
- **Risk**: JSON truncated, parse fails on reload
- **Test**: Write partial JSON to storage, reload, verify recovery
