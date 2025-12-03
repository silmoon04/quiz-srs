# Subagent 2: Data Integrity - Iteration 1

## Focus Area

File operations, state persistence, localStorage, JSON handling, data corruption

---

## Generated E2E Test Ideas

### SA2-001: localStorage quota exceeded during large quiz state save

- **Scenario**: User imports huge quiz, answers many questions
- **Risk**: State save fails silently, progress lost on reload
- **Test**: Fill localStorage near limit, save quiz state, verify handling

### SA2-002: Malformed JSON in localStorage causes app crash on reload

- **Scenario**: localStorage manually edited or corrupted
- **Risk**: App fails to start, white screen
- **Test**: Corrupt localStorage JSON, reload app, verify recovery

### SA2-003: Quiz file with circular references causes infinite loop

- **Scenario**: Crafted JSON with circular refs uploaded
- **Risk**: Browser hangs or crashes
- **Test**: Upload circular JSON, verify graceful rejection

### SA2-004: Import overwrites existing progress without warning

- **Scenario**: User has progress, imports same quiz again
- **Risk**: All progress lost without confirmation
- **Test**: Import quiz, make progress, re-import, verify merge/warning

### SA2-005: Export during active quiz session creates inconsistent snapshot

- **Scenario**: User exports while mid-question
- **Risk**: Partial answer state captured
- **Test**: Export mid-quiz, re-import, verify state consistency

### SA2-006: Very long question text truncates in storage

- **Scenario**: Question with 50KB of text
- **Risk**: Text cut off, question unusable
- **Test**: Import quiz with huge text fields, verify complete storage

### SA2-007: Special filename characters break download on export

- **Scenario**: Quiz name has /\:\*?"<>| characters
- **Risk**: Export fails or creates invalid filename
- **Test**: Create quiz with special name chars, export, verify file created

### SA2-008: Concurrent localStorage writes from multiple components

- **Scenario**: Multiple state updates happen simultaneously
- **Risk**: Race condition overwrites data
- **Test**: Trigger rapid state changes, verify final state integrity

### SA2-009: Binary file uploaded as quiz causes parsing hang

- **Scenario**: User uploads .exe or .zip as quiz file
- **Risk**: Parser hangs trying to process
- **Test**: Upload binary file, verify quick rejection

### SA2-010: Emoji in question IDs breaks JSON serialization

- **Scenario**: Quiz with questionId: "q_🎯_1"
- **Risk**: Serialization/parsing issues
- **Test**: Import quiz with emoji IDs, answer questions, export, verify round-trip
