'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { WelcomeScreen } from '@/components/welcome-screen';
import { Dashboard } from '@/components/dashboard';
import { QuizSession } from '@/components/quiz-session';
import { QuizComplete } from '@/components/quiz-complete';
import { AllQuestionsView } from '@/components/all-questions-view';
import { Toaster } from '@/components/ui/toaster';
import { useToast, toast } from '@/components/ui/use-toast';
import {
  validateQuizModule,
  normalizeQuizModule,
  validateSingleQuestion,
  normalizeSingleQuestion,
  recalculateChapterStats,
  validateAndCorrectQuizModule,
} from '@/utils/quiz-validation-refactored';
import type {
  QuizModule,
  QuizChapter,
  QuizQuestion,
  DisplayedOption,
  SrsProgressCounts,
  IncorrectAnswersExport,
  SessionHistoryEntry,
} from '@/types/quiz-types';
import { ConfirmationModal } from '@/components/confirmation-modal-radix';
// import { QuestionReviewModal } from '@/components/question-review-modal';

type AppState = 'welcome' | 'dashboard' | 'quiz' | 'complete' | 'all-questions';

// Interface for the result of getNextReviewQuestion
interface NextReviewQuestion {
  chapterId: string;
  question: QuizQuestion;
}

// Define the structure for incorrect answer log entries
interface IncorrectAnswerLogEntry {
  questionId: string;
  questionText: string;
  chapterId: string;
  chapterName: string;
  incorrectSelections: {
    selectedOptionId: string;
    selectedOptionText: string;
  }[];
  correctOptionIds: string[];
  correctOptionTexts: string[];
  explanationText: string;
  totalTimesCorrect: number;
  totalTimesIncorrect: number;
  currentSrsLevel: number;
  lastAttemptedAt?: string;
}

interface AnswerRecord {
  selectedOptionId: string | null;
  isCorrect: boolean;
  displayedOptionIds: string[];
  timestamp: string;
}

