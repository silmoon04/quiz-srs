# Final E2E Test Suite - Top 100 Tests

## Selection Methodology

From 510 generated ideas across 10 iterations and 50 subagent perspectives, these 100 tests were selected based on:

1. **Impact**: High likelihood of catching real bugs
2. **Testability**: Feasible with Playwright e2e framework
3. **Coverage**: Diverse across features and failure modes
4. **Priority**: Critical paths tested first

---

## Category 1: Critical User Journeys (15 tests)

### 1.1 First-Time User Flow

```
TEST: e2e-001-first-time-user-journey
PRIORITY: Critical
DESCRIPTION: New user loads app, imports quiz, answers questions, sees results
STEPS:
  1. Open fresh app (no localStorage)
  2. Verify welcome screen shown
  3. Import sample quiz
  4. Verify dashboard with quiz stats
  5. Start quiz session
  6. Answer first question correctly
  7. Answer second question incorrectly
  8. Complete all questions
  9. Verify completion summary
  10. Verify progress persists on refresh
```

### 1.2 Return User Resume Flow

```
TEST: e2e-002-return-user-resume
PRIORITY: Critical
DESCRIPTION: User leaves mid-quiz, returns to exact position
STEPS:
  1. Load quiz with 10 questions
  2. Answer 5 questions
  3. Note current question position
  4. Close browser/tab
  5. Reopen application
  6. Verify quiz state preserved
  7. Verify on question 6
  8. Complete remaining questions
```

### 1.3 Complete SRS Cycle

```
TEST: e2e-003-complete-srs-cycle
PRIORITY: Critical
DESCRIPTION: Question progresses from new → learning → mastered
STEPS:
  1. Load quiz with SRS enabled
  2. Answer question incorrectly (srsLevel stays 0)
  3. Enter review session
  4. Answer correctly (srsLevel → 1)
  5. Answer correctly again (srsLevel → 2)
  6. Verify question marked as mastered
  7. Verify not in review queue
```

### 1.4 Export/Import Round Trip

```
TEST: e2e-004-export-import-roundtrip
PRIORITY: High
DESCRIPTION: Progress survives export/clear/import cycle
STEPS:
  1. Import quiz, make progress
  2. Export progress to file
  3. Clear all localStorage
  4. Verify app shows fresh state
  5. Import exported file
  6. Verify all progress restored
  7. Verify stats match exactly
```

### 1.5 Review Session Flow

```
TEST: e2e-005-review-session-flow
PRIORITY: High
DESCRIPTION: Failed questions appear in review and can be cleared
STEPS:
  1. Answer questions incorrectly
  2. Navigate to review queue
  3. Verify failed questions present
  4. Answer review questions correctly
  5. Verify review queue updates
  6. Complete all reviews
  7. Verify queue empty
```

### 1.6 Chapter Navigation Flow

```
TEST: e2e-006-chapter-navigation
PRIORITY: High
DESCRIPTION: User navigates between chapters correctly
STEPS:
  1. Load multi-chapter quiz
  2. Complete questions in chapter 1
  3. Navigate to chapter 2
  4. Verify chapter 1 progress preserved
  5. Return to chapter 1
  6. Verify on correct question
```

### 1.7 Dashboard Stats Accuracy

```
TEST: e2e-007-dashboard-stats
PRIORITY: High
DESCRIPTION: Dashboard shows accurate statistics
STEPS:
  1. Load quiz
  2. Verify initial stats (0/N questions)
  3. Answer 3 correctly, 2 incorrectly
  4. Return to dashboard
  5. Verify totals accurate
  6. Verify per-chapter breakdowns
```

### 1.8 Keyboard-Only Navigation

```
TEST: e2e-008-keyboard-navigation
PRIORITY: High
DESCRIPTION: Complete quiz using only keyboard
STEPS:
  1. Tab to start button
  2. Enter to start quiz
  3. Arrow keys to navigate options
  4. Enter to select option
  5. Tab to submit, Enter to submit
  6. Complete all questions via keyboard
```

### 1.9 Theme Persistence

