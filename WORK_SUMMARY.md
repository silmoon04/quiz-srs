# Work Summary - 2025-10-28

## What Was Done

### ✅ Completed: Partial KaTeX Sanitization Fix

**Problem:** Inline math expressions were duplicating (e.g., `O(n2)O(n^2)`) because the sanitizer was stripping KaTeX's MathML tags and CSS classes.

**Solution:**

1. Updated `lib/markdown/pipeline.ts` sanitization schema:
   - Extended `defaultSchema` from `rehype-sanitize` instead of replacing it
   - Added all KaTeX MathML tags (`math`, `semantics`, `mrow`, `mi`, `mo`, `mn`, etc.)
   - **Critical fix:** Added `className` and `style` to wildcard attributes - the default schema doesn't include these!
   - Added `aria-hidden` to spans for screen reader compatibility
2. Removed `sanitizeFallback` function that was bypassing KaTeX and causing duplicates

3. Re-enabled KaTeX test suite in `tests/unit/renderer/latex-functionality.test.tsx`

**Results:**

- ✅ 4/13 tests passing (all inline math tests)
- ✅ Inline math (`$x = y$`) now renders correctly
- ✅ MathML structure preserved for accessibility
- ⚠️ Display math (`$$...$$`) still has issues (6/13 tests failing)

**Test Output:**

```
✅ should render inline math correctly
✅ should render multiple inline math expressions
✅ should handle inline math with special characters
✅ should handle inline math with fractions

❌ should render display math correctly (needs .katex-display class)
❌ should render multiple display math expressions
❌ should handle display math with complex expressions
❌ should handle display math with matrices (KaTeX parse error)
```

---

## 🚨 Critical Issues Discovered

### Issue 1: Duplicate Question IDs

**Error:**

```
Error: Encountered two children with the same key, `ch_iterative_bigo_2_q9`.
Keys should be unique so that components maintain their identity across updates.
```

**Impact:**

- React reconciliation errors causing unpredictable UI behavior
- Questions may be duplicated or omitted from rendering
- Console flooding with error messages

**Root Cause:**

- Quiz data contains duplicate question IDs
- `AccessibleQuestionGrid.tsx` line 184 uses questionId as React key
- No validation during import to check for unique IDs

**Fix Required:**

1. Add ID uniqueness validation to quiz import
2. Scan and fix existing quiz files with duplicates
3. Implement automatic deduplication (append `-1`, `-2` suffixes)
4. Use composite keys in React: `${chapterId}-${questionId}-${index}`

---

### Issue 2: Incorrect Answer Feedback Not Showing

**Severity:** Critical (UX) - Users can't learn from mistakes!

**Problem:**
When selecting a wrong answer and clicking submit:

- ✅ Correct answer shows in green
- ❌ User's incorrect selection does NOT show in red
- User can't see what they selected

**Expected:**

- Correct answer: Green background
- Wrong selection: Red background
- Both visible simultaneously

**Root Cause (Hypothesis):**

- Selection state (`selectedOptionId`) being cleared during submission
- UI only rendering `correctOptionIds` without preserving user's choice
- Related to state management issues in Section 2 of audit plan

**Fix Required:**

1. Preserve `selectedOptionId` after submission
2. Update `OptionCard` to show both correct AND selected states:
   ```tsx
   className={cn(
     isCorrect && 'bg-green-100 border-green-500',
     isSelected && !isCorrect && 'bg-red-100 border-red-500'
   )}
   ```
3. Add visual regression test
4. Add E2E test: "submit wrong answer -> verify red highlight"

**Priority:** Fix alongside Phase 2 (Answer Ledger Refactor)

---

## Documentation Updates

Updated `docs/consolidated-audit-plan.md` with:

1. **ARD-001** - Architecture Decision Record for KaTeX sanitization fix
   - Documents what was changed and why
   - Lists alternatives considered
   - Shows test results (4/13 passing)
   - Lists follow-up work needed

2. **Critical Issues Discovered** section
   - Issue 1: Duplicate question IDs with React keys
   - Issue 2: Incorrect answer feedback not showing

3. **Phase 1 Status Update**
   - Marked as "🟡 Partially Completed"
   - Updated symptoms with completion status
   - Updated remaining work list

---

## Files Modified

```
✅ lib/markdown/pipeline.ts
   - Updated sanitizeSchema with MathML tags
   - Added className and style to wildcard attributes
   - Removed sanitizeFallback function

✅ tests/unit/renderer/latex-functionality.test.tsx
   - Removed .skip to re-enable test suite

✅ docs/consolidated-audit-plan.md
   - Added ARD-001
   - Added Critical Issues section
   - Updated Phase 1 status

✅ test-katex-output.mjs removed (temporary debugging file cleanup)
```

---

## Next Steps

### Immediate (Manual Verification Needed)

1. **Test inline math rendering:**
   - Load a quiz with inline math like `$O(n^2)$`
   - Verify no duplication
   - Verify proper styling

2. **Verify the duplicate ID error:**
   - Open browser console
   - Look for the `ch_iterative_bigo_2_q9` error
   - Note which quiz file is causing it

3. **Test incorrect answer feedback:**
   - Select a wrong answer
   - Click submit
   - Check if your wrong selection shows in red

### Short-term (Fix Remaining Issues)

1. **Fix display math** (complete Phase 1)
   - Investigate why `$$...$$` doesn't generate `.katex-display` class
   - Fix matrix rendering KaTeX parse errors
   - Get remaining 9/13 tests passing

2. **Fix duplicate question IDs**
   - Add validation to quiz import
   - Scan and fix quiz data files
   - Implement deduplication strategy

3. **Fix incorrect answer feedback**
   - Preserve selectedOptionId after submission
   - Update OptionCard styling logic
   - Add tests

### Long-term (Continue Audit Plan)

- Phase 2: State Management (Answer Ledger Refactor)
- Phase 3: Import/Export
- Phase 4: Structural Refactor
- Phase 5: UI/UX Polish

---

## Commit

```bash
git commit -m "fix: Partial KaTeX sanitization fix and document new issues"
```

Commit hash: `6289b25`

---

## How to Verify

### Test Inline Math (Should Work ✅)

1. Start dev server: `pnpm dev`
2. Load a quiz with inline math
3. Look for expressions like `$O(n^2)$` or `$x = y$`
4. Verify they render as styled math (not duplicated text)

### Check Console Errors (Will Show Issues ❌)

1. Open browser DevTools console
2. Load quiz
3. Look for duplicate key errors: `ch_iterative_bigo_2_q9`

### Test Wrong Answer Feedback (Will Show Issue ❌)

1. Start a quiz
2. Select a wrong answer
3. Click Submit
4. Check if your selection shows in red (it won't - this is the bug)

---

**Status:** Partial fix complete. Ready for manual verification and next phase.
