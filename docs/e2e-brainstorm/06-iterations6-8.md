# Iterations 6-8: Specialized Scenarios

## Iteration 6 - Integration & Workflow

# Subagent 1: Multi-Step Workflows

### SA1-051: Complete onboarding flow

- **Test**: First launch → load quiz → start → complete

### SA1-052: Study session workflow

- **Test**: Dashboard → select chapter → answer all → review stats

### SA1-053: Spaced repetition complete cycle

- **Test**: Answer → fail → review → succeed → master

### SA1-054: Progress reset workflow

- **Test**: Dashboard → settings → reset → confirm → verify

### SA1-055: Quiz switching workflow

- **Test**: Load quiz A → progress → load quiz B → switch back

### SA1-056: Export and share workflow

- **Test**: Complete quiz → export → verify shareable format

### SA1-057: Daily review routine

- **Test**: Login → check review queue → complete reviews

### SA1-058: Chapter completion celebration

- **Test**: Complete last question → see completion UI

### SA1-059: Mistake correction workflow

- **Test**: Wrong answer → view explanation → practice again

### SA1-060: Bookmark/flag workflow (if exists)

- **Test**: Flag difficult questions → access flagged list

---

# Subagent 2: UI Component Integration

### SA2-051: Sidebar + main content sync

- **Test**: Click sidebar chapter, verify main updates

### SA2-052: Modal + background interaction

- **Test**: Open modal, verify background non-interactive

### SA2-053: Toast + modal layering

- **Test**: Trigger toast while modal open, verify layering

### SA2-054: Progress bar + navigation sync

- **Test**: Navigate, verify progress bar matches position

### SA2-055: Theme + all components sync

- **Test**: Toggle theme, verify all components update

### SA2-056: Scroll position + lazy loading

- **Test**: Scroll through questions, verify lazy load works

### SA2-057: Selection state + submit button sync

- **Test**: Select option, verify submit enabled

### SA2-058: Error state + input sync

- **Test**: Trigger error, clear, verify input state

### SA2-059: Loading state + UI freeze

- **Test**: During load, verify UI shows loading

### SA2-060: Animation + interaction sync

- **Test**: During animation, verify interactions queue

---

# Subagent 3: Edge Input Combinations

### SA3-051: Submit via Enter key while clicking submit

- **Test**: Press Enter and click simultaneously

### SA3-052: Type while modal transitioning

- **Test**: Type as modal opens/closes

### SA3-053: Scroll during option selection

- **Test**: Select while scrolling, verify correct selection

### SA3-054: Tab navigation during focus animation

- **Test**: Tab rapidly during focus transitions

### SA3-055: Copy during text selection

- **Test**: Copy question text during render

### SA3-056: Paste into unexpected areas

- **Test**: Paste text everywhere, verify no side effects

### SA3-057: Drag file while modal open

- **Test**: Drag file with modal open, verify handling

### SA3-058: Touch and mouse simultaneously (touch laptop)

- **Test**: Use both input types, verify no conflicts

### SA3-059: Zoom while interactive element focused

- **Test**: Pinch zoom with button focused

### SA3-060: Orientation change during quiz

- **Test**: Rotate device mid-question

---

# Subagent 4: Temporal Scenarios

### SA4-051: DST transition during quiz

- **Test**: Quiz spans DST change, verify times correct

### SA4-052: Year boundary crossing

- **Test**: Review scheduled Dec 31, check Jan 1

### SA4-053: Leap second handling

- **Test**: Verify no timestamp issues

### SA4-054: Future-dated review appears when due

- **Test**: Set review for "tomorrow", advance clock

### SA4-055: Past-dated review clears properly

- **Test**: Review overdue by days, verify clearing

### SA4-056: Session timeout handling

- **Test**: Leave app open 24 hours (simulated)

### SA4-057: Clock skew between tabs

- **Test**: Tabs with different system times

### SA4-058: Rapid time changes

- **Test**: Change system time during operation

### SA4-059: Midnight boundary quiz

- **Test**: Start quiz at 11:59 PM, finish at 12:01 AM

### SA4-060: Analytics time bucketing

- **Test**: Verify stats grouped by day correctly

---

# Subagent 5: Localization Edge Cases

### SA5-051: Mixed script question (Latin + Cyrillic)

- **Test**: Load "Hello Привет" in question

### SA5-052: Bidirectional text with numbers

- **Test**: Arabic with "123" numbers

### SA5-053: Font fallback for rare scripts

- **Test**: Load Thai/Georgian characters

