'use client';

import React from 'react';
import {
  Home,
  BookOpen,
  BarChart3,
  Settings,
  ChevronRight,
  ArrowRight,
  Upload,
  FileText,
  User,
  Lock,
  Eye,
  EyeOff,
  Bookmark,
  Circle,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DesignFrame, ScreenContainer, BottomNav } from '../shared';

// ============================================================================
// MINIMALIST THEME CSS VARIABLES
// ============================================================================

const minimalThemeStyles: Record<string, string> = {
  // Primary backgrounds
  '--ds-bg-primary': '#FAFAFA',
  '--ds-card-bg': '#FFFFFF',
  '--ds-nav-bg': '#FFFFFF',
  '--ds-input-bg': '#FFFFFF',

  // Accents (pure black)
  '--ds-accent': '#000000',
  '--ds-accent-hover': '#1A1A1A',

  // Text colors
  '--ds-text-primary': '#000000',
  '--ds-text-secondary': '#666666',
  '--ds-text-muted': '#999999',

  // Card styling
  '--ds-card-border': '#E0E0E0',
  '--ds-secondary-bg': '#F5F5F5',
  '--ds-secondary-bg-hover': '#EBEBEB',

  // Progress
  '--ds-progress-bg': '#E0E0E0',

  // Status colors (minimal)
  '--ds-success': '#000000',
  '--ds-error': '#000000',
  '--ds-warning': '#000000',

  // Frame
  '--ds-frame-border': '#000000',
};

// ============================================================================
// CUSTOM COMPONENTS FOR MINIMALIST THEME
// ============================================================================

interface MinimalCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

function MinimalCard({ children, className, hover = false }: MinimalCardProps) {
  return (
    <div
      className={cn(
        'border border-[#E0E0E0] bg-white',
        hover && 'cursor-pointer transition-colors hover:border-black',
        className,
      )}
    >
      {children}
    </div>
  );
}

// Serif heading for editorial feel
function SerifHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={cn('font-serif text-3xl font-normal tracking-tight text-black', className)}>
      {children}
    </h1>
  );
}

function SerifSubheading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={cn('font-serif text-xl font-normal text-black', className)}>{children}</h2>;
}

// Black pill button
function PillButton({
  children,
  className,
  variant = 'primary',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button
      className={cn(
        'rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all',
        variant === 'primary'
          ? 'bg-black text-white hover:bg-[#1A1A1A]'
          : 'border border-black bg-white text-black hover:bg-black hover:text-white',
        className,
      )}
    >
      {children}
    </button>
  );
}

