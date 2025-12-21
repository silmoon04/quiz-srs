# Testing Guide

This document summarizes how to run and extend the Quiz-SRS test suites.

## Goals

- Catch regressions in parsing, rendering, and session state transitions.
- Protect accessibility guarantees and input sanitization.
- Keep the default quiz load and import flows stable.

## Quick Commands

- `npm run test` runs unit + integration + accessibility (Vitest).
- `npm run test:unit` runs unit tests.
- `npm run test:int` runs integration tests.
- `npm run test:access` runs accessibility tests (Vitest + axe).
- `npm run test:e2e` runs Playwright E2E tests.
- `npm run test:e2e:ui` opens the Playwright UI runner.

## Suite Map

- Unit: `tests/unit/**` (components, parser, renderer, store, engine).
- Integration: `tests/int/**` (import flows, persistence, UI contracts).
- Accessibility: `tests/access/**` and `tests/a11y/**`.
- E2E: `tests/e2e/**` (user journeys and edge cases).

## Local Runs (Resource-Friendly)

- Prefer headless E2E runs for faster feedback.
- Limit Playwright workers when running locally:
  - `npx playwright test --workers=2`
  - `npx playwright test --max-workers=50%`

## Fixtures and Assets

- Markdown/JSON fixtures live in `tests/fixtures/**`.
- Default quiz assets live in `public/default-quiz.md` and `public/default-quiz.json`.
- Large manual fixtures live in `public/*.md`.

## Writing Tests

- Use deterministic data (seeded random or fixed IDs).
- Assert visible UX outcomes (copy, status, navigation), not internal state.
- For focus-related assertions, wrap `element.focus()` in `act` or use `userEvent`.

## CI Expectations

- Unit/integration/accessibility suites should pass before merging.
- E2E runs are recommended for flow changes and import/export work.
