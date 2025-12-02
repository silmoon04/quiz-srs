import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChapterCard } from '@/components/chapter-card';

// Mock lucide-react icons to simplify testing
vi.mock('lucide-react', () => ({
  BookOpen: () => <span data-testid="book-open-icon">BookOpen</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">CheckCircle</span>,
  PlayCircle: () => <span data-testid="play-circle-icon">PlayCircle</span>,
}));

// Mock the ProgressBar component to simplify testing
vi.mock('@/components/progress-bar', () => ({
  ProgressBar: ({
    current,
    total,
    variant,
    compact,
    showPercentage,
  }: {
    current: number;
    total: number;
    variant?: string;
    compact?: boolean;
    showPercentage?: boolean;
  }) => (
    <div
      data-testid="progress-bar"
      data-current={current}
      data-total={total}
      data-variant={variant}
      data-compact={compact}
      data-show-percentage={showPercentage}
    >
      Progress: {current}/{total}
    </div>
  ),
}));

// Helper to create chapter data
const createChapterData = (
  overrides: Partial<{
    id: string;
    name: string;
    description?: string;
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    isCompleted: boolean;
  }> = {},
) => ({
  id: 'chapter-1',
  name: 'Chapter 1: Introduction to Testing',
  description: 'Learn the basics of testing React components',
  totalQuestions: 10,
  answeredQuestions: 0,
  correctAnswers: 0,
  isCompleted: false,
  ...overrides,
});

// Default props factory
const createDefaultProps = (chapterOverrides = {}) => ({
  chapter: createChapterData(chapterOverrides),
  onStartQuiz: vi.fn(),
});