```
TEST: e2e-009-theme-persistence
PRIORITY: Medium
DESCRIPTION: Theme preference persists across sessions
STEPS:
  1. Default theme is light
  2. Toggle to dark theme
  3. Refresh page
  4. Verify dark theme active
  5. Toggle back to light
  6. Verify persists
```

### 1.10 Quiz Abandonment

```
TEST: e2e-010-quiz-abandonment
PRIORITY: Medium
DESCRIPTION: Abandoning quiz and importing new one works cleanly
STEPS:
  1. Import quiz A
  2. Answer 5 questions
  3. Import quiz B
  4. Verify quiz B loads fresh
  5. Verify no quiz A state contamination
```

### 1.11 Question History Review

```
TEST: e2e-011-question-history
PRIORITY: Medium
DESCRIPTION: User can review previous answers in current session
STEPS:
  1. Answer 5 questions
  2. Navigate to previous question
  3. Verify shows selected answer
  4. Verify shows correct/incorrect feedback
  5. Navigate forward through history
```

### 1.12 Progress Bar Accuracy

```
TEST: e2e-012-progress-bar
PRIORITY: Medium
DESCRIPTION: Progress bar accurately reflects position
STEPS:
  1. Load 10 question quiz
  2. Verify bar at 0%
  3. Answer 5 questions
  4. Verify bar at 50%
  5. Complete quiz
  6. Verify bar at 100%
```

### 1.13 Answer Modification Before Submit

```
TEST: e2e-013-answer-change
PRIORITY: High
DESCRIPTION: User can change answer before submitting
STEPS:
  1. Select option A
  2. Verify A appears selected
  3. Select option B
  4. Verify only B selected
  5. Submit
  6. Verify B was recorded
```

### 1.14 Correct/Incorrect Feedback

```
TEST: e2e-014-answer-feedback
PRIORITY: Critical
DESCRIPTION: Correct and incorrect feedback clearly shown
STEPS:
  1. Answer question correctly
  2. Verify success indication visible
  3. Answer next question incorrectly
  4. Verify error indication visible
  5. Verify correct answer highlighted
```

### 1.15 Explanation Display

```
TEST: e2e-015-explanation-display
PRIORITY: High
DESCRIPTION: Explanation shows after answer submission
STEPS:
  1. Submit answer
  2. Verify explanation section visible
  3. Verify explanation text matches quiz data
  4. Verify markdown in explanation renders
```

---

## Category 2: Data Integrity (15 tests)

### 2.1 LocalStorage Corruption Recovery

```
TEST: e2e-016-storage-corruption-recovery
PRIORITY: Critical
DESCRIPTION: App recovers from corrupted localStorage
STEPS:
  1. Manually corrupt localStorage JSON
  2. Reload application
  3. Verify no crash
  4. Verify error message or fresh start
```

### 2.2 Concurrent Tab State

```
TEST: e2e-017-concurrent-tabs
PRIORITY: Critical
DESCRIPTION: Two tabs don't corrupt shared state
STEPS:
  1. Open app in tab 1
  2. Open app in tab 2
  3. Import quiz in tab 1
  4. Import different quiz in tab 2
  5. Answer questions in both
  6. Verify no state corruption
```

### 2.3 Import Validation

```
TEST: e2e-018-import-validation
PRIORITY: High
DESCRIPTION: Invalid quiz files are rejected with helpful errors
STEPS:
  1. Import completely invalid JSON
  2. Verify error message shown
  3. Import JSON missing required fields
  4. Verify specific error about missing field
```

### 2.4 Duplicate Question ID Handling

```
TEST: e2e-019-duplicate-ids
PRIORITY: High
DESCRIPTION: Quiz with duplicate IDs handled appropriately
STEPS:
  1. Import quiz with duplicate questionIds
  2. Verify warning or deduplication
  3. Answer questions
  4. Verify correct question updated
```

### 2.5 Unicode Content Preservation

```
TEST: e2e-020-unicode-preservation
PRIORITY: High
DESCRIPTION: Unicode characters preserved in export/import
STEPS:
  1. Import quiz with emoji/CJK/RTL text
  2. Verify display correct
  3. Export quiz
  4. Reimport exported file
  5. Verify characters identical
```

