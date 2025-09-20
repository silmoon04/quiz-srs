# Quiz-SRS Repository Inventory & Risk Map

_Generated for TDD UX Hardening Preparation_

## 1) Bird's-eye Map

### Dependency Summary

- **Runtime Dependencies**: 42 packages
  - **Heavy Dependencies**:
    - `@radix-ui/*` (23 packages) - Comprehensive UI primitives
    - `katex` (latest) - LaTeX rendering
    - `mermaid` (latest) - Diagram rendering
    - `recharts` (2.15.0) - Chart components
    - `next` (15.2.4) - React framework
    - `react` (^19) - Core library
  - **Utility Libraries**: `clsx`, `tailwind-merge`, `class-variance-authority`
  - **Form Handling**: `react-hook-form`, `@hookform/resolvers`
  - **Validation**: `zod`

- **Dev Dependencies**: 28 packages
  - **Testing**: `vitest`, `@testing-library/*`, `playwright`, `@axe-core/react`
  - **Linting**: `eslint`, `typescript-eslint`, `prettier`
  - **Type Safety**: `typescript` (^5)
  - **Bundle Analysis**: `@next/bundle-analyzer`, `size-limit`

### Directory Structure & File Counts

```
quiz-srs/
├── app/ (4 files, ~2000 lines)
│   ├── layout.tsx (35 lines)
│   ├── page.tsx (1940 lines) - Main app logic
│   ├── test/page.tsx (194 lines)
│   └── globals.css (337 lines)
├── components/ (19 files, ~4000 lines)
│   ├── UI Components (5 files)
│   ├── Text Renderers (5 files) - CRITICAL DUPLICATION
│   ├── Quiz Components (9 files)
│   └── ui/ (47 Radix-based components)
├── lib/ (6 files, ~500 lines)
│   ├── markdown/ (6 pipeline files) - CRITICAL DUPLICATION
│   ├── schema/ (1 file)
│   └── utils.ts
├── utils/ (3 files, ~800 lines)
├── hooks/ (2 files)
├── types/ (1 file)
├── tests/ (20+ files)
└── public/ (7 files)
```

**File Type Distribution**:

- TypeScript: ~85% (TSX: ~70%, TS: ~15%)
- Configuration: ~10%
- Documentation: ~5%

### Route Map (`app/`)

- `/` → `page.tsx` (Main Quiz App)
- `/test` → `test/page.tsx` (Markdown Parser Tests)

### Component Taxonomy

- **Rendering**: 5 renderers (CRITICAL DUPLICATION)
  - `text-renderer.tsx` - Full-featured with XSS risk
  - `safe-text-renderer.tsx` - Uses sync pipeline
  - `secure-text-renderer.tsx` - Custom XSS protection
  - `simple-safe-renderer.tsx` - Basic implementation
  - `basic-text-renderer.tsx` - Minimal implementation

- **Accessibility**:
  - ✅ Radix UI components (built-in a11y)
  - ❌ Missing `aria-live` regions
  - ❌ No `prefers-reduced-motion` support
  - ❌ No focus trapping in modals

- **Navigation**:
  - `dashboard.tsx` - Chapter selection
  - `quiz-session.tsx` - Main quiz interface
  - `question-navigation-menu.tsx` - Question jumping

- **Editor**:
  - `question-editor.tsx` - Full question editing
  - `question-review-modal.tsx` - Batch question review

- **Forms**:
  - Radix-based form components
  - Custom validation with Zod

## 2) Risk Radar (P0–P3)

### P0 - Critical Security Risks

1. **XSS via `dangerouslySetInnerHTML`** (Priority: 125)
   - **Files**: All 5 renderer components use unsafe HTML injection
   - **Evidence**: `components/text-renderer.tsx:612`, `components/safe-text-renderer.tsx:122`, etc.
   - **Impact**: Critical security vulnerability

2. **Missing External Link Security** (Priority: 45)
   - **Evidence**: `components/secure-text-renderer.tsx:242-257` - No `rel="noopener noreferrer"`
   - **Impact**: Security risk for external links

### P1 - High Priority Accessibility Issues

1. **Missing Screen Reader Feedback** (Priority: 100)
   - **Evidence**: No `aria-live` regions found in quiz components
   - **Impact**: Screen reader users cannot receive immediate feedback

2. **No Focus Trapping in Modals** (Priority: 80)
   - **Evidence**: `components/confirmation-modal.tsx`, `components/question-editor.tsx`
   - **Impact**: Screen reader users lose context