describe('ChapterCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the chapter card', () => {
      render(<ChapterCard {...createDefaultProps()} />);
      expect(screen.getByText('Introduction to Testing')).toBeInTheDocument();
    });

    it('should render the BookOpen icon', () => {
      render(<ChapterCard {...createDefaultProps()} />);
      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
    });

    it('should render the progress bar component', () => {
      render(<ChapterCard {...createDefaultProps()} />);
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    it('should render the action button', () => {
      render(<ChapterCard {...createDefaultProps()} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Chapter Name Parsing', () => {
    it('should parse chapter name with prefix and colon', () => {
      render(<ChapterCard {...createDefaultProps({ name: 'Chapter 1: Introduction' })} />);
      expect(screen.getByText('Chapter 1:')).toBeInTheDocument();
      expect(screen.getByText('Introduction')).toBeInTheDocument();
    });

    it('should render chapter name without prefix when no colon exists', () => {
      render(<ChapterCard {...createDefaultProps({ name: 'Introduction to Testing' })} />);
      expect(screen.getByText('Introduction to Testing')).toBeInTheDocument();
    });

    it('should handle name with multiple colons correctly', () => {
      render(
        <ChapterCard {...createDefaultProps({ name: 'Part 1: Introduction: Getting Started' })} />,
      );
      expect(screen.getByText('Part 1:')).toBeInTheDocument();
      expect(screen.getByText('Introduction: Getting Started')).toBeInTheDocument();
    });

    it('should handle empty prefix before colon', () => {
      render(<ChapterCard {...createDefaultProps({ name: ': Just the Title' })} />);
      expect(screen.getByText(':')).toBeInTheDocument();
      expect(screen.getByText('Just the Title')).toBeInTheDocument();
    });

    it('should handle name ending with colon', () => {
      render(<ChapterCard {...createDefaultProps({ name: 'Chapter Title:' })} />);
      expect(screen.getByText('Chapter Title:')).toBeInTheDocument();
    });
  });

  describe('Chapter Description', () => {
    it('should render chapter description when provided', () => {
      render(<ChapterCard {...createDefaultProps({ description: 'Test description' })} />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(<ChapterCard {...createDefaultProps({ description: undefined })} />);
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });

    it('should not render description paragraph when empty string', () => {
      const { container } = render(<ChapterCard {...createDefaultProps({ description: '' })} />);
      // Empty description should not render a paragraph element
      const descriptionParagraph = container.querySelector('p.text-xs.text-gray-400');
      expect(descriptionParagraph).not.toBeInTheDocument();
    });

    it('should render long description text', () => {
      const longDescription =
        'This is a very long description that explains all the topics covered in this chapter including testing, components, and React best practices.';
      render(<ChapterCard {...createDefaultProps({ description: longDescription })} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });

  describe('Progress Indication', () => {
    it('should display questions completed count', () => {
      render(<ChapterCard {...createDefaultProps({ answeredQuestions: 5, totalQuestions: 10 })} />);
      expect(screen.getByText('5 of 10 questions completed')).toBeInTheDocument();
    });

    it('should display zero questions completed for not started chapter', () => {
      render(<ChapterCard {...createDefaultProps({ answeredQuestions: 0, totalQuestions: 10 })} />);
      expect(screen.getByText('0 of 10 questions completed')).toBeInTheDocument();
    });

    it('should display all questions completed', () => {
      render(
        <ChapterCard
          {...createDefaultProps({ answeredQuestions: 10, totalQuestions: 10, isCompleted: true })}
        />,
      );
      expect(screen.getByText('10 of 10 questions completed')).toBeInTheDocument();
    });

    it('should pass correct props to ProgressBar', () => {
      render(<ChapterCard {...createDefaultProps({ answeredQuestions: 5, totalQuestions: 10 })} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-current', '5');
      expect(progressBar).toHaveAttribute('data-total', '10');
      expect(progressBar).toHaveAttribute('data-compact', 'true');
      expect(progressBar).toHaveAttribute('data-show-percentage', 'true');
    });

    it('should pass success variant to ProgressBar when chapter is completed', () => {
      render(<ChapterCard {...createDefaultProps({ isCompleted: true })} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-variant', 'success');
    });

    it('should pass default variant to ProgressBar when chapter is not completed', () => {
      render(<ChapterCard {...createDefaultProps({ isCompleted: false })} />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-variant', 'default');
    });
  });

  describe('Accuracy Display', () => {
    it('should display accuracy when questions are answered', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 10,
            correctAnswers: 7,
          })}
        />,
      );
      expect(screen.getByText('Accuracy:')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('should not display visible accuracy when no questions answered', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 0,
            correctAnswers: 0,
          })}
        />,
      );
      // The hidden placeholder should exist but with transparent text
      expect(screen.getByText('Accuracy: 0%')).toHaveClass('text-transparent');
    });

    it('should calculate accuracy correctly at 100%', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 10,
            correctAnswers: 10,
          })}
        />,
      );
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should calculate accuracy correctly at 0%', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 10,
            correctAnswers: 0,
          })}
        />,
      );
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should round accuracy to nearest whole number', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 3,
            correctAnswers: 1,
          })}
        />,
      );
      // 1/3 = 33.33... should round to 33%
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('should apply green color to high accuracy (>=70%)', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 10,
            correctAnswers: 7,
          })}
        />,
      );
      const accuracyValue = screen.getByText('70%');
      expect(accuracyValue).toHaveClass('text-green-400');
    });

    it('should apply yellow color to low accuracy (<70%)', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 10,
            correctAnswers: 6,
          })}
        />,
      );
      const accuracyValue = screen.getByText('60%');
      expect(accuracyValue).toHaveClass('text-yellow-400');
    });

    it('should apply green color to accuracy exactly at 70%', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 10,
            correctAnswers: 7,
          })}
        />,
      );
      const accuracyValue = screen.getByText('70%');
      expect(accuracyValue).toHaveClass('text-green-400');
    });
  });

  describe('Button States - Not Started', () => {
    it('should show Start Quiz button for not started chapter', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 0,
            isCompleted: false,
          })}
        />,
      );
      expect(screen.getByRole('button', { name: /start quiz/i })).toBeInTheDocument();
    });

    it('should show PlayCircle icon for not started chapter', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 0,
            isCompleted: false,
          })}
        />,
      );
      expect(screen.getByTestId('play-circle-icon')).toBeInTheDocument();
    });
  });

  describe('Button States - In Progress', () => {
    it('should show Continue Quiz button for in-progress chapter', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 5,
            totalQuestions: 10,
            isCompleted: false,
          })}
        />,
      );
      expect(screen.getByRole('button', { name: /continue quiz/i })).toBeInTheDocument();
    });

    it('should show PlayCircle icon for in-progress chapter', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 5,
            isCompleted: false,
          })}
        />,
      );
      expect(screen.getByTestId('play-circle-icon')).toBeInTheDocument();
    });
  });

  describe('Button States - Completed', () => {
    it('should show Review Quiz button for completed chapter', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 10,
            totalQuestions: 10,
            isCompleted: true,
          })}
        />,
      );
      expect(screen.getByRole('button', { name: /review quiz/i })).toBeInTheDocument();
    });

    it('should show CheckCircle icon for completed chapter', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            isCompleted: true,
          })}
        />,
      );
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onStartQuiz with chapter id when button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ id: 'test-chapter-123' });
      render(<ChapterCard {...props} />);

      await user.click(screen.getByRole('button'));

      expect(props.onStartQuiz).toHaveBeenCalledTimes(1);
      expect(props.onStartQuiz).toHaveBeenCalledWith('test-chapter-123');
    });

    it('should call onStartQuiz when Start Quiz button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ answeredQuestions: 0, isCompleted: false });
      render(<ChapterCard {...props} />);

      await user.click(screen.getByRole('button', { name: /start quiz/i }));

      expect(props.onStartQuiz).toHaveBeenCalledTimes(1);
    });

    it('should call onStartQuiz when Continue Quiz button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ answeredQuestions: 5, isCompleted: false });
      render(<ChapterCard {...props} />);

      await user.click(screen.getByRole('button', { name: /continue quiz/i }));

      expect(props.onStartQuiz).toHaveBeenCalledTimes(1);
    });

    it('should call onStartQuiz when Review Quiz button is clicked', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ isCompleted: true });
      render(<ChapterCard {...props} />);

      await user.click(screen.getByRole('button', { name: /review quiz/i }));

      expect(props.onStartQuiz).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple rapid clicks', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ChapterCard {...props} />);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(props.onStartQuiz).toHaveBeenCalledTimes(3);
    });
  });

  describe('Different Chapter States', () => {
    it('should render correctly for not started chapter', () => {
      const props = createDefaultProps({
        answeredQuestions: 0,
        correctAnswers: 0,
        isCompleted: false,
      });
      render(<ChapterCard {...props} />);

      expect(screen.getByRole('button', { name: /start quiz/i })).toBeInTheDocument();
      expect(screen.getByTestId('play-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('0 of 10 questions completed')).toBeInTheDocument();
    });

    it('should render correctly for in-progress chapter with low accuracy', () => {
      const props = createDefaultProps({
        answeredQuestions: 5,
        correctAnswers: 2,
        isCompleted: false,
      });
      render(<ChapterCard {...props} />);

      expect(screen.getByRole('button', { name: /continue quiz/i })).toBeInTheDocument();
      expect(screen.getByText('40%')).toHaveClass('text-yellow-400');
    });

    it('should render correctly for in-progress chapter with high accuracy', () => {
      const props = createDefaultProps({
        answeredQuestions: 5,
        correctAnswers: 4,
        isCompleted: false,
      });
      render(<ChapterCard {...props} />);

      expect(screen.getByRole('button', { name: /continue quiz/i })).toBeInTheDocument();
      expect(screen.getByText('80%')).toHaveClass('text-green-400');
    });

    it('should render correctly for completed chapter', () => {
      const props = createDefaultProps({
        answeredQuestions: 10,
        correctAnswers: 10,
        totalQuestions: 10,
        isCompleted: true,
      });
      render(<ChapterCard {...props} />);

      expect(screen.getByRole('button', { name: /review quiz/i })).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('10 of 10 questions completed')).toBeInTheDocument();
      expect(screen.getByText('100%')).toHaveClass('text-green-400');
    });

    it('should render correctly for completed chapter with low accuracy', () => {
      const props = createDefaultProps({
        answeredQuestions: 10,
        correctAnswers: 5,
        totalQuestions: 10,
        isCompleted: true,
      });
      render(<ChapterCard {...props} />);

      expect(screen.getByRole('button', { name: /review quiz/i })).toBeInTheDocument();
      expect(screen.getByText('50%')).toHaveClass('text-yellow-400');
    });
  });

  describe('Visual Styling', () => {
    it('should apply completed chapter styling', () => {
      const { container } = render(<ChapterCard {...createDefaultProps({ isCompleted: true })} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-green-700/70');
      expect(card.className).toContain('to-green-950');
    });

    it('should apply not completed chapter styling', () => {
      const { container } = render(<ChapterCard {...createDefaultProps({ isCompleted: false })} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-gray-800');
      expect(card.className).toContain('to-gray-950');
    });

    it('should have hover transition classes', () => {
      const { container } = render(<ChapterCard {...createDefaultProps()} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('transition-all');
      expect(card.className).toContain('hover:shadow-md');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero total questions', () => {
      render(<ChapterCard {...createDefaultProps({ totalQuestions: 0, answeredQuestions: 0 })} />);
      expect(screen.getByText('0 of 0 questions completed')).toBeInTheDocument();
    });

    it('should handle chapter with very long name', () => {
      const longName = 'Chapter 1: ' + 'A'.repeat(200);
      render(<ChapterCard {...createDefaultProps({ name: longName })} />);
      expect(screen.getByText('Chapter 1:')).toBeInTheDocument();
    });

    it('should handle chapter with special characters in name', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            name: 'Chapter 1: <script>alert("xss")</script>',
          })}
        />,
      );
      expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
    });

    it('should handle chapter with unicode characters in name', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            name: 'Chapter 1: 日本語テスト 🎉',
          })}
        />,
      );
      expect(screen.getByText('日本語テスト 🎉')).toBeInTheDocument();
    });

    it('should handle chapter with numeric id', () => {
      const props = createDefaultProps({ id: '12345' });
      render(<ChapterCard {...props} />);

      const user = userEvent.setup();
    });

    it('should handle answered questions exceeding total questions', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 15,
            totalQuestions: 10,
          })}
        />,
      );
      expect(screen.getByText('15 of 10 questions completed')).toBeInTheDocument();
    });

    it('should handle correct answers exceeding answered questions', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 5,
            correctAnswers: 10,
          })}
        />,
      );
      // Should still calculate even if data is inconsistent
      expect(screen.getByText('200%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      render(<ChapterCard {...createDefaultProps()} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render semantic heading for chapter title', () => {
      render(<ChapterCard {...createDefaultProps()} />);
      // CardTitle uses default heading - verify text is present
      expect(screen.getByText('Introduction to Testing')).toBeInTheDocument();
    });

    it('should have button with descriptive text for start state', () => {
      render(<ChapterCard {...createDefaultProps({ answeredQuestions: 0, isCompleted: false })} />);
      expect(screen.getByRole('button', { name: /start quiz/i })).toBeInTheDocument();
    });

    it('should have button with descriptive text for continue state', () => {
      render(<ChapterCard {...createDefaultProps({ answeredQuestions: 5, isCompleted: false })} />);
      expect(screen.getByRole('button', { name: /continue quiz/i })).toBeInTheDocument();
    });

    it('should have button with descriptive text for review state', () => {
      render(<ChapterCard {...createDefaultProps({ isCompleted: true })} />);
      expect(screen.getByRole('button', { name: /review quiz/i })).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render Card component container', () => {
      const { container } = render(<ChapterCard {...createDefaultProps()} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(<ChapterCard {...createDefaultProps({ description: 'Test description' })} />);

      // Header with title
      expect(screen.getByText('Introduction to Testing')).toBeInTheDocument();
      // Description
      expect(screen.getByText('Test description')).toBeInTheDocument();
      // Progress bar
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      // Questions completed text
      expect(screen.getByText(/questions completed/)).toBeInTheDocument();
      // Action button
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Accuracy Calculation Edge Cases', () => {
    it('should return 0 accuracy when no questions answered', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 0,
            correctAnswers: 0,
          })}
        />,
      );
      // Hidden placeholder with 0%
      expect(screen.getByText('Accuracy: 0%')).toHaveClass('text-transparent');
    });

    it('should calculate correct accuracy with large numbers', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 1000,
            correctAnswers: 753,
          })}
        />,
      );
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should round down for values just below threshold', () => {
      render(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 10,
            correctAnswers: 6.9,
          })}
        />,
      );
      // JavaScript will handle non-integer but Math.round should still work
      expect(screen.getByText('69%')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle minimal chapter data', () => {
      const minimalChapter = {
        id: 'min',
        name: 'Minimal',
        totalQuestions: 1,
        answeredQuestions: 0,
        correctAnswers: 0,
        isCompleted: false,
      };
      render(<ChapterCard chapter={minimalChapter} onStartQuiz={vi.fn()} />);
      expect(screen.getByText('Minimal')).toBeInTheDocument();
    });

    it('should handle chapter with all optional fields', () => {
      const fullChapter = {
        id: 'full',
        name: 'Section 1: Full Chapter',
        description: 'Complete description with all details',
        totalQuestions: 20,
        answeredQuestions: 15,
        correctAnswers: 12,
        isCompleted: false,
      };
      render(<ChapterCard chapter={fullChapter} onStartQuiz={vi.fn()} />);

      expect(screen.getByText('Section 1:')).toBeInTheDocument();
      expect(screen.getByText('Full Chapter')).toBeInTheDocument();
      expect(screen.getByText('Complete description with all details')).toBeInTheDocument();
      expect(screen.getByText('15 of 20 questions completed')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });

  describe('Interactive Behavior', () => {
    it('should maintain button functionality after re-render', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();
      const { rerender } = render(<ChapterCard {...props} />);

      await user.click(screen.getByRole('button'));
      expect(props.onStartQuiz).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<ChapterCard {...props} />);

      await user.click(screen.getByRole('button'));
      expect(props.onStartQuiz).toHaveBeenCalledTimes(2);
    });

    it('should update when chapter prop changes', () => {
      const props = createDefaultProps({ answeredQuestions: 0, isCompleted: false });
      const { rerender } = render(<ChapterCard {...props} />);

      expect(screen.getByRole('button', { name: /start quiz/i })).toBeInTheDocument();

      // Update to completed state
      rerender(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 10,
            isCompleted: true,
          })}
        />,
      );

      expect(screen.getByRole('button', { name: /review quiz/i })).toBeInTheDocument();
    });

    it('should update accuracy display when answers change', () => {
      const props = createDefaultProps({
        answeredQuestions: 5,
        correctAnswers: 3,
      });
      const { rerender } = render(<ChapterCard {...props} />);

      expect(screen.getByText('60%')).toBeInTheDocument();

      // Update correct answers
      rerender(
        <ChapterCard
          {...createDefaultProps({
            answeredQuestions: 5,
            correctAnswers: 4,
          })}
        />,
      );

      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });
});
