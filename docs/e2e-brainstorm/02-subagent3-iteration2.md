# Subagent 3: State Transitions - Iteration 2

## Focus Area

Moving between application states, view changes, mode switches

---

## Generated E2E Test Ideas

### SA3-011: Welcome → Dashboard transition preserves loaded quiz

- **Scenario**: Load quiz from welcome, arrive at dashboard
- **Risk**: Quiz data lost in transition
- **Test**: Import from welcome, verify quiz visible on dashboard

### SA3-012: Dashboard → Quiz Session → Dashboard round trip

- **Scenario**: Start quiz, answer some, return to dashboard
- **Risk**: Progress not saved until quiz complete
- **Test**: Partial quiz, return, verify progress shown

### SA3-013: Quiz Session → Review Session mode switch

- **Scenario**: Finish regular quiz, enter review mode
- **Risk**: Different UI expectations, confusion
- **Test**: Complete quiz, start review, verify UI differences clear

### SA3-014: Viewing question history during active quiz

- **Scenario**: Click to see previous answers mid-quiz
- **Risk**: Viewing history affects current question state
- **Test**: View history mid-quiz, return, verify state unchanged

### SA3-015: Modal open → background state change → modal close

- **Scenario**: Open settings, quiz auto-saves, close settings
- **Risk**: Modal shows stale data or conflicts with save
- **Test**: Open modal, trigger save, close, verify consistency

### SA3-016: Theme toggle during quiz doesn't reset question state

- **Scenario**: Toggle dark/light mode mid-question
- **Risk**: Re-render clears selected answer
- **Test**: Select answer, toggle theme, verify selection persists

### SA3-017: Chapter collapse/expand state persists

- **Scenario**: Collapse chapter, navigate away, return
- **Risk**: Collapse state forgotten
- **Test**: Collapse chapters, navigate, return, verify collapsed

### SA3-018: Filter/sort state resets appropriately

- **Scenario**: Filter questions by status, switch chapters
- **Risk**: Filter stuck from previous chapter
- **Test**: Apply filter, switch chapter, verify filter behavior

### SA3-019: Rapid state transitions don't queue incorrectly

- **Scenario**: Click dashboard, quiz, dashboard, quiz quickly
- **Risk**: State machine gets confused, wrong view shown
- **Test**: Rapid navigation clicks, verify final state correct

### SA3-020: Loading state shown during slow transitions

- **Scenario**: Large quiz takes time to render
- **Risk**: UI appears frozen, user clicks again
- **Test**: Load large quiz, verify loading indicator shown