// Learning streak bar
function StreakBar({ day, active, height }: { day: string; active?: boolean; height: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-16 w-3 flex-col-reverse overflow-hidden rounded-full bg-[#F5F5F5]">
        <div
          className={cn('w-full rounded-full transition-all', active ? 'bg-black' : 'bg-[#E0E0E0]')}
          style={{ height: `${height}%` }}
        />
      </div>
      <span
        className={cn(
          'text-[10px] uppercase tracking-wider',
          active ? 'font-medium text-black' : 'text-[#999999]',
        )}
      >
        {day}
      </span>
    </div>
  );
}

// Minimal circular progress
function MinimalCircularProgress({ value, size = 56 }: { value: number; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F5F5F5"
          strokeWidth="2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-black">{value}%</span>
      </div>
    </div>
  );
}

// Category item with subtle icon
function CategoryItem({
  label,
  count,
  icon,
}: {
  label: string;
  count: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="-mx-4 flex cursor-pointer items-center justify-between border-b border-[#F5F5F5] px-4 py-4 transition-colors last:border-0 hover:bg-[#FAFAFA]">
      <div className="flex items-center gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0]">
          {icon || <Circle size={12} className="text-black" />}
        </div>
        <span className="text-sm text-black">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#999999]">{count}</span>
        <ChevronRight size={16} className="text-[#CCCCCC]" />
      </div>
    </div>
  );
}

// Minimal course card
function CourseCard({
  title,
  lessons,
  progress,
  featured,
}: {
  title: string;
  lessons: number;
  progress: number;
  featured?: boolean;
}) {
  return (
    <MinimalCard className={cn('p-4', featured && 'border-black')} hover>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 text-sm font-medium text-black">{title}</h3>
          <p className="text-xs text-[#999999]">{lessons} lessons</p>
        </div>
        <Bookmark size={16} className={cn(featured ? 'fill-black text-black' : 'text-[#CCCCCC]')} />
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#F5F5F5]">
        <div className="h-full rounded-full bg-black" style={{ width: `${progress}%` }} />
      </div>
    </MinimalCard>
  );
}

// ============================================================================
// SCREEN 1: DASHBOARD
// ============================================================================

function DashboardScreen() {
  return (
    <div style={minimalThemeStyles}>
      <ScreenContainer className="bg-[#FAFAFA] pb-24">
        {/* Hero Section */}
        <div className="px-2 pb-12 pt-8">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#999999]">Welcome back</p>
          <SerifHeading className="mb-6 leading-tight">
            Improve your
            <br />
            design skills
          </SerifHeading>
          <PillButton className="flex items-center gap-2">
            Get Started
            <ArrowRight size={16} />
          </PillButton>
        </div>

        {/* Learning Streak */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.15em] text-[#666666]">
              Learning streak
            </span>
            <span className="text-xs text-[#999999]">7 days</span>
          </div>
          <div className="flex items-end justify-between px-2">
            <StreakBar day="M" height={60} />
            <StreakBar day="T" height={80} />
            <StreakBar day="W" height={45} />
            <StreakBar day="T" height={90} />
            <StreakBar day="F" height={70} />
            <StreakBar day="S" active height={100} />
            <StreakBar day="S" height={30} />
          </div>
        </div>

        {/* My Courses */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.15em] text-[#666666]">My Courses</span>
            <button className="text-xs text-black underline underline-offset-4">View all</button>
          </div>
          <div className="space-y-3">
            <CourseCard title="Typography Fundamentals" lessons={12} progress={75} featured />
            <CourseCard title="Grid Systems" lessons={8} progress={40} />
            <CourseCard title="Color Theory" lessons={15} progress={20} />
          </div>
        </div>

        {/* Widgets Area */}
        <div className="grid grid-cols-2 gap-3">
          <MinimalCard className="p-4 text-center">
            <div className="mb-1 font-serif text-2xl text-black">24</div>
            <div className="text-[10px] uppercase tracking-wider text-[#999999]">Due today</div>
          </MinimalCard>
          <MinimalCard className="p-4 text-center">
            <div className="mb-1 font-serif text-2xl text-black">156</div>
            <div className="text-[10px] uppercase tracking-wider text-[#999999]">Cards learned</div>
          </MinimalCard>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={0}
          items={[
            { icon: <Home size={20} strokeWidth={1.5} />, label: 'Home' },
            { icon: <BookOpen size={20} strokeWidth={1.5} />, label: 'Learn' },
            { icon: <BarChart3 size={20} strokeWidth={1.5} />, label: 'Stats' },
            { icon: <Settings size={20} strokeWidth={1.5} />, label: 'Settings' },
          ]}
          className="border-[#E0E0E0] bg-white"
        />
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 2: QUIZ (Category Selection)
// ============================================================================

function QuizScreen() {
  const categories = [
    { label: 'Principles of Design', count: 24, icon: <Circle size={8} className="fill-black" /> },
    { label: 'Grids', count: 18, icon: <Minus size={12} className="text-black" /> },
    { label: 'Guidelines', count: 12, icon: <Minus size={12} className="rotate-45 text-black" /> },
    { label: 'Color', count: 32, icon: <Circle size={12} className="text-black" /> },
    {
      label: 'Typography',
      count: 28,
      icon: <FileText size={12} className="text-black" strokeWidth={1.5} />,
    },
  ];

  return (
    <div style={minimalThemeStyles}>
      <ScreenContainer className="bg-[#FAFAFA] pb-24">
        {/* Header */}
        <div className="px-2 pb-10 pt-8">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#999999]">Quiz</p>
          <SerifHeading className="leading-tight">
            Put your skills
            <br />
            to the test
          </SerifHeading>
        </div>

        {/* Stats Row */}
        <div className="mb-10 flex items-center gap-8">
          <div>
            <div className="font-serif text-2xl text-black">114</div>
            <div className="text-[10px] uppercase tracking-wider text-[#999999]">
              Total questions
            </div>
          </div>
          <div className="h-8 w-px bg-[#E0E0E0]" />
          <div>
            <div className="font-serif text-2xl text-black">5</div>
            <div className="text-[10px] uppercase tracking-wider text-[#999999]">Categories</div>
          </div>
        </div>

        {/* Category List */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.15em] text-[#666666]">Categories</span>
          </div>
          <MinimalCard className="px-4">
            {categories.map((cat, index) => (
              <CategoryItem key={index} label={cat.label} count={cat.count} icon={cat.icon} />
            ))}
          </MinimalCard>
        </div>

        {/* Start Quiz Button */}
        <div className="flex justify-center">
          <PillButton className="flex w-full items-center justify-center gap-2">
            Start Quiz
            <ArrowRight size={16} />
          </PillButton>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={1}
          items={[
            { icon: <Home size={20} strokeWidth={1.5} />, label: 'Home' },
            { icon: <BookOpen size={20} strokeWidth={1.5} />, label: 'Learn' },
            { icon: <BarChart3 size={20} strokeWidth={1.5} />, label: 'Stats' },
            { icon: <Settings size={20} strokeWidth={1.5} />, label: 'Settings' },
          ]}
          className="border-[#E0E0E0] bg-white"
        />
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 3: SRS REVIEW
// ============================================================================

function SRSReviewScreen() {
  const [showAnswer, setShowAnswer] = React.useState(false);

  const options = [
    { letter: 'A', label: 'Ascender' },
    { letter: 'B', label: 'X-height' },
    { letter: 'C', label: 'Counter' },
    { letter: 'D', label: 'Stem' },
  ];

  return (
    <div style={minimalThemeStyles}>
      <ScreenContainer className="flex min-h-full flex-col bg-[#FAFAFA] pb-24">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 pt-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E0E0E0] transition-colors hover:border-black">
            <ChevronRight size={18} className="rotate-180 text-black" />
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.15em] text-[#999999]">Typography</p>
            <p className="text-sm text-black">Card 12 of 28</p>
          </div>
          <MinimalCircularProgress value={43} />
        </div>

        {/* Question Card */}
        <MinimalCard className="mb-6 flex-1 p-6">
          <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-[#999999]">
            Typographic Anatomy
          </p>

          {/* Visual illustration placeholder */}
          <div className="relative mb-8 flex h-32 items-center justify-center">
            <span className="font-serif text-[80px] leading-none text-black">Ag</span>
            <div className="absolute right-16 top-6 h-px w-16 bg-black" />
            <div className="absolute right-4 top-6 h-2 w-2 rounded-full border border-black" />
          </div>

          <SerifSubheading className="mb-8 text-center">
            What is the name of the part
            <br />
            indicated by the arrow?
          </SerifSubheading>

          {/* Letter Options */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => (
              <button
                key={option.letter}
                onClick={() => setShowAnswer(true)}
                className={cn(
                  'border py-4 text-center transition-all',
                  showAnswer && option.letter === 'A'
                    ? 'border-black bg-black text-white'
                    : 'border-[#E0E0E0] hover:border-black',
                )}
              >
                <span className="mb-1 block text-xs uppercase tracking-wider text-[#999999]">
                  {option.letter}
                </span>
                <span className="text-sm text-current">{option.label}</span>
              </button>
            ))}
          </div>
        </MinimalCard>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <PillButton variant="secondary" className="flex-1">
            Skip
          </PillButton>
          <PillButton className="flex-1">Submit</PillButton>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={1}
          items={[
            { icon: <Home size={20} strokeWidth={1.5} />, label: 'Home' },
            { icon: <BookOpen size={20} strokeWidth={1.5} />, label: 'Learn' },
            { icon: <BarChart3 size={20} strokeWidth={1.5} />, label: 'Stats' },
            { icon: <Settings size={20} strokeWidth={1.5} />, label: 'Settings' },
          ]}
          className="border-[#E0E0E0] bg-white"
        />
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 4: IMPORT (Login/Set Password Style)
// ============================================================================

function ImportScreen() {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div style={minimalThemeStyles}>
      <ScreenContainer className="flex min-h-full flex-col bg-[#FAFAFA] pb-24">
        {/* Header */}
        <div className="px-2 pb-10 pt-8">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#999999]">Import</p>
          <SerifHeading className="mb-3 leading-tight">
            Add your
            <br />
            content
          </SerifHeading>
          <p className="text-sm leading-relaxed text-[#666666]">
            Import flashcards from various sources or create them from scratch.
          </p>
        </div>

        {/* Form Card */}
        <MinimalCard className="mb-6 p-6">
          {/* File Name Input */}
          <div className="mb-6">
            <label className="mb-3 block text-xs uppercase tracking-[0.15em] text-[#666666]">
              Collection Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type="text"
                placeholder="Typography Basics"
                className="h-12 w-full border border-[#E0E0E0] bg-white pl-11 pr-4 text-sm text-black transition-colors placeholder:text-[#CCCCCC] focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* URL Input */}
          <div className="mb-6">
            <label className="mb-3 block text-xs uppercase tracking-[0.15em] text-[#666666]">
              Import URL
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="https://..."
                className="h-12 w-full border border-[#E0E0E0] bg-white pl-11 pr-12 text-sm text-black transition-colors placeholder:text-[#CCCCCC] focus:border-black focus:outline-none"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999999] transition-colors hover:text-black"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E0E0E0]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#999999]">or</span>
            <div className="h-px flex-1 bg-[#E0E0E0]" />
          </div>

          {/* Upload Area */}
          <div className="cursor-pointer border border-dashed border-[#E0E0E0] p-8 text-center transition-colors hover:border-black">
            <Upload size={24} className="mx-auto mb-4 text-[#999999]" />
            <p className="mb-1 text-sm text-black">Upload a file</p>
            <p className="text-xs text-[#999999]">.md, .json, .csv</p>
          </div>
        </MinimalCard>

        {/* Recent Imports */}
        <div className="mb-8">
          <span className="mb-4 block text-xs uppercase tracking-[0.15em] text-[#666666]">
            Recent Imports
          </span>
          <div className="space-y-2">
            {[
              { name: 'design-principles.md', date: 'Today' },
              { name: 'color-theory.json', date: 'Yesterday' },
            ].map((file, index) => (
              <MinimalCard key={index} className="flex items-center gap-4 p-4" hover>
                <div className="flex h-10 w-10 items-center justify-center border border-[#E0E0E0]">
                  <FileText size={16} className="text-black" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-black">{file.name}</p>
                  <p className="text-xs text-[#999999]">{file.date}</p>
                </div>
                <ChevronRight size={16} className="text-[#CCCCCC]" />
              </MinimalCard>
            ))}
          </div>
        </div>

        {/* Import Button */}
        <div className="mt-auto">
          <PillButton className="flex w-full items-center justify-center gap-2">
            Import Content
            <ArrowRight size={16} />
          </PillButton>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={1}
          items={[
            { icon: <Home size={20} strokeWidth={1.5} />, label: 'Home' },
            { icon: <BookOpen size={20} strokeWidth={1.5} />, label: 'Learn' },
            { icon: <BarChart3 size={20} strokeWidth={1.5} />, label: 'Stats' },
            { icon: <Settings size={20} strokeWidth={1.5} />, label: 'Settings' },
          ]}
          className="border-[#E0E0E0] bg-white"
        />
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function MinimalThemePage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b border-[#E0E0E0] bg-white px-6 py-16 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#999999]">Design System</p>
        <h1 className="mb-4 font-serif text-5xl font-normal text-black">Minimalist Theme</h1>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-[#666666]">
          An elegant, editorial-inspired design featuring extreme minimalism, bold serif typography,
          and a refined black and white palette.
        </p>
      </div>

      {/* Horizontal scroll container for all screens */}
      <div className="overflow-x-auto pb-16">
        <div className="flex min-w-max gap-8 px-8 pt-12">
          <DesignFrame themeName="Dashboard" className="flex-shrink-0">
            <DashboardScreen />
          </DesignFrame>

          <DesignFrame themeName="Quiz" className="flex-shrink-0">
            <QuizScreen />
          </DesignFrame>

          <DesignFrame themeName="SRS Review" className="flex-shrink-0">
            <SRSReviewScreen />
          </DesignFrame>

          <DesignFrame themeName="Import" className="flex-shrink-0">
            <ImportScreen />
          </DesignFrame>
        </div>
      </div>

      {/* Color Palette Reference */}
      <div className="mx-auto max-w-4xl px-8 pb-16">
        <h2 className="mb-8 text-center font-serif text-2xl text-black">Color Palette</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-7">
          <div className="text-center">
            <div className="mb-3 aspect-square w-full border border-[#E0E0E0] bg-[#FAFAFA]" />
            <div className="text-sm text-black">Background</div>
            <div className="text-xs text-[#999999]">#FAFAFA</div>
          </div>
          <div className="text-center">
            <div className="mb-3 aspect-square w-full border border-[#E0E0E0] bg-white" />
            <div className="text-sm text-black">Card</div>
            <div className="text-xs text-[#999999]">#FFFFFF</div>
          </div>
          <div className="text-center">
            <div className="mb-3 aspect-square w-full bg-black" />
            <div className="text-sm text-black">Accent</div>
            <div className="text-xs text-[#999999]">#000000</div>
          </div>
          <div className="text-center">
            <div className="mb-3 aspect-square w-full border border-[#E0E0E0] bg-[#F5F5F5]" />
            <div className="text-sm text-black">Secondary</div>
            <div className="text-xs text-[#999999]">#F5F5F5</div>
          </div>
          <div className="text-center">
            <div className="mb-3 aspect-square w-full bg-[#666666]" />
            <div className="text-sm text-black">Text Secondary</div>
            <div className="text-xs text-[#999999]">#666666</div>
          </div>
          <div className="text-center">
            <div className="mb-3 aspect-square w-full bg-[#999999]" />
            <div className="text-sm text-black">Text Muted</div>
            <div className="text-xs text-[#999999]">#999999</div>
          </div>
          <div className="text-center">
            <div className="mb-3 aspect-square w-full bg-[#E0E0E0]" />
            <div className="text-sm text-black">Border</div>
            <div className="text-xs text-[#999999]">#E0E0E0</div>
          </div>
        </div>
      </div>

      {/* Design Features */}
      <div className="mx-auto max-w-4xl px-8 pb-20">
        <h2 className="mb-8 text-center font-serif text-2xl text-black">Design Characteristics</h2>
        <div className="grid grid-cols-1 gap-px bg-[#E0E0E0] md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Serif Typography', desc: 'Bold, elegant headings with serif fonts' },
            { title: 'Extreme Whitespace', desc: 'Generous spacing for visual breathing room' },
            { title: 'Black Pill Buttons', desc: 'Minimal CTAs with rounded pill shape' },
            { title: 'Thin Borders', desc: 'Subtle 1px lines for separation' },
            { title: 'Monochrome Palette', desc: 'Pure black and white with gray tones' },
            { title: 'Learning Streak Bars', desc: 'Minimal vertical progress indicators' },
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6">
              <div className="mb-2 text-sm font-medium text-black">{feature.title}</div>
              <div className="text-xs leading-relaxed text-[#666666]">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer quote */}
      <div className="border-t border-[#E0E0E0] py-16 text-center">
        <p className="mx-auto max-w-md font-serif text-xl italic text-black">
          &ldquo;Less, but better.&rdquo;
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#999999]">— Dieter Rams</p>
      </div>
    </main>
  );
}