### 2.6 Empty Quiz Handling

```
TEST: e2e-021-empty-quiz
PRIORITY: Medium
DESCRIPTION: Quiz with no questions shows appropriate message
STEPS:
  1. Import quiz with chapters but no questions
  2. Verify no crash
  3. Verify helpful empty state message
```

### 2.7 Zero Options Question

```
TEST: e2e-022-zero-options
PRIORITY: Medium
DESCRIPTION: Question with no options handled gracefully
STEPS:
  1. Import quiz with question having empty options array
  2. Verify error or skip behavior
  3. Other questions still work
```

### 2.8 All Options Correct

```
TEST: e2e-023-all-correct
PRIORITY: Medium
DESCRIPTION: Question where all options are correct works
STEPS:
  1. Import quiz with all correctOptionIds
  2. Select any option
  3. Verify marked correct
```

### 2.9 Large Quiz Performance

```
TEST: e2e-024-large-quiz
PRIORITY: High
DESCRIPTION: Large quiz (1000 questions) loads and works
STEPS:
  1. Import quiz with 1000 questions
  2. Verify loads within 10 seconds
  3. Navigate to last question
  4. Answer questions
  5. Verify responsive
```

### 2.10 Progress Persistence on Crash

```
TEST: e2e-025-persistence
PRIORITY: High
DESCRIPTION: Progress saved frequently enough for recovery
STEPS:
  1. Answer question
  2. Immediately refresh (simulate crash)
  3. Verify answer was saved
```

### 2.11 File Type Validation

```
TEST: e2e-026-file-type
PRIORITY: Medium
DESCRIPTION: Only .json and .md files accepted
STEPS:
  1. Try to import .txt file
  2. Verify rejected
  3. Import .json file
  4. Verify accepted
  5. Import .md file
  6. Verify accepted
```

### 2.12 Markdown Quiz Parsing

```
TEST: e2e-027-markdown-parsing
PRIORITY: High
DESCRIPTION: Markdown quiz format parses correctly
STEPS:
  1. Import valid markdown quiz
  2. Verify chapters extracted
  3. Verify questions parsed
  4. Verify options correct
  5. Verify explanations present
```

### 2.13 JSON Quiz Parsing

```
TEST: e2e-028-json-parsing
PRIORITY: High
DESCRIPTION: JSON quiz format parses correctly
STEPS:
  1. Import valid JSON quiz
  2. Verify all fields read
  3. Verify nested structures preserved
```

### 2.14 Special Filename Characters

```
TEST: e2e-029-special-filename
PRIORITY: Medium
DESCRIPTION: Export handles special characters in quiz name
STEPS:
  1. Import quiz named "Test/Quiz:2024"
  2. Export quiz
  3. Verify download succeeds
  4. Verify filename sanitized
```

### 2.15 LocalStorage Cleared Recovery

```
TEST: e2e-030-storage-cleared
PRIORITY: High
DESCRIPTION: App handles cleared localStorage gracefully
STEPS:
  1. Make progress
  2. Clear browser storage
  3. Reload app
  4. Verify clean welcome state
  5. No errors in console
```

---

## Category 3: UI/UX Correctness (15 tests)

### 3.1 Answer Selection Visibility

```
TEST: e2e-031-selection-visibility
PRIORITY: Critical
DESCRIPTION: Selected option is clearly visually distinct
STEPS:
  1. Navigate to question with 4 options
  2. Select option B
  3. Verify B has selected styling
  4. Verify A, C, D do not have selected styling
```

### 3.2 Button State Management

```
TEST: e2e-032-button-states
PRIORITY: High
DESCRIPTION: Submit button enabled/disabled appropriately
STEPS:
  1. Load question
  2. Verify submit disabled (no selection)
  3. Select option
  4. Verify submit enabled
  5. Deselect option (if possible)
  6. Verify submit disabled again
```

### 3.3 Loading States

```
TEST: e2e-033-loading-states
PRIORITY: High
DESCRIPTION: Loading indicators shown during async operations
STEPS:
  1. Import large quiz
  2. Verify loading indicator shown
  3. Verify UI not interactive during load
  4. Verify loading clears when complete
```

