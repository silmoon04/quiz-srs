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
  Check,
  Zap,
  Award,
  Target,
  Calendar,
  TrendingUp,
  File,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DesignFrame,
  ScreenContainer,
  SectionHeading,
  CardTitle,
  BodyText,
  Caption,
  BottomNav,
} from '../shared';

// ============================================================================
// APTITUDE TEST THEME CSS VARIABLES
// ============================================================================

const aptitudeThemeStyles: React.CSSProperties = {
  // Primary backgrounds - ultra clean white
  '--ds-bg-primary': '#FFFFFF',
  '--ds-card-bg': '#FFFFFF',
  '--ds-nav-bg': '#FFFFFF',
  '--ds-input-bg': '#FAFAFA',

  // Accents - purple for professional feel
  '--ds-accent': '#9B59B6',
  '--ds-accent-hover': '#8E44AD',
  '--ds-secondary-accent': '#9B59B6',

  // Text colors
  '--ds-text-primary': '#1A1A1A',
  '--ds-text-secondary': '#666666',
  '--ds-text-muted': '#999999',

  // Card styling - thin borders
  '--ds-card-border': '#E8E8E8',
  '--ds-secondary-bg': '#F5F5F5',
  '--ds-secondary-bg-hover': '#EEEEEE',

  // Progress
  '--ds-progress-bg': '#E8E8E8',

  // Status colors
  '--ds-success': '#27AE60',
  '--ds-error': '#E74C3C',
  '--ds-warning': '#F39C12',

  // Frame
  '--ds-frame-border': '#1A1A1A',
} as React.CSSProperties;

// ============================================================================
// CUSTOM COMPONENTS FOR APTITUDE THEME
// ============================================================================

interface CleanCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

function CleanCard({ children, className, noPadding }: CleanCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white',
        'border border-[#E8E8E8]',
        !noPadding && 'p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface MinimalStatProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: string;
}

function MinimalStat({ value, label, icon, trend }: MinimalStatProps) {
  return (
    <CleanCard className="flex items-center gap-3 p-4">
      {icon && (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#9B59B6]/10 text-[#9B59B6]">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className="text-2xl font-semibold text-[#1A1A1A]">{value}</div>
        <div className="text-sm text-[#666666]">{label}</div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-sm font-medium text-[#27AE60]">
          <TrendingUp size={14} />
          {trend}
        </div>
      )}
    </CleanCard>
  );
}

interface RadioOptionProps {
  letter: string;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

function RadioOption({ letter, label, selected, onClick }: RadioOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl border p-4 transition-all duration-200',
        selected
          ? 'border-[#9B59B6] bg-[#9B59B6]/5'
          : 'border-[#E8E8E8] bg-white hover:border-[#9B59B6]/40',
      )}
    >
      {/* Radio circle */}
      <span
        className={cn(
          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          selected ? 'border-[#9B59B6] bg-[#9B59B6]' : 'border-[#CCCCCC]',
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      {/* Option letter badge */}
      <span
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-semibold',
          selected ? 'bg-[#9B59B6] text-white' : 'bg-[#F5F5F5] text-[#666666]',
        )}
      >
        {letter}
      </span>
      <span className="text-base text-[#1A1A1A]">{label}</span>
    </button>
  );
}

interface FileTypeBadgeProps {
  type: string;
}

function FileTypeBadge({ type }: FileTypeBadgeProps) {
  const colors: Record<string, { bg: string; text: string }> = {
    MD: { bg: '#E8F5E9', text: '#27AE60' },
    JSON: { bg: '#FFF3E0', text: '#F39C12' },
    CSV: { bg: '#E3F2FD', text: '#3498DB' },
    APKG: { bg: '#F3E5F5', text: '#9B59B6' },
  };

  const color = colors[type] || colors.JSON;

  return (
    <span
      className="rounded px-2 py-1 text-xs font-semibold"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {type}
    </span>
  );
}

// ============================================================================
// HEADER COMPONENT WITH GRADIENT
// ============================================================================

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  timer?: string;
  rightContent?: React.ReactNode;
}

