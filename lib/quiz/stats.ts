import { QuizChapter } from '@/types/quiz-types';

export function recalculateChapterStats(chapter: QuizChapter) {
    chapter.totalQuestions = chapter.questions.length;
    chapter.answeredQuestions = chapter.questions.filter((q) => q.status !== 'not_attempted').length;
    chapter.correctAnswers = chapter.questions.filter(
        (q) => (q.timesAnsweredCorrectly || 0) > 0,
    ).length;
    chapter.isCompleted = chapter.answeredQuestions === chapter.totalQuestions;
}