### 3.4 Error Message Display

```
TEST: e2e-034-error-display
PRIORITY: High
DESCRIPTION: Error messages are visible and helpful
STEPS:
  1. Trigger import error
  2. Verify error message visible
  3. Verify error describes problem
  4. Verify error dismissible
```

### 3.5 Toast Notification Stacking

```
TEST: e2e-035-toast-stacking
PRIORITY: Medium
DESCRIPTION: Multiple toasts display correctly
STEPS:
  1. Trigger success toast
  2. Immediately trigger info toast
  3. Verify both visible
  4. Verify proper stacking/positioning
  5. Verify auto-dismiss works
```

### 3.6 Modal Focus Trap

```
TEST: e2e-036-modal-focus
PRIORITY: High
DESCRIPTION: Focus trapped within open modal
STEPS:
  1. Open confirmation modal
  2. Tab through all elements
  3. Verify focus stays in modal
  4. Verify Escape closes modal
  5. Verify focus returns to trigger
```

### 3.7 Theme Toggle Visual

```
TEST: e2e-037-theme-visual
PRIORITY: Medium
DESCRIPTION: Theme toggle updates all components
STEPS:
  1. Verify light theme colors
  2. Toggle to dark
  3. Verify all text visible
  4. Verify all backgrounds changed
  5. No elements remain in old theme
```

### 3.8 Long Content Handling

```
TEST: e2e-038-long-content
PRIORITY: High
DESCRIPTION: Long question text doesn't break layout
STEPS:
  1. Load question with 500+ word text
  2. Verify text contained
  3. Verify scrollable if needed
  4. Verify options still visible
```

### 3.9 Code Block Rendering

````
TEST: e2e-039-code-blocks
PRIORITY: Medium
DESCRIPTION: Code blocks in questions render properly
STEPS:
  1. Load question with ```code``` blocks
  2. Verify monospace font
  3. Verify syntax highlighting (if applicable)
  4. Verify whitespace preserved
````

### 3.10 LaTeX Rendering

```
TEST: e2e-040-latex-rendering
PRIORITY: Medium
DESCRIPTION: LaTeX equations render correctly
STEPS:
  1. Load question with $inline$ math
  2. Verify equation renders
  3. Load question with $$block$$ math
  4. Verify block equation renders
  5. Verify sizing appropriate
```

### 3.11 Responsive Layout

```
TEST: e2e-041-responsive
PRIORITY: High
DESCRIPTION: App works at different viewport sizes
STEPS:
  1. Test at 1920px width (desktop)
  2. Test at 768px width (tablet)
  3. Test at 375px width (mobile)
  4. Verify all features accessible at each size
```

### 3.12 Scroll Position Management

```
TEST: e2e-042-scroll-position
PRIORITY: Medium
DESCRIPTION: Scroll position handled appropriately
STEPS:
  1. Scroll down to see long question
  2. Submit answer
  3. Verify scroll position for new question
  4. Navigate back
  5. Verify previous scroll state
```

### 3.13 Double-Click Prevention

```
TEST: e2e-043-double-click
PRIORITY: High
DESCRIPTION: Double-clicking submit doesn't cause issues
STEPS:
  1. Select answer
  2. Double-click submit rapidly
  3. Verify only one submission recorded
  4. Verify no duplicate toasts
```

### 3.14 Browser Back Button

```
TEST: e2e-044-browser-back
PRIORITY: High
DESCRIPTION: Browser back button doesn't break state
STEPS:
  1. Start quiz
  2. Answer questions
  3. Press browser back
  4. Press browser forward
  5. Verify state consistent
```

### 3.15 Rapid Navigation

```
TEST: e2e-045-rapid-navigation
PRIORITY: Medium
DESCRIPTION: Rapid clicking through UI doesn't break
STEPS:
  1. Click through chapters rapidly
  2. Click through questions rapidly
  3. Verify final state correct
  4. No console errors
```

---

## Category 4: Accessibility (15 tests)

### 4.1 Focus After Answer

```
TEST: e2e-046-focus-after-answer
PRIORITY: High
DESCRIPTION: Focus moves appropriately after answer submission
STEPS:
  1. Submit answer via keyboard
  2. Verify focus moves to logical next element
  3. Screen reader announces new state
```

