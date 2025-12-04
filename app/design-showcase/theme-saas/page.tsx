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
  Search,
  Grid3X3,
  List,
  Plus,
  Filter,
  Users,
  TrendingUp,
  Calendar,
  FolderOpen,
  MoreHorizontal,
  Play,
  CheckCircle2,
  Target,
  Award,
  Layers,
  Zap,
  FileUp,
  Link2,
  HardDrive,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DesignFrame,
  ScreenContainer,
  SectionHeading,
  CardTitle,
  Caption,
  BottomNav,
  CircularProgress,
} from '../shared';

// ============================================================================
// SAAS LMS THEME CSS VARIABLES
// ============================================================================

const saasThemeStyles: Record<string, string> = {
  // Primary backgrounds
  '--ds-bg-primary': '#FAFAFA',
  '--ds-card-bg': '#FFFFFF',
  '--ds-nav-bg': '#FFFFFF',
  '--ds-input-bg': '#F3F4F6',

  // Accents
  '--ds-accent': '#8B5CF6',
  '--ds-accent-hover': '#7C3AED',
  '--ds-secondary-accent': '#F59E0B',

  // Text colors
  '--ds-text-primary': '#111827',
  '--ds-text-secondary': '#4B5563',
  '--ds-text-muted': '#6B7280',

  // Card styling
  '--ds-card-border': '#E5E7EB',
  '--ds-secondary-bg': '#F3F4F6',
  '--ds-secondary-bg-hover': '#E5E7EB',

  // Progress
  '--ds-progress-bg': '#E5E7EB',

  // Status colors
  '--ds-success': '#22C55E',
  '--ds-error': '#EF4444',
  '--ds-warning': '#F59E0B',

  // Frame
  '--ds-frame-border': '#1F2937',
};

// ============================================================================
// CUSTOM COMPONENTS FOR SAAS THEME
// ============================================================================

interface SaaSCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

function SaaSCard({ children, className, hover = true }: SaaSCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#E5E7EB] bg-white shadow-sm',
        hover && 'cursor-pointer transition-shadow hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TabNavProps {
  tabs: string[];
  activeTab: number;
}

function TabNav({ tabs, activeTab }: TabNavProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-[#F3F4F6] p-1">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-all',
            index === activeTab
              ? 'bg-white text-[#111827] shadow-sm'
              : 'text-[#6B7280] hover:text-[#111827]',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  active?: boolean;
  count?: number;
}

function FilterChip({ label, active, count }: FilterChipProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
        active
          ? 'bg-[#8B5CF6] text-white'
          : 'border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#8B5CF6] hover:text-[#8B5CF6]',
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-xs',
            active ? 'bg-white/20' : 'bg-[#F3F4F6]',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

interface TagBadgeProps {
  label: string;
  variant?: 'purple' | 'orange' | 'green' | 'gray';
}

function TagBadge({ label, variant = 'purple' }: TagBadgeProps) {
  const variants = {
    purple: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    orange: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    green: 'bg-[#22C55E]/10 text-[#22C55E]',
    gray: 'bg-[#6B7280]/10 text-[#6B7280]',
  };

  return (
    <span className={cn('rounded px-2 py-0.5 text-xs font-medium', variants[variant])}>
      {label}
    </span>
  );
}

interface EnrolledBadgeProps {
  count: number;
}

function EnrolledBadge({ count }: EnrolledBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <div className="flex -space-x-2">
        {[...Array(Math.min(3, count))].map((_, i) => (
          <div
            key={i}
            className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]"
          />
        ))}
      </div>
      <span className="font-medium text-[#6B7280]">{count} Enrolled</span>
    </div>
  );
}

interface AccuracyRingProps {
  value: number;
  size?: number;
  label?: string;
  color?: string;
}

function AccuracyRing({ value, size = 48, label, color = '#8B5CF6' }: AccuracyRingProps) {
  const radius = (size - 6) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="4"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-[#111827]">{value}%</span>
        </div>
      </div>
      {label && <span className="mt-1 text-[10px] text-[#6B7280]">{label}</span>}
    </div>
  );
}

interface QuizCardProps {
  title: string;
  thumbnail: string;
  category: string;
  questionCount: number;
  accuracy: number;
  completion: number;
  enrolled: number;
  tags: Array<{ label: string; variant: 'purple' | 'orange' | 'green' | 'gray' }>;
}

