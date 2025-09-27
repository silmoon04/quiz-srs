# MCQ Quiz Forge - Project README

This project implements a robust MCQ (Multiple Choice Question) quiz application using Next.js and TypeScript. It features a sophisticated Markdown parser for importing quiz content, a LaTeX correction utility, and a user-friendly interface for taking quizzes.

## Key Features

- **Dynamic Quiz Loading:** Quizzes are loaded from JSON files, which can be generated from Markdown.
- **Interactive Quiz Session:** Users can navigate questions, select answers, view explanations, and track their progress.
- **Markdown Importer:** A resilient Markdown parser converts specially formatted `.md` files into quiz modules. Supports Multiple-Choice (MCQ) and True/False (T/F) questions.
- **LaTeX Support:** Question and explanation text can include LaTeX, rendered using KaTeX.
- **Secure Text Rendering:** Advanced `SecureTextRenderer` component with complete XSS protection and rich markdown support.
- **LaTeX Correction Utility:** An automated tool to fix common LaTeX formatting errors in JSON content before parsing.
- **Spaced Repetition System (SRS) Concepts:** Basic SRS fields are included in the data model for future enhancements.
- **Comprehensive UI:** Includes components for question display, navigation, progress bars, completion screens, and toast notifications.
- **Validation & Normalization:** Ensures data integrity of quiz modules.

## 📚 Documentation

### Core Documentation

- **[SecureTextRenderer](docs/SecureTextRenderer.md)** - Complete API documentation and migration guide
- **[Testing Guide](docs/TESTING.md)** - Comprehensive testing documentation and AI agent instructions
- **[Changelog](CHANGELOG.md)** - Project history and version changes

### Quick Links

