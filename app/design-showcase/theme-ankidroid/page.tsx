'use client';

import React from 'react';
import {
  Home,
  BookOpen,
  BarChart3,
  Settings,
  ChevronRight,
  Plus,
  Search,
  Folder,
  FileText,
  Trash2,
  Edit3,
  Clock,
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DesignFrame,
  ScreenContainer,
  DisplayHeading,
  SectionHeading,
  CardTitle,
  BodyText,
  Caption,
  BaseCard,
  PrimaryButton,
  ProgressBar,
  BottomNav,
  SearchBar,
  OptionCard,
} from '../shared';

// ============================================================================
// ANKIDROID THEME CSS VARIABLES
// ============================================================================

const ankidroidThemeStyles: React.CSSProperties = {
  // Primary backgrounds
  '--ds-bg-primary': '#FDF6E9',
  '--ds-card-bg': '#FFFFFF',
  '--ds-nav-bg': '#FFFFFF',
  '--ds-input-bg': '#FEF9F0',

  // Accents
  '--ds-accent': '#5DADE2',
  '--ds-accent-hover': '#3498DB',
  '--ds-secondary-accent': '#F5B041',

  // Text colors
  '--ds-text-primary': '#2C3E50',
  '--ds-text-secondary': '#7F8C8D',
  '--ds-text-muted': '#95A5A6',

  // Card styling
  '--ds-card-border': '#E8DDD0',
  '--ds-secondary-bg': '#FEF9F0',
  '--ds-secondary-bg-hover': '#FCF3E4',

  // Progress
  '--ds-progress-bg': '#E8DDD0',

  // Status colors
  '--ds-success': '#27AE60',
  '--ds-error': '#E74C3C',
  '--ds-warning': '#F5B041',

  // Frame
  '--ds-frame-border': '#2C3E50',
} as React.CSSProperties;

// ============================================================================
// CATEGORY COLORS
// ============================================================================

const categoryColors = {
  CSCI: { bg: 'rgba(93, 173, 226, 0.15)', text: '#5DADE2', border: '#5DADE2' },
  PHYS: { bg: 'rgba(231, 76, 60, 0.15)', text: '#E74C3C', border: '#E74C3C' },
  MATH: { bg: 'rgba(245, 176, 65, 0.15)', text: '#E67E22', border: '#E67E22' },
  CHEM: { bg: 'rgba(155, 89, 182, 0.15)', text: '#9B59B6', border: '#9B59B6' },
  BIO: { bg: 'rgba(39, 174, 96, 0.15)', text: '#27AE60', border: '#27AE60' },
};

// ============================================================================
// CUSTOM COMPONENTS FOR ANKIDROID THEME
// ============================================================================

interface CategoryTagAnkiProps {
  label: string;
  category: keyof typeof categoryColors;
  className?: string;
}

function CategoryTagAnki({ label, category, className }: CategoryTagAnkiProps) {
  const colors = categoryColors[category];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold',
        className,
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {label}
    </span>
  );
}

interface WarmCardProps {
  children: React.ReactNode;
  className?: string;
}

