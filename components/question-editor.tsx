"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SecureTextRenderer } from "./secure-text-renderer";
import { ConfirmationModal } from "./confirmation-modal";
import { X, Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";
import type { QuizQuestion, QuizOption } from "@/types/quiz-types";

interface QuestionEditorProps {
  isOpen: boolean;
  question: QuizQuestion;
  chapterId: string;
  onSave: (question: QuizQuestion) => void;
  onCancel: () => void;
  onDelete: (questionId: string) => void;
  generateUniqueOptionId?: (
    questionId: string,
    existingOptionIds: string[],
  ) => string;
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
  const [questionId, setQuestionId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>([]);
  const [explanationText, setExplanationText] = useState("");

  // SRS and performance tracking fields
  const [srsLevel, setSrsLevel] = useState(0);
  const [nextReviewAt, setNextReviewAt] = useState("");

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
      setNextReviewAt(question.nextReviewAt || "");

      // Determine if this is a new question (empty questionText indicates new)
      setIsNewQuestion(!question.questionText);

      console.log("Question Editor initialized with:", {
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
      validationErrors.push("Question ID is required");
    }

    if (!questionText.trim()) {
      validationErrors.push("Question text is required");
    }

    if (options.length < 2) {
      validationErrors.push("At least 2 options are required");
    }

    // Check for empty options
    const emptyOptions = options.filter((opt) => !opt.optionText.trim());
    if (emptyOptions.length > 0) {
      validationErrors.push(`${emptyOptions.length} option(s) have empty text`);
    }

    // Check for duplicate option IDs
    const optionIds = options.map((opt) => opt.optionId);
    const duplicateIds = optionIds.filter(
      (id, index) => optionIds.indexOf(id) !== index,
    );
    if (duplicateIds.length > 0) {
      validationErrors.push("Duplicate option IDs found");
    }

    if (correctOptionIds.length === 0) {
      validationErrors.push("At least one correct answer must be selected");
    }

    // Check that all correct option IDs exist in options
    const invalidCorrectIds = correctOptionIds.filter(
      (correctId) => !options.some((opt) => opt.optionId === correctId),
    );
    if (invalidCorrectIds.length > 0) {
      validationErrors.push(
        "Some correct answers reference non-existent options",
      );
    }

    if (!explanationText.trim()) {
      validationErrors.push("Explanation text is required");
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
      optionText: "",
    };

    setOptions([...options, newOption]);
    console.log("Added new option:", newOptionId);
  };

  // Remove option
  const handleRemoveOption = (optionId: string) => {
    setOptions(options.filter((opt) => opt.optionId !== optionId));
    setCorrectOptionIds(correctOptionIds.filter((id) => id !== optionId));
    console.log("Removed option:", optionId);
  };

  // Update option text
  const handleUpdateOptionText = (optionId: string, newText: string) => {
    setOptions(
      options.map((opt) =>
        opt.optionId === optionId ? { ...opt, optionText: newText } : opt,
      ),
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
      status: question.status || "not_attempted",
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

    console.log("Saving question:", updatedQuestion.questionId);
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
    console.log("Deleting question:", questionId);
    onDelete(questionId);
    setShowDeleteConfirmation(false);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Editor Modal */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onCancel}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <Card
          className="bg-gradient-to-r from-slate-950 to-gray-950 border-gray-800 backdrop-blur-sm shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="pb-4 border-b border-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="bg-yellow-700/20 p-2 rounded-lg flex-shrink-0">
                  <X className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-white text-xl leading-tight break-words">
                    {isNewQuestion ? "Add New Question" : "Edit Question"}
                  </CardTitle>
                  <p className="text-gray-400 text-sm mt-1">
                    {isNewQuestion
                      ? "Create a new question for this chapter"
                      : "Modify the current question"}
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
                  {showPreview ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={onCancel}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-white/10 flex-shrink-0"
                  aria-label="Close editor"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div
              className={`grid ${showPreview ? "grid-cols-2" : "grid-cols-1"} gap-6`}
            >
              {/* Editor Form */}
              <div className="space-y-6">
                {/* Error Display */}
                {errors.length > 0 && (
                  <div className="bg-red-900/40 border border-red-700 rounded-lg p-4">
                    <h4 className="text-red-300 font-medium mb-2">
                      Validation Errors:
                    </h4>
                    <ul className="text-red-200 text-sm space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Question ID */}
                <div className="space-y-2">
                  <Label
                    htmlFor="questionId"
                    className="text-white font-medium"
                  >
                    Question ID
                  </Label>
                  <Input
                    id="questionId"
                    value={questionId}
                    onChange={(e) => setQuestionId(e.target.value)}
                    placeholder="e.g., chapter1_q1"
                    className="bg-slate-800 border-slate-700 text-white"
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
                  <Label
                    htmlFor="questionText"
                    className="text-white font-medium"
                  >
                    Question Text
                  </Label>
                  <Textarea
                    id="questionText"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter your question here. You can use Markdown, LaTeX ($$...$$), and HTML."
                    className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
                    rows={5}
                  />
                  <p className="text-xs text-gray-400">
                    Supports Markdown, LaTeX math ($$...$$), and basic HTML
                    formatting
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white font-medium">
                      Answer Options
                    </Label>
                    <Button
                      onClick={handleAddOption}
                      variant="outline"
                      size="sm"
                      className="border-green-700 bg-green-900/40 text-green-200 hover:bg-green-800/50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div
                        key={option.optionId}
                        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              checked={correctOptionIds.includes(
                                option.optionId,
                              )}
                              onChange={() =>
                                handleToggleCorrectAnswer(option.optionId)
                              }
                              className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
                            />
                            <span className="text-xs text-gray-400">
                              Correct
                            </span>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm text-gray-300">
                                Option {index + 1}
                              </Label>
                              <code className="text-xs bg-slate-700 px-2 py-1 rounded text-blue-300">
                                {option.optionId}
                              </code>
                            </div>
                            <Textarea
                              value={option.optionText}
                              onChange={(e) =>
                                handleUpdateOptionText(
                                  option.optionId,
                                  e.target.value,
                                )
                              }
                              placeholder="Enter option text (supports Markdown and LaTeX)"
                              className="bg-slate-700 border-slate-600 text-white"
                              rows={2}
                            />
                          </div>

                          <Button
                            onClick={() => handleRemoveOption(option.optionId)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-2"
                            disabled={options.length <= 2}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {options.length < 2 && (
                    <p className="text-sm text-yellow-400">
                      At least 2 options are required
                    </p>
                  )}
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <Label
                    htmlFor="explanationText"
                    className="text-white font-medium"
                  >
                    Explanation
                  </Label>
                  <Textarea
                    id="explanationText"
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                    placeholder="Provide a detailed explanation of the correct answer. Supports Markdown and LaTeX."
                    className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                    rows={4}
                  />
                </div>

                {/* SRS Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="srsLevel"
                      className="text-white font-medium"
                    >
                      SRS Level
                    </Label>
                    <Input
                      id="srsLevel"
                      type="number"
                      min="0"
                      max="2"
                      value={srsLevel}
                      onChange={(e) =>
                        setSrsLevel(Number.parseInt(e.target.value) || 0)
                      }
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <p className="text-xs text-gray-400">
                      0 = New/Failed, 1 = Learning, 2 = Mastered
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="nextReviewAt"
                      className="text-white font-medium"
                    >
                      Next Review (ISO Date)
                    </Label>
                    <Input
                      id="nextReviewAt"
                      type="datetime-local"
                      value={
                        nextReviewAt
                          ? new Date(nextReviewAt).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setNextReviewAt(
                          e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "",
                        )
                      }
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <p className="text-xs text-gray-400">
                      Leave empty for immediate availability
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              {showPreview && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Preview</h3>

                  {/* Question Preview */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-base">
                        Question
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {questionText ? (
                        <div className="prose prose-invert max-w-none">
                          <SecureTextRenderer
                            content={questionText}
                            className="text-white"
                          />
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">
                          Question text will appear here...
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Options Preview */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-base">
                        Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {options.length > 0 ? (
                        options.map((option, index) => (
                          <div
                            key={option.optionId}
                            className={`p-3 rounded border-2 ${
                              correctOptionIds.includes(option.optionId)
                                ? "border-green-600 bg-green-900/20"
                                : "border-slate-600 bg-slate-700/30"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-sm text-gray-400 mt-1">
                                {index + 1}.
                              </span>
                              {option.optionText ? (
                                <div className="prose prose-invert max-w-none flex-1">
                                  <SecureTextRenderer
                                    content={option.optionText}
                                    className="text-white text-sm"
                                  />
                                </div>
                              ) : (
                                <p className="text-gray-400 italic text-sm">
                                  Option text will appear here...
                                </p>
                              )}
                              {correctOptionIds.includes(option.optionId) && (
                                <span className="text-xs bg-green-700 text-green-100 px-2 py-1 rounded">
                                  Correct
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 italic">
                          Options will appear here...
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Explanation Preview */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-base">
                        Explanation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {explanationText ? (
                        <div className="prose prose-invert max-w-none">
                          <SecureTextRenderer
                            content={explanationText}
                            className="text-white"
                          />
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">
                          Explanation will appear here...
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>

          {/* Footer with action buttons */}
          <div className="border-t border-gray-800 p-6">
            <div className="flex justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                Use Ctrl+Enter to save, Escape to cancel
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="border-gray-700 bg-gray-900/70 text-gray-200 hover:bg-gray-800 hover:text-white hover:border-gray-600"
                >
                  Cancel
                </Button>
                {!isNewQuestion && (
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    className="bg-red-700 hover:bg-red-800 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Question
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  className="bg-green-700 hover:bg-green-800 active:bg-green-900 text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isNewQuestion ? "Add Question" : "Save Changes"}
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
            questionText.substring(0, 150) +
            (questionText.length > 150 ? "..." : "")
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