### 4.2 ARIA Live Announcements

```
TEST: e2e-047-aria-live
PRIORITY: High
DESCRIPTION: Correct/incorrect announced to screen readers
STEPS:
  1. Submit correct answer
  2. Verify aria-live region updates
  3. Submit incorrect answer
  4. Verify announcement changes
```

### 4.3 Heading Structure

```
TEST: e2e-048-heading-structure
PRIORITY: Medium
DESCRIPTION: Heading hierarchy is logical
STEPS:
  1. Extract all headings from page
  2. Verify h1 exists
  3. Verify no skipped levels (h1 → h3)
  4. Verify logical nesting
```

### 4.4 Form Labels

```
TEST: e2e-049-form-labels
PRIORITY: High
DESCRIPTION: All form inputs have proper labels
STEPS:
  1. Find all inputs on page
  2. Verify each has associated label
  3. Label clicks focus input
```

### 4.5 Button Names

```
TEST: e2e-050-button-names
PRIORITY: High
DESCRIPTION: All buttons have accessible names
STEPS:
  1. Find all buttons
  2. Verify each has text or aria-label
  3. Names are descriptive
```

### 4.6 Color Contrast

```
TEST: e2e-051-color-contrast
PRIORITY: High
DESCRIPTION: Text meets WCAG contrast requirements
STEPS:
  1. Run axe-core audit
  2. Verify no contrast violations
  3. Test in both themes
```

### 4.7 Keyboard Option Selection

```
TEST: e2e-052-keyboard-options
PRIORITY: High
DESCRIPTION: Options selectable via keyboard
STEPS:
  1. Focus first option
  2. Arrow down to option 2
  3. Press Space/Enter to select
  4. Verify selection registered
```

### 4.8 Skip Link

```
TEST: e2e-053-skip-link
PRIORITY: Medium
DESCRIPTION: Skip to content link exists and works
STEPS:
  1. Tab on page load
  2. Verify skip link first focusable
  3. Activate skip link
  4. Verify main content focused
```

### 4.9 Error Identification

```
TEST: e2e-054-error-identification
PRIORITY: High
DESCRIPTION: Errors announced and associated with inputs
STEPS:
  1. Trigger validation error
  2. Verify aria-invalid set
  3. Verify aria-describedby links error
  4. Screen reader hears error
```

### 4.10 Modal Accessibility

```
TEST: e2e-055-modal-accessibility
PRIORITY: High
DESCRIPTION: Modals are fully accessible
STEPS:
  1. Open modal
  2. Verify aria-modal="true"
  3. Verify role="dialog"
  4. Verify focus trapped
  5. Verify Escape closes
  6. Verify focus return
```

### 4.11 Image Alt Text

```
TEST: e2e-056-image-alt
PRIORITY: Medium
DESCRIPTION: All meaningful images have alt text
STEPS:
  1. Find all images
  2. Verify meaningful images have descriptive alt
  3. Verify decorative images have empty alt or aria-hidden
```

### 4.12 Reduced Motion

```
TEST: e2e-057-reduced-motion
PRIORITY: Medium
DESCRIPTION: Respects prefers-reduced-motion
STEPS:
  1. Set reduced motion preference
  2. Trigger animations
  3. Verify animations reduced/removed
```

### 4.13 Zoom Support

```
TEST: e2e-058-zoom-support
PRIORITY: Medium
DESCRIPTION: App usable at 200% zoom
STEPS:
  1. Set browser zoom to 200%
  2. Navigate entire app
  3. Verify no overlap/cutoff
  4. All features accessible
```

### 4.14 Focus Visibility

```
TEST: e2e-059-focus-visible
PRIORITY: High
DESCRIPTION: Focus indicator visible on all interactive elements
STEPS:
  1. Tab through all interactive elements
  2. Verify visible focus ring on each
  3. Focus ring has sufficient contrast
```

### 4.15 Touch Target Size

```
TEST: e2e-060-touch-targets
PRIORITY: Medium
DESCRIPTION: Touch targets are at least 44x44px
STEPS:
  1. Measure all button/link dimensions
  2. Verify minimum 44x44px
  3. Or verify adequate spacing if smaller
```