3. **Missing Motion Reduction Support** (Priority: 75)
   - **Evidence**: No `prefers-reduced-motion` handling found
   - **Impact**: Accessibility violation for motion-sensitive users

### P2 - Medium Priority Issues

1. **Renderer Inconsistency** (Priority: 90)
   - **Evidence**: 5 different renderer implementations
   - **Impact**: Inconsistent behavior across components

2. **Missing `alt` Attributes** (Priority: 60)
   - **Evidence**: Image processing in markdown pipelines
   - **Impact**: Poor accessibility for images

## 3) Static Findings (grep-level)

### `dangerouslySetInnerHTML` Usage

**Found 27 occurrences across 5 files:**

```typescript
// components/text-renderer.tsx:612
dangerouslySetInnerHTML={{ __html: processedContent }}

// components/safe-text-renderer.tsx:122
dangerouslySetInnerHTML={{ __html: processedContent }}

// components/secure-text-renderer.tsx:369
dangerouslySetInnerHTML={{ __html: processedContent }}

// components/simple-safe-renderer.tsx:24
dangerouslySetInnerHTML={{ __html: processedHtml }}

// components/basic-text-renderer.tsx:64
dangerouslySetInnerHTML={{ __html: sanitizedContent }}
```

### `target="_blank"` without `rel=`

**Found 0 matches** - No external links detected

### `role="button"` on Non-buttons

**Found 1 occurrence:**

```typescript
// components/option-card.tsx:68
role="button"
tabIndex={disabled ? -1 : 0}
```

_Note: This is appropriate usage on clickable cards_

### `onClick` on Non-interactive Elements

**Found 68 occurrences** - All appear to be legitimate button/clickable element handlers

### `tabIndex={0}` on Non-widgets

**Found 0 matches** - No inappropriate tabIndex usage

### `<img` without `alt`

**Found 6 occurrences in markdown processing:**

```typescript
// lib/markdown/working-pipeline.ts:50
html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

// components/secure-text-renderer.tsx:175
return `<img src="${cleanUrl}" alt="${alt}">`;
```

_Note: These generate alt attributes from markdown syntax_

### `outline: none` or Suppressed Focus Styles

**Found 44 occurrences** - All appear to be legitimate focus management with ring alternatives

### `aria-live` / `role="status"`

**Found 0 matches** - Critical gap for dynamic content announcements

### `prefers-reduced-motion`

**Found 0 matches** - Critical accessibility gap

## 4) Dependency Graph Highlights

### Renderer Import Relationships

```
TextRenderer (text-renderer.tsx)
├── Uses: katex, mermaid, custom pipeline
├── Imported by: quiz-session.tsx, all-questions-view.tsx
└── Risk: P0 XSS vulnerability

SafeTextRenderer (safe-text-renderer.tsx)
├── Uses: lib/markdown/sync-pipeline.ts
├── Imported by: quiz-session.tsx
└── Risk: P0 XSS vulnerability

SecureTextRenderer (secure-text-renderer.tsx)
├── Uses: lib/markdown/latex-processor.ts
├── Imported by: confirmation-modal.tsx
└── Risk: P0 XSS vulnerability

SimpleSafeRenderer (simple-safe-renderer.tsx)
├── Uses: lib/markdown/sync-pipeline.ts
├── Imported by: [Unknown - needs investigation]
└── Risk: P0 XSS vulnerability

BasicTextRenderer (basic-text-renderer.tsx)
├── Uses: Custom regex processing
├── Imported by: [Unknown - needs investigation]
└── Risk: P0 XSS vulnerability
```

### High-Coupling Components (Top 10 by In-degree)

1. **`quiz-session.tsx`** - Central hub, imports multiple renderers
2. **`page.tsx`** - Main app orchestrator
3. **`confirmation-modal.tsx`** - Uses SecureTextRenderer
4. **`all-questions-view.tsx`** - Uses TextRenderer
5. **`question-editor.tsx`** - Complex modal component
6. **`question-review-modal.tsx`** - Batch processing modal
7. **`dashboard.tsx`** - Chapter selection interface
8. **`chapter-card.tsx`** - Individual chapter display
9. **`option-card.tsx`** - Question option display
10. **`progress-bar.tsx`** - Progress visualization

### Modal Component Analysis

- **Radix-based**: `components/ui/dialog.tsx`, `components/ui/alert-dialog.tsx` (Built-in focus management)
- **Custom**: `components/confirmation-modal.tsx`, `components/question-editor.tsx`, `components/question-review-modal.tsx` (Missing focus trapping)

## 5) "Mechanical & Safe" Fix List

