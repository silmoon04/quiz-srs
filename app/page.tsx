'use client';

import { useQuizStore } from '@/store/quiz-store';
import { WelcomeScreen } from '@/components/welcome-screen';
import { Toaster } from '@/components/ui/toaster';
import { ScreenReaderAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';
import { DashboardContainer } from '@/features/dashboard/components/DashboardContainer';
import { QuizSessionContainer } from '@/features/quiz-session/components/QuizSessionContainer';
import { QuizCompleteContainer } from '@/features/quiz-session/components/QuizCompleteContainer';
import { useModuleLoader } from '@/features/dashboard/hooks/use-module-loader';

export default function MCQQuizForge() {
  const appState = useQuizStore((state) => state.appState);
  const startQuiz = useQuizStore((state) => state.startQuiz);
  const startReviewSession = useQuizStore((state) => state.startReviewSession);
  const setAppState = useQuizStore((state) => state.setAppState);
  const { loadDefault, loadFromFile, isLoading, error } = useModuleLoader();

  return (
    <main className="min-h-screen bg-background font-sans antialiased">
      <ScreenReaderAnnouncer>
        {appState === 'welcome' && (
          <WelcomeScreen
            onLoadDefaultQuiz={loadDefault}
            onLoadQuiz={loadFromFile}
            isLoading={isLoading}
            error={error}
          />
        )}

        {appState === 'dashboard' && (
          <DashboardContainer
            onStartQuiz={(chapterId) => {
              startQuiz(chapterId);
            }}
            onStartReview={() => {
              startReviewSession();
            }}
          />
        )}

        {appState === 'quiz' && (
          <QuizSessionContainer
            onComplete={() => {
              setAppState('complete');
            }}
            onBack={() => {
              // Handled by container/store
            }}
          />
        )}

        {appState === 'complete' && <QuizCompleteContainer />}

        <Toaster />
      </ScreenReaderAnnouncer>
    </main>
  );
}
