'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SecureTextRenderer } from './secure-text-renderer';
import { ConfirmationModal } from './confirmation-modal';
import { X, Plus, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import type { QuizQuestion, QuizOption } from '@/types/quiz-types';

interface QuestionEditorProps {
  isOpen: boolean;
  question: QuizQuestion;
  chapterId: string;
  onSave: (question: QuizQuestion) => void;
  onCancel: () => void;
  onDelete: (questionId: string) => void;
  generateUniqueOptionId?: (questionId: string, existingOptionIds: string[]) => string;
}

export function QuestionEditor({
  isOpen,
  question,
  chapterId,
  onSave,
  onCancel,
  onDelete,
  generateUniqueOptionId,
}: QuestionEditorProps) {
  // Form state
  const [questionId, setQuestionId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>([]);
  const [explanationText, setExplanationText] = useState('');

  // SRS and performance tracking fields
  const [srsLevel, setSrsLevel] = useState(0);
  const [nextReviewAt, setNextReviewAt] = useState('');

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isNewQuestion, setIsNewQuestion] = useState(false);

  // Initialize form data when question changes
  useEffect(() => {
    if (question) {
      setQuestionId(question.questionId);
      setQuestionText(question.questionText);
      setOptions([...question.options]);
      setCorrectOptionIds([...question.correctOptionIds]);
      setExplanationText(question.explanationText);
      setSrsLevel(question.srsLevel || 0);
      setNextReviewAt(question.nextReviewAt || '');

      // Determine if this is a new question (empty questionText indicates new)
      setIsNewQuestion(!question.questionText);

      console.log('Question Editor initialized with:', {
        questionId: question.questionId,
        isNew: !question.questionText,
        optionsCount: question.options.length,
      });
    }
  }, [question]);

  // Validation function
  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!questionId.trim()) {
      validationErrors.push('Question ID is required');
    }

    if (!questionText.trim()) {
      validationErrors.push('Question text is required');
    }

    if (options.length < 2) {
      validationErrors.push('At least 2 options are required');
    }

    // Check for empty options
    const emptyOptions = options.filter((opt) => !opt.optionText.trim());
    if (emptyOptions.length > 0) {
      validationErrors.push(`${emptyOptions.length} option(s) have empty text`);
    }

    // Check for duplicate option IDs
    const optionIds = options.map((opt) => opt.optionId);
    const duplicateIds = optionIds.filter((id, index) => optionIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      validationErrors.push('Duplicate option IDs found');
    }

    if (correctOptionIds.length === 0) {
      validationErrors.push('At least one correct answer must be selected');
    }

    // Check that all correct option IDs exist in options
    const invalidCorrectIds = correctOptionIds.filter(
      (correctId) => !options.some((opt) => opt.optionId === correctId),
    );
    if (invalidCorrectIds.length > 0) {
      validationErrors.push('Some correct answers reference non-existent options');
    }

    if (!explanationText.trim()) {
      validationErrors.push('Explanation text is required');
    }

    return validationErrors;
  };

  // Add new option
  const handleAddOption = () => {
    const existingOptionIds = options.map((opt) => opt.optionId);
    const newOptionId = generateUniqueOptionId
      ? generateUniqueOptionId(questionId, existingOptionIds)
      : `${questionId}_opt${options.length + 1}`;

    const newOption: QuizOption = {
      optionId: newOptionId,
      optionText: '',
    };

    setOptions([...options, newOption]);
    console.log('Added new option:', newOptionId);
  };

  // Remove option
  const handleRemoveOption = (optionId: string) => {
    setOptions(options.filter((opt) => opt.optionId !== optionId));
    setCorrectOptionIds(correctOptionIds.filter((id) => id !== optionId));
    console.log('Removed option:', optionId);
  };

  // Update option text
  const handleUpdateOptionText = (optionId: string, newText: string) => {
    setOptions(
      options.map((opt) => (opt.optionId === optionId ? { ...opt, optionText: newText } : opt)),
    );
  };

  // Toggle correct answer
  const handleToggleCorrectAnswer = (optionId: string) => {
    if (correctOptionIds.includes(optionId)) {
      setCorrectOptionIds(correctOptionIds.filter((id) => id !== optionId));
    } else {
      setCorrectOptionIds([...correctOptionIds, optionId]);
    }
  };

  // Handle save
  const handleSave = () => {
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const updatedQuestion: QuizQuestion = {
      questionId,
      questionText,
      options,
      correctOptionIds,
      explanationText,
      // Preserve existing performance tracking data
      status: question.status || 'not_attempted',
      timesAnsweredCorrectly: question.timesAnsweredCorrectly || 0,
      timesAnsweredIncorrectly: question.timesAnsweredIncorrectly || 0,
      historyOfIncorrectSelections: question.historyOfIncorrectSelections || [],
      lastSelectedOptionId: question.lastSelectedOptionId,
      lastAttemptedAt: question.lastAttemptedAt,
      // SRS fields
      srsLevel,
      nextReviewAt: nextReviewAt || null,
      shownIncorrectOptionIds: question.shownIncorrectOptionIds || [],
    };

    console.log('Saving question:', updatedQuestion.questionId);
    onSave(updatedQuestion);
  };

  // Handle delete
  const handleDelete = () => {
    if (isNewQuestion) {
      // Just cancel for new questions
      onCancel();
    } else {
      setShowDeleteConfirmation(true);
    }
  };

  const handleConfirmDelete = () => {
    console.log('Deleting question:', questionId);
    onDelete(questionId);
    setShowDeleteConfirmation(false);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Editor Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <Card
          className="max-h-[90vh] w-full max-w-6xl overflow-hidden border-gray-800 bg-gradient-to-r from-slate-950 to-gray-950 shadow-xl backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b border-gray-800 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex-shrink-0 rounded-lg bg-yellow-700/20 p-2">
                  <X className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="break-words text-xl leading-tight text-white">
                    {isNewQuestion ? 'Add New Question' : 'Edit Question'}
                  </CardTitle>
                  <p className="mt-1 text-sm text-gray-400">
                    {isNewQuestion
                      ? 'Create a new question for this chapter'
                      : 'Modify the current question'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  size="sm"
                  className="border-blue-700 bg-blue-900/40 text-blue-200 hover:bg-blue-800/50 hover:text-white"
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={onCancel}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 text-gray-400 hover:bg-white/10 hover:text-white"
                  aria-label="Close editor"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="max-h-[calc(90vh-200px)] overflow-y-auto p-6">
            <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
              {/* Editor Form */}
              <div className="space-y-6">
                {/* Error Display */}
                {errors.length > 0 && (
                  <div className="rounded-lg border border-red-700 bg-red-900/40 p-4">
                    <h4 className="mb-2 font-medium text-red-300">Validation Errors:</h4>
                    <ul className="space-y-1 text-sm text-red-200">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Question ID */}
                <div className="space-y-2">
                  <Label htmlFor="questionId" className="font-medium text-white">
                    Question ID
                  </Label>
                  <Input
                    id="questionId"
                    value={questionId}
                    onChange={(e) => setQuestionId(e.target.value)}
                    placeholder="e.g., chapter1_q1"
                    className="border-slate-700 bg-slate-800 text-white"
                    disabled={!isNewQuestion} // Disable editing ID for existing questions
                  />
                  {!isNewQuestion && (
                    <p className="text-xs text-gray-400">
                      Question ID cannot be changed for existing questions
                    </p>
                  )}
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  <Label htmlFor="questionText" className="font-medium text-white">
                    Question Text
                  </Label>
                  <Textarea
                    id="questionText"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter your question here. You can use Markdown, LaTeX ($$...$$), and HTML."
                    className="min-h-[120px] border-slate-700 bg-slate-800 text-white"
                    rows={5}
                  />
                  <p className="text-xs text-gray-400">
                    Supports Markdown, LaTeX math ($$...$$), and basic HTML formatting
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-white">Answer Options</Label>
                    <Button
                      onClick={handleAddOption}
                      variant="outline"
                      size="sm"
                      className="border-green-700 bg-green-900/40 text-green-200 hover:bg-green-800/50"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div
                        key={option.optionId}
                        className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={correctOptionIds.includes(option.optionId)}
                              onChange={() => handleToggleCorrectAnswer(option.optionId)}
                              className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-xs text-gray-400">Correct</span>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm text-gray-300">Option {index + 1}</Label>
                              <code className="rounded bg-slate-700 px-2 py-1 text-xs text-blue-300">
                                {option.optionId}
                              </code>
                            </div>
                            <Textarea
                              value={option.optionText}
                              onChange={(e) =>
                                handleUpdateOptionText(option.optionId, e.target.value)
                              }
                              placeholder="Enter option text (supports Markdown and LaTeX)"
                              className="border-slate-600 bg-slate-700 text-white"
                              rows={2}
                            />
                          </div>

                          <Button
                            onClick={() => handleRemoveOption(option.optionId)}
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                            disabled={options.length <= 2}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {options.length < 2 && (
                    <p className="text-sm text-yellow-400">At least 2 options are required</p>
                  )}
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <Label htmlFor="explanationText" className="font-medium text-white">
                    Explanation
                  </Label>
                  <Textarea
                    id="explanationText"
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                    placeholder="Provide a detailed explanation of the correct answer. Supports Markdown and LaTeX."
                    className="min-h-[100px] border-slate-700 bg-slate-800 text-white"
                    rows={4}
                  />
                </div>

                {/* SRS Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="srsLevel" className="font-medium text-white">
                      SRS Level
                    </Label>
                    <Input
                      id="srsLevel"
                      type="number"
                      min="0"
                      max="2"
                      value={srsLevel}
                      onChange={(e) => setSrsLevel(Number.parseInt(e.target.value) || 0)}
                      className="border-slate-700 bg-slate-800 text-white"
                    />
                    <p className="text-xs text-gray-400">
                      0 = New/Failed, 1 = Learning, 2 = Mastered
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nextReviewAt" className="font-medium text-white">
                      Next Review (ISO Date)
                    </Label>
                    <Input
                      id="nextReviewAt"
                      type="datetime-local"
                      value={nextReviewAt ? new Date(nextReviewAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) =>
                        setNextReviewAt(
                          e.target.value ? new Date(e.target.value).toISOString() : '',
                        )
                      }
                      className="border-slate-700 bg-slate-800 text-white"
                    />
                    <p className="text-xs text-gray-400">Leave empty for immediate availability</p>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              {showPreview && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Preview</h3>

                  {/* Question Preview */}
                  <Card className="border-slate-700 bg-slate-800/50">
                    <CardHeader>
                      <CardTitle className="text-base text-white">Question</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {questionText ? (
                        <div className="prose prose-invert max-w-none">
                          <SecureTextRenderer content={questionText} className="text-white" />
                        </div>
                      ) : (
                        <p className="italic text-gray-400">Question text will appear here...</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Options Preview */}
                  <Card className="border-slate-700 bg-slate-800/50">
                    <CardHeader>
                      <CardTitle className="text-base text-white">Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {options.length > 0 ? (
                        options.map((option, index) => (
                          <div
                            key={option.optionId}
                            className={`rounded border-2 p-3 ${
                              correctOptionIds.includes(option.optionId)
                                ? 'border-green-600 bg-green-900/20'
                                : 'border-slate-600 bg-slate-700/30'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="mt-1 text-sm text-gray-400">{index + 1}.</span>
                              {option.optionText ? (
                                <div className="prose prose-invert max-w-none flex-1">
                                  <SecureTextRenderer
                                    content={option.optionText}
                                    className="text-sm text-white"
                                  />
                                </div>
                              ) : (
                                <p className="text-sm italic text-gray-400">
                                  Option text will appear here...
                                </p>
                              )}
                              {correctOptionIds.includes(option.optionId) && (
                                <span className="rounded bg-green-700 px-2 py-1 text-xs text-green-100">
                                  Correct
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="italic text-gray-400">Options will appear here...</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Explanation Preview */}
                  <Card className="border-slate-700 bg-slate-800/50">
                    <CardHeader>
                      <CardTitle className="text-base text-white">Explanation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {explanationText ? (
                        <div className="prose prose-invert max-w-none">
                          <SecureTextRenderer content={explanationText} className="text-white" />
                        </div>
                      ) : (
                        <p className="italic text-gray-400">Explanation will appear here...</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>

          {/* Footer with action buttons */}
          <div className="border-t border-gray-800 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-400">Use Ctrl+Enter to save, Escape to cancel</div>
              <div className="flex gap-3">
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="border-gray-700 bg-gray-900/70 text-gray-200 hover:border-gray-600 hover:bg-gray-800 hover:text-white"
                >
                  Cancel
                </Button>
                {!isNewQuestion && (
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    className="bg-red-700 text-white hover:bg-red-800"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Question
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  className="bg-green-700 text-white transition-all duration-200 hover:bg-green-800 focus-visible:ring-2 focus-visible:ring-green-500 active:bg-green-900"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isNewQuestion ? 'Add Question' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          title="Delete Question"
          message={`Are you sure you want to delete this question? This action cannot be undone.`}
          questionPreview={
            questionText.substring(0, 150) + (questionText.length > 150 ? '...' : '')
          }
          confirmText="Delete Question"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}
    </>
  );
}
