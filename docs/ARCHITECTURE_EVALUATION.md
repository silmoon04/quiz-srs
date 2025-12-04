# Architecture Evaluation & Improvement Plan

## 1. Evaluation of Current Architecture

### Ease of UI Changes

- **Visual Styling:** **High**. The use of Tailwind CSS and Shadcn UI components makes visual changes (colors, spacing, typography) very fast and consistent.
- **Interaction Patterns:** **Medium**. The separation of logic (Hooks) and View (Components) is good. However, the heavy reliance on `dangerouslySetInnerHTML` for rendering content limits the ability to easily embed complex interactive React components (like custom sliders or interactive diagrams) directly within the question text without significant refactoring (e.g., moving to `rehype-react`).
- **Drastic Changes:** If you want to change the _layout_ (e.g., from a list to a grid), it's easy. If you want to change the _rendering engine_ (e.g., to support interactive coding widgets), it requires replacing `MarkdownRenderer`.

### Ease of Debugging & Fixing (e.g., Double-Click Issue)

- **Reproducibility:** **Medium**. Issues related to hydration and async rendering (like the double-click bug) can be flaky and hard to reproduce in unit tests but obvious in manual testing.
- **Fixability:** **High**. Once identified, the fix is usually architectural. For the double-click issue, the root cause was the **asynchronous nature of the Markdown pipeline**. The `useEffect` hook caused a delay between the component mounting and the content appearing, leading to missed clicks or focus shifts.
- **Improvement:** Switching to a **Synchronous Rendering Pipeline** (which we just did) eliminates this class of bugs entirely.

### Feature Extensibility

- **Rich Text in Options:** **High**. The pipeline is extensible. Adding syntax highlighting was as simple as adding `rehype-highlight`.
- **Mermaid Diagrams:** **Medium**. Currently relies on a client-side patch (`mermaid.run`). A more robust solution would be a dedicated React component, but the current solution works for basic needs.
- **Parser Reliability:** **Low (Currently)**. The regex/line-based parser is fragile. It breaks on edge cases (e.g., unexpected whitespace, different header styles).
- **Scalability:** **Medium**. Adding more questions is easy (Markdown), but the parser might choke on large files or complex syntax.

## 2. Implemented Improvements

### A. Synchronous Rendering (Fixes Double-Click Bug)

We have refactored `lib/markdown/pipeline.ts` and `components/rendering/MarkdownRenderer.tsx` to use `processSync`.

- **Why:** `useEffect` rendering causes a "flash" of empty content and hydration mismatches. This often leads to the browser missing the first click event or resetting the focus.
- **Result:** Content renders immediately on the server (SSR) and client. No layout shift. No missed clicks.

### B. Syntax Highlighting (Rich Text Options)

We installed `rehype-highlight` and added it to the pipeline.

- **Why:** You wanted "text coloring for variables".
- **Result:** Code blocks in options (e.g., \`\`\`js const x = 1 \`\`\`) will now be syntax highlighted automatically.

## 3. Recommended Next Steps (Roadmap)

### Step 1: AST-Based Parser (The "100% Reliability" Goal)

**Current Status:** The parser (`parseMarkdownToQuizModule`) is a custom line-by-line state machine. It is prone to breaking if the Markdown format deviates slightly.
**Recommendation:** Rewrite the parser to use `unified` + `remark-parse`.

1.  Parse the entire Markdown file into an AST (Abstract Syntax Tree).
2.  Traverse the tree to find "Heading" nodes.
3.  Extract content between headings as "Chapter" or "Question" blocks.
4.  This handles all Markdown edge cases (nested lists, code blocks, weird spacing) natively.

### Step 2: Robust Mermaid Integration

**Current Status:** We use a `useEffect` to find `.mermaid` classes and run `mermaid.run()`. This is a bit "hacky" and can conflict with React's virtual DOM.
**Recommendation:**

1.  Create a dedicated `<MermaidChart code="..." />` component.
2.  Use `rehype-react` (instead of `dangerouslySetInnerHTML`) to replace `<code class="language-mermaid">` with the `MermaidChart` component.
3.  This allows the chart to be a real React component with proper lifecycle management.

### Step 3: Interactive Options

**Current Status:** Options are static HTML.
**Recommendation:** If you want options to be interactive (e.g., "Click the variable name"), you need `rehype-react` to render them as React components.

## 4. How to Verify Changes

1.  **Double Click:** Open the quiz. Click an option _immediately_ after it appears. It should select instantly.
2.  **Syntax Highlighting:** Add a code block to an option in your Markdown file:
    ```markdown
    - **A1:** `const x = 10;`
    ```
    It should appear colored (if you have a CSS theme for highlight.js loaded - we might need to add a CSS import to `layout.tsx`).

## 5. Missing Piece: CSS for Highlighting

We installed the highlighter, but we need the CSS styles.
I will add a standard highlight.js theme to `app/layout.tsx` or `globals.css`.