function GradientHeader({ title, subtitle, timer, rightContent }: GradientHeaderProps) {
  return (
    <div
      className="-mx-4 -mt-6 px-4 py-5"
      style={{
        background: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>}
        </div>
        {timer && (
          <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5">
            <Clock size={16} className="text-white" />
            <span className="text-sm font-semibold text-white">{timer}</span>
          </div>
        )}
        {rightContent}
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN 1: DASHBOARD
// ============================================================================

function DashboardScreen() {
  const tests = [
    { name: 'Logical Reasoning', questions: 25, time: '30 min', status: 'ready' },
    { name: 'Verbal Ability', questions: 30, time: '25 min', status: 'ready' },
    { name: 'Quantitative Aptitude', questions: 35, time: '40 min', status: 'completed' },
  ];

  return (
    <div style={aptitudeThemeStyles}>
      <ScreenContainer className="bg-white pb-24">
        {/* Gradient Header */}
        <GradientHeader
          title="Aptitude Test Suite"
          subtitle="Practice for certification"
          timer="09:45:23"
        />

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <MinimalStat
            value={156}
            label="Questions Solved"
            icon={<Target size={20} />}
            trend="+12%"
          />
          <MinimalStat value="82%" label="Accuracy Rate" icon={<Award size={20} />} />
        </div>

        {/* Quick Start Section */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading className="text-lg text-[#1A1A1A]">Quick Start</SectionHeading>
            <Caption className="cursor-pointer font-medium text-[#9B59B6]">View All</Caption>
          </div>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <CleanCard key={index} className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg',
                    test.status === 'completed'
                      ? 'bg-[#27AE60]/10 text-[#27AE60]'
                      : 'bg-[#9B59B6]/10 text-[#9B59B6]',
                  )}
                >
                  {test.status === 'completed' ? <Check size={24} /> : <BookOpen size={24} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[#1A1A1A]">{test.name}</div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-[#666666]">
                    <span>{test.questions} questions</span>
                    <span className="h-1 w-1 rounded-full bg-[#CCCCCC]" />
                    <span>{test.time}</span>
                  </div>
                </div>
                {test.status === 'completed' ? (
                  <span className="rounded-full bg-[#27AE60]/10 px-3 py-1 text-xs font-medium text-[#27AE60]">
                    Done
                  </span>
                ) : (
                  <ChevronRight size={20} className="text-[#CCCCCC]" />
                )}
              </CleanCard>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-8">
          <SectionHeading className="mb-4 text-lg text-[#1A1A1A]">Performance</SectionHeading>
          <CleanCard>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#666666]">Weekly Progress</span>
              <span className="text-sm font-medium text-[#9B59B6]">75%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#E8E8E8]">
              <div className="h-full rounded-full bg-[#9B59B6]" style={{ width: '75%' }} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#E8E8E8] pt-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-[#1A1A1A]">45</div>
                <div className="text-xs text-[#666666]">Tests Taken</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[#27AE60]">38</div>
                <div className="text-xs text-[#666666]">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[#1A1A1A]">12</div>
                <div className="text-xs text-[#666666]">Day Streak</div>
              </div>
            </div>
          </CleanCard>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={0}
          items={[
            { icon: <Home size={24} />, label: 'Home' },
            { icon: <BookOpen size={24} />, label: 'Tests' },
            { icon: <BarChart3 size={24} />, label: 'Stats' },
            { icon: <Settings size={24} />, label: 'Settings' },
          ]}
          className="border-[#E8E8E8] bg-white"
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
    { letter: 'A', label: 'Sequential data processing', selected: false },
    { letter: 'B', label: 'Divide and conquer approach', selected: true },
    { letter: 'C', label: 'Brute force iteration', selected: false },
    { letter: 'D', label: 'Random sampling method', selected: false },
  ];

  return (
    <div style={aptitudeThemeStyles}>
      <ScreenContainer className="flex min-h-full flex-col bg-white">
        {/* Gradient Header with Timer */}
        <GradientHeader title="Logical Reasoning" timer="24:35" />

        {/* Question Counter */}
        <div className="mt-6 flex items-center justify-between">
          <span className="font-medium text-[#1A1A1A]">Question 8 of 25</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#666666]">Score:</span>
            <span className="font-semibold text-[#27AE60]">7/7</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#E8E8E8]">
          <div
            className="h-full rounded-full bg-[#9B59B6] transition-all duration-300"
            style={{ width: '32%' }}
          />
        </div>

        {/* Question Card */}
        <CleanCard className="mt-6 border-none bg-[#FAFAFA]">
          <CardTitle className="text-base leading-relaxed text-[#1A1A1A]">
            What algorithmic approach is best suited for finding the maximum subarray sum in a large
            dataset?
          </CardTitle>
        </CleanCard>

        {/* Options */}
        <div className="mt-6 flex-1 space-y-3">
          {options.map((option) => (
            <RadioOption
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
              'w-full rounded-xl py-4 text-base font-semibold text-white',
              'bg-[#9B59B6] hover:bg-[#8E44AD]',
              'transition-colors duration-200',
              'flex items-center justify-center gap-2',
            )}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 3: SRS REVIEW
// ============================================================================

function SRSReviewScreen() {
  const stats = [
    { label: 'New', value: 15, color: '#3498DB' },
    { label: 'Learning', value: 28, color: '#F39C12' },
    { label: 'Review', value: 47, color: '#27AE60' },
  ];

  return (
    <div style={aptitudeThemeStyles}>
      <ScreenContainer className="bg-white pb-24">
        {/* Gradient Header */}
        <GradientHeader title="Spaced Repetition" subtitle="Review your cards" />

        {/* Cards Due Summary */}
        <CleanCard className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-[#9B59B6]">90</div>
              <div className="mt-1 text-sm text-[#666666]">Cards due today</div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#9B59B6]">
              <Zap size={28} className="text-[#9B59B6]" />
            </div>
          </div>

          {/* Card Type Breakdown */}
          <div className="mt-6 flex gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex-1 text-center">
                <div className="text-xl font-semibold" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-[#666666]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Start Review Button */}
          <button
            className={cn(
              'mt-6 w-full rounded-xl py-3.5 font-semibold text-white',
              'bg-[#9B59B6] hover:bg-[#8E44AD]',
              'transition-colors duration-200',
            )}
          >
            Start Review Session
          </button>
        </CleanCard>

        {/* Streak Counter */}
        <CleanCard className="mt-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F39C12]/10">
            <Zap size={24} className="text-[#F39C12]" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-[#1A1A1A]">Current Streak</div>
            <div className="text-sm text-[#666666]">Keep it going!</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#F39C12]">24</div>
            <div className="text-xs text-[#666666]">days</div>
          </div>
        </CleanCard>

        {/* Recent Review Sessions */}
        <div className="mt-8">
          <SectionHeading className="mb-4 text-lg text-[#1A1A1A]">Recent Sessions</SectionHeading>
          <div className="space-y-3">
            {[
              { date: 'Today', cards: 45, accuracy: '92%' },
              { date: 'Yesterday', cards: 62, accuracy: '88%' },
              { date: 'Dec 2', cards: 38, accuracy: '95%' },
            ].map((session, index) => (
              <CleanCard key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8E8E8]">
                    <Calendar size={18} className="text-[#666666]" />
                  </div>
                  <div>
                    <div className="font-medium text-[#1A1A1A]">{session.date}</div>
                    <div className="text-sm text-[#666666]">{session.cards} cards reviewed</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Check size={16} className="text-[#27AE60]" />
                  <span className="font-medium text-[#27AE60]">{session.accuracy}</span>
                </div>
              </CleanCard>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={1}
          items={[
            { icon: <Home size={24} />, label: 'Home' },
            { icon: <BookOpen size={24} />, label: 'Review' },
            { icon: <BarChart3 size={24} />, label: 'Stats' },
            { icon: <Settings size={24} />, label: 'Settings' },
          ]}
          className="border-[#E8E8E8] bg-white"
        />
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 4: IMPORT
// ============================================================================

function ImportScreen() {
  const recentImports = [
    { name: 'Data Structures Basics', type: 'MD', date: 'Dec 3', questions: 45 },
    { name: 'Algorithm Patterns', type: 'JSON', date: 'Dec 1', questions: 78 },
    { name: 'System Design', type: 'CSV', date: 'Nov 28', questions: 32 },
  ];

  return (
    <div style={aptitudeThemeStyles}>
      <ScreenContainer className="bg-white pb-6">
        {/* Gradient Header */}
        <GradientHeader title="Import Questions" subtitle="Add new test materials" />

        {/* Upload Area */}
        <CleanCard className="mt-6 border-2 border-dashed border-[#E8E8E8]">
          <div className="flex flex-col items-center py-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#9B59B6]/10">
              <Upload size={28} className="text-[#9B59B6]" />
            </div>
            <div className="text-center">
              <div className="font-medium text-[#1A1A1A]">Drop files here</div>
              <div className="mt-1 text-sm text-[#666666]">or click to browse</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <FileTypeBadge type="MD" />
              <FileTypeBadge type="JSON" />
              <FileTypeBadge type="CSV" />
              <FileTypeBadge type="APKG" />
            </div>
          </div>
        </CleanCard>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <CleanCard className="flex flex-col items-center py-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#9B59B6]/10">
              <FolderOpen size={24} className="text-[#9B59B6]" />
            </div>
            <span className="text-sm font-medium text-[#1A1A1A]">Browse Files</span>
          </CleanCard>
          <CleanCard className="flex flex-col items-center py-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#27AE60]/10">
              <FileText size={24} className="text-[#27AE60]" />
            </div>
            <span className="text-sm font-medium text-[#1A1A1A]">From URL</span>
          </CleanCard>
        </div>

        {/* Recent Imports */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading className="text-lg text-[#1A1A1A]">Recent Imports</SectionHeading>
            <Caption className="cursor-pointer font-medium text-[#9B59B6]">Clear All</Caption>
          </div>

          <div className="space-y-3">
            {recentImports.map((item, index) => (
              <CleanCard key={index} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F5F5]">
                  <File size={20} className="text-[#666666]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-[#1A1A1A]">{item.name}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <FileTypeBadge type={item.type} />
                    <span className="text-xs text-[#999999]">{item.questions} questions</span>
                  </div>
                </div>
                <div className="text-sm text-[#999999]">{item.date}</div>
              </CleanCard>
            ))}
          </div>
        </div>

        {/* Import Templates */}
        <div className="mt-8">
          <SectionHeading className="mb-4 text-lg text-[#1A1A1A]">Templates</SectionHeading>
          <CleanCard className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3498DB]/10">
              <FileText size={20} className="text-[#3498DB]" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-[#1A1A1A]">Download Template</div>
              <div className="text-sm text-[#666666]">Get started with our format</div>
            </div>
            <ChevronRight size={20} className="text-[#CCCCCC]" />
          </CleanCard>
        </div>
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AptitudeThemePage() {
  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="px-6 py-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-[#1A1A1A]">Aptitude Test Theme</h1>
        <p className="mx-auto max-w-2xl text-lg text-[#666666]">
          A clean, professional design inspired by certification test platforms. Minimal borders,
          purple accents, and focused layouts create a distraction-free testing experience.
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
        <h2 className="mb-6 text-center text-2xl font-bold text-[#1A1A1A]">Color Palette</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl border border-[#E8E8E8] bg-white" />
            <div className="text-sm font-medium text-[#1A1A1A]">Primary BG</div>
            <div className="text-xs text-[#666666]">#FFFFFF</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl border-2 border-[#E8E8E8]" />
            <div className="text-sm font-medium text-[#1A1A1A]">Border</div>
            <div className="text-xs text-[#666666]">#E8E8E8</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#9B59B6]" />
            <div className="text-sm font-medium text-[#1A1A1A]">Accent</div>
            <div className="text-xs text-[#666666]">#9B59B6</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#27AE60]" />
            <div className="text-sm font-medium text-[#1A1A1A]">Success</div>
            <div className="text-xs text-[#666666]">#27AE60</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#1A1A1A]" />
            <div className="text-sm font-medium text-[#1A1A1A]">Text Primary</div>
            <div className="text-xs text-[#666666]">#1A1A1A</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#666666]" />
            <div className="text-sm font-medium text-[#1A1A1A]">Text Secondary</div>
            <div className="text-xs text-[#666666]">#666666</div>
          </div>
        </div>
      </div>
    </main>
  );
}
