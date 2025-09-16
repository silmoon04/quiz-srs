"use client"
import { useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, BookOpen, Brain, Check, Clock, FileText, Sparkles } from "lucide-react"

interface WelcomeScreenProps {
  onLoadQuiz: (file: File) => void
  onLoadDefaultQuiz: () => void
  isLoading?: boolean
  error?: string
}

export function WelcomeScreen({ onLoadQuiz, onLoadDefaultQuiz, isLoading = false, error }: WelcomeScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("File selected:", file.name, "Type:", file.type, "Size:", file.size)
      onLoadQuiz(file)
    }
    // Reset the input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    if (!isLoading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-gray-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-800 p-4 rounded-full shadow-sm">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">MCQ Master</h1>
          <p className="text-xl text-gray-300 max-w-lg mx-auto">
            Transform your learning with interactive multiple-choice quizzes. Load your quiz module and start your
            journey.
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-gradient-to-r from-slate-950 to-gray-950 border-gray-800 backdrop-blur-sm shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              Get Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-6">
              <p className="text-gray-200">Choose how you'd like to begin your learning experience.</p>

              {/* Primary Action - Try Algorithm Quiz */}
              <div className="space-y-4">
                <Button
                  onClick={onLoadDefaultQuiz}
                  disabled={isLoading}
                  size="lg"
                  className="bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white px-10 py-4 text-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 w-full sm:w-auto"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  {isLoading ? "Loading..." : "Try Algorithm Quiz"}
                </Button>

                {/* Secondary Action - Load Custom Quiz */}
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-sm text-gray-400">or</p>
                  <Button
                    onClick={triggerFileInput}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="border-gray-600 bg-gray-900/40 text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-500 px-4 py-2 text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isLoading ? "Loading..." : "Load Quiz (JSON/MD)"}
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

              {isLoading && <p className="text-blue-400 text-sm">Processing your quiz module...</p>}
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 shadow-sm">
                <p className="text-red-300 text-center font-medium">Error Loading Quiz Module</p>
                <p className="text-red-200 text-sm mt-2 text-center whitespace-pre-line">{error}</p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
              <div className="text-center space-y-2">
                <div className="bg-green-900/30 p-3 rounded-full w-fit mx-auto border border-green-700/30">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white">Interactive Learning</h3>
                <p className="text-sm text-gray-300">Engage with dynamic quizzes</p>
              </div>

              <div className="text-center space-y-2">
                <div className="bg-purple-900/30 p-3 rounded-full w-fit mx-auto border border-purple-700/30">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white">Smart Feedback</h3>
                <p className="text-sm text-gray-300">Get detailed explanations</p>
              </div>

              <div className="text-center space-y-2">
                <div className="bg-blue-900/30 p-3 rounded-full w-fit mx-auto border border-blue-700/30">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white">Progress Tracking</h3>
                <p className="text-sm text-gray-300">Monitor your learning journey</p>
              </div>

              <div className="text-center space-y-2">
                <div className="bg-orange-900/30 p-3 rounded-full w-fit mx-auto border border-orange-700/30">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="font-semibold text-white">Spaced Repetition</h3>
                <p className="text-sm text-gray-300">Master topics with smart review schedules</p>
              </div>

              <div className="text-center space-y-2">
                <div className="bg-red-900/30 p-3 rounded-full w-fit mx-auto border border-red-700/30">
                  <FileText className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="font-semibold text-white">Markdown & JSON</h3>
                <p className="text-sm text-gray-300">Support for both JSON and Markdown quiz formats</p>
              </div>
            </div>

            {/* Format Information */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mt-6">
              <h4 className="text-white font-semibold mb-3">Supported Formats:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <p className="text-blue-400 font-medium">📄 JSON Format</p>
                  <p className="text-gray-300">Traditional structured quiz data with full feature support</p>
                  <div className="text-xs text-gray-400">
                    <p>• Complete quiz modules with chapters</p>
                    <p>• Progress tracking and SRS data</p>
                    <p>• LaTeX math expressions</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-green-400 font-medium">📝 Markdown Format</p>
                  <p className="text-gray-300">Human-readable format with LaTeX, code blocks, and more</p>
                  <div className="text-xs text-gray-400">
                    <p>• Easy to write and edit</p>
                    <p>• Supports LaTeX math expressions</p>
                    <p>• Code blocks and rich formatting</p>
                    <p>• Optional progress state tracking</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded">
                <p className="text-blue-300 text-xs font-medium mb-1">Markdown Format Example:</p>
                <pre className="text-xs text-gray-300 overflow-x-auto">
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
  )
}