function QuizCard({
  title,
  thumbnail,
  category,
  questionCount,
  accuracy,
  completion,
  enrolled,
  tags,
}: QuizCardProps) {
  return (
    <SaaSCard className="overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-24" style={{ background: thumbnail }}>
        <div className="absolute left-2 top-2">
          <span className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-[#111827] backdrop-blur-sm">
            {category}
          </span>
        </div>
        <button className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm">
          <MoreHorizontal size={14} className="text-[#6B7280]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <CardTitle className="mb-2 line-clamp-1 text-sm text-[#111827]">{title}</CardTitle>

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <TagBadge key={i} label={tag.label} variant={tag.variant} />
          ))}
        </div>

        {/* Stats Row */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-[#6B7280]">
            <FileText size={12} />
            <span>{questionCount} Questions</span>
          </div>
          <EnrolledBadge count={enrolled} />
        </div>

        {/* Progress Rings */}
        <div className="flex items-center justify-around border-t border-[#E5E7EB] pt-3">
          <AccuracyRing value={accuracy} label="Accuracy" color="#22C55E" />
          <AccuracyRing value={completion} label="Complete" color="#8B5CF6" />
        </div>
      </div>
    </SaaSCard>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}

function SidebarItem({ icon, label, active, badge }: SidebarItemProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]'
          : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]',
      )}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-xs font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// SCREEN 1: DASHBOARD
// ============================================================================

function DashboardScreen() {
  const quizzes: QuizCardProps[] = [
    {
      title: 'UI/UX Design Principles',
      thumbnail: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      category: 'Design',
      questionCount: 45,
      accuracy: 87,
      completion: 65,
      enrolled: 234,
      tags: [
        { label: 'UI/UX', variant: 'purple' },
        { label: 'Urgent', variant: 'orange' },
      ],
    },
    {
      title: 'React Advanced Patterns',
      thumbnail: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
      category: 'Development',
      questionCount: 32,
      accuracy: 92,
      completion: 100,
      enrolled: 156,
      tags: [
        { label: 'React', variant: 'purple' },
        { label: 'Not Urgent', variant: 'gray' },
      ],
    },
    {
      title: 'Data Structures & Algorithms',
      thumbnail: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
      category: 'Computer Science',
      questionCount: 60,
      accuracy: 78,
      completion: 45,
      enrolled: 412,
      tags: [
        { label: 'DSA', variant: 'green' },
        { label: 'Urgent', variant: 'orange' },
      ],
    },
    {
      title: 'System Design Interview',
      thumbnail: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
      category: 'Interview',
      questionCount: 28,
      accuracy: 95,
      completion: 80,
      enrolled: 89,
      tags: [{ label: 'System Design', variant: 'purple' }],
    },
  ];

  return (
    <div style={saasThemeStyles}>
      <ScreenContainer className="bg-[#FAFAFA] px-0 pb-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]">
              <Layers size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#111827]">QuizMaster</div>
              <div className="text-xs text-[#6B7280]">Workspace</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]">
              <Bell size={16} className="text-[#6B7280]" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#E5E7EB] bg-white px-4 py-3">
          <TabNav tabs={['Quiz', 'Course', 'Path', 'Analytics']} activeTab={0} />
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
              />
              <input
                type="text"
                placeholder="Search quizzes..."
                className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
              />
            </div>
            <button className="flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#6B7280] transition-colors hover:border-[#8B5CF6]">
              <Filter size={16} />
              Filter
            </button>
            <div className="flex items-center overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
              <button className="bg-[#8B5CF6] p-2.5 text-white">
                <Grid3X3 size={16} />
              </button>
              <button className="p-2.5 text-[#6B7280] hover:bg-[#F3F4F6]">
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <FilterChip label="All" active count={156} />
            <FilterChip label="In Progress" count={12} />
            <FilterChip label="Completed" count={89} />
            <FilterChip label="Not Started" count={55} />
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="px-4">
          <div className="grid grid-cols-2 gap-3">
            {quizzes.map((quiz, index) => (
              <QuizCard key={index} {...quiz} />
            ))}
          </div>
        </div>

        {/* FAB */}
        <button className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/30 transition-colors hover:bg-[#7C3AED]">
          <Plus size={24} />
        </button>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={0}
          items={[
            { icon: <Home size={24} />, label: 'Home' },
            { icon: <BookOpen size={24} />, label: 'Library' },
            { icon: <BarChart3 size={24} />, label: 'Stats' },
            { icon: <Settings size={24} />, label: 'Settings' },
          ]}
          className="border-[#E5E7EB] bg-white"
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
    { letter: 'A', label: 'Consistency and standards', selected: false },
    { letter: 'B', label: 'User control and freedom', selected: true },
    { letter: 'C', label: 'Aesthetic and minimalist design', selected: false },
    { letter: 'D', label: 'Recognition over recall', selected: false },
  ];

  return (
    <div style={saasThemeStyles}>
      <ScreenContainer className="flex min-h-full flex-col bg-[#FAFAFA] px-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6]">
            <ChevronRight size={18} className="rotate-180 text-[#6B7280]" />
          </button>
          <div className="text-center">
            <div className="text-sm font-semibold text-[#111827]">UI/UX Design Principles</div>
            <div className="text-xs text-[#6B7280]">Quiz Session</div>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6]">
            <MoreHorizontal size={18} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="border-b border-[#E5E7EB] bg-white px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-[#111827]">Question 12 of 45</span>
            <span className="text-sm text-[#6B7280]">27% Complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div className="h-full w-[27%] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]" />
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1 px-4 py-6">
          <SaaSCard hover={false} className="mb-6 p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-sm font-bold text-[#8B5CF6]">
                12
              </span>
              <div className="flex-1">
                <TagBadge label="Heuristics" variant="purple" />
              </div>
              <button className="text-[#6B7280] hover:text-[#8B5CF6]">
                <BookOpen size={18} />
              </button>
            </div>
            <CardTitle className="text-base leading-relaxed text-[#111827]">
              According to Nielsen&apos;s heuristics, which principle emphasizes that the system
              should always keep users informed about what is going on?
            </CardTitle>
          </SaaSCard>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.letter}
                className={cn(
                  'flex w-full items-center gap-4 rounded-xl border-2 p-4 transition-all',
                  option.selected
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 shadow-sm'
                    : 'border-[#E5E7EB] bg-white hover:border-[#8B5CF6]/50',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors',
                    option.selected ? 'bg-[#8B5CF6] text-white' : 'bg-[#F3F4F6] text-[#6B7280]',
                  )}
                >
                  {option.letter}
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    option.selected ? 'text-[#111827]' : 'text-[#4B5563]',
                  )}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Action */}
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <button className="flex-1 rounded-xl bg-[#F3F4F6] py-3 text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E5E7EB]">
              Skip Question
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#7C3AED]">
              Submit Answer
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 3: SRS REVIEW
// ============================================================================