- **Getting Started**: Follow the installation and setup instructions below
- **Quiz Creation**: Use the [Markdown Quiz Format](#markdown-quiz-format-specification) to create quizzes
- **Import/Export**: Manage quiz data with the [Import/Export System](#importexport-system)
- **Customization**: Configure the application with [Customization Options](#customization)

## Refactoring Updates (June 2025)

The Markdown parser and related utilities have undergone a significant refactoring to enhance robustness, resilience, and data integrity for production readiness. Key improvements include:

- **Robust Block-Content Parser:**
  - A new internal helper function, `parseBlockContent`, has been implemented.
  - This function correctly handles multi-line content, including Markdown code blocks (e.g., \`\`\`python ... \`\`\`), ensuring that stoppers or special Markdown syntax within code blocks do not prematurely terminate content parsing.
  - This is now used for parsing question text, option text (for MCQs), and explanation text, making the parser resilient to complex embedded content.

- **Granular Error Handling and Recovery:**
  - Parsing for individual questions is now wrapped in `try...catch` blocks.
  - If a single question is malformed and causes a parsing error, a detailed error message (including the approximate line number) is logged.
  - A recovery mechanism (`recoverAndSkipToNextEntry`) attempts to advance the parser to the next valid question or chapter separator (`### Q:`, `### T/F:`, `## `, `---`), allowing the rest of the file to be processed.
  - This ensures that one bad question does not prevent the entire quiz module from being parsed.

- **Strict ID Uniqueness Enforcement:**
  - The parser now tracks all chapter IDs and question IDs encountered.
  - If a duplicate ID is found, a non-fatal `[Warning]` message is added to the error report. Parsing continues, but the user is alerted to potential data integrity issues.
  - If an ID is missing, a unique default ID is generated, and a warning is issued.

- **Hardened LaTeX Correction Utility:**
  - The `correctLatexInJsonContent` utility now uses a more conservative regular expression (`/"(?:[^"\\]|\\.)*(?:\${1,2})[^$]*?(?:\${1,2})(?:[^"\\]|\\.)*"/g`) to detect potential LaTeX content within JSON strings.
  - This pattern specifically targets strings that contain LaTeX math delimiters (`$...$` or `$$...$$`).
  - This change significantly reduces the risk of the utility incorrectly modifying valid non-LaTeX data (e.g., file paths, code snippets) that might have coincidentally contained backslashes or other LaTeX-like sequences. The trade-off is that LaTeX commands not enclosed in `$...$` or `$$...$$` within a JSON string value might not be automatically corrected by this specific utility.

- **Support for True/False Questions:**
  - The parser now supports a new True/False question type, identified by the `### T/F:` prefix.
  - These questions automatically generate "True" and "False" options and expect the correct answer to be specified as `True` or `False`.
  - T/F questions cannot have an `**Options:**` block.
  - The `QuizQuestion` type now includes an optional `type` field (`'mcq' | 'true_false'`), defaulting to `'mcq'` for backward compatibility.

- **Backward Compatibility:**
  - All refactoring changes, including the addition of T/F questions, have been implemented while maintaining backward compatibility with existing, valid Markdown quiz formats for MCQs. Features like alternate description formats (`_description_`), option prefixes (`**A1:**` vs. `- **A1:**`), and answer section headers (`**Correct:**` vs. `**Ans:**`) continue to be supported for MCQs.

These changes make the Markdown import process significantly more reliable, versatile, and suitable for production environments.

## Markdown Quiz Format Specification

The parser expects Markdown files to follow a specific structure:

\\`\`\`markdown

# Module Name

Description: Optional module description.
_Alternatively, descriptions can be like this._

---

## Chapter Name <!-- CH_ID: unique_chapter_id (Optional, but recommended) -->

Description: Optional chapter description.
_Or this format for chapter description._

---

### Q: This is an MCQ question. <!-- Q_ID: mcq_example_id -->

Question text can span multiple lines.

**Options:** (or **Opt:**)
**A1:** Option 1 text.

- **A2:** Option 2 text.

**Correct:** A1 (or **Ans:** A1)

**Exp:**
Explanation for the MCQ.

---

### T/F: This is a True/False question. <!-- Q_ID: tf_example_id -->

The earth is flat.

**Correct:** False (or **Ans:** False)

**Exp:**
The Earth is an oblate spheroid.

---

\\`\`\`

**Key Points:**

- **Module Header:** Starts with `# Module Name`. Description is optional. Separated by `---`.
- **Chapter Header:** Starts with `## Chapter Name`. Optional `<!-- CH_ID: your_id -->` comment for a stable ID. Description is optional. Separated by `---`.
- **Question Block (General):**
  - Optional `<!-- Q_ID: your_id -->` comment for a stable ID on the same line as the question header.
  - Question text can span multiple lines and include Markdown code blocks.
  - `**Correct:** {answer}` or `**Ans:** {answer}` section.
  - `**Exp:**` section for the explanation. Explanation text can be multi-line and include code blocks.
- **MCQ Specific (`### Q:`):**
  - Must have an `**Options:**` or `**Opt:**` section.
  - Options are prefixed with `**A{number}:**` (e.g., `**A1:**`) or `- **A{number}:**`. Option text can be multi-line and include code blocks.
  - Correct answer labels refer to the `A{number}` part (e.g., `A1, A3`).
- **True/False Specific (`### T/F:`):**
  - **Must NOT** have an `**Options:**` or `**Opt:**` section. Options are implicitly "True" and "False".
  - Correct answer must be the literal word `True` or `False` (case-insensitive).
- **Separators:** `---` can be used to visually separate questions, but is only strictly required after module and chapter headers.
- **IDs:** Providing explicit `CH_ID` and `Q_ID` in HTML comments is highly recommended for stable linking and data management. If missing, defaults will be generated. Duplicate IDs will now generate warnings.

## Project Structure (Illustrative)

- `app/`: Next.js App Router pages.
  - `page.tsx`: Main entry point for the quiz.
  - `test/page.tsx`: Page for testing parser or components.
- `components/`: React components.
  - `ui/`: Shadcn/ui components.
  - `quiz-session.tsx`: Core component for managing an active quiz.
  - `dashboard.tsx`: Displays chapter selection.
  - `text-renderer.tsx`: Legacy text renderer (being replaced by SecureTextRenderer).
- `secure-text-renderer.tsx`: Advanced secure text renderer with XSS protection and rich markdown support.
  - ... other UI components.
- `hooks/`: Custom React hooks (e.g., `use-toast.ts`).
- `lib/`: Utility functions (e.g., `utils.ts`).
- `public/`: Static assets, including `default-quiz.json`.
- `types/`: TypeScript type definitions (e.g., `quiz-types.ts`).
- `utils/`: Core utilities like `quiz-validation-refactored.ts` (contains the parser and validators).

## Getting Started

1.  Clone the repository.
2.  Install dependencies: \`npm install\`
3.  Run the development server: \`npm run dev\`
4.  Open your browser to \`http://localhost:3000\`.

The default quiz is loaded from \`public/default-quiz.json\`. You can create your own Markdown files and use a script or a UI feature (if implemented) to parse them into JSON format for the application.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/mcq-master.git
   cd mcq-master
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install

   # or

   yarn install

   # or

   pnpm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev

   # or

   yarn dev

   # or

   pnpm dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Quiz Format Specifications

### JSON Format

The JSON format provides the most comprehensive feature support:

\`\`\`json
{
"name": "Quiz Module Name",
"description": "Optional module description",
"chapters": [
{
"id": "unique_chapter_id",
"name": "Chapter Name",
"description": "Optional chapter description",
"questions": [
{
"questionId": "unique_question_id",
"type": "mcq", // or "true_false"
"questionText": "Question text with **markdown** and $$LaTeX$$ support",
"options": [ // For MCQ; For T/F, this would be auto-generated
{
"optionId": "unique_option_id", // For T/F, "true" or "false"
"optionText": "Option text with formatting support" // For T/F, "True" or "False"
}
],
"correctOptionIds": ["option_id_1"], // For T/F, ["true"] or ["false"]
"explanationText": "Detailed explanation with formatting",
"status": "not_attempted",
"timesAnsweredCorrectly": 0,
"timesAnsweredIncorrectly": 0,
"historyOfIncorrectSelections": [],
"srsLevel": 0,
"nextReviewAt": null,
"shownIncorrectOptionIds": []
}
]
}
]
}
\`\`\`

### Markdown Format

The Markdown format offers a more human-readable alternative:

**MCQ Example:**
\`\`\`markdown

# Quiz Module Name

## _Optional module description_

## Chapter Name <!-- ID:chapter_id -->

## Description: Optional chapter description

### Q: What is the time complexity of binary search? <!-- ID:q1 -->

**Options:**
**A1:** O(n)
**A2:** O(log n)
**A3:** O(n²)

**Correct:** A2

## **Exp:** Binary search divides the search space in half with each comparison, resulting in O(log n) time complexity.

\`\`\`

**True/False Example:**
\`\`\`markdown

### T/F: The sun rises in the west. <!-- ID:tf_sun_q -->

**Correct:** False

## **Exp:** The sun rises in the east due to the Earth's rotation.

\`\`\`

#### Markdown Format Variations

**Compact Format (MCQ):**
\`\`\`markdown
**Opt:**

- **A1:** Option 1
- **A2:** Option 2

**Ans:** A1

**Exp:** Explanation text
\`\`\`

**ID Comments:**

- Same line: \`<!-- ID:question_id -->\`
- Separate line:
  \`\`\`markdown
  ### Q: Question text
  <!-- ID:question_id -->
  \`\`\`

## 🎯 Core Features Deep Dive

### SecureTextRenderer Component

The `SecureTextRenderer` is a comprehensive text rendering component that provides secure, rich text display with complete XSS protection:

#### **Security Features**

- **XSS Protection**: Complete sanitization of dangerous content including script tags, event handlers, and malicious URLs
- **URL Validation**: Rejects dangerous protocols (`javascript:`, `data:`, `vbscript:`) while allowing safe URLs
- **Attribute Sanitization**: Removes dangerous HTML attributes and event handlers
- **Content Detection**: Intelligently detects raw HTML vs markdown content for appropriate processing

#### **Rich Markdown Support**

- **Headers**: All levels (h1-h6) with proper HTML structure
- **Text Formatting**: Bold (`**text**`, `__text__`), italic (`*text*`, `_text_`), strikethrough (`~~text~~`)
- **Code**: Inline code (`` `code` ``) and code blocks (`code`)
- **Lists**: Unordered (`- item`), ordered (`1. item`), and task lists (`- [x] completed`)
- **Links & Images**: `[text](url)` and `![alt](url)` with URL validation
- **Tables**: Full table support with proper HTML structure (`<table>`, `<thead>`, `<tbody>`)
- **Blockquotes**: `> text` support with proper nesting
- **Horizontal Rules**: `---`, `***`, `___` support

#### **LaTeX Math Rendering**

- **Inline Math**: `$math$` renders as inline math with KaTeX
- **Display Math**: `$$math$$` renders as centered display math
- **Error Handling**: Malformed LaTeX gracefully handled with error styling
- **Performance**: Optimized for quiz applications with frequent content updates

#### **Advanced Features**

- **Mixed Content**: Safely handles combinations of markdown, LaTeX, and HTML
- **Unicode Support**: Full support for special characters and emojis
- **Error Recovery**: Graceful handling of malformed content
- **Performance**: Lightweight regex-based processing for optimal speed

#### **Usage Example**

```tsx
import { SecureTextRenderer } from '@/components/secure-text-renderer'

const content = `
# Quiz Question

This is a **bold** question with *italic* text and $E = mc^2$ math.

## Code Example
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## Task List
- [x] Completed task
- [ ] Incomplete task
`

<SecureTextRenderer content={content} className="my-custom-class" />
```

### Spaced Repetition System (SRS)

MCQ Master implements a sophisticated three-level SRS system:

#### **Level 0: New/Lapsing**

- **Status**: New questions or questions answered incorrectly
- **Scheduling**: 30-second quick retry for immediate reinforcement
- **Purpose**: Initial learning and immediate error correction

#### **Level 1: Learning**

- **Status**: Questions answered correctly once
- **Scheduling**: 10-minute review interval
- **Purpose**: Short-term retention verification

#### **Level 2: Mastered**

- **Status**: Questions answered correctly twice consecutively
- **Scheduling**: No further reviews (removed from queue)
- **Purpose**: Long-term retention achieved

#### **Smart Scheduling Features**

- **Recent Failure Priority**: Questions failed recently get slight priority
- **Dynamic Queue**: Review queue updates in real-time
- **Progress Visualization**: Anki-style progress bars show learning pipeline

### Question Editor

The built-in question editor provides comprehensive authoring capabilities:

#### **Live Preview**

- **Real-time Rendering**: See exactly how questions will appear
- **LaTeX Support**: Live preview of mathematical expressions
- **Markdown Rendering**: Rich text formatting preview
- **Option Validation**: Immediate feedback on option configuration

#### **Rich Text Support**

- **LaTeX Math**: Inline (\`$...$\`) and display (\`$$...$$\`) math
- **HTML Tags**: Support for \`<b>\`, \`<i>\`, \`<code>\`, etc.
- **Markdown**: Standard markdown formatting
- **Code Blocks**: Syntax highlighting for code examples

#### **Validation System**

- **Required Fields**: Ensures all necessary fields are completed
- **Option Validation**: Checks for valid option IDs and text
- **Correct Answer Validation**: Verifies correct answers reference valid options
- **Duplicate Detection**: Prevents duplicate option IDs

### Session History Navigation

Navigate through your quiz session with advanced history features:

#### **Historical View**

- **Answer Review**: Review previous answers within the session
- **Context Preservation**: See exactly what options were displayed
- **Performance Tracking**: View correct/incorrect status for each answer
- **Navigation Controls**: Previous/Next buttons for easy browsing

#### **Live vs Historical**

- **Live Questions**: Current unanswered questions
- **Historical Answers**: Previously answered questions in the session
- **Seamless Transition**: Switch between live and historical views
- **State Preservation**: Maintains context when switching views

### Import/Export System

Comprehensive data management capabilities:

#### **Quiz Module Management**

- **Full Export**: Complete quiz state with all progress data
- **Import with Validation**: Automatic validation and error reporting
- **LaTeX Correction**: Automatic fixing of common LaTeX issues
- **Progress Preservation**: Maintains learning progress across imports

#### **Question-Level Operations**

- **Individual Export**: Export single questions for sharing
- **Batch Import**: Import multiple questions with conflict resolution
- **Overwrite Protection**: Confirmation dialogs for destructive operations
- **Append Mode**: Add new questions without affecting existing ones

#### **Mistake Analysis**

- **Detailed Logs**: Export comprehensive incorrect answer history
- **Performance Metrics**: Include attempt counts and SRS levels
- **Chapter Context**: Maintain chapter and question relationships
- **Timestamp Tracking**: Record when mistakes were made

## 🎨 User Interface Features

### Dashboard

The main dashboard provides a comprehensive overview:

#### **Module Information**

- **Title and Description**: Clear module identification
- **Chapter Overview**: Grid layout of all chapters
- **Progress Indicators**: Visual progress bars for each chapter
- **Completion Status**: Clear indication of completed chapters

#### **Chapter Cards**

- **Progress Visualization**: Circular progress indicators
- **Statistics Display**: Questions answered, correct answers, accuracy
- **Status Badges**: Visual indicators for completion status
- **Quick Actions**: Start quiz or continue from last position

#### **Review System**

- **Review Queue Counter**: Number of questions due for review
- **Start Review Button**: One-click access to review sessions
- **SRS Statistics**: Overview of learning pipeline status

### Quiz Interface

The quiz interface is optimized for learning:

#### **Question Display**

- **Clean Layout**: Distraction-free question presentation
- **Rich Text Rendering**: Full support for LaTeX, HTML, and Markdown
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Keyboard navigation and screen reader support

#### **Option Selection**

- **Visual Feedback**: Clear indication of selected options
- **Hover Effects**: Interactive feedback for better UX
- **Keyboard Support**: Arrow keys and Enter for selection
- **Touch Friendly**: Optimized for mobile devices

#### **Answer Feedback**

- **Immediate Feedback**: Instant indication of correct/incorrect
- **Explanation Display**: Detailed explanations with rich formatting
- **Progress Indication**: Show position within chapter
- **Navigation Controls**: Easy movement between questions

### Question Navigation Menu

Advanced navigation system for quiz sessions:

#### **Visual Progress Map**

- **Question Grid**: Visual representation of all questions
- **Status Indicators**: Color-coded status for each question
- **Current Position**: Clear indication of current question
- **Click Navigation**: Direct navigation to any question

#### **Status Legend**

- **Not Attempted**: Questions not yet answered
- **Correct**: Questions answered correctly
- **Incorrect**: Questions answered incorrectly
- **Current**: Currently active question

#### **Session History Integration**

- **Historical Markers**: Show questions answered in current session
- **Live vs Historical**: Visual distinction between modes
- **Context Switching**: Easy switching between live and historical views

## 🔧 Technical Features

### LaTeX Support

Comprehensive mathematical expression support:

#### **Inline Math**

- **Syntax**: \`$expression$\`
- **Example**: \`$E = mc^2$\` renders as inline math
- **Use Cases**: Mathematical variables, simple expressions

#### **Display Math**

- **Syntax**: \`$$expression$$\`
- **Example**: \`$$\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}$$\`
- **Use Cases**: Complex equations, formulas, proofs

#### **Supported Commands**

- **Greek Letters**: \`\\alpha\`, \`\\beta\`, \`\\gamma\`, etc.
- **Operators**: \`\\sum\`, \`\\int\`, \`\\prod\`, \`\\lim\`, etc.
- **Relations**: \`\\leq\`, \`\\geq\`, \`\\neq\`, \`\\approx\`, etc.
- **Functions**: \`\\sin\`, \`\\cos\`, \`\\log\`, \`\\ln\`, etc.
- **Structures**: \`\\frac{}{}\`, \`\\sqrt{}\`, \`\\binom{}{}\`, etc.

### Markdown Support

Rich text formatting capabilities:

#### **Basic Formatting**

- **Bold**: \`**text**\` or \`**text**\`
- **Italic**: \`_text_\` or \`_text_\`
- **Code**: \`\`code\`\` for inline code
- **Links**: \`[text](url)\` for hyperlinks

#### **Advanced Features**

- **Code Blocks**: Syntax highlighting for multiple languages
- **Lists**: Ordered and unordered lists
- **Tables**: Full table support with alignment
- **Blockquotes**: \`> quoted text\`

### HTML Support

Direct HTML integration for advanced formatting:

#### **Supported Tags**

- **Text Formatting**: \`<b>\`, \`<i>\`, \`<u>\`, \`<s>\`
- **Code**: \`<code>\` for inline code snippets
- **Structure**: \`<div>\`, \`<span>\`, \`<p>\`
- **Lists**: \`<ul>\`, \`<ol>\`, \`<li>\`

#### **Styling**

- **CSS Classes**: Support for Tailwind CSS classes
- **Inline Styles**: Direct style attribute support
- **Responsive**: Automatic responsive behavior

### Data Validation

Comprehensive validation system:

#### **JSON Validation**

- **Schema Validation**: Strict adherence to quiz module schema
- **Type Checking**: Ensures correct data types for all fields
- **Relationship Validation**: Verifies option IDs match correct answers
- **Completeness Checks**: Ensures all required fields are present

#### **Markdown Validation**

- **Structure Validation**: Checks for proper markdown structure
- **Content Validation**: Ensures all required sections are present
- **ID Validation**: Verifies unique IDs across questions and chapters
- **Format Compliance**: Checks adherence to supported formats

#### **LaTeX Correction**

- **Automatic Fixing**: Corrects common LaTeX formatting errors
- **Command Recognition**: Identifies and fixes LaTeX commands
- **Escape Sequence Handling**: Proper handling of backslashes
- **Error Reporting**: Detailed reports of corrections made

## 📱 Responsive Design

### Mobile Optimization

#### **Touch Interface**

- **Large Touch Targets**: Optimized button and option sizes
- **Gesture Support**: Swipe navigation where appropriate
- **Viewport Optimization**: Proper scaling and zoom behavior
- **Orientation Support**: Works in both portrait and landscape

#### **Layout Adaptation**

- **Flexible Grids**: Responsive grid layouts for different screen sizes
- **Collapsible Sections**: Expandable sections for better mobile UX
- **Optimized Typography**: Readable text sizes across devices
- **Efficient Scrolling**: Smooth scrolling with proper momentum

### Desktop Features

#### **Keyboard Navigation**

- **Tab Navigation**: Full keyboard accessibility
- **Shortcut Keys**: Ctrl+Enter to submit, Escape to cancel
- **Arrow Key Support**: Navigate between options
- **Focus Management**: Proper focus indication and management

#### **Advanced Interactions**

- **Hover Effects**: Rich hover states for better feedback
- **Context Menus**: Right-click context menus where appropriate
- **Drag and Drop**: File upload via drag and drop
- **Multi-window Support**: Proper behavior across multiple windows

## 🔒 Data Management

### Local Storage

#### **Automatic Saving**

- **Progress Persistence**: Automatic saving of quiz progress
- **Session Recovery**: Recover interrupted sessions
- **Settings Storage**: User preferences and settings
- **Cache Management**: Efficient caching of quiz data

#### **Data Security**

- **Local Only**: All data stored locally in browser
- **No Server Dependency**: Fully client-side application
- **Privacy Focused**: No data transmission to external servers
- **User Control**: Complete user control over data

### Import/Export Workflows

#### **File Format Support**

- **JSON Files**: Native format with full feature support
- **Markdown Files**: Human-readable format support
- **Automatic Detection**: Automatic format detection
- **Error Handling**: Graceful handling of invalid files

#### **Conflict Resolution**

- **Overwrite Protection**: Confirmation for destructive operations
- **Merge Options**: Smart merging of imported data
- **Backup Creation**: Automatic backups before imports
- **Rollback Support**: Ability to undo imports

## 🎓 Educational Features

### Learning Analytics

#### **Performance Tracking**

- **Accuracy Metrics**: Track accuracy over time
- **Attempt History**: Complete history of all attempts
- **Time Tracking**: Monitor time spent on questions
- **Difficulty Analysis**: Identify challenging topics

#### **Progress Visualization**

- **Progress Bars**: Visual progress indicators
- **Achievement Badges**: Milestone achievements
- **Streak Tracking**: Consecutive correct answers
- **Improvement Trends**: Visual trend analysis

### Study Modes

#### **Regular Quiz Mode**

- **Linear Progression**: Traditional question-by-question progression
- **Chapter-Based**: Organized by chapters and topics
- **Progress Tracking**: Comprehensive progress monitoring
- **Flexible Navigation**: Jump to any question within chapter

#### **Review Mode**

- **SRS-Based**: Spaced repetition scheduling
- **Priority Queue**: Most urgent questions first
- **Adaptive Scheduling**: Adjusts based on performance
- **Mastery Tracking**: Clear mastery progression

#### **Practice Mode**

- **Mistake Review**: Focus on previously incorrect answers
- **Weak Areas**: Target areas needing improvement
- **Custom Filters**: Filter by difficulty or topic
- **Unlimited Attempts**: No penalty for multiple attempts

## 🛠️ Development Features

### Code Quality

#### **TypeScript**

- **Full Type Safety**: Comprehensive type definitions
- **Interface Definitions**: Clear data structure definitions
- **Generic Types**: Reusable type definitions
- **Strict Mode**: Strict TypeScript configuration

#### **Code Organization**

- **Component Architecture**: Modular React components
- **Custom Hooks**: Reusable logic in custom hooks
- **Utility Functions**: Shared utility functions
- **Type Definitions**: Centralized type definitions

### Testing

#### **Built-in Tests**

- **Parser Testing**: Comprehensive markdown parser tests
- **Validation Testing**: Data validation test suites
- **Component Testing**: React component test coverage
- **Integration Testing**: End-to-end workflow testing

#### **Test Navigation**

- **Test Page**: Dedicated test page at \`/test\`
- **Interactive Testing**: Run tests directly in browser
- **Result Visualization**: Clear test result display
- **Debug Information**: Detailed debug output

## 🧪 Testing & CI

### Testing Framework

#### **Unit Testing**

- **Vitest**: Fast unit testing framework with Vite integration
- **@testing-library/react**: React component testing utilities
- **Coverage**: 90% coverage required for parser modules, 80% for components
- **Watch Mode**: Real-time test execution during development

#### **Integration Testing**

- **Component Integration**: Test component interactions and state management
- **Rendering Tests**: Verify component rendering with different props
- **State Management**: Test complex state transitions and data flow

#### **End-to-End Testing**

- **Playwright**: Cross-browser E2E testing with built-in browser automation
- **User Flows**: Complete user journey testing across the application
- **Cross-browser**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Visual Testing**: Screenshot comparison and visual regression testing

#### **Accessibility Testing**

- **axe-core**: Automated accessibility testing with WCAG compliance
- **Keyboard Navigation**: Focus management and tab order testing
- **Screen Reader**: ARIA labels and landmarks validation
- **Color Contrast**: Automated contrast ratio verification

### Test Structure

#### **Test Organization**

```
tests/
├── unit/           # Unit tests for individual functions and components
├── int/            # Integration tests for component interactions
├── e2e/            # End-to-end tests for complete user flows
├── access/         # Accessibility tests for WCAG compliance
├── fixtures/       # Test data and mock files
└── setup.ts        # Test configuration and setup
```

#### **Test Fixtures**

- **Markdown Parser Tests**: Comprehensive test cases for markdown parsing
- **LaTeX Rendering Tests**: Math expression rendering validation
- **Validation Tests**: Schema validation and error handling
- **Edge Cases**: Boundary conditions and error scenarios

### Continuous Integration

#### **CI Pipeline**

1. **TypeScript Type Check**: Compile-time type validation
2. **ESLint**: Code quality and style enforcement
3. **Unit Tests**: Fast, isolated component and function tests
4. **Integration Tests**: Component interaction and state management
5. **Accessibility Tests**: WCAG compliance and screen reader support
6. **E2E Tests**: Cross-browser user journey validation
7. **Build**: Production build verification
8. **Coverage Check**: Coverage threshold enforcement
9. **Dependency Check**: Unused dependency and export analysis
10. **Bundle Analysis**: Size monitoring and optimization insights

#### **Coverage Thresholds**

- **Parser modules** (`lib/schema/`): 90% coverage required
- **Components**: 80% coverage required
- **Global**: 80% coverage required

#### **Quality Gates**

- **Type Safety**: All TypeScript errors must be resolved
- **Linting**: All ESLint warnings must be addressed
- **Test Coverage**: Coverage thresholds must be met
- **Accessibility**: No accessibility violations allowed
- **Build Success**: Production build must complete successfully

### Running Tests

#### **Local Development**

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:int           # Integration tests
npm run test:e2e           # End-to-end tests
npm run test:access        # Accessibility tests

# Run tests in watch mode
npm run test:unit:watch

# Generate coverage report
npm run coverage
```

#### **CI Checks**

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Dependency analysis
npm run depcheck

# Bundle analysis
npm run analyze
```

### Pre-commit Hooks

#### **Automated Quality Checks**

- **Lint-staged**: Runs ESLint and Prettier on staged files
- **Type Checking**: Ensures TypeScript compilation success
- **Test Execution**: Runs relevant tests for changed files
- **Formatting**: Automatically formats code before commit

#### **Git Hooks**

- **pre-commit**: Runs lint-staged before commit
- **prepare**: Installs husky hooks automatically

### Test Data Management

#### **Fixtures**

- **Realistic Data**: Test fixtures based on actual usage patterns
- **Edge Cases**: Boundary conditions and error scenarios
- **Performance Data**: Large datasets for performance testing
- **Accessibility Data**: Content with various accessibility requirements

#### **Mock Data**

- **API Responses**: Mock API responses for testing
- **User Interactions**: Simulated user behavior patterns
- **Error States**: Various error conditions and recovery
- **Loading States**: Different loading and async scenarios

### Performance Testing

#### **Bundle Analysis**

- **Size Monitoring**: Track bundle size changes over time
- **Dependency Analysis**: Identify unused dependencies
- **Code Splitting**: Verify optimal code splitting
- **Tree Shaking**: Ensure dead code elimination

#### **Runtime Performance**

- **Component Rendering**: Measure component render times
- **Memory Usage**: Monitor memory consumption patterns
- **User Interactions**: Test responsiveness of user interactions
- **Large Datasets**: Performance with large quiz modules

### Performance

#### **Optimization**

- **Code Splitting**: Automatic code splitting
- **Lazy Loading**: Lazy loading of components
- **Memoization**: React.memo and useMemo optimization
- **Bundle Optimization**: Optimized build output

#### **Caching**

- **Component Caching**: Efficient component re-rendering
- **Data Caching**: Smart data caching strategies
- **Asset Caching**: Optimized asset loading
- **Memory Management**: Efficient memory usage

## 🎨 Customization

### Theming

#### **Dark Theme**

- **Gradient Backgrounds**: Beautiful gradient backgrounds
- **Color Consistency**: Consistent color scheme throughout
- **Contrast Optimization**: High contrast for readability
- **Eye Strain Reduction**: Optimized for extended use

#### **Component Styling**

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Styled component library
- **Responsive Utilities**: Mobile-first responsive design
- **Animation Support**: Smooth animations and transitions

### Configuration

#### **Quiz Settings**

- **SRS Configuration**: Customizable SRS intervals
- **Display Options**: Configurable display preferences
- **Navigation Settings**: Customizable navigation behavior
- **Accessibility Options**: Accessibility preference settings

#### **Editor Settings**

- **Preview Mode**: Toggle live preview
- **Validation Level**: Configurable validation strictness
- **Auto-save**: Automatic saving preferences
- **Keyboard Shortcuts**: Customizable keyboard shortcuts

## 📚 Usage Examples

### Creating a Quiz Module

#### **JSON Format Example**

\`\`\`json
{
"name": "Computer Science Fundamentals",
"description": "Basic concepts in computer science",
"chapters": [
{
"id": "algorithms",
"name": "Algorithm Analysis",
"description": "Big O notation and complexity analysis",
"questions": [
{
"questionId": "big_o_1",
"type": "mcq",
"questionText": "What is the time complexity of binary search?",
"options": [
{ "optionId": "big_o_1_a", "optionText": "O(n)" },
{ "optionId": "big_o_1_b", "optionText": "O(log n)" },
{ "optionId": "big_o_1_c", "optionText": "O(n²)" }
],
"correctOptionIds": ["big_o_1_b"],
"explanationText": "Binary search divides the search space in half with each comparison, resulting in O(log n) time complexity."
},
{
"questionId": "tf_stability_1",
"type": "true_false",
"questionText": "A stable sorting algorithm maintains the relative order of equal elements.",
"options": [
{ "optionId": "true", "optionText": "True" },
{ "optionId": "false", "optionText": "False" }
],
"correctOptionIds": ["true"],
"explanationText": "Stability is a key property where items with identical keys appear in the same order in the output as they did in the input."
}
]
}
]
}
\`\`\`

#### **Markdown Format Example**

\`\`\`markdown

# Computer Science Fundamentals

## _Basic concepts in computer science_

## Algorithm Analysis <!-- ID:algorithms -->

## Description: Big O notation and complexity analysis

### Q: What is the time complexity of binary search? <!-- ID:big_o_1 -->

**Options:**
**A1:** O(n)
**A2:** O(log n)
**A3:** O(n²)

**Correct:** A2

## **Exp:** Binary search divides the search space in half with each comparison, resulting in O(log n) time complexity.

### T/F: A stable sorting algorithm maintains the relative order of equal elements. <!-- ID:tf_stability_1 -->

**Correct:** True

## **Exp:** Stability is a key property where items with identical keys appear in the same order in the output as they did in the input.

\`\`\`

### Advanced LaTeX Examples

#### **Mathematical Expressions**

\`\`\`markdown

### Q: What is the sum formula for the first n natural numbers?

**Options:**
**A1:** $$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$
**A2:** $$\\sum_{i=1}^{n} i = n^2$$
**A3:** $$\\sum_{i=1}^{n} i = \\frac{n^2(n+1)^2}{4}$$

**Correct:** A1

**Exp:** The sum of the first n natural numbers is given by the formula $$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$, which can be proven by mathematical induction.
\`\`\`

#### **Complex Equations**

\`\`\`markdown

### Q: What is the quadratic formula?

**Exp:** For a quadratic equation $ax^2 + bx + c = 0$, the solutions are:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

The discriminant $\\Delta = b^2 - 4ac$ determines the nature of the roots:

- If $\\Delta > 0$: Two distinct real roots
- If $\\Delta = 0$: One repeated real root
- If $\\Delta < 0$: Two complex conjugate roots
  \`\`\`

### Code Examples in Questions

#### **Programming Questions**

\`\`\`markdown

### Q: What is the output of this Python code?

\`\`\`python
def fibonacci(n):
if n <= 1:
return n
return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(5))
\`\`\`

**Options:**
**A1:** 5
**A2:** 8
**A3:** 13

**Correct:** A2

**Exp:** The Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, ...
So fibonacci(5) = 5 (the 5th Fibonacci number, 0-indexed).
\`\`\`

## 🔧 Troubleshooting

### Common Issues

#### **LaTeX Rendering Problems**

- **Issue**: LaTeX not rendering properly
- **Solution**: Check for proper escaping of backslashes in JSON
- **Auto-fix**: Use the built-in LaTeX correction feature

#### **Import Failures**

- **Issue**: Quiz file won't import
- **Solution**: Validate file format and check error messages
- **Debug**: Use the test page to validate markdown parsing

#### **Performance Issues**

- **Issue**: Slow loading or rendering
- **Solution**: Check for very large quiz files or complex LaTeX
- **Optimization**: Break large quizzes into smaller chapters

### File Format Issues

#### **JSON Validation Errors**

- **Missing Fields**: Ensure all required fields are present
- **Type Errors**: Check that field types match expected types
- **ID Conflicts**: Ensure all IDs are unique within their scope
- **Reference Errors**: Verify that correctOptionIds reference valid options

#### **Markdown Parsing Errors**

- **Structure Issues**: Check for proper heading hierarchy
- **Missing Sections**: Ensure all required sections are present
- **ID Format**: Verify ID comments are properly formatted
- **Option Format**: Check option formatting matches expected patterns

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   \`\`\`bash
   git checkout -b feature/amazing-feature
   \`\`\`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   \`\`\`bash
   git commit -m 'Add amazing feature'
   \`\`\`
6. **Push to the branch**
   \`\`\`bash
   git push origin feature/amazing-feature
   \`\`\`
7. **Open a Pull Request**

### Code Style

- **TypeScript**: Use strict TypeScript with proper typing
- **React**: Follow React best practices and hooks patterns
- **Tailwind**: Use Tailwind CSS for styling
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting

### Testing

- **Unit Tests**: Write unit tests for new functionality
- **Integration Tests**: Test component interactions
- **Manual Testing**: Test across different browsers and devices
- **Accessibility**: Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js**: React framework for production
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **KaTeX**: Fast math typesetting library
- **React**: JavaScript library for building user interfaces

## 📚 Documentation

### Core Documentation

- **[SecureTextRenderer Guide](docs/SecureTextRenderer.md)**: Complete component documentation
- **[API Reference](docs/API.md)**: Detailed API documentation
- **[Migration Guide](docs/MIGRATION.md)**: Migrating from TextRenderer to SecureTextRenderer
- **[Testing Guide](docs/TESTING.md)**: Comprehensive testing documentation

### Development Resources

- **[Progress Documentation](PROGRESS.md)**: Development progress and learnings
- **[Changelog](CHANGELOG.md)**: Version history and changes
- **[Documentation Index](docs/README.md)**: Complete documentation overview

## 📞 Support

For support, questions, or feature requests:

1. **GitHub Issues**: Open an issue on GitHub
2. **Documentation**: Check the comprehensive documentation above
3. **Test Page**: Use the built-in test page for debugging
4. **Community**: Join discussions in GitHub Discussions

---

**MCQ Master** - Transform your learning with interactive quizzes and spaced repetition! 🚀
