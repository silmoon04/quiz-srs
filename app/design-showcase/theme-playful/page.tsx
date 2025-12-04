'use client';

import React from 'react';
import {
  Home,
  BookOpen,
  BarChart3,
  Settings,
  ChevronRight,
  Clock,
  Upload,
  FileText,
  Sparkles,
  Trophy,
  Star,
  Flame,
  Zap,
  Diamond,
  Play,
  Gift,
  FolderOpen,
  File,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DesignFrame,
  ScreenContainer,
  SectionHeading,
  CardTitle,
  Caption,
  BottomNav,
} from '../shared';

// ============================================================================
// PLAYFUL MATH QUIZ THEME CSS VARIABLES
// ============================================================================

const playfulThemeStyles: Record<string, string> = {
  // Primary backgrounds - light lavender
  '--ds-bg-primary': '#F8F4FF',
  '--ds-card-bg': '#FFFFFF',
  '--ds-nav-bg': '#FFFFFF',
  '--ds-input-bg': '#F0EBFF',

  // Accents - vibrant purple
  '--ds-accent': '#7C3AED',
  '--ds-accent-hover': '#6D28D9',
  '--ds-secondary-accent': '#EC4899',

  // Text colors
  '--ds-text-primary': '#1F2937',
  '--ds-text-secondary': '#4B5563',
  '--ds-text-muted': '#9CA3AF',

  // Card styling
  '--ds-card-border': '#E9D5FF',
  '--ds-secondary-bg': '#F3E8FF',
  '--ds-secondary-bg-hover': '#EDE9FE',

  // Progress
  '--ds-progress-bg': '#E9D5FF',

  // Status colors
  '--ds-success': '#10B981',
  '--ds-error': '#EF4444',
  '--ds-warning': '#F59E0B',

  // Frame
  '--ds-frame-border': '#1F2937',
};

// ============================================================================
// CUSTOM COMPONENTS FOR PLAYFUL THEME
// ============================================================================

interface PlayfulCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

function PlayfulCard({ children, className, gradient }: PlayfulCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        gradient
          ? 'bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white'
          : 'border border-[#E9D5FF] bg-white shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface AvatarBadgeProps {
  name: string;
  points: number;
}

function AvatarBadge({ name, points }: AvatarBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Illustrated Avatar */}
      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#EC4899] to-[#F472B6] shadow-lg">
          <span className="text-2xl">👧</span>
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#10B981]">
          <Crown size={12} className="text-white" />
        </div>
      </div>
      <div>
        <div className="text-lg font-bold text-[#1F2937]">{name}</div>
        <div className="flex items-center gap-1">
          <Diamond size={14} className="fill-[#7C3AED] text-[#7C3AED]" />
          <span className="text-sm font-semibold text-[#7C3AED]">{points} Points</span>
        </div>
      </div>
    </div>
  );
}

interface CategoryCardProps {
  title: string;
  icon: string;
  questionsCount: number;
  color: string;
  bgColor: string;
}

function CategoryCard({ title, icon, questionsCount, color, bgColor }: CategoryCardProps) {
  return (
    <div
      className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-transparent p-4 transition-all hover:border-[#7C3AED]/30"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mb-2 text-4xl">{icon}</div>
      <div className="text-sm font-semibold text-[#1F2937]">{title}</div>
      <div className="mt-1 text-xs text-[#6B7280]">{questionsCount} Qs</div>
    </div>
  );
}

interface PointsBadgeProps {
  points: number;
  size?: 'sm' | 'lg';
}

function PointsBadge({ points, size = 'sm' }: PointsBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full bg-gradient-to-r from-[#EC4899] to-[#F472B6] font-bold text-white shadow-lg',
        size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-5 py-2.5 text-lg',
      )}
    >
      <Diamond size={size === 'sm' ? 14 : 20} className="fill-white" />
      <span>{points} Points</span>
    </div>
  );
}

