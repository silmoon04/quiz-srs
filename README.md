# Quiz-SRS (Spaced Repetition System)

![Build Status](https://github.com/silmoon04/quiz-srs/actions/workflows/deploy.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.2-black)

**Quiz-SRS** is a high-performance web application designed to help learners master complex topics through active recall and spaced repetition. It is engineered to prevent rote memorization by dynamically restructuring questions and options on every attempt, ensuring true understanding of the material.

## Live Demo

Try the application directly in your browser:  
[**https://silmoon04.github.io/quiz-srs**](https://silmoon04.github.io/quiz-srs)

## Key Learning Features

### Anti-Memorization Architecture
Most quiz apps suffer from "pattern matching," where users memorize the position of the correct answer (e.g., "Answer C is correct") rather than the concept itself.
- **Dynamic Shuffling**: Every session randomizes the order of both questions and their multiple-choice options.
- **Multiple Correct Variants**: The system supports questions where the "correct" usage is context-dependent, forcing the user to evaluate every option rather than remembering a single string.

### AI-Assisted Study Workflow
The application is designed to function as an input provider for LLMs like ChatGPT or Claude.
- **Mistake Export**: Users can export a structured log of their incorrect answers.
- **Contextual Analysis**: This log includes the question, the user's selection, and the correct options, allowing AI tools to generate targeted explanations and new practice questions based on specific knowledge gaps.

### Spaced Repetition Engine
Implements a modified SM-2 algorithm to schedule question reviews at optimal intervals, maximizing long-term retention efficiency.

## Engineering Highlights

- **Local-First Architecture**: Zero-backend design. All state is persisted locally using `zustand` with strict schema validation, ensuring privacy and offline capability.
- **Strict Type Safety**: The codebase enforces `@typescript-eslint/no-explicit-any` validation to guarantee type integrity across the entire application state.
- **Secure Rendering**: Uses a sanitized Markdown pipeline (`rehype-sanitize`) to render rich text and code blocks safely without exposing users to XSS vulnerabilities.
- **Accessibility**: Built on Radix UI primitives ensuring full keyboard navigation and screen reader compliance.

## Quick Start (Local Development)

To build and run the project locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/silmoon04/quiz-srs.git
    cd quiz-srs
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Production Build**
    ```bash
    npm run build
    ```

## Documentation

- **[Architecture Deep Dive](docs/ARCHITECTURE_DEEP_DIVE.md)**: Detailed breakdown of state management, design patterns (Facade, Adapter), and security models.
- **[User Guide](docs/USER_GUIDE.md)**: Instructions for creating custom quiz modules using the Markdown format.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Static Export)
- **Language**: TypeScript (Strict Mode)
- **State**: Zustand + Persist Middleware
- **Testing**: Vitest, Playwright, Axe-core

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