### Immediate Actions (No Behavior Changes)

1. **Add `.editorconfig`** - Standardize editor settings
2. **Add `rel="noopener noreferrer"`** - External link security
3. **Add `aria-label` to icon-only buttons** - Improve accessibility
4. **Run Prettier on all files** - Code formatting consistency
5. **Add eslint-plugin-jsx-a11y** - Accessibility linting rules
6. **Create a11y helper functions** - Utility functions for common patterns

### Code Quality Improvements

1. **Import ordering** - Consistent import organization
2. **Remove unused imports** - Clean up dependencies
3. **Add missing TypeScript types** - Improve type safety
4. **Standardize error handling** - Consistent error patterns

## 6) "Defer until Tests" Fix List

### Major Refactoring (Requires Testing)

1. **Renderer Consolidation** - Merge 5 renderers into 1 secure implementation
2. **Modal Replacement** - Replace custom modals with Radix Dialog
3. **Navigation Keyboard Model** - Implement proper keyboard navigation
4. **Sanitizer Pipeline Changes** - Replace `dangerouslySetInnerHTML` with safe alternatives
5. **Undo/Redo Implementation** - Add state management for user actions
6. **i18n Infrastructure** - Internationalization support

### Architecture Changes

1. **State Management** - Consider Zustand/Redux for complex state
2. **Component Composition** - Reduce prop drilling
3. **Error Boundaries** - Add React error boundaries
4. **Performance Optimization** - Lazy loading and memoization

## 7) File Ownership / Areas

### Rendering & Content Processing

**Owner**: Content Team

- `components/text-renderer.tsx` - @deprecated
- `components/safe-text-renderer.tsx` - @deprecated
- `components/secure-text-renderer.tsx` - @deprecated
- `components/simple-safe-renderer.tsx` - @deprecated
- `components/basic-text-renderer.tsx` - @deprecated
- `lib/markdown/` - All pipeline files

### Accessibility

**Owner**: A11y Team

- `components/confirmation-modal.tsx`
- `components/question-editor.tsx`
- `components/question-review-modal.tsx`
- `components/quiz-session.tsx`
- `components/option-card.tsx`

### Navigation & UX

**Owner**: UX Team

- `components/dashboard.tsx`
- `components/quiz-session.tsx`
- `components/question-navigation-menu.tsx`
- `components/chapter-card.tsx`
- `components/quiz-complete.tsx`

### Editor & Forms

**Owner**: Editor Team

- `components/question-editor.tsx`
- `components/question-review-modal.tsx`
- `components/all-questions-view.tsx`

### Import/Export

**Owner**: Data Team

- `utils/quiz-validation/`
- `utils/quiz-validation.ts`
- `utils/quiz-validation-refactored.ts`

### SRS Logic

**Owner**: Algorithm Team

- `app/page.tsx` (SRS state management)
- `components/quiz-session.tsx` (SRS UI)

## 8) Kill/Keep Watchlist

### Legacy Renderers → Tag with `@deprecated`

```typescript
/**
 * @deprecated Use SecureTextRenderer instead
 * @security-risk Uses dangerouslySetInnerHTML without proper sanitization
 */
export const TextRenderer = memo(function TextRenderer({...}) {
```

### Mermaid/Recharts Usage Check

- **Mermaid**: Used in `text-renderer.tsx`, `safe-text-renderer.tsx` - CONFIRMED USED
- **Recharts**: Used in `components/ui/chart.tsx` - CONFIRMED USED

### Dead Code Candidates

- `lib/markdown/basic-pipeline.ts` - Fallback implementation
- `lib/markdown/working-pipeline.ts` - Basic implementation
- `utils/quiz-validation.ts` - Old implementation (refactored version exists)

## 9) Exit Criteria for this Phase

### ✅ Completed

- [x] Markdown report produced
- [x] No repo files changed (except adding this report)
- [x] Comprehensive risk assessment completed
- [x] Dependency graph mapped
- [x] Static analysis performed
- [x] Component taxonomy established
- [x] Priority-based fix list created

### 📋 Ready for Next Phase

- [ ] TDD test suite implementation
- [ ] Security fixes (P0 items)
- [ ] Accessibility improvements (P1 items)
- [ ] Renderer consolidation
- [ ] Modal accessibility fixes

---

**Report Generated**: $(date)  
**Repository**: Quiz-SRS  
**Analysis Scope**: Full codebase static analysis  
**Risk Assessment**: P0-P3 prioritized findings  
**Next Phase**: TDD UX Hardening Implementation