### SA5-054: Very long compound words (German)

- **Test**: "Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz"

### SA5-055: Text with many diacritics

- **Test**: Vietnamese with tones

### SA5-056: Vertical text (if supported)

- **Test**: Japanese vertical writing

### SA5-057: Ruby annotations (if supported)

- **Test**: Japanese furigana

### SA5-058: Mathematical notation localization

- **Test**: Different decimal separators

### SA5-059: Date format localization

- **Test**: MM/DD/YYYY vs DD.MM.YYYY

### SA5-060: Number format in stats

- **Test**: Thousand separators by locale

---

## Iteration 7 - Failure Modes

# Subagent 1: Graceful Degradation

### SA1-061: App works without CSS loaded

- **Test**: Block CSS, verify usable

### SA1-062: App works with slow JS execution

- **Test**: Throttle CPU, verify functional

### SA1-063: App works with limited viewport

- **Test**: 320x480 viewport, verify usable

### SA1-064: App works with very large viewport

- **Test**: 4K resolution, verify layout

### SA1-065: App works with very small font

- **Test**: System font at 8px

### SA1-066: App works with very large font

- **Test**: System font at 32px

### SA1-067: App works with high DPI

- **Test**: 3x retina display

### SA1-068: App works with color blind mode

- **Test**: Simulate color blindness, verify usable

### SA1-069: App works with inverted colors

- **Test**: OS color inversion

### SA1-070: App works with reduced motion

- **Test**: prefers-reduced-motion: reduce

---

# Subagent 2: Error Boundary Scenarios

### SA2-061: Question render error isolated

- **Test**: Corrupt one question, others work

### SA2-062: Chapter render error isolated

- **Test**: Corrupt one chapter, others work

### SA2-063: Option render error isolated

- **Test**: Corrupt one option, question works

### SA2-064: Explanation render error isolated

- **Test**: Bad LaTeX in explanation, question works

### SA2-065: Navigation error recovery

- **Test**: Nav throws, app still usable

### SA2-066: Settings error recovery

- **Test**: Settings throws, quiz still works

### SA2-067: Export error doesn't lose data

- **Test**: Export fails, state preserved

### SA2-068: Import error shows helpful message

- **Test**: Import fails, error actionable

### SA2-069: Render timeout recovery

- **Test**: Slow render doesn't crash

### SA2-070: Infinite loop prevention

- **Test**: Bad data doesn't cause loop

---

# Subagent 3: Network Conditions

### SA3-061: Offline mode basic functionality

- **Test**: Disconnect, verify stored quiz works

### SA3-062: Reconnection detection

- **Test**: Reconnect, verify app responds

### SA3-063: Slow network import

- **Test**: Throttle to 2G, import file

### SA3-064: Intermittent connection

- **Test**: Flaky network, verify resilience

### SA3-065: High latency handling

- **Test**: 5 second latency, verify UX

### SA3-066: Packet loss simulation

- **Test**: 10% packet loss, verify recovery

### SA3-067: DNS failure handling

- **Test**: DNS fails, verify error message

### SA3-068: SSL error handling

- **Test**: Bad cert (if applicable)

### SA3-069: Large payload handling

- **Test**: Import over slow network

### SA3-070: Concurrent request handling

- **Test**: Multiple file imports simultaneously

---

# Subagent 4: Storage Scenarios

### SA4-061: Private browsing mode works

- **Test**: Incognito, verify basic functionality

### SA4-062: Storage disabled handling

- **Test**: Block storage, verify error message

### SA4-063: Storage quota reached

- **Test**: Fill storage, verify handling

### SA4-064: Storage cleared mid-session

- **Test**: Clear storage during use

### SA4-065: Multiple storage backends

- **Test**: Verify localStorage + sessionStorage use

### SA4-066: Storage key collision

- **Test**: Other app uses same keys

### SA4-067: Storage encryption (if any)

- **Test**: Verify data encrypted at rest

### SA4-068: Storage migration between versions

- **Test**: Old format upgrades cleanly

### SA4-069: Storage compaction

- **Test**: Large state compresses efficiently

### SA4-070: Storage event handling

- **Test**: Storage event from other tab

---

# Subagent 5: Platform-Specific

### SA5-061: PWA installation works

- **Test**: Install as PWA, verify functionality

### SA5-062: PWA offline works

- **Test**: Install, go offline, verify works

### SA5-063: Service worker updates

- **Test**: Update SW, verify app updates

### SA5-064: iOS Safari quirks

- **Test**: iOS-specific layout issues

