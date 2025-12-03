# Iteration 3: Deep Dive Scenarios

## Subagent Focus Areas for Iteration 3

1. **Quiz Content Edge Cases** - Unusual quiz structures
2. **Session Lifecycle** - Start, pause, resume, end
3. **Data Format Variations** - Different file formats, schemas
4. **Browser Compatibility** - Different browsers, versions
5. **Internationalization** - Non-English content, RTL

---

# Subagent 1: Quiz Content Edge Cases

### SA1-021: Quiz with single question single option

- **Test**: Import minimal quiz, verify answerable

### SA1-022: True/False question type renders differently from MCQ

- **Test**: Load T/F question, verify appropriate UI

### SA1-023: Question with image in markdown displays correctly

- **Test**: Load question with ![image](url), verify renders

### SA1-024: Nested lists in explanation render properly

- **Test**: Load explanation with nested bullets, verify format

### SA1-025: Question references previous question in text

- **Test**: Question says "From Q1...", verify no broken links

### SA1-026: Chapter with 100 questions navigates smoothly

- **Test**: Load large chapter, navigate to end, verify performance

### SA1-027: Question text with tables renders aligned

- **Test**: Load markdown table in question, verify columns align

### SA1-028: Mixed markdown and LaTeX in single question

- **Test**: Load "The formula $x^2$ means..." verify both render

### SA1-029: Block quote in question styled distinctly

- **Test**: Load > quoted text, verify quote styling

### SA1-030: Horizontal rule separates question sections

- **Test**: Load question with ---, verify rule renders

---

# Subagent 2: Session Lifecycle

### SA2-021: Start quiz session initializes clean state

- **Test**: Start session, verify all questions unanswered

### SA2-022: Pause quiz (navigate away) preserves exact state

- **Test**: Select answer, don't submit, navigate away, return

### SA2-023: Resume quiz after browser refresh

- **Test**: Mid-quiz refresh, verify position maintained

### SA2-024: End quiz session shows complete summary

- **Test**: Answer all questions, verify summary shown

### SA2-025: Restart quiz clears all progress for that quiz

- **Test**: Complete quiz, restart, verify all reset

### SA2-026: Session timeout doesn't lose answered questions

- **Test**: Leave quiz open 1 hour (simulated), verify state

### SA2-027: Multiple quiz sessions don't interfere

- **Test**: Start quiz, open new tab with different quiz

### SA2-028: Session state survives browser back button

- **Test**: Mid-quiz browser back, forward, verify state

### SA2-029: Closing browser with unsaved changes prompts

- **Test**: Select answer, try to close, verify prompt/no prompt

### SA2-030: Session recovery after accidental navigation

- **Test**: Click external link, back button, verify state

---

# Subagent 3: Data Format Variations

### SA3-021: JSON quiz with minified format parses correctly

- **Test**: Import minified JSON (no whitespace), verify works

### SA3-022: Markdown quiz with CRLF line endings parses

- **Test**: Import Windows-formatted markdown, verify works

### SA3-023: UTF-8 BOM at file start doesn't break parsing

- **Test**: Import file with BOM, verify clean parse

### SA3-024: JSON with trailing commas handled gracefully

- **Test**: Import JSON with trailing commas, verify error/fix

### SA3-025: Markdown with front matter (YAML header) parses

- **Test**: Import markdown with ---, verify content extracted

### SA3-026: Quiz exported as JSON reimports identically

- **Test**: Export, reimport, compare byte-for-byte

### SA3-027: Old quiz format version migrates automatically

- **Test**: Import v1 format quiz, verify upgraded to current

### SA3-028: Large file (10MB) processes without timeout

- **Test**: Import 10MB quiz, verify completes

### SA3-029: Empty lines in markdown don't create blank questions

- **Test**: Import markdown with extra blank lines, verify clean

### SA3-030: Comments in JSON ignored properly

- **Test**: Import JSON with // comments (if supported)

---

# Subagent 4: Browser Compatibility

### SA4-021: Works in latest Chrome

- **Test**: Run full suite in Chrome latest

### SA4-022: Works in latest Firefox

- **Test**: Run full suite in Firefox latest

### SA4-023: Works in latest Safari

- **Test**: Run full suite in Safari latest

### SA4-024: Works in latest Edge

- **Test**: Run full suite in Edge latest

### SA4-025: localStorage fallback if unavailable

- **Test**: Disable localStorage, verify fallback behavior

### SA4-026: No console errors during normal operation

- **Test**: Complete user flow, check console for errors

### SA4-027: Performance acceptable on low-end device

- **Test**: Throttle CPU 6x, verify usable performance

### SA4-028: Touch events work correctly on touchscreen

- **Test**: Run on touch device, verify taps work

### SA4-029: Copy/paste works across browsers

- **Test**: Copy question text, paste in each browser

### SA4-030: File input accepts correct file types

- **Test**: Verify .json and .md accepted, others rejected

---

# Subagent 5: Internationalization

### SA5-021: Japanese question text renders correctly

- **Test**: Import quiz with 日本語, verify display

### SA5-022: Arabic RTL text displays right-to-left

- **Test**: Import quiz with عربي, verify RTL layout

### SA5-023: Chinese characters don't break layout

- **Test**: Import quiz with 中文, verify no overflow

### SA5-024: Emoji in all fields render correctly

- **Test**: Import quiz with 🎯📚 everywhere, verify display

### SA5-025: Mixed LTR/RTL content in same question

- **Test**: Question with English and عربي, verify both readable

### SA5-026: Diacritical marks (accents) preserved

- **Test**: Import "café résumé naïve", verify accents intact

### SA5-027: Greek letters in math context render

- **Test**: Import α β γ in LaTeX, verify proper display

### SA5-028: Currency symbols display correctly

- **Test**: Import £ € ¥ ₹, verify symbols intact

### SA5-029: Long non-breaking text handled

- **Test**: Import verylongwordwithoutspaces, verify wrapping

### SA5-030: Zero-width characters don't cause issues

- **Test**: Import text with ZWNJ/ZWJ, verify no visual bugs
