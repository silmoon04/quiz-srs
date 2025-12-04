# Quiz-SRS Architecture

**Last Updated:** December 4, 2025

---

## Overview

Quiz-SRS is a Next.js 15 application implementing a spaced repetition system (SRS) for multiple-choice quizzes. The architecture follows a layered approach with clear separation between UI, state management, and business logic.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   Pages     │ │  Components │ │     UI      │   │
│  │  (app/)     │ │ (components)│ │ (Shadcn)    │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│                  State Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   Zustand   │ │   Custom    │ │  React      │   │
│  │   Store     │ │   Hooks     │ │  State      │   │
│  │  (store/)   │ │  (hooks/)   │ │  (page.tsx) │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│                Business Logic Layer                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  SRS Engine │ │  Validation │ │   Schema    │   │
│  │ (lib/engine)│ │  (utils/)   │ │ (lib/schema)│   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│              Cross-Cutting Concerns                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   Types     │ │  Markdown   │ │ Persistence │   │
│  │  (types/)   │ │ (lib/markdown)│(localStorage)│  │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
quiz-srs/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout (fonts, analytics)
│   ├── page.tsx             # Main app (Refactored to use Feature Containers)
│   ├── globals.css          # Global styles
│   └── test/                # Test utilities page
│
├── features/                # Feature Modules (New Architecture)
│   ├── dashboard/          # Dashboard Feature
│   │   ├── DashboardContainer.tsx
│   │   └── DashboardView.tsx
│   ├── question-editor/    # Editor Feature
│   │   ├── QuestionEditorContainer.tsx
│   │   └── QuestionEditorView.tsx
│   ├── quiz-session/       # Quiz Session Feature
│   │   ├── QuizSessionContainer.tsx
│   │   └── QuizSessionView.tsx
│   └── srs-review/         # SRS Review Feature
│       ├── SrsReviewContainer.tsx
│       └── SrsReviewView.tsx
│
├── components/              # Shared React Components
│   ├── a11y/               # Accessibility components
│   ├── rendering/          # Content rendering
│   ├── ui/                 # Shadcn UI primitives
│   └── [Shared Components] # Generic components used across features
│
├── hooks/                   # Custom React Hooks
│   ├── use-mobile.tsx      # Mobile detection
│   ├── use-quiz-persistence.ts  # Persistence hook
│   └── [Feature Hooks]     # Feature-specific logic
│
├── lib/                     # Business Logic
│   ├── engine/             # SRS Algorithm (Pure Functions)
│   ├── markdown/           # Markdown Processing
│   ├── schema/             # Zod Schemas
│   └── utils.ts            # Generic utilities
│
├── services/                # Service Layer
│   └── persistence/        # Persistence implementations
│
├── store/                   # Zustand State Management
│   ├── index.ts            # Store exports
│   └── quiz-store.ts       # Global state
│
├── types/                   # TypeScript Definitions
│
└── tests/                   # Test Suite
```

---

## Feature Architecture

The application has been refactored to use a feature-based architecture, improving maintainability and scalability.

### Feature-Based Folder Structure

Code is organized by feature domain rather than technical type. Each feature folder contains its own Container, View, and related logic.

### Container/Presentation Pattern

We strictly separate logic from UI:

- **Containers (`*Container.tsx`):** Handle state, side effects, and data fetching. They pass data and callbacks to Views.
- **Views (`*View.tsx`):** Pure UI components. They receive data via props and emit events via callbacks. They contain no business logic.

### Custom Hooks

Logic is extracted into custom hooks for reusability and testing:

- `useQuizSession`: Manages quiz state and navigation.
- `useQuestionEditor`: Manages question editing state.
- `useDashboard`: Manages dashboard data and interactions.

### Dependency Injection

Persistence is handled via Dependency Injection to allow easy swapping of storage mechanisms (e.g., LocalStorage vs. API):

- `PersistenceService` interface defines the contract.
- `LocalStorageService` implements the interface.
- Services are injected into hooks or stores.

---

## Key Design Patterns

### 1. Pure Functions for Business Logic

The SRS engine uses pure functions for testability:

```typescript
// lib/engine/srs.ts
export function calculateNextReview(input: SrsInput, isCorrect: boolean): SrsResult {
  // No side effects, fully deterministic
  // Easy to unit test
}
```

### 2. Component Composition

UI components follow the composition pattern:

```
QuizSession
├── QuestionDisplay
│   └── MarkdownRenderer
├── OptionList
│   └── OptionCard (x4)
├── ProgressBar
└── NavigationButtons
```

### 3. State Slices (Zustand)

State is organized into logical slices:

```typescript
// store/quiz-store.ts
interface QuizStore {
  // Session Slice
  currentQuestionIndex: number;
  isQuizActive: boolean;