### SA5-065: Android Chrome quirks

- **Test**: Android-specific issues

### SA5-066: Firefox container tabs

- **Test**: Container tabs isolation

### SA5-067: Browser extension interference

- **Test**: Ad blocker, dark mode extension

### SA5-068: Browser zoom level

- **Test**: 150% browser zoom

### SA5-069: Print functionality

- **Test**: Print quiz, verify printable

### SA5-070: Screenshot functionality

- **Test**: Take screenshot, verify clean capture

---

## Iteration 8 - Completeness Checks

# Subagent 1: Full CRUD Operations

### SA1-071: Create quiz (if feature exists)

- **Test**: Create new quiz from scratch

### SA1-072: Read quiz completely

- **Test**: All quiz data accessible

### SA1-073: Update question answer

- **Test**: Change answer, verify updated

### SA1-074: Update progress data

- **Test**: Progress updates correctly

### SA1-075: Delete quiz data

- **Test**: Remove quiz, verify gone

### SA1-076: Delete progress only

- **Test**: Reset progress, keep quiz

### SA1-077: Bulk operations

- **Test**: Answer multiple questions

### SA1-078: Undo operations

- **Test**: Undo answer if supported

### SA1-079: Redo operations

- **Test**: Redo answer if supported

### SA1-080: Operation history

- **Test**: View history of answers

---

# Subagent 2: Validation Coverage

### SA2-071: All required fields validated

- **Test**: Missing each required field

### SA2-072: Field length limits enforced

- **Test**: Exceed max lengths

### SA2-073: Field type validation

- **Test**: Wrong types submitted

### SA2-074: Range validation

- **Test**: Out-of-range numbers

### SA2-075: Format validation

- **Test**: Invalid formats

### SA2-076: Uniqueness validation

- **Test**: Duplicate IDs

### SA2-077: Referential integrity

- **Test**: References to missing items

### SA2-078: Circular reference detection

- **Test**: Self-referencing items

### SA2-079: Consistency validation

- **Test**: Conflicting data states

### SA2-080: Sanitization validation

- **Test**: Dangerous content stripped

---

# Subagent 3: Accessibility Completeness

### SA3-071: All interactive elements focusable

- **Test**: Tab to every interactive element

### SA3-072: All images have alt text

- **Test**: Audit all images

### SA3-073: All forms have labels

- **Test**: Audit all form elements

### SA3-074: All buttons have names

- **Test**: Audit button accessibility

### SA3-075: All links have text

- **Test**: Audit link accessibility

### SA3-076: Color not sole indicator

- **Test**: Verify non-color cues

### SA3-077: Text resizable to 200%

- **Test**: Zoom text 200%, verify usable

### SA3-078: Keyboard shortcuts announced

- **Test**: All shortcuts discoverable

### SA3-079: Error messages accessible

- **Test**: Screen reader hears errors

### SA3-080: Success messages accessible

- **Test**: Screen reader hears success

---

# Subagent 4: Performance Benchmarks

### SA4-071: Initial load under 3 seconds

- **Test**: Measure cold start time

### SA4-072: Quiz import under 5 seconds

- **Test**: Measure import time

### SA4-073: Question navigation under 100ms

- **Test**: Measure navigation latency

### SA4-074: Answer submission under 200ms

- **Test**: Measure submission latency

### SA4-075: Export generation under 2 seconds

- **Test**: Measure export time

### SA4-076: Search results under 500ms

- **Test**: Measure search time

### SA4-077: Theme toggle under 100ms

- **Test**: Measure theme switch

### SA4-078: Modal open under 200ms

- **Test**: Measure modal transition

### SA4-079: Memory usage under 100MB

- **Test**: Measure peak memory

### SA4-080: No layout shifts after load

- **Test**: Measure CLS

---

# Subagent 5: Feature Completeness

### SA5-071: All menu items functional

- **Test**: Click every menu item

### SA5-072: All buttons functional

- **Test**: Click every button

### SA5-073: All links functional

- **Test**: Click every link

### SA5-074: All inputs functional

- **Test**: Type in every input

### SA5-075: All dropdowns functional

- **Test**: Use every dropdown

### SA5-076: All checkboxes functional

- **Test**: Toggle every checkbox

### SA5-077: All radio buttons functional

- **Test**: Select every radio

### SA5-078: All sliders functional

- **Test**: Adjust every slider

### SA5-079: All tooltips appear

- **Test**: Hover for all tooltips

### SA5-080: All modals open/close

- **Test**: Open/close every modal
