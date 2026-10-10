# Quiz-SRS

A study app for practising multiple-choice and true/false questions. Load a quiz from Markdown or JSON, work through its chapters, and return to questions due for review. The included question bank covers data structures and algorithms.

[Open the hosted demo](https://silmoon04.github.io/quiz-srs/)

## Using it

1. Choose **Try Algorithm Quiz** or upload your own `.md` or `.json` file with **Load Quiz (JSON/MD)**.
2. Pick a chapter and answer its questions. Each answer has an explanation, and answer options vary between attempts.
3. Use the dashboard to review due questions, export your progress, or download a log of incorrect answers for further study.

Progress is stored in your browser's local storage. Export it from the dashboard if you want a backup or need to move to another browser; there is no account or cloud sync.

The mistake log includes the question, selected answers, correct answers and explanation. You can use it yourself or give it to an AI assistant for follow-up practice. The app does not call an AI service.

## Run locally

Use Node.js 22 or newer and npm.

```bash
git clone https://github.com/silmoon04/quiz-srs.git
cd quiz-srs
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). For a static production export, run `npm run build`; Next.js writes the site to `out/`.

## How it works

- **Quiz import:** a Markdown parser and Zod validation turn uploaded files into modules, chapters and questions. See the [quiz format guide](docs/QUIZ_FORMAT.md) for a small example.
- **Answer selection:** questions can contain several valid answers and a larger pool of distractors. The app selects a subset and shuffles the displayed options.
- **Review scheduling:** a small Leitner-style system retries incorrect answers after 30 seconds and schedules a correct answer for review after 10 minutes. A second consecutive correct answer marks the question as mastered and removes it from scheduled review.
- **State:** Zustand manages the active module, answers and session progress, with browser persistence.
- **Rendering:** Next.js, React and TypeScript, with Tailwind and Radix UI components. The Markdown pipeline supports code highlighting, KaTeX maths and Mermaid diagrams, with an HTML sanitisation step.

This is a study tool with a deliberately short review cycle. It does not implement SM-2 or a long-term forgetting model. Dashboard import/export is connected; the corresponding buttons inside a quiz and on its results screen are still placeholders.

## Development

```bash
npm run typecheck
npm run test:unit -- tests/unit/engine/srs.test.ts tests/unit/parser/markdown-parser.test.ts
```

The repository also contains integration, accessibility and Playwright browser tests. See [testing notes](docs/TESTING.md) for the available suites and [architecture notes](docs/ARCHITECTURE.md) for a broader map of the code. The hosted demo is a deployed snapshot and may lag behind `main`.
