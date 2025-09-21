'use client';
import { useRef } from 'react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, BookOpen, Brain, Check, Clock, FileText, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onLoadQuiz: (file: File) => void;
  onLoadDefaultQuiz: () => void;
  isLoading?: boolean;
  error?: string;
}

export function WelcomeScreen({
  onLoadQuiz,
  onLoadDefaultQuiz,
  isLoading = false,
  error,
}: WelcomeScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
      onLoadQuiz(file);
    }
    // Reset the input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-slate-950 to-gray-950 p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-800 p-4 shadow-sm">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">MCQ Master</h1>
          <p className="mx-auto max-w-lg text-xl text-gray-300">
            Transform your learning with interactive multiple-choice quizzes. Load your quiz module
            and start your journey.
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-gray-800 bg-gradient-to-r from-slate-950 to-gray-950 shadow-sm backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-white">
              <BookOpen className="h-6 w-6 text-blue-400" />
              Get Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6 text-center">
              <p className="text-gray-200">
                Choose how you'd like to begin your learning experience.
              </p>

              {/* Primary Action - Try Algorithm Quiz */}
              <div className="space-y-4">
                <Button
                  onClick={onLoadDefaultQuiz}
                  disabled={isLoading}
                  size="lg"
                  className="w-full bg-teal-700 px-10 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-200 hover:bg-teal-800 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 active:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  {isLoading ? 'Loading...' : 'Try Algorithm Quiz'}
                </Button>

                {/* Secondary Action - Load Custom Quiz */}
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-sm text-gray-400">or</p>
                  <Button
                    onClick={triggerFileInput}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="border-gray-600 bg-gray-900/40 px-4 py-2 text-sm text-gray-300 shadow-sm transition-all duration-200 hover:border-gray-500 hover:bg-gray-800/50 hover:text-white focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isLoading ? 'Loading...' : 'Load Quiz (JSON/MD)'}
                  </Button>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.md,.markdown,application/json,text/markdown"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />

              {isLoading && <p className="text-sm text-blue-400">Processing your quiz module...</p>}
            </div>

            {error && (
              <div className="rounded-lg border border-red-700 bg-red-900/40 p-4 shadow-sm">
                <p className="text-center font-medium text-red-300">Error Loading Quiz Module</p>
                <p className="mt-2 whitespace-pre-line text-center text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Features */}
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div className="space-y-2 text-center">
                <div className="mx-auto w-fit rounded-full border border-green-700/30 bg-green-900/30 p-3">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white">Interactive Learning</h3>
                <p className="text-sm text-gray-300">Engage with dynamic quizzes</p>
              </div>

              <div className="space-y-2 text-center">
                <div className="mx-auto w-fit rounded-full border border-purple-700/30 bg-purple-900/30 p-3">
                  <Brain className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white">Smart Feedback</h3>
                <p className="text-sm text-gray-300">Get detailed explanations</p>
              </div>

              <div className="space-y-2 text-center">
                <div className="mx-auto w-fit rounded-full border border-blue-700/30 bg-blue-900/30 p-3">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white">Progress Tracking</h3>
                <p className="text-sm text-gray-300">Monitor your learning journey</p>
              </div>

              <div className="space-y-2 text-center">
                <div className="mx-auto w-fit rounded-full border border-orange-700/30 bg-orange-900/30 p-3">
                  <Clock className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="font-semibold text-white">Spaced Repetition</h3>
                <p className="text-sm text-gray-300">Master topics with smart review schedules</p>
              </div>

              <div className="space-y-2 text-center">
                <div className="mx-auto w-fit rounded-full border border-red-700/30 bg-red-900/30 p-3">
                  <FileText className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="font-semibold text-white">Markdown & JSON</h3>
                <p className="text-sm text-gray-300">
                  Support for both JSON and Markdown quiz formats
                </p>
              </div>
            </div>

            {/* Format Information */}
            <div className="mt-6 rounded-lg border border-gray-700 bg-gray-900/50 p-4">
              <h4 className="mb-3 font-semibold text-white">Supported Formats:</h4>
              <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
                <div className="space-y-2">
                  <p className="font-medium text-blue-400">📄 JSON Format</p>
                  <p className="text-gray-300">
                    Traditional structured quiz data with full feature support
                  </p>
                  <div className="text-xs text-gray-400">
                    <p>• Complete quiz modules with chapters</p>
                    <p>• Progress tracking and SRS data</p>
                    <p>• LaTeX math expressions</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-green-400">📝 Markdown Format</p>
                  <p className="text-gray-300">
                    Human-readable format with LaTeX, code blocks, and more
                  </p>
                  <div className="text-xs text-gray-400">
                    <p>• Easy to write and edit</p>
                    <p>• Supports LaTeX math expressions</p>
                    <p>• Code blocks and rich formatting</p>
                    <p>• Optional progress state tracking</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded border border-blue-700/30 bg-blue-900/20 p-3">
                <p className="mb-1 text-xs font-medium text-blue-300">Markdown Format Example:</p>
                <pre className="overflow-x-auto text-xs text-gray-300">
                  {`# Quiz Title
_Optional description_
---
## Chapter Name <!-- ID:chapter_id -->
---
### Q: What is 2+2? <!-- ID:q1 -->

**Opt:**
- **A1:** 3
- **A2:** 4
- **A3:** 5

**Ans:** A2

**Exp:** 2+2 equals 4.
---`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