  // Questions Slice
  questions: QuizQuestion[];
  answerHistory: Map<string, AnswerRecord>;

  // UI Slice
  showExplanation: boolean;
  isSubmitting: boolean;

  // SRS Slice
  srsLevels: Map<string, number>;
  nextReviewDates: Map<string, Date>;
}
```

### 4. Validation at Boundaries

Data is validated at import boundaries:

```
JSON Input → validateQuizModule() → Normalized QuizModule → Components
```

---

## Data Flow

### Quiz Loading

```
1. User imports JSON/Markdown
2. parseQuizFile() → Raw object
3. validateQuizModule() → Validation result
4. normalizeQuizModule() → Clean QuizModule
5. setCurrentModule() → State update
6. Components re-render
```

### Answer Submission

```
1. User selects option
2. handleSubmitAnswer()
3. calculateNextReview() → SRS calculation (pure)
4. Update question state
5. recalculateChapterStats()
6. Persist to localStorage
```

---

## Testing Strategy

| Layer       | Test Type  | Tool         | Coverage Target |
| ----------- | ---------- | ------------ | --------------- |
| SRS Engine  | Unit       | Vitest       | 100%            |
| Validation  | Unit       | Vitest       | 100%            |
| Components  | Unit       | Vitest + RTL | 80%+            |
| Hooks       | Unit       | Vitest       | 80%+            |
| Integration | Contract   | Vitest       | Key paths       |
| E2E         | User flows | Playwright   | Critical paths  |
| A11y        | WCAG       | Vitest       | WCAG 2.1 AA     |

---

## Dependencies (Runtime)

| Package       | Purpose        | Used By          |
| ------------- | -------------- | ---------------- |
| `next`        | Framework      | App              |
| `react`       | UI             | All components   |
| `zustand`     | State          | store/           |
| `zod`         | Validation     | lib/schema/      |
| `@radix-ui/*` | UI primitives  | components/ui/   |
| `katex`       | Math rendering | MarkdownRenderer |
| `mermaid`     | Diagrams       | MarkdownRenderer |
| `rehype-*`    | Markdown       | lib/markdown/    |
| `unified`     | Markdown       | lib/markdown/    |

---

## Known Technical Debt

### 1. Monolithic page.tsx (HIGH)

- **Issue:** 2000+ lines, 13 useState, 28 handlers
- **Impact:** Hard to test, maintain, and extend
- **Solution:** Migrate to Zustand store, extract handlers

### 2. Bridge Hook (MEDIUM)

- **Issue:** `use-quiz-state.ts` is a temporary migration bridge
- **Impact:** Extra indirection during transition
- **Solution:** Remove after Zustand migration complete

### 3. Test Coverage Gaps (LOW)

- **Issue:** Some medium-confidence dead code flagged
- **Impact:** Tests exist but source unused
- **Solution:** Periodic cleanup audits

---

## Migration Plan: page.tsx → Zustand

### Phase 1: State Migration (Current)

1. [x] Create Zustand store with slices
2. [x] Create bridge hook (use-quiz-state)
3. [ ] Replace useState calls one-by-one

### Phase 2: Handler Migration

1. [ ] Move handleSubmitAnswer to store action
2. [ ] Move handleNextQuestion to store action
3. [ ] Move handleImportQuiz to store action

### Phase 3: Cleanup

1. [ ] Remove bridge hook
2. [ ] Merge use-quiz-persistence with Zustand persist
3. [ ] Split remaining UI logic into smaller components

---

## Extension Points

### Adding New Question Types

1. Extend `types/quiz-types.ts`:

```typescript
type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank';
```

2. Add validation in `lib/schema/quiz.ts`
3. Create new component in `components/`
4. Add case in `QuizSession.tsx`

### Adding New SRS Algorithms

1. Create new module in `lib/engine/`:

```typescript
// lib/engine/sm2.ts
export function calculateSM2Review(input: SM2Input, grade: number): SM2Result;
```

2. Update store to use new algorithm
3. Add tests in `tests/unit/engine/`

---

## Metrics

| Metric         | Current | Target |
| -------------- | ------- | ------ |
| Total Files    | 165     | <150   |
| Test Files     | 71      | 71     |
| Unit Tests     | 2062    | 2000+  |
| Test Coverage  | ~85%    | 90%+   |
| Bundle Size    | TBD     | <200KB |
| page.tsx Lines | ~2000   | <500   |