function SRSReviewScreen() {
  const learningPaths = [
    { title: 'UI/UX Fundamentals', progress: 75, total: 120, completed: 90 },
    { title: 'React Mastery', progress: 45, total: 80, completed: 36 },
    { title: 'System Design', progress: 20, total: 50, completed: 10 },
  ];

  const upcomingCards = [
    { title: "Nielsen's Heuristics", category: 'UI/UX', due: 'Due now', urgent: true },
    { title: 'React Hooks', category: 'React', due: 'In 2 hours', urgent: false },
    { title: 'CAP Theorem', category: 'System Design', due: 'Tomorrow', urgent: false },
  ];

  return (
    <div style={saasThemeStyles}>
      <ScreenContainer className="bg-[#FAFAFA] px-0 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
          <div>
            <div className="text-lg font-bold text-[#111827]">SRS Review</div>
            <div className="text-sm text-[#6B7280]">Spaced Repetition Dashboard</div>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <Play size={16} className="fill-white" />
            Start Review
          </button>
        </div>

        {/* Stats Overview */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-4 gap-3">
            <SaaSCard className="p-3 text-center" hover={false}>
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#EF4444]/10">
                <Zap size={20} className="text-[#EF4444]" />
              </div>
              <div className="text-xl font-bold text-[#111827]">24</div>
              <div className="text-[10px] text-[#6B7280]">Due Now</div>
            </SaaSCard>
            <SaaSCard className="p-3 text-center" hover={false}>
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#F59E0B]/10">
                <Clock size={20} className="text-[#F59E0B]" />
              </div>
              <div className="text-xl font-bold text-[#111827]">12</div>
              <div className="text-[10px] text-[#6B7280]">Today</div>
            </SaaSCard>
            <SaaSCard className="p-3 text-center" hover={false}>
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E]/10">
                <CheckCircle2 size={20} className="text-[#22C55E]" />
              </div>
              <div className="text-xl font-bold text-[#111827]">156</div>
              <div className="text-[10px] text-[#6B7280]">Mastered</div>
            </SaaSCard>
            <SaaSCard className="p-3 text-center" hover={false}>
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#8B5CF6]/10">
                <Target size={20} className="text-[#8B5CF6]" />
              </div>
              <div className="text-xl font-bold text-[#111827]">89%</div>
              <div className="text-[10px] text-[#6B7280]">Retention</div>
            </SaaSCard>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="mb-4 px-4">
          <SaaSCard className="p-4" hover={false}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#111827]">Weekly Progress</div>
                <div className="text-xs text-[#6B7280]">You&apos;re on track!</div>
              </div>
              <div className="flex items-center gap-1 text-[#22C55E]">
                <TrendingUp size={16} />
                <span className="text-sm font-semibold">+12%</span>
              </div>
            </div>
            <div className="flex h-16 items-end justify-between gap-1">
              {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={cn('w-full rounded-t', i === 5 ? 'bg-[#8B5CF6]' : 'bg-[#E5E7EB]')}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-[#6B7280]">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </SaaSCard>
        </div>

        {/* Learning Paths */}
        <div className="mb-4 px-4">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeading className="text-sm text-[#111827]">Learning Paths</SectionHeading>
            <Caption className="cursor-pointer text-xs font-semibold text-[#8B5CF6]">
              View All
            </Caption>
          </div>
          <div className="space-y-3">
            {learningPaths.map((path, index) => (
              <SaaSCard key={index} className="p-4" hover={false}>
                <div className="flex items-center gap-4">
                  <CircularProgress value={path.progress} size={48} strokeWidth={4} showLabel />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#111827]">{path.title}</div>
                    <div className="text-xs text-[#6B7280]">
                      {path.completed} of {path.total} cards mastered
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#6B7280]" />
                </div>
              </SaaSCard>
            ))}
          </div>
        </div>

        {/* Upcoming Cards */}
        <div className="px-4">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeading className="text-sm text-[#111827]">Upcoming Cards</SectionHeading>
            <Caption className="cursor-pointer text-xs font-semibold text-[#8B5CF6]">
              See All
            </Caption>
          </div>
          <div className="space-y-2">
            {upcomingCards.map((card, index) => (
              <SaaSCard key={index} className="flex items-center gap-3 p-3">
                <div
                  className={cn(
                    'h-10 w-2 rounded-full',
                    card.urgent ? 'bg-[#EF4444]' : 'bg-[#E5E7EB]',
                  )}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#111827]">{card.title}</div>
                  <div className="flex items-center gap-2">
                    <TagBadge label={card.category} variant="purple" />
                    <span
                      className={cn(
                        'text-xs',
                        card.urgent ? 'font-medium text-[#EF4444]' : 'text-[#6B7280]',
                      )}
                    >
                      {card.due}
                    </span>
                  </div>
                </div>
                <Play size={18} className="text-[#8B5CF6]" />
              </SaaSCard>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={1}
          items={[
            { icon: <Home size={24} />, label: 'Home' },
            { icon: <BookOpen size={24} />, label: 'SRS' },
            { icon: <BarChart3 size={24} />, label: 'Stats' },
            { icon: <Settings size={24} />, label: 'Settings' },
          ]}
          className="border-[#E5E7EB] bg-white"
        />
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 4: IMPORT
// ============================================================================

function ImportScreen() {
  const recentFiles = [
    { name: 'UI Principles Quiz', type: 'MD', size: '24 KB', date: 'Today' },
    { name: 'React Patterns', type: 'JSON', size: '156 KB', date: 'Yesterday' },
    { name: 'DSA Flashcards', type: 'CSV', size: '89 KB', date: 'Dec 2' },
  ];

  return (
    <div style={saasThemeStyles}>
      <ScreenContainer className="bg-[#FAFAFA] px-0 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6]">
            <ChevronRight size={18} className="rotate-180 text-[#6B7280]" />
          </button>
          <div className="text-sm font-semibold text-[#111827]">Import Content</div>
          <div className="w-8" />
        </div>

        {/* Import Methods */}
        <div className="px-4 py-4">
          <SaaSCard
            className="border-2 border-dashed border-[#8B5CF6]/30 bg-[#8B5CF6]/5 p-6"
            hover={false}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B5CF6]/10">
                <Upload size={32} className="text-[#8B5CF6]" />
              </div>
              <div className="mb-1 text-base font-semibold text-[#111827]">
                Drag & drop files here
              </div>
              <div className="mb-4 text-sm text-[#6B7280]">or click to browse</div>
              <div className="flex items-center gap-2">
                <TagBadge label="MD" variant="purple" />
                <TagBadge label="JSON" variant="orange" />
                <TagBadge label="CSV" variant="green" />
                <TagBadge label="APKG" variant="gray" />
              </div>
            </div>
          </SaaSCard>
        </div>

        {/* Quick Actions */}
        <div className="mb-4 px-4">
          <SectionHeading className="mb-3 text-sm text-[#111827]">Quick Actions</SectionHeading>
          <div className="grid grid-cols-2 gap-3">
            <SaaSCard className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
                <FileUp size={24} className="text-[#8B5CF6]" />
              </div>
              <div className="text-sm font-semibold text-[#111827]">Upload File</div>
              <div className="text-xs text-[#6B7280]">From your device</div>
            </SaaSCard>
            <SaaSCard className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#22C55E]/10">
                <Plus size={24} className="text-[#22C55E]" />
              </div>
              <div className="text-sm font-semibold text-[#111827]">New Content</div>
              <div className="text-xs text-[#6B7280]">Create from scratch</div>
            </SaaSCard>
            <SaaSCard className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F59E0B]/10">
                <Link2 size={24} className="text-[#F59E0B]" />
              </div>
              <div className="text-sm font-semibold text-[#111827]">From URL</div>
              <div className="text-xs text-[#6B7280]">Import from link</div>
            </SaaSCard>
            <SaaSCard className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6]/10">
                <HardDrive size={24} className="text-[#3B82F6]" />
              </div>
              <div className="text-sm font-semibold text-[#111827]">Cloud Storage</div>
              <div className="text-xs text-[#6B7280]">Google Drive, etc.</div>
            </SaaSCard>
          </div>
        </div>

        {/* Recent Files */}
        <div className="px-4">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeading className="text-sm text-[#111827]">Recent Files</SectionHeading>
            <button className="flex items-center gap-1 text-xs text-[#6B7280]">
              <span>All Types</span>
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recentFiles.map((file, index) => (
              <SaaSCard key={index} className="flex items-center gap-3 p-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    file.type === 'MD' && 'bg-[#8B5CF6]/10',
                    file.type === 'JSON' && 'bg-[#F59E0B]/10',
                    file.type === 'CSV' && 'bg-[#22C55E]/10',
                  )}
                >
                  <FileText
                    size={20}
                    className={cn(
                      file.type === 'MD' && 'text-[#8B5CF6]',
                      file.type === 'JSON' && 'text-[#F59E0B]',
                      file.type === 'CSV' && 'text-[#22C55E]',
                    )}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#111827]">{file.name}</div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <TagBadge
                      label={file.type}
                      variant={
                        file.type === 'MD' ? 'purple' : file.type === 'JSON' ? 'orange' : 'green'
                      }
                    />
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>{file.date}</span>
                  </div>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6]">
                  <MoreHorizontal size={16} className="text-[#6B7280]" />
                </button>
              </SaaSCard>
            ))}
          </div>
        </div>

        {/* File Browser */}
        <div className="mt-4 px-4">
          <SaaSCard className="p-4" hover={false}>
            <div className="mb-3 flex items-center gap-3">
              <FolderOpen size={20} className="text-[#F59E0B]" />
              <span className="text-sm font-semibold text-[#111827]">Browse Files</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <span className="rounded bg-[#F3F4F6] px-2 py-1">My Quizzes</span>
              <ChevronRight size={12} />
              <span className="rounded bg-[#F3F4F6] px-2 py-1">UI/UX</span>
              <ChevronRight size={12} />
              <span className="text-[#8B5CF6]">Select folder...</span>
            </div>
          </SaaSCard>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={1}
          items={[
            { icon: <Home size={24} />, label: 'Home' },
            { icon: <BookOpen size={24} />, label: 'Library' },
            { icon: <BarChart3 size={24} />, label: 'Stats' },
            { icon: <Settings size={24} />, label: 'Settings' },
          ]}
          className="border-[#E5E7EB] bg-white"
        />
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function SaaSThemePage() {
  return (
    <main className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-white px-6 py-12 text-center">
        <div className="mb-3 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]">
            <Layers size={24} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#111827]">SaaS LMS Theme</h1>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-[#4B5563]">
          A professional learning management system design inspired by modern SaaS platforms.
          Features content cards, progress indicators, and a clean dashboard layout.
        </p>
      </div>

      {/* Horizontal scroll container for all screens */}
      <div className="overflow-x-auto pb-12">
        <div className="flex min-w-max gap-8 px-8 pt-8">
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
        <h2 className="mb-6 text-center text-2xl font-bold text-[#111827]">Color Palette</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]" />
            <div className="text-sm font-medium text-[#111827]">Background</div>
            <div className="text-xs text-[#6B7280]">#FAFAFA</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl border border-[#E5E7EB] bg-white" />
            <div className="text-sm font-medium text-[#111827]">Card/Sidebar</div>
            <div className="text-xs text-[#6B7280]">#FFFFFF</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#8B5CF6]" />
            <div className="text-sm font-medium text-[#111827]">Accent</div>
            <div className="text-xs text-[#6B7280]">#8B5CF6</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#F59E0B]" />
            <div className="text-sm font-medium text-[#111827]">Secondary</div>
            <div className="text-xs text-[#6B7280]">#F59E0B</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#22C55E]" />
            <div className="text-sm font-medium text-[#111827]">Success</div>
            <div className="text-xs text-[#6B7280]">#22C55E</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#111827]" />
            <div className="text-sm font-medium text-[#111827]">Text Primary</div>
            <div className="text-xs text-[#6B7280]">#111827</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#6B7280]" />
            <div className="text-sm font-medium text-[#111827]">Text Muted</div>
            <div className="text-xs text-[#6B7280]">#6B7280</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#E5E7EB]" />
            <div className="text-sm font-medium text-[#111827]">Border</div>
            <div className="text-xs text-[#6B7280]">#E5E7EB</div>
          </div>
        </div>
      </div>

      {/* Design Features */}
      <div className="mx-auto max-w-4xl px-8 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-[#111827]">Design Features</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#8B5CF6]/10">
              <Grid3X3 size={20} className="text-[#8B5CF6]" />
            </div>
            <div className="mb-1 font-semibold text-[#111827]">Grid View Toggle</div>
            <div className="text-sm text-[#6B7280]">Switch between grid and list layouts</div>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E]/10">
              <Target size={20} className="text-[#22C55E]" />
            </div>
            <div className="mb-1 font-semibold text-[#111827]">Circular Progress</div>
            <div className="text-sm text-[#6B7280]">Accuracy and completion indicators</div>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#F59E0B]/10">
              <Users size={20} className="text-[#F59E0B]" />
            </div>
            <div className="mb-1 font-semibold text-[#111827]">Enrolled Badges</div>
            <div className="text-sm text-[#6B7280]">Show participant count with avatars</div>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#8B5CF6]/10">
              <Filter size={20} className="text-[#8B5CF6]" />
            </div>
            <div className="mb-1 font-semibold text-[#111827]">Filter Chips</div>
            <div className="text-sm text-[#6B7280]">Quick filtering with toggle chips</div>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#EC4899]/10">
              <Award size={20} className="text-[#EC4899]" />
            </div>
            <div className="mb-1 font-semibold text-[#111827]">Tag System</div>
            <div className="text-sm text-[#6B7280]">Categorize with colored tags</div>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#3B82F6]/10">
              <Plus size={20} className="text-[#3B82F6]" />
            </div>
            <div className="mb-1 font-semibold text-[#111827]">FAB Actions</div>
            <div className="text-sm text-[#6B7280]">Floating action buttons for quick access</div>
          </div>
        </div>
      </div>
    </main>
  );
}