---

## Category 5: Security (10 tests)

### 5.1 XSS Script Tags

```
TEST: e2e-061-xss-script
PRIORITY: Critical
DESCRIPTION: Script tags in quiz content are neutralized
STEPS:
  1. Import quiz with <script>alert('xss')</script>
  2. View question
  3. Verify no script execution
  4. Verify text sanitized or escaped
```

### 5.2 XSS Event Handlers

```
TEST: e2e-062-xss-events
PRIORITY: Critical
DESCRIPTION: Event handlers in content are stripped
STEPS:
  1. Import quiz with <img onerror="alert(1)">
  2. View question
  3. Verify no script execution
  4. Verify handler stripped
```

### 5.3 JavaScript URLs

```
TEST: e2e-063-js-urls
PRIORITY: Critical
DESCRIPTION: javascript: URLs are blocked
STEPS:
  1. Import quiz with [link](javascript:alert(1))
  2. Click link
  3. Verify no script execution
```

### 5.4 Data Exfiltration Prevention

```
TEST: e2e-064-data-exfil
PRIORITY: High
DESCRIPTION: No external requests from quiz content
STEPS:
  1. Import quiz with external image URL
  2. Monitor network
  3. Verify external request blocked or proxied
```

### 5.5 Prototype Pollution

```
TEST: e2e-065-prototype
PRIORITY: High
DESCRIPTION: __proto__ in JSON doesn't pollute
STEPS:
  1. Import quiz with "__proto__" key
  2. Verify Object.prototype unchanged
  3. App functions normally
```

### 5.6 HTML Injection

```
TEST: e2e-066-html-injection
PRIORITY: High
DESCRIPTION: HTML in quiz content is sanitized
STEPS:
  1. Import quiz with <form action="evil.com">
  2. Verify form element stripped
  3. Import quiz with <iframe src="evil">
  4. Verify iframe stripped
```

### 5.7 Path Traversal

```
TEST: e2e-067-path-traversal
PRIORITY: Medium
DESCRIPTION: File paths in quiz can't escape
STEPS:
  1. Import quiz with ../../etc/passwd reference
  2. Verify no file system access
  3. Graceful handling
```

### 5.8 Storage Isolation

```
TEST: e2e-068-storage-isolation
PRIORITY: Medium
DESCRIPTION: Quiz data isolated from other origins
STEPS:
  1. Verify localStorage is same-origin
  2. Verify no cross-origin access
```

### 5.9 Console Security

```
TEST: e2e-069-console-security
PRIORITY: Low
DESCRIPTION: No sensitive data logged to console
STEPS:
  1. Complete user journey
  2. Check console logs
  3. Verify no sensitive data exposed
```

### 5.10 Input Sanitization

```
TEST: e2e-070-input-sanitization
PRIORITY: High
DESCRIPTION: User inputs are sanitized
STEPS:
  1. If any user input fields exist
  2. Input malicious content
  3. Verify sanitized on display
```

---

## Category 6: Error Handling (10 tests)

### 6.1 Error Boundary

```
TEST: e2e-071-error-boundary
PRIORITY: Critical
DESCRIPTION: Component errors show fallback UI
STEPS:
  1. Trigger component error (malformed quiz)
  2. Verify error boundary catches
  3. Verify fallback UI shown
  4. Verify recovery option available
```

### 6.2 Network Failure

```
TEST: e2e-072-network-failure
PRIORITY: High
DESCRIPTION: Network errors handled gracefully
STEPS:
  1. Block sample quiz fetch
  2. Click load sample
  3. Verify error message
  4. Verify app still usable
```

### 6.3 Parse Error Recovery

```
TEST: e2e-073-parse-error
PRIORITY: High
DESCRIPTION: Parse errors show helpful message
STEPS:
  1. Import malformed JSON
  2. Verify error shown
  3. Error describes parse issue
  4. Can try different file
```

### 6.4 Validation Error Messages