interface QuizOptionProps {
  letter: string;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

function QuizOption({ letter, label, selected, onClick }: QuizOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-200',
        selected
          ? 'border-[#7C3AED] bg-[#7C3AED]/10 shadow-md shadow-[#7C3AED]/20'
          : 'border-[#E9D5FF] bg-white hover:border-[#7C3AED]/50 hover:shadow-md',
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold transition-colors',
          selected ? 'bg-[#7C3AED] text-white' : 'bg-[#F3E8FF] text-[#7C3AED]',
        )}
      >
        {letter}
      </span>
      <span className="text-base font-medium text-[#1F2937]">{label}</span>
    </button>
  );
}

interface FileTagProps {
  type: string;
}

function FileTag({ type }: FileTagProps) {
  const colors: Record<string, { bg: string; text: string }> = {
    MD: { bg: '#D1FAE5', text: '#059669' },
    JSON: { bg: '#FEF3C7', text: '#D97706' },
    CSV: { bg: '#DBEAFE', text: '#2563EB' },
    APKG: { bg: '#F3E8FF', text: '#7C3AED' },
  };

  const color = colors[type] || colors.JSON;

  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-bold"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {type}
    </span>
  );
}

// Confetti/Stars decoration component
function ConfettiDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Stars */}
      <Star className="absolute left-8 top-4 h-4 w-4 animate-pulse fill-[#F59E0B] text-[#F59E0B]" />
      <Star
        className="absolute right-12 top-12 h-3 w-3 animate-pulse fill-[#EC4899] text-[#EC4899]"
        style={{ animationDelay: '0.3s' }}
      />
      <Star
        className="absolute left-16 top-20 h-5 w-5 animate-pulse fill-[#7C3AED] text-[#7C3AED]"
        style={{ animationDelay: '0.5s' }}
      />
      <Star
        className="absolute right-20 top-8 h-4 w-4 animate-pulse fill-[#10B981] text-[#10B981]"
        style={{ animationDelay: '0.7s' }}
      />
      <Sparkles className="absolute left-4 top-16 h-5 w-5 animate-bounce text-[#F59E0B]" />
      <Sparkles
        className="absolute right-6 top-6 h-4 w-4 animate-bounce text-[#EC4899]"
        style={{ animationDelay: '0.2s' }}
      />

      {/* Confetti dots */}
      <div className="absolute left-20 top-10 h-2 w-2 rounded-full bg-[#7C3AED]" />
      <div className="absolute right-16 top-14 h-3 w-3 rounded-full bg-[#EC4899]" />
      <div className="absolute left-8 top-24 h-2 w-2 rounded-full bg-[#10B981]" />
      <div className="top-18 absolute right-8 h-2 w-2 rounded-full bg-[#F59E0B]" />
    </div>
  );
}

// ============================================================================
// SCREEN 1: DASHBOARD
// ============================================================================

