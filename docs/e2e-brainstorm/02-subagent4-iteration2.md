# Subagent 4: Visual Regression - Iteration 2

## Focus Area

UI consistency, layout issues, responsive design, visual bugs

---

## Generated E2E Test Ideas

### SA4-011: Correct/incorrect option colors visible and distinct

- **Scenario**: Submit answer, see feedback colors
- **Risk**: Colors too similar, or invisible in some themes
- **Test**: Screenshot comparison of feedback states in both themes

### SA4-012: Long question text doesn't overflow container

- **Scenario**: Question is a full paragraph
- **Risk**: Text bleeds into margins or other elements
- **Test**: Load long question, verify contained properly

### SA4-013: Code blocks in questions render with proper formatting

- **Scenario**: Question contains `code` blocks
- **Risk**: Code loses formatting, appears inline
- **Test**: Load code question, verify code block styling

### SA4-014: LaTeX equations render at readable size

- **Scenario**: Complex math equation in question
- **Risk**: Equation too small or overlaps text
- **Test**: Load LaTeX question, verify equation visible and sized

### SA4-015: Mobile viewport shows full question without scroll

- **Scenario**: View quiz on 375px width screen
- **Risk**: Critical content below fold, not obvious to scroll
- **Test**: Set mobile viewport, verify question visible

### SA4-016: Progress bar accurately reflects question count

- **Scenario**: 10 question quiz, at question 5
- **Risk**: Progress bar shows wrong percentage
- **Test**: Navigate to specific question, verify bar position

### SA4-017: Selected option visual state clearly different

- **Scenario**: Click to select an option
- **Risk**: Selected state looks like hover state
- **Test**: Select option, move mouse away, verify selection visible

### SA4-018: Disabled buttons appear disabled

- **Scenario**: Submit button disabled when no option selected
- **Risk**: Button looks clickable but isn't
- **Test**: Screenshot button in disabled state, verify visual cue

### SA4-019: Icons load and display correctly (no broken images)

- **Scenario**: UI icons for navigation, actions
- **Risk**: Icons fail to load, show broken image
- **Test**: Scan for broken image elements

### SA4-020: Toast notifications don't overlap each other

- **Scenario**: Multiple toasts shown
- **Risk**: Toasts stack on same position, unreadable
- **Test**: Trigger multiple toasts, verify stacking/positioning
