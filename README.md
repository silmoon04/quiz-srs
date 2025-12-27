# Quiz-SRS (Spaced Repetition System)

![Build Status](https://github.com/silmoon04/quiz-srs/actions/workflows/deploy.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.2-black)

**Quiz-SRS** is a modern, high-performance web application designed to help learners master complex topics through active recall and spaced repetition. Built with accuracy and accessibility in mind, it transforms static Markdown or JSON content into interactive, knowledge-reinforcing quiz sessions.

## Key Features

- **🧠 Spaced Repetition Engine**: Intelligently schedules reviews based on your performance, ensuring efficient long-term retention.
- **📝 Markdown-First Workflow**: Write quizzes in standard Markdown with simple annotations. Supports code blocks, math (LaTeX), and rich text.
- **🛡️ Secure & Robust**: Sanitary rendering pipeline preventing XSS, with strict Content Security Policies and type-safe architecture.
- **♿ Fully Accessible**: Built on Radix UI primitives with keyboard navigation, screen reader support, and WCAG compliance.
- **📊 Detailed Analytics**: Track your progress with session history, accuracy metrics, and mistake reviews.

## 🚀 Quick Start

Get up and running in less than a minute.

1.  **Clone the repository**

    ```bash
    git clone https://github.com/silmoon04/quiz-srs.git
    cd quiz-srs
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to start quizzing!

## 📖 Documentation

- **[User Guide & formats](docs/USER_GUIDE.md)**: Learn how to create custom quiz modules.
- **[Architecture](docs/ARCHITECTURE.md)**: System design, state management, and component hierarchy.
- **[Testing Strategy](docs/TESTING.md)**: Detailed breakdown of our testing layers (Unit, E2E, A11y).

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Static Export)
- **Language**: TypeScript (Strict Mode)
- **State**: Zustand + Persistence
- **Styling**: Tailwind CSS + Shadcn UI
- **Testing**: Vitest, Playwright, Axe-core

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
