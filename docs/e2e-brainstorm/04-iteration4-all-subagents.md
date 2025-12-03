# Iteration 4: Behavioral & Edge Scenarios

## Subagent Focus Areas

1. **Answer Behavior** - Selection, submission, correction
2. **Feedback System** - Correct/incorrect, explanations
3. **Progress Tracking** - Stats, history, streaks
4. **Navigation Patterns** - Movement through quiz
5. **File Operations** - Import, export, load

---

# Subagent 1: Answer Behavior

### SA1-031: Changing answer before submit works

- **Test**: Select A, change to B, submit, verify B recorded

### SA1-032: Cannot change answer after submission

- **Test**: Submit, try to select different, verify locked

### SA1-033: Submit with no selection shows error

- **Test**: Click submit without selecting, verify error message

### SA1-034: Keyboard Enter submits currently selected

- **Test**: Select via keyboard, press Enter, verify submission

### SA1-035: Click outside options doesn't deselect

- **Test**: Select option, click empty space, verify still selected

### SA1-036: Answer recorded immediately upon submission

- **Test**: Submit, refresh immediately, verify answer saved

### SA1-037: Answering same question twice increments count

- **Test**: Answer in review mode multiple times, check counter

### SA1-038: Incorrect answer shows which was correct

- **Test**: Answer wrong, verify correct option highlighted

### SA1-039: Multiple correct options all shown when relevant

- **Test**: Load multi-correct question, verify all indicated

### SA1-040: Answer time tracked for analytics (if feature exists)

- **Test**: Answer quickly vs slowly, check if time recorded

---

# Subagent 2: Feedback System

### SA2-031: Correct answer shows success feedback

- **Test**: Answer correctly, verify green/success indication

### SA2-032: Incorrect answer shows error feedback

- **Test**: Answer incorrectly, verify red/error indication

### SA2-033: Explanation shown after answer submission

- **Test**: Submit, verify explanation visible

### SA2-034: Explanation markdown renders properly

- **Test**: Explanation has **bold** and `code`, verify rendered

### SA2-035: Explanation with LaTeX renders math

- **Test**: Explanation has $formula$, verify LaTeX rendered

### SA2-036: Long explanation scrollable

- **Test**: Explanation is 1000 words, verify scrollable

### SA2-037: Explanation can be collapsed/expanded

- **Test**: If feature exists, verify toggle works

### SA2-038: Feedback animation completes smoothly

- **Test**: Visual confirmation animation doesn't stutter

### SA2-039: Audio feedback (if exists) plays correctly

- **Test**: Check for sound on correct/incorrect

### SA2-040: Feedback consistent across question types

- **Test**: MCQ and T/F show same feedback pattern

---

# Subagent 3: Progress Tracking

### SA3-031: Total questions count accurate

- **Test**: Verify dashboard shows correct total

### SA3-032: Answered questions count updates live

- **Test**: Answer question, verify count increments

### SA3-033: Correct percentage calculates properly

- **Test**: Answer 3/10 correct, verify 30% shown

### SA3-034: Chapter progress independent per chapter

- **Test**: Complete chapter 1, verify chapter 2 still 0%

### SA3-035: Overall progress aggregates all chapters

- **Test**: Complete all chapters, verify 100% overall

### SA3-036: Mastery level (SRS) updates after correct answers

- **Test**: Answer same question correctly twice, verify level up

### SA3-037: Failed questions appear in review queue

- **Test**: Answer wrong, check review queue populated

### SA3-038: Mastered questions excluded from review

- **Test**: Master question, verify not in review queue

### SA3-039: Progress persists across sessions

- **Test**: Make progress, close browser, reopen, verify kept

### SA3-040: Reset progress clears all stats

- **Test**: Use reset function, verify all zeroed

---

# Subagent 4: Navigation Patterns

### SA4-031: Next button advances to next question

- **Test**: Click next, verify next question shown

### SA4-032: Previous button returns to prior question

- **Test**: Click previous, verify prior question shown

### SA4-033: Question number navigation jumps correctly

- **Test**: Click question 5, verify question 5 shown

### SA4-034: Chapter navigation switches chapters

- **Test**: Click chapter 2, verify chapter 2 questions shown

### SA4-035: First/Last navigation works

- **Test**: Click first, verify first question; same for last

### SA4-036: Navigation disabled during answer reveal

- **Test**: Submit, verify nav disabled until acknowledged

### SA4-037: Navigation state shows current position

- **Test**: On question 5/10, verify "5 of 10" or similar

### SA4-038: Keyboard navigation (arrows) moves questions

- **Test**: Press right arrow, verify next question

### SA4-039: Navigation wraps at boundaries appropriately

- **Test**: At last question, next goes to first or stays

### SA4-040: Navigation through answered vs unanswered

- **Test**: Filter to unanswered, navigate only those

---

# Subagent 5: File Operations

### SA5-031: Import button opens file picker

- **Test**: Click import, verify file dialog opens

### SA5-032: Drag-drop file onto page imports

- **Test**: Drag quiz.json onto app, verify imported

### SA5-033: Import shows success message

- **Test**: Import valid file, verify success toast

### SA5-034: Import invalid file shows error

- **Test**: Import corrupted file, verify error message

### SA5-035: Export downloads file to device

- **Test**: Click export, verify file downloaded

### SA5-036: Export filename includes quiz name

- **Test**: Quiz named "Biology", verify biology in filename

### SA5-037: Export includes all progress data

- **Test**: Make progress, export, check JSON has progress

### SA5-038: Load sample quiz works

- **Test**: Click sample quiz, verify loads correctly

### SA5-039: Recent files list maintained (if feature)

- **Test**: Import file, check if appears in recent list

### SA5-040: File type validation on import

- **Test**: Try to import .txt, verify rejected