```
TEST: e2e-074-validation-errors
PRIORITY: High
DESCRIPTION: Validation errors are specific and helpful
STEPS:
  1. Import quiz missing 'name'
  2. Verify error mentions 'name'
  3. Import quiz with empty chapters
  4. Verify error mentions 'chapters'
```

### 6.5 Silent Failure Prevention

```
TEST: e2e-075-no-silent-fail
PRIORITY: High
DESCRIPTION: No operations fail silently
STEPS:
  1. Trigger various failures
  2. Verify each has visible feedback
  3. No blank screens
```

### 6.6 Graceful Degradation

```
TEST: e2e-076-degradation
PRIORITY: Medium
DESCRIPTION: App degrades gracefully with missing features
STEPS:
  1. Disable localStorage
  2. Verify app warns but works
  3. Features requiring storage disabled
```

### 6.7 Infinite Loop Prevention

```
TEST: e2e-077-infinite-loop
PRIORITY: High
DESCRIPTION: Bad data doesn't cause infinite loops
STEPS:
  1. Import quiz with circular reference
  2. Verify timeout or error
  3. App remains responsive
```

### 6.8 Memory Error Handling

```
TEST: e2e-078-memory-error
PRIORITY: Medium
DESCRIPTION: Large quizzes don't crash browser
STEPS:
  1. Import very large quiz (50MB)
  2. Verify warning or chunked loading
  3. Browser remains stable
```

### 6.9 Timeout Handling

```
TEST: e2e-079-timeout
PRIORITY: Medium
DESCRIPTION: Long operations have timeouts
STEPS:
  1. Trigger slow operation
  2. Verify timeout message if too long
  3. User can cancel/retry
```

### 6.10 Recovery After Error

```
TEST: e2e-080-recovery
PRIORITY: High
DESCRIPTION: App recoverable after any error
STEPS:
  1. Trigger error state
  2. Verify can retry operation
  3. Verify can navigate away
  4. App fully functional after
```

---

## Category 7: State Management (10 tests)

### 7.1 State Consistency

```
TEST: e2e-081-state-consistency
PRIORITY: High
DESCRIPTION: UI always reflects current state
STEPS:
  1. Make state changes
  2. Verify all UI elements updated
  3. No stale data shown
```

### 7.2 Rapid State Changes

```
TEST: e2e-082-rapid-state
PRIORITY: High
DESCRIPTION: Rapid state changes don't cause issues
STEPS:
  1. Click answer options rapidly
  2. Submit rapidly
  3. Navigate rapidly
  4. Final state correct
```

### 7.3 Browser History State

```
TEST: e2e-083-history-state
PRIORITY: Medium
DESCRIPTION: History state matches app state
STEPS:
  1. Navigate through app
  2. Use back/forward
  3. State matches URL/history
```

### 7.4 Session vs Persistent State

```
TEST: e2e-084-session-persistent
PRIORITY: Medium
DESCRIPTION: Session state cleared, persistent state kept
STEPS:
  1. Close tab (session lost)
  2. Reopen (persistent kept)
  3. Verify appropriate split
```

### 7.5 State Reset

```
TEST: e2e-085-state-reset
PRIORITY: Medium
DESCRIPTION: Reset fully clears state
STEPS:
  1. Make extensive progress
  2. Use reset function
  3. Verify all state cleared
  4. Fresh start confirmed
```

### 7.6 Partial State Load

```
TEST: e2e-086-partial-state
PRIORITY: Medium
DESCRIPTION: App handles partial state gracefully
STEPS:
  1. Corrupt partial localStorage state
  2. Reload app
  3. Verify recovers or resets
```

### 7.7 Cross-Tab State Sync

```
TEST: e2e-087-cross-tab
PRIORITY: High
DESCRIPTION: Multiple tabs show consistent state
STEPS:
  1. Open two tabs
  2. Make change in tab 1
  3. Verify tab 2 updates (or warns)
```

### 7.8 State During Navigation

```
TEST: e2e-088-nav-state
PRIORITY: Medium
DESCRIPTION: State preserved during navigation
STEPS:
  1. Select answer (don't submit)
  2. Navigate to dashboard
  3. Return to quiz
  4. Verify selection state
```

### 7.9 Optimistic Updates

