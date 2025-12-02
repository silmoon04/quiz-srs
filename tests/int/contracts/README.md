# Behavioral Contract Tests

This directory contains **behavioral contract tests** that define the required behavior of the Quiz-SRS application. These tests serve as a **specification** that any implementation must satisfy.

## Purpose

These tests are designed for:

1. **TDD (Test-Driven Development)**: Write contracts first, then implement
2. **Major Refactoring**: Contracts survive architectural changes
3. **Regression Prevention**: Ensure critical behaviors never break
4. **Documentation**: Serve as executable specifications

## Key Principles

### Implementation-Agnostic

These tests focus on **WHAT** the system should do, not **HOW** it's done:

- ✅ "Correct answer should be marked as correct"
- ❌ "The `useState` hook should update correctly"

### Behavior-Focused

Tests describe user-visible behavior:

- ✅ "User's incorrect selection should be highlighted"
- ❌ "CSS class `bg-red-100` should be applied"

### Stable Through Refactoring

The same tests should pass whether:

- State is in React context, Redux, Zustand, or props
- UI is built with Tailwind, styled-components, or CSS modules
- Components are class-based or functional

## Test Files

| File                                                                     | Purpose                                     | Tests |
| ------------------------------------------------------------------------ | ------------------------------------------- | ----- |
| [answer-feedback.contract.test.ts](answer-feedback.contract.test.ts)     | Answer display (correct/incorrect feedback) | 12    |
| [navigation-state.contract.test.ts](navigation-state.contract.test.ts)   | State persistence across navigation         | 22    |
| [import-export.contract.test.ts](import-export.contract.test.ts)         | File import/export operations               | 28    |
| [accessibility.contract.test.ts](accessibility.contract.test.ts)         | WCAG compliance, keyboard nav, ARIA         | 42    |
| [ui-consistency.contract.test.ts](ui-consistency.contract.test.ts)       | Button labels, toast timing, validation     | 30    |
| [content-rendering.contract.test.ts](content-rendering.contract.test.ts) | Markdown, LaTeX, code block rendering       | 40    |
| [data-integrity.contract.test.ts](data-integrity.contract.test.ts)       | Unique IDs, SRS state, statistics           | 33    |

## Running the Tests

```bash
# Run all contract tests
npm run test:int -- tests/int/contracts

# Run specific contract
npm run test:int -- tests/int/contracts/answer-feedback.contract.test.ts

# Run with verbose output
npm run test:int -- tests/int/contracts --reporter=verbose
```

## Critical Issues Covered

These contracts address the bugs documented in `docs/consolidated-audit-plan.md`:

### Answer Feedback (Issue 2)

- ✅ Correct answer highlighted in green
- ✅ User's incorrect selection highlighted in red
- ✅ Both visible simultaneously

### Navigation State (Section 2)

- ✅ Answer persists when navigating away and back
- ✅ No pre-selection on fresh questions
- ✅ Option order remains stable
- ✅ All Questions view shows accurate progress

### Import/Export (Section 3)

- ✅ Export triggers actual download
- ✅ Import commits state before showing toast
- ✅ "Load New Module" is functional
- ✅ Cross-browser download compatibility

### Accessibility (Section 5)

- ✅ Keyboard navigation (Enter, Space, Arrows)
- ✅ Focus indicators visible (3:1 contrast)
- ✅ Focus vs selection visually distinct
- ✅ Non-color feedback (icons + labels)
- ✅ Modal focus traps

### Content Rendering (Section 1)

- ✅ Inline math renders once (no duplication)
- ✅ LaTeX commands not double-escaped
- ✅ Display math formatted correctly
- ✅ Code blocks preserve formatting
- ✅ MathML elements not stripped

### Data Integrity (ARD-002, ARD-004)

- ✅ Unique question IDs across module
- ✅ correctOptionIds reference valid options
- ✅ SRS state internally consistent
- ✅ Chapter statistics accurate

## Writing New Contracts

When adding a new contract:

1. **Reference the docs**: Link to the issue in `consolidated-audit-plan.md`
2. **Describe expected behavior**: In comments, explain what SHOULD happen
3. **Use pure functions**: Test logic without React/DOM dependencies where possible
4. **Name with CONTRACT prefix**: Makes intent clear in test output
5. **Group logically**: Related contracts in same describe block

### Template

```typescript
describe('Feature Contract - Category', () => {
  /**
   * CONTRACT: Brief description of the requirement
   *
   * Reference: docs/consolidated-audit-plan.md - Section X
   */

  describe('CONTRACT: Specific Requirement', () => {
    it('should [expected behavior]', () => {
      // Arrange
      const input = /* ... */;

      // Act
      const result = /* ... */;

      // Assert
      expect(result).toBe(/* expected */);
    });
  });
});
```

## E2E Contract Tests

For full user flow testing, see:

- [tests/e2e/user-flow-contracts.spec.ts](../../e2e/user-flow-contracts.spec.ts)

These Playwright tests verify end-to-end behavior in real browsers.

## Relationship to Other Tests

| Test Type          | Purpose                  | Changes With Implementation? |
| ------------------ | ------------------------ | ---------------------------- |
| **Contract Tests** | Define required behavior | ❌ No                        |
| Unit Tests         | Test specific functions  | ✅ Yes                       |
| Component Tests    | Test React components    | ✅ Yes                       |
| E2E Tests          | Test full user flows     | ❌ No                        |

## Maintenance

When refactoring:

1. Run contracts first: `npm run test:int -- tests/int/contracts`
2. If contracts pass, your refactor preserved required behavior
3. If contracts fail, fix the implementation (not the tests)

When adding features:

1. Write contract tests for expected behavior
2. Ensure existing contracts still pass
3. Implement the feature
4. All contracts should pass before merging
