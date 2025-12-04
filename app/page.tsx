'use client';

import { useEffect } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { WelcomeScreen } from '@/components/welcome-screen';
import { Toaster } from '@/components/ui/toaster';
import { ScreenReaderAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';
import { DashboardContainer } from '@/features/dashboard/components/DashboardContainer';
import { QuizSessionContainer } from '@/features/quiz-session/components/QuizSessionContainer';
import { useModuleLoader } from '@/features/dashboard/hooks/use-module-loader';

export default function MCQQuizForge() {
  const appState = useQuizStore((state) => state.appState);
  const { loadDefault, loadFromFile, isLoading, error } = useModuleLoader();

  // Initial load
  useEffect(() => {
    loadDefault();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
              console.log('Starting quiz:', chapterId);
            }}
            onStartReview={() => {
              console.log('Starting review');
            }}
          />
        )}

        {appState === 'quiz' && (
          <QuizSessionContainer
            onComplete={() => {
              // Handled by container/store
            }}
            onBack={() => {
              // Handled by container/store
            }}
          />
        )}

        <Toaster />
      </ScreenReaderAnnouncer>
    </main>
  );
}
