# Subagent 1: User Journeys - Iteration 2

## Focus Area

Complete end-to-end user flows, multi-step scenarios, realistic usage patterns

---

## Generated E2E Test Ideas

### SA1-011: First-time user journey from landing to first quiz complete

- **Scenario**: New user loads app, imports quiz, answers all questions
- **Risk**: Any broken step blocks entire user journey
- **Test**: Complete fresh user flow with assertions at each step

### SA1-012: Return user resumes quiz from exactly where they left off

- **Scenario**: User leaves mid-chapter, returns next day
- **Risk**: Progress lost, wrong question shown
- **Test**: Complete partial quiz, reload app, verify exact position

### SA1-013: User completes entire SRS cycle (new → mastered)

- **Scenario**: Answer question correctly 3+ times to reach mastered
- **Risk**: SRS level never advances, stuck in review
- **Test**: Answer same question correctly multiple times, verify mastery

### SA1-014: User exports progress, clears data, reimports successfully

- **Scenario**: Backup and restore workflow
- **Risk**: Export incomplete, import fails, progress lost
- **Test**: Complete export/clear/import cycle, verify identical state

### SA1-015: User switches between multiple imported quizzes

- **Scenario**: User has 3 quizzes, switches between them
- **Risk**: Wrong quiz state loaded, cross-contamination
- **Test**: Import multiple quizzes, switch between, verify isolation

### SA1-016: User retries failed questions from review queue

- **Scenario**: Failed questions appear in review, user re-answers
- **Risk**: Review queue doesn't populate, or never clears
- **Test**: Fail questions, do review session, verify queue updates

### SA1-017: User navigates dashboard stats after quiz completion

- **Scenario**: Finish quiz, view all stats and progress metrics
- **Risk**: Stats don't update, show stale data
- **Test**: Complete quiz, verify all dashboard metrics accurate

### SA1-018: User uses chapter navigation to jump around quiz

- **Scenario**: Start chapter 5, go to 2, back to 5
- **Risk**: Question order confused, wrong progress shown
- **Test**: Non-linear navigation, verify state consistency

### SA1-019: User abandons quiz mid-session, starts fresh quiz

- **Scenario**: Import quiz A, do 5 questions, import quiz B
- **Risk**: Quiz A state leaks into quiz B
- **Test**: Abandon mid-quiz, import new, verify clean slate

### SA1-020: User completes quiz in one sitting vs multiple sessions

- **Scenario**: Compare completion in one session vs split across days
- **Risk**: Session-based state differs from persisted state
- **Test**: Complete quiz both ways, verify identical final state
