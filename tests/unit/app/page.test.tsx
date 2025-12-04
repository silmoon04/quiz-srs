import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MCQQuizForge from '@/app/page';
import { useQuizStore } from '@/store/quiz-store';

// Mock the hooks and components
const mockLoadDefault = vi.fn();
const mockLoadFromFile = vi.fn();

vi.mock('@/features/dashboard/hooks/use-module-loader', () => ({
  useModuleLoader: () => ({
    loadDefault: mockLoadDefault,
    loadFromFile: mockLoadFromFile,
    isLoading: false,
    error: '',
  }),
}));

vi.mock('@/components/welcome-screen', () => ({
  WelcomeScreen: () => <div data-testid="welcome-screen">Welcome Screen</div>,
}));

vi.mock('@/features/dashboard/components/DashboardContainer', () => ({
  DashboardContainer: () => <div data-testid="dashboard-container">Dashboard Container</div>,
}));

vi.mock('@/features/quiz-session/components/QuizSessionContainer', () => ({
  QuizSessionContainer: () => (
    <div data-testid="quiz-session-container">Quiz Session Container</div>
  ),
}));

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

vi.mock('@/components/a11y/ScreenReaderAnnouncer', () => ({
  ScreenReaderAnnouncer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="announcer">{children}</div>
  ),
}));

describe('MCQQuizForge Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuizStore.setState({ appState: 'welcome' });
  });

  it('should call loadDefault on mount', () => {
    render(<MCQQuizForge />);
    expect(mockLoadDefault).toHaveBeenCalledTimes(1);
  });

  it('should render WelcomeScreen when appState is welcome', () => {
    useQuizStore.setState({ appState: 'welcome' });
    render(<MCQQuizForge />);
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-container')).not.toBeInTheDocument();
  });

  it('should render DashboardContainer when appState is dashboard', () => {
    useQuizStore.setState({ appState: 'dashboard' });
    render(<MCQQuizForge />);
    expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome-screen')).not.toBeInTheDocument();
  });

  it('should render QuizSessionContainer when appState is quiz', () => {
    useQuizStore.setState({ appState: 'quiz' });
    render(<MCQQuizForge />);
    expect(screen.getByTestId('quiz-session-container')).toBeInTheDocument();
  });

  it('should render Toaster', () => {
    render(<MCQQuizForge />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});