function DashboardScreen() {
  const categories = [
    { title: 'Math', icon: '🧮', questionsCount: 45, color: '#7C3AED', bgColor: '#F3E8FF' },
    { title: 'Chemistry', icon: '🧪', questionsCount: 32, color: '#10B981', bgColor: '#D1FAE5' },
    { title: 'Physics', icon: '⚡', questionsCount: 28, color: '#3B82F6', bgColor: '#DBEAFE' },
  ];

  const recentQuizzes = [
    { name: 'Algebra Basics', score: '18/20', date: 'Today', icon: '📐' },
    { name: 'Periodic Table', score: '15/15', date: 'Yesterday', icon: '⚗️' },
    { name: "Newton's Laws", score: '12/15', date: 'Dec 2', icon: '🚀' },
  ];

  return (
    <div style={playfulThemeStyles}>
      <ScreenContainer className="bg-[#F8F4FF] pb-24">
        {/* Header with Avatar */}
        <div className="-mx-4 -mt-6 flex items-center justify-between border-b border-[#E9D5FF] bg-white px-4 py-4">
          <AvatarBadge name="Hi, Emma!" points={2450} />
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF3C7]">
              <Flame size={20} className="text-[#F59E0B]" />
            </div>
            <span className="font-bold text-[#F59E0B]">12</span>
          </div>
        </div>

        {/* Play and Win Hero Banner */}
        <PlayfulCard gradient className="relative mt-6 overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Gift size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Daily Challenge</span>
              </div>
              <h2 className="mb-1 text-2xl font-bold text-white">Play and Win!</h2>
              <p className="mb-4 text-sm text-white/80">
                Complete today&apos;s quiz for bonus points
              </p>
              <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-bold text-[#7C3AED] shadow-lg transition-shadow hover:shadow-xl">
                <Play size={18} className="fill-[#7C3AED]" />
                Start Now
              </button>
            </div>
            <div className="text-6xl">🎯</div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />
        </PlayfulCard>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <PlayfulCard className="py-3 text-center">
            <div className="mb-1 text-2xl">🏆</div>
            <div className="text-xl font-bold text-[#7C3AED]">156</div>
            <div className="text-xs text-[#6B7280]">Quizzes</div>
          </PlayfulCard>
          <PlayfulCard className="py-3 text-center">
            <div className="mb-1 text-2xl">⭐</div>
            <div className="text-xl font-bold text-[#F59E0B]">92%</div>
            <div className="text-xs text-[#6B7280]">Accuracy</div>
          </PlayfulCard>
          <PlayfulCard className="py-3 text-center">
            <div className="mb-1 text-2xl">🔥</div>
            <div className="text-xl font-bold text-[#EC4899]">12</div>
            <div className="text-xs text-[#6B7280]">Day Streak</div>
          </PlayfulCard>
        </div>

        {/* Categories */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading className="flex items-center gap-2 text-lg text-[#1F2937]">
              <Sparkles size={20} className="text-[#7C3AED]" />
              Categories
            </SectionHeading>
            <Caption className="cursor-pointer font-semibold text-[#7C3AED]">See All</Caption>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat, index) => (
              <CategoryCard
                key={index}
                title={cat.title}
                icon={cat.icon}
                questionsCount={cat.questionsCount}
                color={cat.color}
                bgColor={cat.bgColor}
              />
            ))}
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="mt-8">
          <SectionHeading className="mb-4 flex items-center gap-2 text-lg text-[#1F2937]">
            <Clock size={20} className="text-[#7C3AED]" />
            Recent Quizzes
          </SectionHeading>
          <div className="space-y-3">
            {recentQuizzes.map((quiz, index) => (
              <PlayfulCard key={index} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3E8FF] text-2xl">
                  {quiz.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#1F2937]">{quiz.name}</div>
                  <div className="text-sm text-[#6B7280]">{quiz.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#10B981]">{quiz.score}</span>
                  <Star size={16} className="fill-[#F59E0B] text-[#F59E0B]" />
                </div>
              </PlayfulCard>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={0}
          items={[
            { icon: <Home size={24} />, label: 'Home' },
            { icon: <BookOpen size={24} />, label: 'Learn' },
            { icon: <BarChart3 size={24} />, label: 'Stats' },
            { icon: <Settings size={24} />, label: 'Settings' },
          ]}
          className="border-[#E9D5FF] bg-white"
        />
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 2: QUIZ
// ============================================================================

function QuizScreen() {
  const options = [
    { letter: 'a', label: 'Quadratic Formula', selected: false },
    { letter: 'b', label: 'Pythagorean Theorem', selected: true },
    { letter: 'c', label: "Euler's Identity", selected: false },
    { letter: 'd', label: 'Fibonacci Sequence', selected: false },
  ];

  return (
    <div style={playfulThemeStyles}>
      <ScreenContainer className="flex min-h-full flex-col bg-[#F8F4FF]">
        {/* Header */}
        <div className="-mx-4 -mt-6 flex items-center justify-between border-b border-[#E9D5FF] bg-white px-4 py-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3E8FF]">
            <ChevronRight size={20} className="rotate-180 text-[#7C3AED]" />
          </button>
          <span className="font-bold text-[#1F2937]">Math Quiz</span>
          <PointsBadge points={180} size="sm" />
        </div>

        {/* Progress Ring and Timer */}
        <div className="mt-6 flex items-center justify-between">
          {/* Question Counter Ring */}
          <div className="relative h-20 w-20">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#E9D5FF" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(7 / 20) * 213.6} 213.6`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-[#7C3AED]">7</span>
              <span className="text-xs text-[#6B7280]">of 20</span>
            </div>
          </div>

          {/* Timer Circle */}
          <div className="relative h-20 w-20">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#FEF3C7" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${0.65 * 213.6} 213.6`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Clock size={16} className="mb-0.5 text-[#F59E0B]" />
              <span className="text-sm font-bold text-[#F59E0B]">1:45</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <PlayfulCard className="mt-6 border-none bg-gradient-to-br from-[#F3E8FF] to-white">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🤔</span>
            <CardTitle className="text-lg leading-relaxed text-[#1F2937]">
              Which theorem states that in a right triangle, the square of the hypotenuse equals the
              sum of squares of the other two sides?
            </CardTitle>
          </div>
        </PlayfulCard>

        {/* Options */}
        <div className="mt-6 flex-1 space-y-3">
          {options.map((option) => (
            <QuizOption
              key={option.letter}
              letter={option.letter}
              label={option.label}
              selected={option.selected}
            />
          ))}
        </div>

        {/* Next Button */}
        <div className="mt-6 pb-6">
          <button
            className={cn(
              'w-full rounded-2xl py-4 text-lg font-bold text-white',
              'bg-gradient-to-r from-[#7C3AED] to-[#3B82F6]',
              'shadow-lg shadow-[#7C3AED]/30 hover:shadow-xl hover:shadow-[#7C3AED]/40',
              'transition-all duration-200',
              'flex items-center justify-center gap-2',
            )}
          >
            Next Question
            <ChevronRight size={22} />
          </button>
        </div>
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 3: SRS REVIEW (CELEBRATION)
// ============================================================================

function SRSReviewScreen() {
  return (
    <div style={playfulThemeStyles}>
      <ScreenContainer className="relative flex min-h-full flex-col bg-[#F8F4FF]">
        {/* Confetti Decoration */}
        <ConfettiDecoration />

        {/* Trophy Section */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center pt-8">
          {/* Large Trophy */}
          <div className="relative mb-4">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] shadow-xl shadow-[#F59E0B]/30">
              <Trophy size={64} className="text-white" />
            </div>
            <div className="absolute -right-2 -top-2">
              <Sparkles size={28} className="text-[#7C3AED]" />
            </div>
          </div>

          {/* Congratulations Text */}
          <h1 className="mb-2 text-center text-3xl font-bold text-[#1F2937]">
            🎉 Congratulations! 🎉
          </h1>
          <p className="mb-6 text-center text-[#6B7280]">You completed the quiz!</p>

          {/* Score Display */}
          <PlayfulCard className="mb-4 w-full max-w-xs py-6 text-center">
            <div className="mb-2 text-5xl font-bold text-[#10B981]">19/20</div>
            <div className="text-[#6B7280]">Questions Correct</div>
            <div className="mt-3 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={24}
                  className={cn(
                    i < 4 ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-[#E9D5FF] text-[#E9D5FF]',
                  )}
                />
              ))}
            </div>
          </PlayfulCard>

          {/* Points Earned */}
          <PlayfulCard gradient className="mb-4 w-full max-w-xs">
            <div className="flex items-center justify-center gap-3">
              <Diamond size={28} className="fill-white text-white" />
              <div>
                <div className="text-3xl font-bold text-white">+200</div>
                <div className="text-sm text-white/80">Points Earned!</div>
              </div>
            </div>
          </PlayfulCard>

          {/* Stats Row */}
          <div className="mb-6 grid w-full max-w-xs grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-[#7C3AED]">95%</div>
              <div className="text-xs text-[#6B7280]">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#F59E0B]">8:32</div>
              <div className="text-xs text-[#6B7280]">Time</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#EC4899]">🔥 13</div>
              <div className="text-xs text-[#6B7280]">Streak</div>
            </div>
          </div>

          {/* Achievement Badge */}
          <PlayfulCard className="mb-8 flex w-full max-w-xs items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D1FAE5]">
              <Zap size={24} className="text-[#10B981]" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[#1F2937]">Speed Master!</div>
              <div className="text-sm text-[#6B7280]">Completed in record time</div>
            </div>
          </PlayfulCard>
        </div>

        {/* Buttons */}
        <div className="relative z-10 space-y-3 pb-8">
          <button
            className={cn(
              'w-full rounded-2xl py-4 text-lg font-bold text-white',
              'bg-gradient-to-r from-[#7C3AED] to-[#3B82F6]',
              'shadow-lg shadow-[#7C3AED]/30',
              'flex items-center justify-center gap-2',
            )}
          >
            <Play size={20} className="fill-white" />
            Play Again
          </button>
          <button
            className={cn(
              'w-full rounded-2xl py-4 text-lg font-bold',
              'border-2 border-[#E9D5FF] bg-white text-[#7C3AED]',
              'flex items-center justify-center gap-2',
            )}
          >
            <Home size={20} />
            Back to Home
          </button>
        </div>
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 4: IMPORT
// ============================================================================

function ImportScreen() {
  const categoryIcons = [
    { name: 'Math', icon: '🧮', color: '#F3E8FF' },
    { name: 'Science', icon: '🔬', color: '#D1FAE5' },
    { name: 'History', icon: '📜', color: '#FEF3C7' },
    { name: 'Language', icon: '📚', color: '#DBEAFE' },
  ];

  const recentFiles = [
    { name: 'Algebra Quiz Pack', type: 'MD', questions: 45, icon: '📐' },
    { name: 'Chemistry Formulas', type: 'JSON', questions: 32, icon: '⚗️' },
  ];

  return (
    <div style={playfulThemeStyles}>
      <ScreenContainer className="bg-[#F8F4FF] pb-6">
        {/* Header */}
        <div className="-mx-4 -mt-6 flex items-center justify-between border-b border-[#E9D5FF] bg-white px-4 py-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3E8FF]">
            <ChevronRight size={20} className="rotate-180 text-[#7C3AED]" />
          </button>
          <span className="text-lg font-bold text-[#1F2937]">Import Quiz</span>
          <div className="w-10" />
        </div>

        {/* Fun Upload Area */}
        <PlayfulCard className="mt-6 border-2 border-dashed border-[#7C3AED]/30 bg-gradient-to-br from-[#F3E8FF] to-white">
          <div className="flex flex-col items-center py-8">
            <div className="relative mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] shadow-lg shadow-[#7C3AED]/30">
                <Upload size={36} className="text-white" />
              </div>
              <Sparkles className="absolute -right-1 -top-1 h-6 w-6 text-[#F59E0B]" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#1F2937]">Drop your files here!</div>
              <div className="mt-1 text-[#6B7280]">or tap to browse</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <FileTag type="MD" />
              <FileTag type="JSON" />
              <FileTag type="CSV" />
              <FileTag type="APKG" />
            </div>
          </div>
        </PlayfulCard>

        {/* Category Selection */}
        <div className="mt-8">
          <SectionHeading className="mb-4 flex items-center gap-2 text-lg text-[#1F2937]">
            <Sparkles size={20} className="text-[#7C3AED]" />
            Choose Category
          </SectionHeading>
          <div className="grid grid-cols-4 gap-3">
            {categoryIcons.map((cat, index) => (
              <div
                key={index}
                className="flex cursor-pointer flex-col items-center rounded-2xl p-3 transition-transform hover:scale-105"
                style={{ backgroundColor: cat.color }}
              >
                <span className="mb-1 text-3xl">{cat.icon}</span>
                <span className="text-xs font-semibold text-[#1F2937]">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <PlayfulCard className="flex cursor-pointer flex-col items-center py-5 transition-shadow hover:shadow-md">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] shadow-lg shadow-[#7C3AED]/20">
              <FolderOpen size={28} className="text-white" />
            </div>
            <span className="font-semibold text-[#1F2937]">Browse Files</span>
          </PlayfulCard>
          <PlayfulCard className="flex cursor-pointer flex-col items-center py-5 transition-shadow hover:shadow-md">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10B981] to-[#34D399] shadow-lg shadow-[#10B981]/20">
              <FileText size={28} className="text-white" />
            </div>
            <span className="font-semibold text-[#1F2937]">From URL</span>
          </PlayfulCard>
        </div>

        {/* Recent Files */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading className="flex items-center gap-2 text-lg text-[#1F2937]">
              <Clock size={20} className="text-[#7C3AED]" />
              Recent Files
            </SectionHeading>
            <Caption className="cursor-pointer font-semibold text-[#7C3AED]">View All</Caption>
          </div>
          <div className="space-y-3">
            {recentFiles.map((file, index) => (
              <PlayfulCard key={index} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3E8FF] text-2xl">
                  {file.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#1F2937]">{file.name}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <FileTag type={file.type} />
                    <span className="text-xs text-[#6B7280]">{file.questions} questions</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#7C3AED]" />
              </PlayfulCard>
            ))}
          </div>
        </div>

        {/* Fun Tip */}
        <PlayfulCard gradient className="mt-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl">💡</span>
            <div>
              <div className="font-bold text-white">Pro Tip!</div>
              <div className="text-sm text-white/80">
                Create quizzes with Markdown for the best experience
              </div>
            </div>
          </div>
        </PlayfulCard>
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function PlayfulThemePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8F4FF] to-[#EDE9FE]">
      {/* Header */}
      <div className="px-6 py-12 text-center">
        <h1 className="mb-3 flex items-center justify-center gap-3 text-4xl font-bold text-[#1F2937]">
          <span>🎮</span>
          Playful Math Quiz Theme
          <span>🎯</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[#4B5563]">
          A fun, gamified design inspired by mobile learning games. Vibrant colors, playful
          illustrations, and celebration screens make learning feel like a game!
        </p>
      </div>

      {/* Horizontal scroll container for all screens */}
      <div className="overflow-x-auto pb-12">
        <div className="flex min-w-max gap-8 px-8">
          <DesignFrame themeName="Dashboard" className="flex-shrink-0">
            <DashboardScreen />
          </DesignFrame>

          <DesignFrame themeName="Quiz" className="flex-shrink-0">
            <QuizScreen />
          </DesignFrame>

          <DesignFrame themeName="SRS Review (Celebration)" className="flex-shrink-0">
            <SRSReviewScreen />
          </DesignFrame>

          <DesignFrame themeName="Import" className="flex-shrink-0">
            <ImportScreen />
          </DesignFrame>
        </div>
      </div>

      {/* Color Palette Reference */}
      <div className="mx-auto max-w-4xl px-8 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-[#1F2937]">🎨 Color Palette</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl border border-[#E9D5FF] bg-[#F8F4FF]" />
            <div className="text-sm font-medium text-[#1F2937]">Background</div>
            <div className="text-xs text-[#6B7280]">#F8F4FF</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#7C3AED]" />
            <div className="text-sm font-medium text-[#1F2937]">Accent</div>
            <div className="text-xs text-[#6B7280]">#7C3AED</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#EC4899]" />
            <div className="text-sm font-medium text-[#1F2937]">Secondary</div>
            <div className="text-xs text-[#6B7280]">#EC4899</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#10B981]" />
            <div className="text-sm font-medium text-[#1F2937]">Success</div>
            <div className="text-xs text-[#6B7280]">#10B981</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#F59E0B]" />
            <div className="text-sm font-medium text-[#1F2937]">Warning</div>
            <div className="text-xs text-[#6B7280]">#F59E0B</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6]" />
            <div className="text-sm font-medium text-[#1F2937]">Hero Gradient</div>
            <div className="text-xs text-[#6B7280]">Purple → Blue</div>
          </div>
        </div>
      </div>
    </main>
  );
}
