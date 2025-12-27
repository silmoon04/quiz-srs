'use client';

import { useQuizStore } from '@/store/quiz-store';
import { QuizComplete } from './QuizComplete';
import { useModuleLoader } from '@/features/dashboard/hooks/use-module-loader';
import type { QuizChapter } from '@/types/quiz-types';

export function QuizCompleteContainer() {
  const { currentChapterId, currentModule, answerRecords, setAppState, startQuiz, updateModule } =
    useQuizStore();

  const { loadDefault } = useModuleLoader();

  // 1. Get statistics
  const chapter = currentModule?.chapters.find((c) => c.id === currentChapterId);

  // Guard clause: if no chapter/module (e.g. reload or error), return null or redirect
  if (!chapter || !currentModule) {
    return null;
  }

  const chapterQuestionIds = chapter.questions.map((q) => q.questionId);

  // Filter answer records that belong to this chapter's questions
  // and were created in the *current* session context?
  // Actually answerRecords is a map of questionId -> record.
  // It resets on startQuiz. So it only contains current session data.
  const relevantRecords = Object.entries(answerRecords)
    .filter(([qId]) => chapterQuestionIds.includes(qId))
    .map(([, rec]) => rec);

  const totalQuestions = chapter.questions.length;
  // Count correct answers based on available records
  // (Handling case where user might not have answered all, although navigation prevents that usually)
  const correctAnswers = relevantRecords.filter((r) => r.isCorrect).length;
  const incorrectAnswers = relevantRecords.length - correctAnswers;

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const results = {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    accuracy,
  };

  const hasIncorrectAnswers = incorrectAnswers > 0;

  // 2. Logic for Next Chapter
  const currentChapterIndex = currentModule.chapters.findIndex((c) => c.id === currentChapterId);
  const nextChapter =
    currentChapterIndex !== -1 && currentChapterIndex < currentModule.chapters.length - 1
      ? currentModule.chapters[currentChapterIndex + 1]
      : null;

  // 3. Logic for Review Mistakes
  const handleReviewMistakes = () => {
    const incorrectQuestionIds = Object.entries(answerRecords)
      .filter(([qId, rec]) => !rec.isCorrect && chapterQuestionIds.includes(qId))
      .map(([qId]) => qId);

    const mistakes = chapter.questions.filter((q) => incorrectQuestionIds.includes(q.questionId));

    if (mistakes.length === 0) return;

    const reviewChapterId = `${currentChapterId}-review-${Date.now()}`;

    // Create a transient chapter for review
    // We reset status for the session to 'not_attempted' stylistically if needed,
    // but here we just pass the questions as-is.
    const reviewChapter: QuizChapter = {
      ...chapter,
      id: reviewChapterId,
      name: `${chapter.name} (Review)`,
      questions: mistakes,
      totalQuestions: mistakes.length,
      answeredQuestions: 0,
      correctAnswers: 0,
      isCompleted: false,
    };

    // Inject the transient chapter into the module
    updateModule((mod) => ({
      ...mod,
      chapters: [...mod.chapters, reviewChapter],
    }));

    // Start the quiz on the new chapter
    startQuiz(reviewChapterId);
  };

  return (
    <QuizComplete
      chapter={{ id: chapter.id, name: chapter.name }}
      results={results}
      onBackToDashboard={() => setAppState('dashboard')}
      onRetryQuiz={() => startQuiz(chapter.id)}
      onExportResults={() => {
        console.log('Exporting results...');
        // Placeholder for export logic
      }}
      onLoadNewModule={() => setAppState('welcome')}
      onExportIncorrectAnswers={() => {
        console.log('Exporting incorrect answers...');
        // Placeholder
      }}
      hasIncorrectAnswers={hasIncorrectAnswers}
      nextChapterId={nextChapter?.id}
      onStartChapterQuiz={(id) => startQuiz(id)}
      onReviewMistakes={handleReviewMistakes}
    />
  );
}