function WarmCard({ children, className }: WarmCardProps) {
  return (
    <div
      className={cn(
        'rounded-[24px] bg-white p-5',
        'shadow-[0_4px_20px_rgba(44,62,80,0.08)]',
        'border border-[#E8DDD0]',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ListItemProps {
  title: string;
  subtitle?: string;
  progress?: number;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onClick?: () => void;
}

function ListItem({ title, subtitle, progress, icon, rightElement, onClick }: ListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl p-4',
        'bg-[#FEF9F0] hover:bg-[#FCF3E4]',
        'transition-colors duration-200',
        'text-left',
      )}
    >
      {icon && (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#5DADE2]/10 text-[#5DADE2]">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-[#2C3E50]">{title}</div>
        {subtitle && <div className="truncate text-sm text-[#7F8C8D]">{subtitle}</div>}
        {progress !== undefined && (
          <div className="mt-2">
            <ProgressBar value={progress} className="h-1.5" />
          </div>
        )}
      </div>
      {rightElement || <ChevronRight size={20} className="flex-shrink-0 text-[#95A5A6]" />}
    </button>
  );
}

// ============================================================================
// CHART COMPONENT
// ============================================================================

function ActivityChart() {
  const data = [30, 45, 35, 60, 80, 65, 75];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxValue = Math.max(...data);

  return (
    <div className="w-full">
      {/* Gradient background chart area */}
      <div
        className="relative mb-3 h-32 rounded-2xl p-4"
        style={{
          background:
            'linear-gradient(135deg, rgba(93, 173, 226, 0.1) 0%, rgba(245, 176, 65, 0.1) 100%)',
        }}
      >
        {/* Chart bars */}
        <div className="flex h-full items-end justify-between gap-2">
          {data.map((value, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${(value / maxValue) * 100}%`,
                  background: `linear-gradient(180deg, #5DADE2 0%, #3498DB 100%)`,
                  minHeight: '8px',
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Day labels */}
      <div className="flex justify-between px-2">
        {days.map((day, index) => (
          <span key={index} className="text-xs font-medium text-[#7F8C8D]">
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatisticsChart() {
  // Curved line chart representation
  return (
    <div
      className="relative h-24 overflow-hidden rounded-2xl"
      style={{
        background:
          'linear-gradient(135deg, rgba(93, 173, 226, 0.08) 0%, rgba(245, 176, 65, 0.08) 100%)',
      }}
    >
      <svg viewBox="0 0 200 80" className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5DADE2" />
            <stop offset="100%" stopColor="#F5B041" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5DADE2" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#5DADE2" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path
          d="M0,60 Q30,50 50,45 T100,35 T150,25 T200,30 L200,80 L0,80 Z"
          fill="url(#areaGradient)"
        />
        {/* Line */}
        <path
          d="M0,60 Q30,50 50,45 T100,35 T150,25 T200,30"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// ============================================================================
// SCREEN 1: DASHBOARD
// ============================================================================

function DashboardScreen() {
  const recentItems = [
    { title: 'Data Structures', subtitle: 'CSCI 2100', progress: 75 },
    { title: 'Calculus III', subtitle: 'MATH 2210', progress: 45 },
    { title: 'Physics Mechanics', subtitle: 'PHYS 1100', progress: 90 },
  ];

  return (
    <div style={ankidroidThemeStyles}>
      <ScreenContainer className="bg-[#FDF6E9] pb-24">
        {/* Greeting Section */}
        <div className="mb-6 pt-4">
          <Caption className="text-[#7F8C8D]">Good morning,</Caption>
          <DisplayHeading className="mt-1 text-3xl text-[#2C3E50]">Welcome back! 📚</DisplayHeading>
          <BodyText className="mt-2 text-[#7F8C8D]">Ready to continue learning?</BodyText>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <WarmCard className="p-4 text-center">
            <div className="text-2xl font-bold text-[#5DADE2]">127</div>
            <div className="mt-1 text-xs text-[#7F8C8D]">Cards Due</div>
          </WarmCard>
          <WarmCard className="p-4 text-center">
            <div className="text-2xl font-bold text-[#27AE60]">85%</div>
            <div className="mt-1 text-xs text-[#7F8C8D]">Accuracy</div>
          </WarmCard>
          <WarmCard className="p-4 text-center">
            <div className="text-2xl font-bold text-[#F5B041]">12</div>
            <div className="mt-1 text-xs text-[#7F8C8D]">Day Streak</div>
          </WarmCard>
        </div>

        {/* Activity Chart */}
        <WarmCard className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading className="text-lg text-[#2C3E50]">Weekly Activity</SectionHeading>
            <Caption className="font-medium text-[#5DADE2]">View All</Caption>
          </div>
          <ActivityChart />
        </WarmCard>

        {/* Recently Reviewed */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading className="text-lg text-[#2C3E50]">Recently Reviewed</SectionHeading>
            <Caption className="font-medium text-[#5DADE2]">See All</Caption>
          </div>
          <div className="space-y-3">
            {recentItems.map((item, index) => (
              <ListItem
                key={index}
                title={item.title}
                subtitle={item.subtitle}
                progress={item.progress}
                icon={<BookOpen size={20} />}
                rightElement={
                  <span className="text-sm font-semibold text-[#5DADE2]">{item.progress}%</span>
                }
              />
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={0}
          items={[
            { icon: <Home size={24} />, label: 'Home' },
            { icon: <BookOpen size={24} />, label: 'Study' },
            { icon: <BarChart3 size={24} />, label: 'Stats' },
            { icon: <Settings size={24} />, label: 'Settings' },
          ]}
          className="border-[#E8DDD0] bg-white shadow-[0_-4px_20px_rgba(44,62,80,0.05)]"
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
    { letter: 'A', label: 'O(n)', state: 'default' as const },
    { letter: 'B', label: 'O(log n)', state: 'selected' as const },
    { letter: 'C', label: 'O(n log n)', state: 'default' as const },
    { letter: 'D', label: 'O(n²)', state: 'default' as const },
  ];

  return (
    <div style={ankidroidThemeStyles}>
      <ScreenContainer className="flex min-h-full flex-col bg-[#FDF6E9]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <CategoryTagAnki label="CSCI" category="CSCI" />
            <Caption className="text-[#7F8C8D]">Question 5 of 20</Caption>
          </div>
          <div className="flex items-center gap-2 text-[#7F8C8D]">
            <Clock size={16} />
            <span className="text-sm font-medium">2:45</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-[#7F8C8D]">Progress</span>
            <span className="font-semibold text-[#5DADE2]">25%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#E8DDD0]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: '25%',
                background: 'linear-gradient(90deg, #5DADE2 0%, #3498DB 100%)',
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <WarmCard className="mb-6 flex-shrink-0">
          <CardTitle className="text-lg leading-relaxed text-[#2C3E50]">
            What is the time complexity of binary search on a sorted array?
          </CardTitle>
        </WarmCard>

        {/* Options */}
        <div className="mb-6 flex-1 space-y-3">
          {options.map((option) => (
            <button
              key={option.letter}
              className={cn(
                'flex w-full items-center gap-4 rounded-[20px] border-2 p-4 transition-all duration-200',
                option.state === 'selected'
                  ? 'border-[#5DADE2] bg-[#5DADE2]/10 shadow-[0_0_0_3px_rgba(93,173,226,0.1)]'
                  : 'border-[#E8DDD0] bg-white hover:border-[#5DADE2]/50',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                  'text-sm font-bold transition-colors',
                  option.state === 'selected'
                    ? 'bg-[#5DADE2] text-white'
                    : 'bg-[#FEF9F0] text-[#2C3E50]',
                )}
              >
                {option.letter}
              </span>
              <span className="font-medium text-[#2C3E50]">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Next Button */}
        <div className="pb-6">
          <button
            className={cn(
              'w-full rounded-2xl py-4 text-lg font-semibold text-white',
              'transition-all duration-200',
              'shadow-[0_4px_15px_rgba(93,173,226,0.3)]',
            )}
            style={{
              background: 'linear-gradient(135deg, #5DADE2 0%, #3498DB 100%)',
            }}
          >
            Next Question
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
  const categories = [
    { name: 'CSCI 2100', category: 'CSCI' as const, cards: 45, due: 12 },
    { name: 'PHYS 1100', category: 'PHYS' as const, cards: 32, due: 8 },
    { name: 'MATH 2210', category: 'MATH' as const, cards: 58, due: 23 },
    { name: 'CHEM 1010', category: 'CHEM' as const, cards: 27, due: 5 },
    { name: 'BIO 1500', category: 'BIO' as const, cards: 41, due: 15 },
  ];

  return (
    <div style={ankidroidThemeStyles}>
      <ScreenContainer className="bg-[#FDF6E9] pb-24">
        {/* Header */}
        <div className="mb-6 pt-4">
          <SectionHeading className="text-2xl text-[#2C3E50]">SRS Review</SectionHeading>
          <BodyText className="mt-1 text-[#7F8C8D]">
            Master your knowledge with spaced repetition
          </BodyText>
        </div>

        {/* Card Count Summary */}
        <WarmCard className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-[#5DADE2]">63</div>
              <div className="mt-1 text-sm text-[#7F8C8D]">Cards due today</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#27AE60]" />
                <span className="text-sm text-[#7F8C8D]">New: 15</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#F5B041]" />
                <span className="text-sm text-[#7F8C8D]">Learning: 23</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#5DADE2]" />
                <span className="text-sm text-[#7F8C8D]">Review: 25</span>
              </div>
            </div>
          </div>
          <button
            className={cn(
              'mt-5 w-full rounded-2xl py-4 text-lg font-semibold text-white',
              'transition-all duration-200',
              'shadow-[0_4px_15px_rgba(245,176,65,0.3)]',
            )}
            style={{
              background: 'linear-gradient(135deg, #F5B041 0%, #E67E22 100%)',
            }}
          >
            Start Review Session
          </button>
        </WarmCard>

        {/* Category Tags Grid */}
        <div className="mb-6">
          <SectionHeading className="mb-4 text-lg text-[#2C3E50]">Categories</SectionHeading>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, index) => (
              <WarmCard key={index} className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <CategoryTagAnki label={cat.category} category={cat.category} />
                  <span className="text-xs text-[#7F8C8D]">{cat.cards} cards</span>
                </div>
                <div className="mb-2 text-sm font-medium text-[#2C3E50]">{cat.name}</div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#F5B041]" />
                  <span className="text-sm font-semibold text-[#F5B041]">{cat.due} due</span>
                </div>
              </WarmCard>
            ))}
          </div>
        </div>

        {/* Statistics Chart */}
        <WarmCard>
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading className="text-lg text-[#2C3E50]">Progress Over Time</SectionHeading>
            <div className="flex items-center gap-1 text-[#27AE60]">
              <TrendingUp size={16} />
              <span className="text-sm font-semibold">+12%</span>
            </div>
          </div>
          <StatisticsChart />
          <div className="mt-4 flex justify-between text-sm">
            <div className="text-center">
              <div className="font-bold text-[#2C3E50]">1,234</div>
              <div className="text-xs text-[#7F8C8D]">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-[#2C3E50]">89%</div>
              <div className="text-xs text-[#7F8C8D]">Retention</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-[#2C3E50]">4.2</div>
              <div className="text-xs text-[#7F8C8D]">Avg Ease</div>
            </div>
          </div>
        </WarmCard>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={1}
          items={[
            { icon: <Home size={24} />, label: 'Home' },
            { icon: <BookOpen size={24} />, label: 'Study' },
            { icon: <BarChart3 size={24} />, label: 'Stats' },
            { icon: <Settings size={24} />, label: 'Settings' },
          ]}
          className="border-[#E8DDD0] bg-white shadow-[0_-4px_20px_rgba(44,62,80,0.05)]"
        />
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 4: IMPORT
// ============================================================================

function ImportScreen() {
  const decks = [
    { name: 'Computer Science Fundamentals', category: 'CSCI', cards: 156, size: '2.4 MB' },
    { name: 'Physics: Mechanics & Waves', category: 'PHYS', cards: 89, size: '1.8 MB' },
    { name: 'Calculus III Complete', category: 'MATH', cards: 234, size: '3.1 MB' },
  ];

  const groups = [
    { name: 'Science & Engineering', count: 5 },
    { name: 'Languages', count: 3 },
    { name: 'Medical', count: 2 },
    { name: 'Arts & Music', count: 1 },
  ];

  return (
    <div style={ankidroidThemeStyles}>
      <ScreenContainer className="bg-[#FDF6E9] pb-6">
        {/* Header */}
        <div className="mb-6 pt-4">
          <SectionHeading className="text-2xl text-[#2C3E50]">Import Decks</SectionHeading>
          <BodyText className="mt-1 text-[#7F8C8D]">
            Add new study materials to your library
          </BodyText>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95A5A6]" />
            <input
              type="text"
              placeholder="Search decks..."
              className={cn(
                'h-14 w-full rounded-2xl pl-12 pr-4',
                'border border-[#E8DDD0] bg-white',
                'text-[#2C3E50] placeholder:text-[#95A5A6]',
                'focus:border-[#5DADE2] focus:outline-none focus:ring-2 focus:ring-[#5DADE2]/20',
                'shadow-[0_2px_10px_rgba(44,62,80,0.05)]',
              )}
            />
          </div>
        </div>

        {/* Group Categories */}
        <div className="mb-6">
          <SectionHeading className="mb-4 text-lg text-[#2C3E50]">Categories</SectionHeading>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
            {groups.map((group, index) => (
              <button
                key={index}
                className={cn(
                  'flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2.5',
                  'border transition-colors',
                  index === 0
                    ? 'border-[#5DADE2] bg-[#5DADE2] text-white'
                    : 'border-[#E8DDD0] bg-white text-[#2C3E50] hover:border-[#5DADE2]',
                )}
              >
                <Folder size={16} />
                <span className="whitespace-nowrap text-sm font-medium">{group.name}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    index === 0 ? 'bg-white/20 text-white' : 'bg-[#FEF9F0] text-[#7F8C8D]',
                  )}
                >
                  {group.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Deck List with Swipe Actions */}
        <div className="mb-6">
          <SectionHeading className="mb-4 text-lg text-[#2C3E50]">Available Decks</SectionHeading>
          <div className="space-y-3">
            {decks.map((deck, index) => (
              <WarmCard key={index} className="overflow-hidden p-0">
                <div className="relative">
                  {/* Swipe action hints */}
                  <div className="absolute inset-y-0 right-0 flex">
                    <div className="flex w-16 items-center justify-center bg-[#E74C3C] opacity-0">
                      <Trash2 size={20} className="text-white" />
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="relative flex items-center gap-4 bg-white p-4">
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor:
                          categoryColors[deck.category as keyof typeof categoryColors].bg,
                      }}
                    >
                      <FileText
                        size={24}
                        style={{
                          color: categoryColors[deck.category as keyof typeof categoryColors].text,
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-[#2C3E50]">{deck.name}</div>
                      <div className="mt-1 flex items-center gap-3">
                        <CategoryTagAnki
                          label={deck.category}
                          category={deck.category as keyof typeof categoryColors}
                        />
                        <span className="text-xs text-[#7F8C8D]">{deck.cards} cards</span>
                        <span className="text-xs text-[#95A5A6]">{deck.size}</span>
                      </div>
                    </div>
                    <button
                      className={cn(
                        'h-10 w-10 flex-shrink-0 rounded-xl',
                        'bg-[#5DADE2] text-white',
                        'flex items-center justify-center',
                        'shadow-[0_2px_8px_rgba(93,173,226,0.3)]',
                        'transition-colors hover:bg-[#3498DB]',
                      )}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </WarmCard>
            ))}
          </div>
        </div>

        {/* Import from File */}
        <WarmCard>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5B041]/10">
              <Plus size={24} className="text-[#F5B041]" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-[#2C3E50]">Import from File</CardTitle>
              <Caption className="text-[#7F8C8D]">APKG, JSON, CSV formats</Caption>
            </div>
            <ChevronRight size={20} className="text-[#95A5A6]" />
          </div>
        </WarmCard>
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AnkiDroidThemePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FDF6E9] to-[#F5E6D3]">
      {/* Header */}
      <div className="px-6 py-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-[#2C3E50]">AnkiDroid Theme</h1>
        <p className="mx-auto max-w-2xl text-lg text-[#7F8C8D]">
          A warm, cozy design inspired by AnkiDroid. Soft cream backgrounds, gentle shadows, and
          inviting colors create a personal study companion feel.
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
        <h2 className="mb-6 text-center text-2xl font-bold text-[#2C3E50]">Color Palette</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl border border-[#E8DDD0] bg-[#FDF6E9]" />
            <div className="text-sm font-medium text-[#2C3E50]">Primary BG</div>
            <div className="text-xs text-[#7F8C8D]">#FDF6E9</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl border border-[#E8DDD0] bg-white" />
            <div className="text-sm font-medium text-[#2C3E50]">Card BG</div>
            <div className="text-xs text-[#7F8C8D]">#FFFFFF</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#5DADE2]" />
            <div className="text-sm font-medium text-[#2C3E50]">Accent</div>
            <div className="text-xs text-[#7F8C8D]">#5DADE2</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#F5B041]" />
            <div className="text-sm font-medium text-[#2C3E50]">Secondary</div>
            <div className="text-xs text-[#7F8C8D]">#F5B041</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#2C3E50]" />
            <div className="text-sm font-medium text-[#2C3E50]">Text Primary</div>
            <div className="text-xs text-[#7F8C8D]">#2C3E50</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#7F8C8D]" />
            <div className="text-sm font-medium text-[#2C3E50]">Text Secondary</div>
            <div className="text-xs text-[#7F8C8D]">#7F8C8D</div>
          </div>
        </div>
      </div>
    </main>
  );
}
