"use client";
import { useState } from "react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecureTextRenderer } from "./secure-text-renderer";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Minus,
  Save,
  FileText,
} from "lucide-react";
import type { QuizQuestion } from "@/types/quiz-types";

interface QuestionReviewModalProps {
  isOpen: boolean;
  questionsToReview: QuizQuestion[];
  onSaveSelected: (selectedQuestions: QuizQuestion[]) => void;
  onCancel: () => void;
}

export function QuestionReviewModal({
  isOpen,
  questionsToReview,
  onSaveSelected,
  onCancel,
}: QuestionReviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionsMarkedForAddition, setQuestionsMarkedForAddition] = useState<
    QuizQuestion[]
  >([]);

  if (!isOpen || questionsToReview.length === 0) return null;

  const currentQuestion = questionsToReview[currentIndex];
  const isCurrentQuestionMarked = questionsMarkedForAddition.some(
    (q) => q.questionId === currentQuestion.questionId,
  );

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : questionsToReview.length - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev < questionsToReview.length - 1 ? prev + 1 : 0,
    );
  };

  const handleToggleQuestion = () => {
    if (isCurrentQuestionMarked) {
      // Remove from marked list
      setQuestionsMarkedForAddition((prev) =>
        prev.filter((q) => q.questionId !== currentQuestion.questionId),
      );
    } else {
      // Add to marked list
      setQuestionsMarkedForAddition((prev) => [...prev, currentQuestion]);
    }
  };

  const handleSaveSelected = () => {
    onSaveSelected(questionsMarkedForAddition);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === " ") {
      e.preventDefault();
      handleToggleQuestion();
    }
  };

  // Get correct options for display
  const correctOptions = currentQuestion.options.filter((opt) =>
    currentQuestion.correctOptionIds.includes(opt.optionId),
  );
  const incorrectOptions = currentQuestion.options.filter(
    (opt) => !currentQuestion.correctOptionIds.includes(opt.optionId),
  );

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Card
        className="bg-gradient-to-r from-slate-950 to-gray-950 border-gray-800 backdrop-blur-sm shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-4 border-b border-gray-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="bg-purple-700/20 p-2 rounded-lg flex-shrink-0">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-white text-xl leading-tight break-words">
                  Review Questions for Addition
                </CardTitle>
                <p className="text-gray-400 text-sm mt-1">
                  Review and select questions to add to the current chapter
                </p>
              </div>
            </div>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10 flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Navigation and status */}
            <div className="flex items-center justify-between gap-4 bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  size="sm"
                  className="border-gray-700 bg-gray-900/70 text-gray-200 hover:bg-gray-800"
                  disabled={questionsToReview.length <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-white font-medium">
                  Question {currentIndex + 1} of {questionsToReview.length}
                </span>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  size="sm"
                  className="border-gray-700 bg-gray-900/70 text-gray-200 hover:bg-gray-800"
                  disabled={questionsToReview.length <= 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {questionsMarkedForAddition.length} selected for addition
                </span>
                <Button
                  onClick={handleToggleQuestion}
                  variant={isCurrentQuestionMarked ? "destructive" : "default"}
                  size="sm"
                  className={
                    isCurrentQuestionMarked
                      ? "bg-red-700 hover:bg-red-800"
                      : "bg-green-700 hover:bg-green-800 text-white"
                  }
                >
                  {isCurrentQuestionMarked ? (
                    <>
                      <Minus className="w-4 h-4 mr-2" />
                      Remove from Selection
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Selection
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Question preview */}
            <div className="space-y-4">
              {/* Question ID and metadata */}
              <div className="bg-slate-800/30 rounded-lg p-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-gray-400">
                    ID:{" "}
                    <span className="text-blue-400 font-mono">
                      {currentQuestion.questionId}
                    </span>
                  </span>
                  {currentQuestion.srsLevel !== undefined && (
                    <span className="text-gray-400">
                      SRS Level:{" "}
                      <span className="text-yellow-400">
                        {currentQuestion.srsLevel}
                      </span>
                    </span>
                  )}
                  {currentQuestion.timesAnsweredCorrectly !== undefined && (
                    <span className="text-gray-400">
                      Correct:{" "}
                      <span className="text-green-400">
                        {currentQuestion.timesAnsweredCorrectly}
                      </span>
                    </span>
                  )}
                  {currentQuestion.timesAnsweredIncorrectly !== undefined && (
                    <span className="text-gray-400">
                      Incorrect:{" "}
                      <span className="text-red-400">
                        {currentQuestion.timesAnsweredIncorrectly}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Question text */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">
                    Question Text
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <SecureTextRenderer
                      content={currentQuestion.questionText}
                      className="text-white leading-relaxed break-words"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Options */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">
                    Answer Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Correct options */}
                  {correctOptions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-2">
                        Correct Answer(s):
                      </h4>
                      <div className="space-y-2">
                        {correctOptions.map((option) => (
                          <div
                            key={option.optionId}
                            className="bg-green-950/30 border border-green-700/50 rounded-lg p-3"
                          >
                            <div className="prose prose-invert max-w-none">
                              <SecureTextRenderer
                                content={option.optionText}
                                className="text-green-200 text-sm leading-relaxed break-words"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Incorrect options (show first few) */}
                  {incorrectOptions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Other Options ({incorrectOptions.length}):
                      </h4>
                      <div className="space-y-2">
                        {incorrectOptions.slice(0, 3).map((option) => (
                          <div
                            key={option.optionId}
                            className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"
                          >
                            <div className="prose prose-invert max-w-none">
                              <SecureTextRenderer
                                content={option.optionText}
                                className="text-gray-300 text-sm leading-relaxed break-words"
                              />
                            </div>
                          </div>
                        ))}
                        {incorrectOptions.length > 3 && (
                          <div className="text-sm text-gray-500 text-center py-2">
                            ... and {incorrectOptions.length - 3} more options
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Explanation */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">
                    Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <SecureTextRenderer
                      content={currentQuestion.explanationText}
                      className="text-gray-200 leading-relaxed break-words"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>

        {/* Footer with action buttons */}
        <div className="border-t border-gray-800 p-6">
          <div className="flex justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              Use arrow keys to navigate, spacebar to toggle selection
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onCancel}
                variant="outline"
                className="border-gray-700 bg-gray-900/70 text-gray-200 hover:bg-gray-800 hover:text-white hover:border-gray-600"
              >
                Cancel All Additions
              </Button>
              <Button
                onClick={handleSaveSelected}
                disabled={questionsMarkedForAddition.length === 0}
                className="bg-green-700 hover:bg-green-800 active:bg-green-900 text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-green-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Save {questionsMarkedForAddition.length} Added Question
                {questionsMarkedForAddition.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