export default function MCQQuizForge() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [currentModule, setCurrentModule] = useState<QuizModule | null>(null);
  const [currentChapterId, setCurrentChapterId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // For managing the "delete current question" confirmation
  const [showDeleteCurrentQuestionConfirmation, setShowDeleteCurrentQuestionConfirmation] =
    useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<QuizQuestion | null>(null);

  // For managing the "overwrite current question" confirmation
  const [showOverwriteCurrentQuestionConfirmation, setShowOverwriteCurrentQuestionConfirmation] =
    useState(false);
  const [pendingOverwriteData, setPendingOverwriteData] = useState<QuizQuestion | null>(null);

  // For managing the "review and append new questions" modal
  // const [showAppendReviewModal, setShowAppendReviewModal] = useState(false);
  const [questionsToReviewForAppend, setQuestionsToReviewForAppend] = useState<QuizQuestion[]>([]);

  // Toast notifications
  useToast();

  // Helper functions for toast notifications
  const showSuccess = (title: string, message?: string) => {
    toast({
      title,
      description: message,
    });
  };

  const showError = (title: string, message?: string) => {
    toast({
      title,
      description: message,
      variant: 'destructive',
    });
  };

  const showInfo = (title: string, message?: string) => {
    toast({
      title,
      description: message,
    });
  };

  const showWarning = (title: string, message?: string) => {
    toast({
      title,
      description: message,
    });
  };

  // SRS state - SIMPLIFIED: Remove static reviewQueue, use dynamic approach
  const [isReviewSessionActive, setIsReviewSessionActive] = useState(false);
  // For review mode, we'll store the current review question directly
  const [currentReviewQuestion, setCurrentReviewQuestion] = useState<NextReviewQuestion | null>(
    null,
  );

  // Session History Navigation State
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryEntry[]>([]);
  const [currentHistoryViewIndex, setCurrentHistoryViewIndex] = useState<number | null>(null);

  const [answerRecords, setAnswerRecords] = useState<Record<string, AnswerRecord>>({});

  const applyAnswerRecordToQuestion = useCallback(
    (question: QuizQuestion | null | undefined) => {
      if (!question) {
        setSelectedOptionId(null);
        setIsSubmitted(false);
        return;
      }

      const record = answerRecords[question.questionId];
      if (!record) {
        setSelectedOptionId(null);
        setIsSubmitted(false);
        return;
      }

      setSelectedOptionId(record.selectedOptionId);
      setIsSubmitted(record.selectedOptionId !== null);
    },
    [answerRecords],
  );

  useEffect(() => {
    if (appState !== 'quiz') {
      return;
    }

    if (currentHistoryViewIndex !== null) {
      return;
    }

    if (isReviewSessionActive) {
      applyAnswerRecordToQuestion(currentReviewQuestion?.question);
      return;
    }

    if (!currentModule) {
      applyAnswerRecordToQuestion(null);
      return;
    }

    const chapter = currentModule.chapters.find((c) => c.id === currentChapterId);
    if (!chapter) {
      applyAnswerRecordToQuestion(null);
      return;
    }

    const question = chapter.questions[currentQuestionIndex];
    applyAnswerRecordToQuestion(question);
  }, [
    appState,
    currentChapterId,
    currentQuestionIndex,
    currentHistoryViewIndex,
    currentModule,
    currentReviewQuestion,
    isReviewSessionActive,
    applyAnswerRecordToQuestion,
  ]);

  // Edit Mode State - Phase 1
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [editingQuestionData, setEditingQuestionData] = useState<QuizQuestion | null>(null);

  // Edit Mode Handler - Phase 1
  const handleSetEditMode = (question: QuizQuestion | null) => {
    console.log('=== Setting Edit Mode ===');
    console.log('Question:', question ? question.questionId : 'null (new question)');

    setEditingQuestionData(question);
    setIsEditModeActive(question !== null);

    if (question) {
      console.log('Entering edit mode for existing question');
    } else {
      console.log('Exiting edit mode');
    }
  };

  // Phase 3: Save/Update Logic
  const handleSaveQuestion = async (questionData: QuizQuestion) => {
    if (!currentModule || !currentChapterId) {
      showError('Save Failed', 'No current module or chapter context found');
      return;
    }

    try {
      console.log('=== Saving Question ===');
      console.log('Question ID:', questionData.questionId);
      console.log('Is new question:', !editingQuestionData);

      // Validate question data
      const validation = validateSingleQuestion(questionData);
      if (!validation.isValid) {
        showError(
          'Validation Failed',
          `Question validation failed:\n${validation.errors.slice(0, 3).join('\n')}`,
        );
        return;
      }

      // Create deep copy of module
      const updatedModule = JSON.parse(JSON.stringify(currentModule)) as QuizModule;
      const targetChapter = updatedModule.chapters.find((c) => c.id === currentChapterId);

      if (!targetChapter) {
        showError('Save Failed', 'Target chapter not found');
        return;
      }

      // Normalize the question data
      const normalizedQuestion = normalizeSingleQuestion(questionData);

      if (editingQuestionData) {
        // Update existing question
        const questionIndex = targetChapter.questions.findIndex(
          (q) => q.questionId === editingQuestionData.questionId,
        );

        if (questionIndex === -1) {
          showError('Save Failed', 'Original question not found for update');
          return;
        }

        // Preserve performance tracking data from original question
        const originalQuestion = targetChapter.questions[questionIndex];
        normalizedQuestion.status = originalQuestion.status;
        normalizedQuestion.timesAnsweredCorrectly = originalQuestion.timesAnsweredCorrectly;
        normalizedQuestion.timesAnsweredIncorrectly = originalQuestion.timesAnsweredIncorrectly;
        normalizedQuestion.historyOfIncorrectSelections =
          originalQuestion.historyOfIncorrectSelections;
        normalizedQuestion.lastSelectedOptionId = originalQuestion.lastSelectedOptionId;
        normalizedQuestion.lastAttemptedAt = originalQuestion.lastAttemptedAt;
        normalizedQuestion.srsLevel = originalQuestion.srsLevel;
        normalizedQuestion.nextReviewAt = originalQuestion.nextReviewAt;
        normalizedQuestion.shownIncorrectOptionIds = originalQuestion.shownIncorrectOptionIds;

        targetChapter.questions[questionIndex] = normalizedQuestion;
        console.log('Updated existing question at index:', questionIndex);

        showSuccess('Question Updated', 'Question updated successfully');
      } else {
        // Add new question
        const currentQuestion = getCurrentQuestion();
        let insertionIndex = targetChapter.questions.length; // Default to end

        if (currentQuestion) {
          // Insert after current question
          const currentIndex = targetChapter.questions.findIndex(
            (q) => q.questionId === currentQuestion.questionId,
          );
          if (currentIndex !== -1) {
            insertionIndex = currentIndex + 1;
          }
        }

        targetChapter.questions.splice(insertionIndex, 0, normalizedQuestion);
        console.log('Added new question at index:', insertionIndex);

        showSuccess('Question Added', 'New question added successfully');
      }

      // Recalculate chapter stats
      recalculateChapterStats(targetChapter);

      // Update module state
      setCurrentModule(updatedModule);

      // Exit edit mode
      handleSetEditMode(null);

      console.log('Question save completed successfully');
    } catch (error) {
      console.error('Error saving question:', error);
      showError(
        'Save Failed',
        `Failed to save question: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  // Phase 4: Delete Logic
  const handleDeleteQuestion = async (questionId: string) => {
    if (!currentModule || !currentChapterId) {
      showError('Delete Failed', 'No current module or chapter context found');
      return;
    }

    try {
      console.log('=== Deleting Question ===');
      console.log('Question ID:', questionId);

      // Create deep copy of module
      const updatedModule = JSON.parse(JSON.stringify(currentModule)) as QuizModule;
      const targetChapter = updatedModule.chapters.find((c) => c.id === currentChapterId);

      if (!targetChapter) {
        showError('Delete Failed', 'Target chapter not found');
        return;
      }

      const questionIndex = targetChapter.questions.findIndex((q) => q.questionId === questionId);

      if (questionIndex === -1) {
        showError('Delete Failed', 'Question not found for deletion');
        return;
      }

      // Check if this is the only question in the chapter
      if (targetChapter.questions.length === 1) {
        showWarning('Cannot Delete', 'Cannot delete the last question in a chapter');
        return;
      }

      // Remove the question
      targetChapter.questions.splice(questionIndex, 1);
      console.log('Deleted question at index:', questionIndex);

      // Recalculate chapter stats
      recalculateChapterStats(targetChapter);

      // Update module state
      setCurrentModule(updatedModule);

      // Exit edit mode
      handleSetEditMode(null);

      // Adjust current question index if necessary
      if (currentQuestionIndex >= targetChapter.questions.length) {
        setCurrentQuestionIndex(Math.max(0, targetChapter.questions.length - 1));
      }

      showSuccess('Question Deleted', 'Question deleted successfully');
      console.log('Question deletion completed successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      showError(
        'Delete Failed',
        `Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  // Phase 5: Unique ID Generation
  const generateUniqueOptionId = (questionId: string, existingOptionIds: string[]): string => {
    let counter = 1;
    let newId: string;

    do {
      newId = `${questionId}_opt${counter}`;
      counter++;
    } while (existingOptionIds.includes(newId));

    return newId;
  };

  const generateUniqueQuestionId = (chapterId: string): string => {
    if (!currentModule) return `${chapterId}_q1`;

    const chapter = currentModule.chapters.find((c) => c.id === chapterId);
    if (!chapter) return `${chapterId}_q1`;

    const existingIds = chapter.questions.map((q) => q.questionId);
    let counter = 1;
    let newId: string;

    do {
      newId = `${chapterId}_q${counter}`;
      counter++;
    } while (existingIds.includes(newId));

    return newId;
  };

  // NEW: Load Default Quiz Handler
  const handleLoadDefaultQuiz = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('=== Loading Default Quiz ===');
      console.log('Current URL:', window.location.href);
      console.log('Attempting to fetch default quiz from /default-quiz.json');

      // Try multiple paths for GitHub Pages compatibility
      const possiblePaths = ['/default-quiz.json', './default-quiz.json', 'default-quiz.json'];

      let response: Response | null = null;
      let lastError: Error | null = null;

      for (const path of possiblePaths) {
        try {
          console.log(`Trying path: ${path}`);
          response = await fetch(path);
          console.log(`Response status for ${path}:`, response.status);

          if (response.ok) {
            console.log(`Successfully fetched from: ${path}`);
            break;
          } else {
            console.log(`Failed to fetch from ${path}: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.log(`Error fetching from ${path}:`, error);
          lastError = error as Error;
        }
      }

      if (!response || !response.ok) {
        const errorMessage = `Failed to fetch default quiz from any path. 
        Tried paths: ${possiblePaths.join(', ')}
        Last error: ${lastError?.message || 'Unknown error'}
        Current URL: ${window.location.href}
        Please check if the file exists in the public directory and is accessible.`;
        throw new Error(errorMessage);
      }

      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Get file content as text
      const fileContent = await response.text();
      console.log('Default quiz file content length:', fileContent.length);
      console.log('First 200 characters:', fileContent.substring(0, 200));

      // Parse JSON with error handling
      let parsedData: any;
      try {
        parsedData = JSON.parse(fileContent);
        console.log('Default quiz JSON parsed successfully');
      } catch (parseError) {
        console.error('Default quiz JSON parse error:', parseError);
        throw new Error('Invalid JSON format in default quiz file.');
      }

      // Validate the parsed data
      const validation = validateQuizModule(parsedData);
      if (!validation.isValid) {
        console.error('Default quiz validation errors:', validation.errors);
        throw new Error(`Invalid default quiz format:
${validation.errors.slice(0, 3).join('\n')}`);
      }

      // Normalize and set the module
      const normalizedModule = normalizeQuizModule(parsedData);
      setCurrentModule(normalizedModule);
      setAnswerRecords({});
      setAppState('dashboard');

      // Show success toast
      showSuccess(
        'Algorithm Quiz Loaded!',
        `Loaded "${normalizedModule.name}" with ${normalizedModule.chapters.length} chapters`,
      );

      console.log('Successfully loaded default quiz module:', normalizedModule.name);
    } catch (err) {
      console.error('Error loading default quiz:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unknown error occurred while loading the default quiz';
      setError(errorMessage);

      // Show error toast
      showError('Failed to Load Algorithm Quiz', errorMessage);

      // Keep user on welcome screen if loading fails
      setAppState('welcome');
    } finally {
      setIsLoading(false);
    }
  };

  // REFINED: Calculate review queue count with improved logic that aligns with getNextReviewQuestion
  const reviewQueueCount = useMemo(() => {
    if (!currentModule) return 0;

    const now = new Date();
    let count = 0;

    console.log('=== Calculating Review Queue Count (Refined) ===');
    console.log('Current time:', now.toISOString());

    currentModule.chapters.forEach((chapter) => {
      chapter.questions.forEach((question) => {
        const isNotMastered = question.status !== 'mastered';

        // REFINED: Align with getNextReviewQuestion's understanding of "due"
        const isBrandNewAndReady = question.srsLevel === 0 && question.nextReviewAt === null; // Brand new, srsLevel 0
        const isScheduledAndDue =
          question.nextReviewAt !== null && new Date(question.nextReviewAt!) <= now; // Scheduled and time has passed
        const isDue = isBrandNewAndReady || isScheduledAndDue;

        if (isNotMastered && isDue) {
          count++;
        }
      });
    });

    console.log(`Total review queue count: ${count}`);
    return count;
  }, [currentModule]);

  // FIXED: Calculate SRS progress counts for Anki-style progress bars
  const srsProgressCounts = useMemo((): SrsProgressCounts | null => {
    if (!currentModule || !isReviewSessionActive) return null;

    const now = new Date();
    let newOrLapsingDue = 0;
    let learningReviewDue = 0;
    let totalNonMastered = 0;

    console.log('=== Calculating SRS Progress Counts (FIXED) ===');

    currentModule.chapters.forEach((chapter) => {
      chapter.questions.forEach((question) => {
        const isNotMastered = question.status !== 'mastered';

        if (isNotMastered) {
          totalNonMastered++;

          // FIXED: For newOrLapsingDue, only count srsLevel 0 items that are actually due now
          if (question.srsLevel === 0) {
            const isBrandNewAndReady = question.nextReviewAt === null;
            const isScheduledAndDue =
              question.nextReviewAt !== null && new Date(question.nextReviewAt!) <= now;
            const isDue = isBrandNewAndReady || isScheduledAndDue;

            if (isDue) {
              newOrLapsingDue++;
              console.log(`  - ${question.questionId}: New/Lapsing (srsLevel 0, due now)`);
            }
          }

          // FIXED: For learningReviewDue, count ALL srsLevel 1 items regardless of due time
          // This represents items "in the learning pipeline" like Anki's green learning count
          if (question.srsLevel === 1) {
            learningReviewDue++;
            console.log(`  - ${question.questionId}: Learning Review (srsLevel 1, in pipeline)`);
          }
        }
      });
    });

    const counts = { newOrLapsingDue, learningReviewDue, totalNonMastered };
    return counts;
  }, [currentModule, isReviewSessionActive]);

  // ENHANCED: Find the next most urgent review question with slight "stickiness" for recent failures
  const getNextReviewQuestion = (): NextReviewQuestion | null => {
    if (!currentModule) return null;

    const now = new Date();
    const dueQuestions: Array<
      NextReviewQuestion & {
        priority: number;
        dueTime: number;
        isRecentFailure: boolean;
      }
    > = [];

    console.log('Current time:', now.toISOString());

    // Collect all due questions from all chapters
    currentModule.chapters.forEach((chapter) => {
      chapter.questions.forEach((question) => {
        const isNotMastered = question.status !== 'mastered';

        // Standard "due" evaluation
        const isBrandNewAndReady = question.srsLevel === 0 && question.nextReviewAt === null;
        const isScheduledAndDue =
          question.nextReviewAt !== null && new Date(question.nextReviewAt!) <= now;
        const isDue = isBrandNewAndReady || isScheduledAndDue;

        // ENHANCED: Check for "recent failure" - srsLevel 0 items with nextReviewAt in very near future
        const isRecentFailure =
          question.srsLevel === 0 &&
          question.nextReviewAt !== null &&
          new Date(question.nextReviewAt!).getTime() - now.getTime() <= 60000; // Within 60 seconds

        if (isNotMastered && (isDue || isRecentFailure)) {
          const srsLevel = question.srsLevel || 0;
          const dueTime = question.nextReviewAt ? new Date(question.nextReviewAt).getTime() : 0;

          dueQuestions.push({
            chapterId: chapter.id,
            question,
            priority: srsLevel,
            dueTime,
            isRecentFailure,
          });

          console.log(
            `  - ✅ ADDED TO DUE LIST (Priority: ${srsLevel}, Recent Failure: ${isRecentFailure})`,
          );
        } else {
          console.log(`  - ❌ NOT DUE`);
        }
      });
    });

    if (dueQuestions.length === 0) {
      console.log('No questions due for review');
      return null;
    }

    // ENHANCED: Sort with slight preference for recent failures if queue is small
    dueQuestions.sort((a, b) => {
      // If queue is small (≤3 items) and one is a recent failure, prioritize it slightly
      if (dueQuestions.length <= 3) {
        if (a.isRecentFailure && !b.isRecentFailure) return -1;
        if (!a.isRecentFailure && b.isRecentFailure) return 1;
      }

      // Standard priority sorting
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Lower srsLevel first
      }
      return a.dueTime - b.dueTime; // Earlier due time first
    });

    const nextQuestion = dueQuestions[0];
    console.log(
      `Selected next review question: ${nextQuestion.question.questionId} (Priority: ${nextQuestion.priority}, Recent Failure: ${nextQuestion.isRecentFailure})`,
    );

    return {
      chapterId: nextQuestion.chapterId,
      question: nextQuestion.question,
    };
  };

  // Load the next review question and set up the UI
  const loadNextReviewQuestion = () => {
    console.log('=== Loading Next Review Question ===');

    const nextReview = getNextReviewQuestion();

    if (nextReview) {
      console.log(
        `Loading question: ${nextReview.question.questionId} from chapter: ${nextReview.chapterId}`,
      );

      setCurrentReviewQuestion(nextReview);
      setCurrentChapterId(nextReview.chapterId);
      setSelectedOptionId(null);
      setIsSubmitted(false);
      setAppState('quiz');
    } else {
      console.log('No more questions due - ending review session');

      // No more questions due - end review session
      setIsReviewSessionActive(false);
      setCurrentReviewQuestion(null);
      setAppState('dashboard');

      // REPLACED: alert() with toast notification
      showSuccess('Review Session Complete! 🎉', 'No more reviews due right now. Great job!');
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        }
      };
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };

  // Replace the existing handleLoadQuiz function with this enhanced version
  const handleLoadQuiz = async (file: File) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Loading quiz file:', file.name, 'Size:', file.size, 'Type:', file.type);

      // Read file content
      const fileContent = await readFileAsText(file);
      console.log('File content length:', fileContent.length);

      // Determine file type and parse accordingly
      const isMarkdownFile =
        file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.markdown');

      let normalizedModule: QuizModule;
      let correctionResult: any;

      if (isMarkdownFile) {
        console.log('Processing as Markdown file...');

        // Parse Markdown content
        const { parseMarkdownToQuizModule } = await import('@/utils/quiz-validation-refactored');
        const parseResult = parseMarkdownToQuizModule(fileContent);

        if (!parseResult.success || !parseResult.quizModule) {
          console.error('Markdown parsing errors:', parseResult.errors);
          throw new Error(`Failed to parse Markdown file:
${parseResult.errors.slice(0, 3).join('\n')}`);
        }

        normalizedModule = parseResult.quizModule;

        // Show any parsing warnings
        if (parseResult.errors.length > 0) {
          console.warn('Markdown parsing warnings:', parseResult.errors);
          showWarning(
            'Parsing Warnings',
            `${parseResult.errors.length} warnings during parsing. Check console for details.`,
          );
        }

        setCurrentModule(normalizedModule);
        setAnswerRecords({});
        setAppState('dashboard');

        showSuccess(
          'Markdown Quiz Loaded Successfully!',
          `Loaded "${normalizedModule.name}" with ${normalizedModule.chapters.length} chapters from Markdown`,
        );

        console.log('Successfully loaded Markdown quiz module:', normalizedModule.name);
      } else {
        console.log('Processing as JSON file...');

        // Parse JSON with LaTeX correction (existing logic)
        let parsedData: any;
        try {
          // First attempt: try parsing as-is
          parsedData = JSON.parse(fileContent);
          console.log('JSON parsed successfully without corrections');
        } catch (parseError) {
          console.log('Initial JSON parse failed, applying LaTeX corrections...', parseError);

          // Apply LaTeX corrections and re-parse
          const {
            validationResult: validation,
            correctionResult: latexCorrection,
            normalizedModule: correctedModule,
          } = validateAndCorrectQuizModule(fileContent);

          correctionResult = latexCorrection;

          if (!validation.isValid) {
            console.error('Validation errors after LaTeX correction:', validation.errors);
            throw new Error(`Invalid quiz module format:
${validation.errors.slice(0, 3).join('\n')}`);
          }

          if (correctedModule) {
            // Use the pre-normalized module from the correction process
            setCurrentModule(correctedModule);
            setAnswerRecords({});
            setAppState('dashboard');

            // Show success message with correction details
            let successMessage = `Loaded "${correctedModule.name}" with ${correctedModule.chapters.length} chapters`;
            if (correctionResult && correctionResult.correctionsMade > 0) {
              successMessage += ` (${correctionResult.correctionsMade} LaTeX formatting corrections applied)`;
            }

            showSuccess('Quiz Module Loaded Successfully!', successMessage);

            // Show correction details if any were made
            if (correctionResult && correctionResult.correctionsMade > 0) {
              console.log('LaTeX corrections applied:', correctionResult.correctionDetails);
              showInfo(
                'LaTeX Formatting Corrected',
                `Automatically fixed ${correctionResult.correctionsMade} LaTeX formatting issues. Your quiz is now ready to use!`,
              );
            }

            console.log(
              'Successfully loaded quiz module with LaTeX corrections:',
              correctedModule.name,
            );
            return;
          }
        }

        // If we reach here, either the JSON parsed successfully initially, or we need to handle it manually
        if (!correctionResult) {
          // Standard validation for successfully parsed JSON
          const validation = validateQuizModule(parsedData);
          if (!validation.isValid) {
            console.error('Validation errors:', validation.errors);
            throw new Error(`Invalid quiz module format:
${validation.errors.slice(0, 3).join('\n')}`);
          }

          // Normalize and set the module
          normalizedModule = normalizeQuizModule(parsedData);
          setCurrentModule(normalizedModule);
          setAnswerRecords({});
          setAppState('dashboard');

          showSuccess(
            'Quiz Module Loaded Successfully!',
            `Loaded "${normalizedModule.name}" with ${normalizedModule.chapters.length} chapters`,
          );

          console.log('Successfully loaded quiz module:', normalizedModule.name);
        }
      }
    } catch (err) {
      console.error('Error loading quiz module:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred while loading the quiz module';
      setError(errorMessage);

      showError('Failed to Load Quiz Module', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Replace the existing handleImportState function with this enhanced version
  const handleImportState = async (file: File) => {
    try {
      console.log('Importing state file:', file.name, 'Size:', file.size, 'Type:', file.type);

      // Read file content
      const fileContent = await readFileAsText(file);
      console.log('State file content length:', fileContent.length);

      // Parse JSON with LaTeX correction support
      let parsedData: any;
      let correctionResult: any;
      try {
        // First attempt: try parsing as-is
        parsedData = JSON.parse(fileContent);
        console.log('State JSON parsed successfully without corrections');
      } catch (parseError) {
        console.log('Initial state JSON parse failed, applying LaTeX corrections...', parseError);

        // Apply LaTeX corrections and re-parse
        const {
          validationResult: validation,
          correctionResult: latexCorrection,
          normalizedModule,
        } = validateAndCorrectQuizModule(fileContent);

        correctionResult = latexCorrection;

        if (!validation.isValid) {
          console.error('State validation errors after LaTeX correction:', validation.errors);
          showError(
            'Invalid State File',
            `Invalid state file format:
${validation.errors.slice(0, 3).join('\n')}`,
          );
          return;
        }

        if (normalizedModule) {
          // Use the pre-normalized module from the correction process
          setCurrentModule(normalizedModule);
          setAnswerRecords({});

          // Reset quiz session state
          setCurrentChapterId('');
          setCurrentQuestionIndex(0);
          setSelectedOptionId(null);
          setIsSubmitted(false);
          setError('');
          setIsReviewSessionActive(false);
          setCurrentReviewQuestion(null);

          // Show success message with correction details
          let successMessage = `Imported progress for "${normalizedModule.name}"`;
          if (correctionResult && correctionResult.correctionsMade > 0) {
            successMessage += ` (${correctionResult.correctionsMade} LaTeX corrections applied)`;
          }

          showSuccess('State Imported Successfully!', successMessage);

          // Show correction details if any were made
          if (correctionResult && correctionResult.correctionsMade > 0) {
            console.log(
              'LaTeX corrections applied during import:',
              correctionResult.correctionDetails,
            );
            showInfo(
              'LaTeX Formatting Corrected',
              `Automatically fixed ${correctionResult.correctionsMade} LaTeX formatting issues during import.`,
            );
          }

          console.log('Successfully imported state with LaTeX corrections:', normalizedModule.name);
          return;
        }
      }

      // If we reach here, the JSON parsed successfully initially
      if (!correctionResult) {
        // Standard validation for successfully parsed JSON
        const validation = validateQuizModule(parsedData);
        if (!validation.isValid) {
          console.error('State validation errors:', validation.errors);
          showError(
            'Invalid State File',
            `Invalid state file format:
${validation.errors.slice(0, 3).join('\n')}`,
          );
          return;
        }

        // Normalize and set the module
        const normalizedModule = normalizeQuizModule(parsedData);
        setCurrentModule(normalizedModule);
        setAnswerRecords({});

        // Reset quiz session state
        setCurrentChapterId('');
        setCurrentQuestionIndex(0);
        setSelectedOptionId(null);
        setIsSubmitted(false);
        setError('');
        setIsReviewSessionActive(false);
        setCurrentReviewQuestion(null);

        showSuccess(
          'State Imported Successfully!',
          `Imported progress for "${normalizedModule.name}"`,
        );
        console.log('Successfully imported state:', normalizedModule.name);
      }
    } catch (err) {
      console.error('Error importing state:', err);
      showError(
        'Import Failed',
        `Error importing state: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  };

  // NEW: Export current question state
  const handleExportCurrentQuestionState = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      showError('Export Failed', 'No current question found to export');
      return;
    }

    try {
      // Export as array for consistency with import logic
      const exportData = [currentQuestion];
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qstate-${currentQuestion.questionId}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      showSuccess(
        'Question Exported',
        `Exported question "${currentQuestion.questionId}" successfully`,
      );
    } catch (error) {
      console.error('Error exporting question:', error);
      showError('Export Failed', 'Failed to export question state');
    }
  };

  // NEW: Import question state from file
  const handleInitiateImportCurrentQuestionState = async (file: File) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !currentChapterId) {
      showError('Import Failed', 'No current question context found');
      return;
    }

    try {
      // Read and parse file
      const fileContent = await readFileAsText(file);
      let parsedData: any;
      try {
        parsedData = JSON.parse(fileContent);
      } catch {
        showError('Import Failed', 'Invalid JSON format in the imported file');
        return;
      }

      // Expect array of questions
      if (!Array.isArray(parsedData)) {
        showError('Import Failed', 'Expected an array of questions in the imported file');
        return;
      }

      // Handle empty array - offer to delete current question
      if (parsedData.length === 0) {
        setQuestionToDelete(currentQuestion);
        setShowDeleteCurrentQuestionConfirmation(true);
        return;
      }

      // Validate and normalize all imported questions
      const validNormalizedImportedQuestions: QuizQuestion[] = [];
      for (let i = 0; i < parsedData.length; i++) {
        const questionData = parsedData[i];
        const validation = validateSingleQuestion(questionData);

        if (!validation.isValid) {
          showError(
            'Import Failed',
            `Question ${i + 1} is invalid:
${validation.errors.slice(0, 3).join('\n')}`,
          );
          return;
        }

        const normalizedQuestion = normalizeSingleQuestion(questionData as QuizQuestion);
        validNormalizedImportedQuestions.push(normalizedQuestion);
      }

      if (validNormalizedImportedQuestions.length === 0) {
        showError('Import Failed', 'No valid questions found in the imported file');
        return;
      }

      // Process the questions
      const firstImportedQuestion = validNormalizedImportedQuestions[0];
      const additionalQuestionsForAppend = validNormalizedImportedQuestions.slice(1);

      // Check for overwrite
      if (firstImportedQuestion.questionId === currentQuestion.questionId) {
        setPendingOverwriteData(firstImportedQuestion);
        setQuestionsToReviewForAppend(additionalQuestionsForAppend);
        setShowOverwriteCurrentQuestionConfirmation(true);
      } else {
        // No overwrite - all questions are for appending
        setPendingOverwriteData(null);
        setQuestionsToReviewForAppend(validNormalizedImportedQuestions);

        if (validNormalizedImportedQuestions.length > 0) {
          // TODO: Implement append review modal
          showInfo(
            'Questions Ready for Import',
            `${validNormalizedImportedQuestions.length} questions ready for import.`,
          );
        } else {
          showInfo(
            'Nothing to Import',
            'Imported question ID does not match current. Nothing to overwrite or append.',
          );
        }
      }
    } catch (error) {
      console.error('Error importing question state:', error);
      showError(
        'Import Failed',
        `Error importing question state: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  // NEW: Confirm delete current question
  const handleConfirmDeleteCurrentQuestion = () => {
    if (!currentModule || !questionToDelete || !currentChapterId) return;

    try {
      const updatedModule = JSON.parse(JSON.stringify(currentModule)) as QuizModule;
      const targetChapter = updatedModule.chapters.find((c) => c.id === currentChapterId);

      if (targetChapter) {
        const questionIndex = targetChapter.questions.findIndex(
          (q) => q.questionId === questionToDelete.questionId,
        );

        if (questionIndex !== -1) {
          targetChapter.questions.splice(questionIndex, 1);
          recalculateChapterStats(targetChapter);
          setCurrentModule(updatedModule);

          const questionIdToRemove = questionToDelete.questionId;
          setAnswerRecords((prev) => {
            const next = { ...prev };
            delete next[questionIdToRemove];
            return next;
          });

          showSuccess('Question Deleted', 'Question deleted successfully');

          // Reset modal states
          setShowDeleteCurrentQuestionConfirmation(false);
          setQuestionToDelete(null);

          // Advance to next question
          handleNextQuestion();
        }
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      showError('Delete Failed', 'Failed to delete question');
    }
  };

  // NEW: Cancel delete current question
  const handleCancelDeleteCurrentQuestion = () => {
    setShowDeleteCurrentQuestionConfirmation(false);
    setQuestionToDelete(null);
  };

  // NEW: Confirm overwrite current question
  const handleConfirmOverwriteCurrentQuestion = () => {
    if (!currentModule || !pendingOverwriteData || !currentChapterId) return;

    try {
      const updatedModule = JSON.parse(JSON.stringify(currentModule)) as QuizModule;
      const targetChapter = updatedModule.chapters.find((c) => c.id === currentChapterId);

      if (targetChapter) {
        const questionIndex = targetChapter.questions.findIndex(
          (q) => q.questionId === pendingOverwriteData.questionId,
        );

        if (questionIndex !== -1) {
          targetChapter.questions[questionIndex] = pendingOverwriteData;
          recalculateChapterStats(targetChapter);
          setCurrentModule(updatedModule);

          const overwrittenQuestionId = pendingOverwriteData.questionId;
          setAnswerRecords((prev) => {
            const next = { ...prev };
            delete next[overwrittenQuestionId];
            return next;
          });

          showSuccess('Question Overwritten', 'Question overwritten successfully');

          // Reset overwrite modal
          setShowOverwriteCurrentQuestionConfirmation(false);

          // Proceed to append if there are additional questions
          if (questionsToReviewForAppend.length > 0) {
            // TODO: Implement append review modal
            showInfo(
              'Questions Ready for Import',
              `${questionsToReviewForAppend.length} additional questions ready for import.`,
            );
          } else {
            setPendingOverwriteData(null);
            setQuestionsToReviewForAppend([]);
          }
        }
      }
    } catch (error) {
      console.error('Error overwriting question:', error);
      showError('Overwrite Failed', 'Failed to overwrite question');
    }
  };

  // NEW: Cancel overwrite current question
  const handleCancelOverwriteCurrentQuestion = () => {
    setShowOverwriteCurrentQuestionConfirmation(false);
    setPendingOverwriteData(null);
    setQuestionsToReviewForAppend([]);
  };

  // NEW: Save appended questions with overwrite capability (removed - unused)
  // const _handleSaveAppendedQuestions = (questionsToActuallyAppend: QuizQuestion[]) => { ... };

  // NEW: Cancel append questions (removed - unused)
  // const _handleCancelAppendQuestions = () => { ... };

  // VERIFIED: Export incorrect answers history with proper chapter name handling
  const handleLoadNewModule = () => {
    console.log('=== Resetting state to load a new module ===');
    setCurrentModule(null);
    setCurrentChapterId('');
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setIsReviewSessionActive(false);
    setCurrentReviewQuestion(null);
    setSessionHistory([]);
    setCurrentHistoryViewIndex(null);
    setAnswerRecords({});
    setQuestionsToReviewForAppend([]);
    setError('');
    setIsLoading(false);
    setAppState('welcome');
    showInfo('Ready for a new module', 'Choose a JSON or Markdown quiz file to begin.');
  };

  const handleExportIncorrectAnswers = () => {
    if (!currentModule) return;

    console.log('=== Exporting Incorrect Answers History ===');

    const incorrectAnswersLog: IncorrectAnswersExport = [];

    currentModule.chapters.forEach((chapter) => {
      chapter.questions.forEach((question) => {
        // Only include questions that have been answered incorrectly
        if ((question.timesAnsweredIncorrectly || 0) > 0) {
          console.log(`Processing question with incorrect answers: ${question.questionId}`);

          // Build incorrect selections array
          const incorrectSelections = (question.historyOfIncorrectSelections || []).map(
            (selectedOptionId) => {
              const selectedOption = question.options.find(
                (opt) => opt.optionId === selectedOptionId,
              );
              return {
                selectedOptionId,
                selectedOptionText: selectedOption
                  ? selectedOption.optionText
                  : `[Option ${selectedOptionId} not found]`,
              };
            },
          );

          // Build correct options array
          const correctOptionTexts = question.correctOptionIds.map((correctOptionId) => {
            const correctOption = question.options.find((opt) => opt.optionId === correctOptionId);
            return correctOption
              ? correctOption.optionText
              : `[Option ${correctOptionId} not found]`;
          });

          const logEntry: IncorrectAnswerLogEntry = {
            questionId: question.questionId,
            questionText: question.questionText,
            chapterId: chapter.id,
            chapterName: chapter.name, // VERIFIED: Correctly using chapter.name
            incorrectSelections,
            correctOptionIds: question.correctOptionIds,
            correctOptionTexts,
            explanationText: question.explanationText,
            totalTimesCorrect: question.timesAnsweredCorrectly || 0,
            totalTimesIncorrect: question.timesAnsweredIncorrectly || 0,
            currentSrsLevel: question.srsLevel || 0,
            lastAttemptedAt: question.lastAttemptedAt,
          };

          incorrectAnswersLog.push(logEntry);
          console.log(
            `Added to log: ${question.questionId} (${incorrectSelections.length} incorrect attempts)`,
          );
        }
      });
    });

    if (incorrectAnswersLog.length === 0) {
      // REPLACED: alert() with toast
      showInfo('No Mistakes to Export', 'No incorrect answers found to export!');
      return;
    }

    // Create export data with metadata
    const exportData = {
      exportedAt: new Date().toISOString(),
      moduleName: currentModule.name,
      moduleDescription: currentModule.description,
      totalIncorrectQuestions: incorrectAnswersLog.length,
      // VERIFIED: Using totalTimesIncorrect (better than incorrectSelections.length)
      totalIncorrectAttempts: incorrectAnswersLog.reduce(
        (sum, entry) => sum + entry.totalTimesIncorrect,
        0,
      ),
      incorrectAnswers: incorrectAnswersLog,
    };

    // Export as JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incorrect-answers-log-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log(`Exported ${incorrectAnswersLog.length} questions with incorrect answers`);

    // REPLACED: alert() with toast
    showSuccess(
      'Mistakes Exported Successfully!',
      `Exported ${incorrectAnswersLog.length} questions with incorrect answers`,
    );
  };

  const handleStartQuiz = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setAnswerRecords({});
    setIsReviewSessionActive(false);
    setCurrentReviewQuestion(null);
    // Clear session history
    setSessionHistory([]);
    setCurrentHistoryViewIndex(null);
    setAppState('quiz');
  };

  // Start review session using dynamic approach
  const handleStartReviewSession = () => {
    if (!currentModule) return;

    console.log('=== Starting Refined Anki-style Review Session ===');

    // Set review mode active
    setIsReviewSessionActive(true);
    // Clear session history
    setSessionHistory([]);
    setCurrentHistoryViewIndex(null);

    // Load the first review question
    loadNextReviewQuestion();
  };

  const handleSelectOption = (optionId: string) => {
    if (!isSubmitted) {
      setSelectedOptionId(optionId);
    }
  };

  // NEW: Navigate to question from menu
  const handleNavigateToQuestionFromMenu = (targetQuestionIndex: number) => {
    console.log(`=== Navigating to Question ${targetQuestionIndex + 1} from Menu ===`);

    const currentChapter = getCurrentChapter();
    if (
      !currentChapter ||
      targetQuestionIndex < 0 ||
      targetQuestionIndex >= currentChapter.questions.length
    ) {
      console.error('Invalid question index or chapter not found');
      return;
    }

    const targetQuestion = currentChapter.questions[targetQuestionIndex];
    console.log(`Target question: ${targetQuestion.questionId}`);

    // Search for this question in session history
    const historyEntryIndex = sessionHistory.findIndex(
      (entry) => entry.questionSnapshot.questionId === targetQuestion.questionId,
    );

    if (historyEntryIndex !== -1) {
      // Question exists in session history - navigate to historical view
      console.log(`Found in session history at index ${historyEntryIndex}`);
      setCurrentHistoryViewIndex(historyEntryIndex);
      setIsSubmitted(true);
      setSelectedOptionId(sessionHistory[historyEntryIndex].selectedOptionId);
    } else {
      // Question not in session history - navigate to live question
      console.log('Not found in session history - navigating to live question');
      setCurrentQuestionIndex(targetQuestionIndex);
      setCurrentHistoryViewIndex(null);
      setSelectedOptionId(null);
      setIsSubmitted(false);
    }
  };

  // NEW: Retry Chapter Handler
  const handleRetryChapter = () => {
    if (!currentModule || !currentChapterId || isReviewSessionActive) {
      console.log('Cannot retry chapter - missing module, chapter ID, or in review session');
      return;
    }

    console.log(`=== Retrying Chapter: ${currentChapterId} ===`);

    try {
      // Create a deep copy of the module
      const updatedModule = JSON.parse(JSON.stringify(currentModule)) as QuizModule;
      const targetChapter = updatedModule.chapters.find((c) => c.id === currentChapterId);

      if (targetChapter) {
        // Reset all questions in the chapter
        targetChapter.questions.forEach((question) => {
          question.status = 'not_attempted';
          question.timesAnsweredCorrectly = 0;
          question.timesAnsweredIncorrectly = 0;
          question.historyOfIncorrectSelections = [];
          question.lastSelectedOptionId = undefined;
          question.lastAttemptedAt = undefined;
          question.srsLevel = 0;
          question.nextReviewAt = null;
          question.shownIncorrectOptionIds = [];
        });

        // Recalculate chapter stats
        recalculateChapterStats(targetChapter);

        // Update the module
        setCurrentModule(updatedModule);

        const resetQuestionIds = targetChapter.questions.map((question) => question.questionId);
        setAnswerRecords((prev) => {
          const next = { ...prev };
          resetQuestionIds.forEach((questionId) => {
            delete next[questionId];
          });
          return next;
        });

        // Reset quiz session state
        setCurrentQuestionIndex(0);
        setSelectedOptionId(null);
        setIsSubmitted(false);
        setSessionHistory([]);
        setCurrentHistoryViewIndex(null);

        showSuccess(
          'Chapter Reset',
          `Chapter "${targetChapter.name}" has been reset. Starting fresh!`,
        );

        console.log(`Successfully reset chapter: ${targetChapter.name}`);
      } else {
        console.error('Target chapter not found for retry');
        showError('Retry Failed', 'Chapter not found');
      }
    } catch (error) {
      console.error('Error retrying chapter:', error);
      showError('Retry Failed', 'Failed to reset chapter');
    }
  };

  // NEW: View All Questions Handler
  const handleViewAllQuestions = () => {
    if (!currentModule || !currentChapterId) {
      console.log('Cannot view all questions - missing module or chapter ID');
      return;
    }

    console.log(`=== Viewing All Questions for Chapter: ${currentChapterId} ===`);
    setAppState('all-questions');
  };

  // NEW: Back to Quiz from All Questions View
  const handleBackToQuizFromAllQuestions = () => {
    console.log('=== Returning to Quiz from All Questions View ===');
    setAppState('quiz');
  };

  const handleSubmitAnswer = (displayedOptions: DisplayedOption[]) => {
    if (!selectedOptionId || isSubmitted) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !currentModule) return;

    console.log(`=== Submitting Answer for Question: ${currentQuestion.questionId} ===`);
    console.log(`Selected option: ${selectedOptionId}`);

    const isCorrect = currentQuestion.correctOptionIds.includes(selectedOptionId);
    console.log(`Answer is ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);

    // Create deep copy of module for updates
    const updatedModule = JSON.parse(JSON.stringify(currentModule)) as QuizModule;

    // Find and update the question
    let targetQuestion: QuizQuestion | null = null;
    let targetChapter: QuizChapter | null = null;

    if (isReviewSessionActive && currentReviewQuestion) {
      // Review session - find question in its original chapter
      targetChapter =
        updatedModule.chapters.find((c) => c.id === currentReviewQuestion.chapterId) || null;
      if (targetChapter) {
        const questionIndex = targetChapter.questions.findIndex(
          (q) => q.questionId === currentQuestion.questionId,
        );
        if (questionIndex !== -1) {
          targetQuestion = targetChapter.questions[questionIndex];
        }
      }
    } else {
      // Regular quiz - find question in current chapter
      targetChapter = updatedModule.chapters.find((c) => c.id === currentChapterId) || null;
      if (targetChapter) {
        const questionIndex = targetChapter.questions.findIndex(
          (q) => q.questionId === currentQuestion.questionId,
        );
        if (questionIndex !== -1) {
          targetQuestion = targetChapter.questions[questionIndex];
        }
      }
    }

    if (!targetQuestion || !targetChapter) {
      console.error('Could not find target question or chapter for update');
      return;
    }

    // Update question statistics
    targetQuestion.lastSelectedOptionId = selectedOptionId;
    targetQuestion.lastAttemptedAt = new Date().toISOString();

    if (isCorrect) {
      targetQuestion.timesAnsweredCorrectly = (targetQuestion.timesAnsweredCorrectly || 0) + 1;

      // Update SRS level and status
      const newSrsLevel = Math.min((targetQuestion.srsLevel || 0) + 1, 2);
      targetQuestion.srsLevel = newSrsLevel;

      if (newSrsLevel >= 2) {
        targetQuestion.status = 'mastered';
        targetQuestion.nextReviewAt = null;
        console.log(`Question mastered! SRS Level: ${newSrsLevel}`);
      } else {
        targetQuestion.status = 'passed_once';
        // Schedule next review (simplified intervals)
        const intervals = [0, 10 * 60 * 1000, 0]; // 0, 10 minutes, mastered
        const nextReviewTime = new Date(Date.now() + intervals[newSrsLevel]);
        targetQuestion.nextReviewAt = nextReviewTime.toISOString();
        console.log(
          `Correct answer! SRS Level: ${newSrsLevel}, Next review: ${nextReviewTime.toISOString()}`,
        );
      }
    } else {
      targetQuestion.timesAnsweredIncorrectly = (targetQuestion.timesAnsweredIncorrectly || 0) + 1;

      // Track incorrect selection
      if (!targetQuestion.historyOfIncorrectSelections) {
        targetQuestion.historyOfIncorrectSelections = [];
      }
      targetQuestion.historyOfIncorrectSelections.push(selectedOptionId);

      // Track shown incorrect options
      if (!targetQuestion.shownIncorrectOptionIds) {
        targetQuestion.shownIncorrectOptionIds = [];
      }
      displayedOptions.forEach((option) => {
        if (
          !option.isCorrect &&
          !targetQuestion.shownIncorrectOptionIds!.includes(option.optionId)
        ) {
          targetQuestion.shownIncorrectOptionIds!.push(option.optionId);
        }
      });

      // Reset SRS progress
      targetQuestion.srsLevel = 0;
      targetQuestion.status = 'attempted';

      // Schedule for quick retry (30 seconds)
      const nextReviewTime = new Date(Date.now() + 30 * 1000);
      targetQuestion.nextReviewAt = nextReviewTime.toISOString();

      console.log(
        `Incorrect answer! Reset to SRS Level 0, Next review: ${nextReviewTime.toISOString()}`,
      );
    }

    // Recalculate chapter stats
    recalculateChapterStats(targetChapter);

    // Update module state
    setCurrentModule(updatedModule);

    setAnswerRecords((prev) => ({
      ...prev,
      [currentQuestion.questionId]: {
        selectedOptionId,
        isCorrect,
        displayedOptionIds: displayedOptions.map((option) => option.optionId),
        timestamp: new Date().toISOString(),
      },
    }));

    // Add to session history (for regular quiz only, not review sessions)
    if (!isReviewSessionActive) {
      const historyEntry: SessionHistoryEntry = {
        questionSnapshot: JSON.parse(JSON.stringify(currentQuestion)),
        selectedOptionId,
        isCorrect,
        displayedOptions: [...displayedOptions],
        chapterId: currentChapterId,
        isReviewSessionQuestion: false,
      };

      setSessionHistory((prev) => [...prev, historyEntry]);
      console.log(
        `Added to session history: ${currentQuestion.questionId} (${isCorrect ? 'correct' : 'incorrect'})`,
      );
    }

    // Mark as submitted
    setIsSubmitted(true);

    console.log('Answer submission completed successfully');
  };

  const handleNextQuestion = () => {
    if (isReviewSessionActive) {
      // Review session - load next review question
      console.log('=== Moving to Next Review Question ===');
      loadNextReviewQuestion();
    } else {
      // Regular quiz - advance to next question in chapter
      console.log('=== Moving to Next Question in Chapter ===');

      const currentChapter = getCurrentChapter();
      if (!currentChapter) return;

      // Clear history view if active
      setCurrentHistoryViewIndex(null);

      if (currentQuestionIndex < currentChapter.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOptionId(null);
        setIsSubmitted(false);
      } else {
        // Chapter completed
        setAppState('complete');
      }
    }
  };

  // NEW: Session History Navigation Handlers
  const handleViewPreviousAnswer = () => {
    console.log('=== Viewing Previous Answer ===');

    if (currentHistoryViewIndex !== null) {
      // Currently viewing history - go to previous entry
      if (currentHistoryViewIndex > 0) {
        const newIndex = currentHistoryViewIndex - 1;
        console.log(`Moving to history index: ${newIndex}`);
        setCurrentHistoryViewIndex(newIndex);

        // Update UI state to match historical entry
        const historicalEntry = sessionHistory[newIndex];
        setSelectedOptionId(historicalEntry.selectedOptionId);
        setIsSubmitted(true);
      }
    } else {
      // Currently viewing live question - go to most recent history entry
      if (sessionHistory.length > 0) {
        const mostRecentIndex = sessionHistory.length - 1;
        console.log(`Entering history view at index: ${mostRecentIndex}`);
        setCurrentHistoryViewIndex(mostRecentIndex);

        // Update UI state to match historical entry
        const historicalEntry = sessionHistory[mostRecentIndex];
        setSelectedOptionId(historicalEntry.selectedOptionId);
        setIsSubmitted(true);
      }
    }
  };

  const handleViewNextInHistory = () => {
    console.log('=== Viewing Next in History ===');

    if (currentHistoryViewIndex !== null && currentHistoryViewIndex < sessionHistory.length - 1) {
      const newIndex = currentHistoryViewIndex + 1;
      console.log(`Moving to history index: ${newIndex}`);
      setCurrentHistoryViewIndex(newIndex);

      // Update UI state to match historical entry
      const historicalEntry = sessionHistory[newIndex];
      setSelectedOptionId(historicalEntry.selectedOptionId);
      setIsSubmitted(true);
    }
  };

  const handleBackToDashboard = () => {
    setAppState('dashboard');
    setCurrentChapterId('');
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setIsReviewSessionActive(false);
    setCurrentReviewQuestion(null);
    // Clear session history
    setSessionHistory([]);
    setCurrentHistoryViewIndex(null);
    // Clear edit mode
    setIsEditModeActive(false);
    setEditingQuestionData(null);
  };

  const handleExportState = () => {
    if (!currentModule) return;

    const dataStr = JSON.stringify(currentModule, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-state-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    // REPLACED: alert() with toast
    showSuccess('State Exported Successfully!', 'Your quiz progress has been saved to a file');
  };

  // Helper functions
  const getCurrentChapter = (): QuizChapter | null => {
    if (!currentModule) return null;

    if (isReviewSessionActive && currentReviewQuestion) {
      return currentModule.chapters.find((c) => c.id === currentReviewQuestion.chapterId) || null;
    }

    return currentModule.chapters.find((c) => c.id === currentChapterId) || null;
  };

  const getCurrentQuestion = (): QuizQuestion | null => {
    if (isReviewSessionActive && currentReviewQuestion) {
      return currentReviewQuestion.question;
    }

    const chapter = getCurrentChapter();
    if (!chapter || currentQuestionIndex >= chapter.questions.length) return null;

    return chapter.questions[currentQuestionIndex];
  };

  // Render the appropriate component based on app state
  const renderCurrentView = () => {
    switch (appState) {
      case 'welcome':
        return (
          <WelcomeScreen
            onLoadQuiz={handleLoadQuiz}
            onLoadDefaultQuiz={handleLoadDefaultQuiz}
            isLoading={isLoading}
            error={error}
          />
        );

      case 'dashboard':
        if (!currentModule) {
          return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-slate-950 to-gray-950">
              <div className="text-xl text-white">Loading dashboard...</div>
            </div>
          );
        }
        return (
          <Dashboard
            module={currentModule}
            onStartQuiz={handleStartQuiz}
            onStartReviewSession={handleStartReviewSession}
            onExportState={handleExportState}
            onImportState={handleImportState}
            onExportIncorrectAnswers={handleExportIncorrectAnswers}
            onLoadNewModule={handleLoadNewModule}
            reviewQueueCount={reviewQueueCount}
          />
        );

      case 'quiz':
        const currentChapter = getCurrentChapter();
        const currentQuestion = getCurrentQuestion();

        if (!currentChapter || !currentQuestion) {
          return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-slate-950 to-gray-950">
              <div className="text-xl text-white">Loading question...</div>
            </div>
          );
        }

        return (
          <QuizSession
            chapter={currentChapter}
            question={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={currentChapter.questions.length}
            selectedOptionId={selectedOptionId}
            isSubmitted={isSubmitted}
            isReviewSession={isReviewSessionActive}
            srsProgressCounts={srsProgressCounts || undefined}
            currentModule={currentModule || undefined}
            sessionHistory={sessionHistory}
            currentHistoryViewIndex={currentHistoryViewIndex}
            // Edit Mode Props - Phase 1
            isEditModeActive={isEditModeActive}
            editingQuestionData={editingQuestionData}
            onSetEditMode={handleSetEditMode}
            onSaveQuestion={handleSaveQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            generateUniqueQuestionId={generateUniqueQuestionId}
            generateUniqueOptionId={generateUniqueOptionId}
            onSelectOption={handleSelectOption}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestion}
            onBackToDashboard={handleBackToDashboard}
            onExportCurrentQuestionState={handleExportCurrentQuestionState}
            onImportQuestionStateFromFile={handleInitiateImportCurrentQuestionState}
            onRetryChapter={handleRetryChapter}
            onNavigateToQuestion={handleNavigateToQuestionFromMenu}
            onViewPrevious={handleViewPreviousAnswer}
            onViewNextInHistory={handleViewNextInHistory}
            onViewAllQuestions={handleViewAllQuestions}
          />
        );

      case 'complete':
        const completedChapter = getCurrentChapter();
        if (!completedChapter) return null;

        // Calculate results for the completed chapter
        const results = {
          totalQuestions: completedChapter.totalQuestions,
          correctAnswers: completedChapter.correctAnswers,
          incorrectAnswers: completedChapter.totalQuestions - completedChapter.correctAnswers,
          accuracy:
            completedChapter.totalQuestions > 0
              ? Math.round(
                  (completedChapter.correctAnswers / completedChapter.totalQuestions) * 100,
                )
              : 0,
        };

        // Check if there are incorrect answers to export
        const hasIncorrectAnswers = results.incorrectAnswers > 0;

        // Find next chapter
        const currentChapterIndex =
          currentModule?.chapters.findIndex((c) => c.id === completedChapter.id) ?? -1;
        const nextChapter =
          currentModule &&
          currentChapterIndex >= 0 &&
          currentChapterIndex < currentModule.chapters.length - 1
            ? currentModule.chapters[currentChapterIndex + 1]
            : null;

        return (
          <QuizComplete
            chapter={completedChapter}
            results={results}
            onRetryQuiz={handleRetryChapter}
            onBackToDashboard={handleBackToDashboard}
            onExportResults={handleExportState}
            onLoadNewModule={() => setAppState('welcome')}
            onExportIncorrectAnswers={handleExportIncorrectAnswers}
            hasIncorrectAnswers={hasIncorrectAnswers}
            nextChapterId={nextChapter?.id}
            onStartChapterQuiz={handleStartQuiz}
          />
        );

      case 'all-questions':
        const allQuestionsChapter = getCurrentChapter();
        if (!allQuestionsChapter) return null;

        return (
          <AllQuestionsView
            chapter={allQuestionsChapter}
            onBackToQuiz={handleBackToQuizFromAllQuestions}
            onBackToDashboard={handleBackToDashboard}
            onRetryChapter={handleRetryChapter}
            isReviewSession={isReviewSessionActive}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentView()}

      {/* Toast Container */}
      <Toaster />

      {/* Confirmation Modal for Deleting Current Question */}
      <ConfirmationModal
        isOpen={showDeleteCurrentQuestionConfirmation}
        title="Delete Current Question"
        message={`Are you sure you want to delete the current question "${questionToDelete?.questionId}"? This action cannot be undone.`}
        confirmText="Delete Question"
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteCurrentQuestion}
        onCancel={handleCancelDeleteCurrentQuestion}
        variant="danger"
      />

      {/* Confirmation Modal for Overwriting Current Question */}
      <ConfirmationModal
        isOpen={showOverwriteCurrentQuestionConfirmation}
        title="Overwrite Current Question"
        message={`The imported file contains a question with the same ID as the current question. Do you want to overwrite the current question with the imported data?`}
        confirmText="Overwrite"
        cancelText="Cancel"
        onConfirm={handleConfirmOverwriteCurrentQuestion}
        onCancel={handleCancelOverwriteCurrentQuestion}
        variant="warning"
      />
    </div>
  );
}
