import type { QuizModule, QuizQuestion, QuizChapter } from '@/types/quiz-types';

/**
 * Sanitizes text for use in deterministic IDs.
 * Takes first 30 chars, lowercases, replaces non-alphanumeric with underscores,
 * and collapses multiple underscores.
 */
export function sanitizeForId(text: string): string {
    return text
        .slice(0, 30)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

/**
 * Resolves duplicate IDs by appending _1, _2, etc.
 * Returns a unique ID and updates the seenIds set.
 */
export function resolveDuplicateId(baseId: string, seenIds: Set<string>): string {
    if (!seenIds.has(baseId)) {
        seenIds.add(baseId);
        return baseId;
    }
    let suffix = 1;
    while (seenIds.has(`${baseId}_${suffix}`)) {
        suffix++;
    }
    const uniqueId = `${baseId}_${suffix}`;
    seenIds.add(uniqueId);
    return uniqueId;
}

export function normalizeSingleQuestion(data: QuizQuestion): QuizQuestion {
    // FIXED D4: Properly clamp srsLevel to valid range [0, 2]
    // Handle negative values, NaN, Infinity, and values > 2
    const rawSrsLevel = data.srsLevel;
    let normalizedSrsLevel = 0;

    if (typeof rawSrsLevel === 'number' && Number.isFinite(rawSrsLevel)) {
        normalizedSrsLevel = Math.max(0, Math.min(2, Math.floor(rawSrsLevel)));
    }

    // FIXED D4: Properly clamp answer counts to non-negative
    const timesCorrect =
        typeof data.timesAnsweredCorrectly === 'number' && data.timesAnsweredCorrectly >= 0
            ? Math.floor(data.timesAnsweredCorrectly)
            : 0;
    const timesIncorrect =
        typeof data.timesAnsweredIncorrectly === 'number' && data.timesAnsweredIncorrectly >= 0
            ? Math.floor(data.timesAnsweredIncorrectly)
            : 0;

    // FIXED: Ensure status matches srsLevel for consistency
    let normalizedStatus = data.status || 'not_attempted';
    if (normalizedSrsLevel >= 2 && normalizedStatus !== 'mastered') {
        normalizedStatus = 'mastered';
    } else if (normalizedSrsLevel === 0 && normalizedStatus === 'mastered') {
        normalizedStatus = 'attempted';
    }

    return {
        ...data,
        explanationText:
            data.explanationText ||
            ((data as unknown as Record<string, unknown>).explanation as string) ||
            '',
        type: data.type || 'mcq', // Default to 'mcq' if type is missing
        status: normalizedStatus,
        timesAnsweredCorrectly: timesCorrect,
        timesAnsweredIncorrectly: timesIncorrect,
        historyOfIncorrectSelections: data.historyOfIncorrectSelections || [],
        lastSelectedOptionId: data.lastSelectedOptionId || undefined,
        lastAttemptedAt: data.lastAttemptedAt || undefined,
        srsLevel: normalizedSrsLevel,
        nextReviewAt: data.nextReviewAt || null,
        shownIncorrectOptionIds: data.shownIncorrectOptionIds || [],
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeQuizModule(data: any): QuizModule {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chapters = Array.isArray(data.chapters) ? data.chapters : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizedChapters = chapters.map((chapter: any) => {
        const questions = Array.isArray(chapter.questions) ? chapter.questions : [];
        const normalizedQuestions = questions.map((q: unknown) =>
            normalizeSingleQuestion(q as QuizQuestion),
        );
        const totalQuestions = normalizedQuestions.length;
        const answeredQuestions = normalizedQuestions.filter(
            (q: QuizQuestion) => q.status !== 'not_attempted',
        ).length;
        const correctAnswers = normalizedQuestions.filter(
            (q: QuizQuestion) => (q.timesAnsweredCorrectly || 0) > 0,
        ).length;
        return {
            ...chapter,
            name: chapter.name ?? chapter.title ?? 'Chapter',
            questions: normalizedQuestions,
            totalQuestions,
            answeredQuestions,
            correctAnswers,
            isCompleted: totalQuestions > 0 && answeredQuestions === totalQuestions,
        } as QuizChapter;
    });

    return {
        ...data,
        name: data.name ?? data.title,
        chapters: normalizedChapters,
    } as QuizModule;
}