```
TEST: e2e-089-optimistic
PRIORITY: Medium
DESCRIPTION: UI updates immediately, handles failure
STEPS:
  1. Submit answer
  2. Verify immediate UI feedback
  3. If save failed, UI reverts
```

### 7.10 State Export Format

```
TEST: e2e-090-export-format
PRIORITY: Medium
DESCRIPTION: Exported state is complete and valid
STEPS:
  1. Make various progress
  2. Export state
  3. Verify JSON valid
  4. All expected fields present
```

---

## Category 8: Performance (5 tests)

### 8.1 Initial Load Time

```
TEST: e2e-091-load-time
PRIORITY: High
DESCRIPTION: App loads within 3 seconds
STEPS:
  1. Navigate to app fresh
  2. Measure time to interactive
  3. Assert under 3 seconds
```

### 8.2 Quiz Import Performance

```
TEST: e2e-092-import-performance
PRIORITY: High
DESCRIPTION: Large quiz imports in reasonable time
STEPS:
  1. Import 1000 question quiz
  2. Measure import time
  3. Assert under 5 seconds
```

### 8.3 Navigation Performance

```
TEST: e2e-093-nav-performance
PRIORITY: Medium
DESCRIPTION: Navigation between questions instant
STEPS:
  1. Measure question transition time
  2. Assert under 100ms
```

### 8.4 No Memory Leaks

```
TEST: e2e-094-memory
PRIORITY: Medium
DESCRIPTION: Memory stable during extended use
STEPS:
  1. Answer 50 questions
  2. Check memory growth
  3. Assert bounded growth
```

### 8.5 Layout Stability

```
TEST: e2e-095-layout-stability
PRIORITY: Medium
DESCRIPTION: No layout shifts during use
STEPS:
  1. Measure CLS during quiz
  2. Assert low CLS score
```

---

## Category 9: Edge Cases (5 tests)

### 9.1 Very Long Session

```
TEST: e2e-096-long-session
PRIORITY: Medium
DESCRIPTION: App stable during long session
STEPS:
  1. Use app for 100 questions
  2. No degradation
  3. Memory stable
```

### 9.2 Minimum Viable Quiz

```
TEST: e2e-097-minimum-quiz
PRIORITY: Medium
DESCRIPTION: Smallest valid quiz works
STEPS:
  1. Import 1 chapter, 1 question quiz
  2. Complete it
  3. Stats correct
```

### 9.3 Maximum Scale Quiz

```
TEST: e2e-098-maximum-quiz
PRIORITY: Medium
DESCRIPTION: Maximum expected quiz size works
STEPS:
  1. Import quiz at size limit
  2. Navigate through
  3. All features work
```

### 9.4 Interrupted Operations

```
TEST: e2e-099-interrupted
PRIORITY: Medium
DESCRIPTION: Interrupted operations don't corrupt
STEPS:
  1. Start import, navigate away
  2. Start export, close modal
  3. Verify clean state
```

### 9.5 Simultaneous Operations

```
TEST: e2e-100-simultaneous
PRIORITY: Medium
DESCRIPTION: Simultaneous operations handled
STEPS:
  1. Import while export in progress
  2. Submit while navigating
  3. Verify deterministic outcome
```

---

## Summary

| Category         | Tests   | Priority Distribution               |
| ---------------- | ------- | ----------------------------------- |
| User Journeys    | 15      | 5 Critical, 7 High, 3 Medium        |
| Data Integrity   | 15      | 3 Critical, 9 High, 3 Medium        |
| UI/UX            | 15      | 2 Critical, 9 High, 4 Medium        |
| Accessibility    | 15      | 0 Critical, 10 High, 5 Medium       |
| Security         | 10      | 3 Critical, 6 High, 1 Medium        |
| Error Handling   | 10      | 1 Critical, 7 High, 2 Medium        |
| State Management | 10      | 0 Critical, 5 High, 5 Medium        |
| Performance      | 5       | 0 Critical, 2 High, 3 Medium        |
| Edge Cases       | 5       | 0 Critical, 0 High, 5 Medium        |
| **Total**        | **100** | **14 Critical, 55 High, 31 Medium** |
