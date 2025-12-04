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
  Plus,
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
  Star,
  Image,
  Palette,
  Box,
  User,
  MoreHorizontal,
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
// DARK PREMIUM THEME CSS VARIABLES
// ============================================================================

const darkThemeStyles: Record<string, string> = {
  // Primary backgrounds
  '--ds-bg-primary': '#0A0A0A',
  '--ds-card-bg': '#1A1A1A',
  '--ds-nav-bg': '#0A0A0A',
  '--ds-input-bg': '#2A2A2A',

  // Accents
  '--ds-accent': '#FACC15',
  '--ds-accent-hover': '#EAB308',
  '--ds-secondary-accent': '#FACC15',

  // Text colors
  '--ds-text-primary': '#FFFFFF',
  '--ds-text-secondary': '#9CA3AF',
  '--ds-text-muted': '#9CA3AF',

  // Card styling
  '--ds-card-border': '#333333',
  '--ds-secondary-bg': '#2A2A2A',
  '--ds-secondary-bg-hover': '#333333',

  // Progress
  '--ds-progress-bg': '#333333',

  // Status colors
  '--ds-success': '#22C55E',
  '--ds-error': '#EF4444',
  '--ds-warning': '#FACC15',

  // Frame
  '--ds-frame-border': '#1F1F1F',
};

// ============================================================================
// CUSTOM COMPONENTS FOR DARK THEME
// ============================================================================

interface DarkCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  featured?: boolean;
}

function DarkCard({ children, className, hover = true, featured = false }: DarkCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl',
        featured ? 'bg-[#FACC15]' : 'border border-[#333333] bg-[#1A1A1A]',
        hover && 'cursor-pointer transition-all hover:border-[#FACC15]/50',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CategoryTabProps {
  label: string;
  active?: boolean;
  icon?: React.ReactNode;
}

function CategoryTab({ label, active, icon }: CategoryTabProps) {
  return (
    <button
      className={cn(
        'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all',
        active ? 'bg-[#FACC15] text-[#0A0A0A]' : 'bg-[#2A2A2A] text-[#9CA3AF] hover:text-white',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

interface CourseCardProps {
  title: string;
  thumbnail: string;
  instructor: string;
  progress: number;
  lessons: number;
}

function CourseCard({ title, thumbnail, instructor, progress, lessons }: CourseCardProps) {
  return (
    <DarkCard className="overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-28" style={{ background: thumbnail }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FACC15]">
            <User size={12} className="text-[#0A0A0A]" />
          </div>
          <span className="text-xs text-white/80">{instructor}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <CardTitle className="mb-2 line-clamp-1 text-sm text-white">{title}</CardTitle>

        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-[#9CA3AF]">{lessons} Lessons</span>
          <span className="text-xs font-bold text-[#FACC15]">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 overflow-hidden rounded-full bg-[#333333]">
          <div
            className="h-full rounded-full bg-[#FACC15] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </DarkCard>
  );
}

interface DecorativeDotsProps {
  className?: string;
}

function DecorativeDots({ className }: DecorativeDotsProps) {
  return (
    <div className={cn('grid grid-cols-5 gap-1.5', className)}>
      {[...Array(15)].map((_, i) => (
        <div key={i} className="h-2 w-2 rounded-full bg-[#0A0A0A]/20" />
      ))}
    </div>
  );
}

interface LessonItemProps {
  number: string;
  title: string;
  duration: string;
  completed?: boolean;
  locked?: boolean;
}

function LessonItem({ number, title, duration, completed, locked }: LessonItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl p-3 transition-all',
        locked ? 'opacity-50' : 'hover:bg-[#2A2A2A]',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold',
          completed
            ? 'bg-[#22C55E] text-white'
            : locked
              ? 'bg-[#333333] text-[#9CA3AF]'
              : 'bg-[#FACC15] text-[#0A0A0A]',
        )}
      >
        {completed ? <CheckCircle2 size={18} /> : number}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="text-xs text-[#9CA3AF]">{duration}</div>
      </div>
      {!locked && <Play size={16} className="text-[#FACC15]" />}
    </div>
  );
}

// ============================================================================
// SCREEN 1: DASHBOARD
// ============================================================================

function DashboardScreen() {
  const courses: CourseCardProps[] = [
    {
      title: 'UI/UX Design Mastery',
      thumbnail: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      instructor: 'Sarah Chen',
      progress: 75,
      lessons: 24,
    },
    {
      title: 'Advanced Illustration',
      thumbnail: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
      instructor: 'Alex Rivera',
      progress: 45,
      lessons: 18,
    },
    {
      title: '3D Modeling Basics',
      thumbnail: 'linear-gradient(135deg, #14B8A6 0%, #22C55E 100%)',
      instructor: 'Mike Park',
      progress: 20,
      lessons: 32,
    },
  ];

  return (
    <div style={darkThemeStyles}>
      <ScreenContainer className="bg-[#0A0A0A] px-0 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="text-sm text-[#9CA3AF]">Welcome back</div>
            <div className="text-2xl font-bold text-white">Hello, Marcus 👋</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-[#1A1A1A]">
              <Bell size={18} className="text-white" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FACC15] text-[10px] font-bold text-[#0A0A0A]">
                5
              </span>
            </button>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#FACC15]">
              <div className="h-full w-full bg-gradient-to-br from-[#FACC15] to-[#F59E0B]" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-5 px-5">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search courses..."
              className="h-12 w-full rounded-xl border border-[#333333] bg-[#1A1A1A] pl-11 pr-4 text-sm text-white transition-colors placeholder:text-[#9CA3AF] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto px-5">
          <div className="flex items-center gap-2">
            <CategoryTab label="All" active icon={<Star size={14} />} />
            <CategoryTab label="Design" icon={<Palette size={14} />} />
            <CategoryTab label="Illustration" icon={<Image size={14} />} />
            <CategoryTab label="3D Render" icon={<Box size={14} />} />
          </div>
        </div>

        {/* Featured Course Card */}
        <div className="mb-6 px-5">
          <DarkCard featured className="relative overflow-hidden p-5">
            <DecorativeDots className="absolute right-3 top-3" />
            <div className="relative z-10">
              <div className="mb-3 inline-block rounded-full bg-[#0A0A0A]/20 px-3 py-1 text-xs font-medium text-[#0A0A0A]">
                Featured Course
              </div>
              <div className="mb-2 text-xl font-bold text-[#0A0A0A]">Master Digital Design</div>
              <div className="mb-4 text-sm text-[#0A0A0A]/70">
                Learn to create stunning visuals with our comprehensive design course
              </div>
              <div className="flex items-center gap-4">
                <button className="rounded-xl bg-[#0A0A0A] px-5 py-2.5 text-sm font-semibold text-[#FACC15] transition-colors hover:bg-[#1A1A1A]">
                  Start Learning
                </button>
                <div className="flex items-center gap-2 text-sm text-[#0A0A0A]/70">
                  <Clock size={14} />
                  <span>12 hours</span>
                </div>
              </div>
            </div>
          </DarkCard>
        </div>

        {/* My Courses Section */}
        <div className="px-5">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading className="text-lg text-white">My Courses</SectionHeading>
            <Caption className="cursor-pointer text-sm font-semibold text-[#FACC15]">
              View All
            </Caption>
          </div>
          <div className="space-y-4">
            {courses.map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={0}
          items={[
            { icon: <Home size={24} />, label: 'Home' },
            { icon: <BookOpen size={24} />, label: 'Library' },
            { icon: <BarChart3 size={24} />, label: 'Stats' },
            { icon: <Settings size={24} />, label: 'Settings' },
          ]}
          className="border-[#333333] bg-[#0A0A0A]"
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
    { letter: 'A', label: 'Consistency across interfaces', selected: false },
    { letter: 'B', label: 'Visual hierarchy and flow', selected: true },
    { letter: 'C', label: 'Color theory fundamentals', selected: false },
    { letter: 'D', label: 'Typography in UI design', selected: false },
  ];

  return (
    <div style={darkThemeStyles}>
      <ScreenContainer className="flex min-h-full flex-col bg-[#0A0A0A] px-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-[#1A1A1A]">
            <ChevronRight size={18} className="rotate-180 text-white" />
          </button>
          <div className="text-center">
            <div className="text-sm font-semibold text-white">Design Quiz</div>
            <div className="text-xs text-[#9CA3AF]">Question 8 of 20</div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-[#1A1A1A]">
            <MoreHorizontal size={18} className="text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 px-5">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#333333]">
              <div className="h-full w-[40%] rounded-full bg-[#FACC15]" />
            </div>
            <span className="text-sm font-bold text-[#FACC15]">40%</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1 px-5">
          <DarkCard hover={false} className="mb-6 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FACC15] text-sm font-bold text-[#0A0A0A]">
                8
              </div>
              <div className="rounded-full bg-[#2A2A2A] px-3 py-1 text-xs font-medium text-[#FACC15]">
                UI Principles
              </div>
            </div>
            <CardTitle className="text-lg leading-relaxed text-white">
              Which design principle helps users understand the relationship between elements?
            </CardTitle>
          </DarkCard>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.letter}
                className={cn(
                  'flex w-full items-center gap-4 rounded-xl border-2 p-4 transition-all',
                  option.selected
                    ? 'border-[#FACC15] bg-[#FACC15]/10'
                    : 'border-[#333333] bg-[#1A1A1A] hover:border-[#FACC15]/50',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                    option.selected ? 'bg-[#FACC15] text-[#0A0A0A]' : 'bg-[#2A2A2A] text-[#9CA3AF]',
                  )}
                >
                  {option.letter}
                </span>
                <span
                  className={cn(
                    'text-left text-sm font-medium',
                    option.selected ? 'text-white' : 'text-[#9CA3AF]',
                  )}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Action */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            <button className="flex-1 rounded-xl border border-[#333333] bg-[#1A1A1A] py-4 text-sm font-semibold text-[#9CA3AF] transition-colors hover:border-[#FACC15]/50">
              Skip
            </button>
            <button className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-[#FACC15] py-4 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#EAB308]">
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
// SCREEN 3: SRS REVIEW (COURSE DETAIL)
// ============================================================================

function SRSReviewScreen() {
  const lessons: LessonItemProps[] = [
    { number: '01', title: 'Introduction to Design', duration: '15 min', completed: true },
    { number: '02', title: 'Color Theory Basics', duration: '22 min', completed: true },
    { number: '03', title: 'Typography Fundamentals', duration: '18 min', completed: false },
    { number: '04', title: 'Layout & Composition', duration: '25 min', locked: true },
    { number: '05', title: 'Visual Hierarchy', duration: '20 min', locked: true },
  ];

  return (
    <div style={darkThemeStyles}>
      <ScreenContainer className="bg-[#0A0A0A] px-0 pb-6">
        {/* Hero Header */}
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#EC4899]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />

          {/* Back button */}
          <button className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#0A0A0A]/50 backdrop-blur-sm">
            <ChevronRight size={18} className="rotate-180 text-white" />
          </button>

          {/* Course info overlay */}
          <div className="absolute bottom-4 left-5 right-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-[#FACC15] px-3 py-1 text-xs font-bold text-[#0A0A0A]">
                Best Seller
              </span>
              <div className="flex items-center gap-1">
                <Star size={12} className="fill-[#FACC15] text-[#FACC15]" />
                <span className="text-sm font-medium text-white">4.9</span>
              </div>
            </div>
            <div className="text-xl font-bold text-white">UI/UX Design Mastery</div>
          </div>
        </div>

        {/* Course Stats */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-around rounded-2xl border border-[#333333] bg-[#1A1A1A] p-4">
            <div className="text-center">
              <div className="text-lg font-bold text-[#FACC15]">24</div>
              <div className="text-xs text-[#9CA3AF]">Lessons</div>
            </div>
            <div className="h-10 w-px bg-[#333333]" />
            <div className="text-center">
              <div className="text-lg font-bold text-[#FACC15]">6h 30m</div>
              <div className="text-xs text-[#9CA3AF]">Duration</div>
            </div>
            <div className="h-10 w-px bg-[#333333]" />
            <div className="text-center">
              <div className="text-lg font-bold text-[#FACC15]">2.4k</div>
              <div className="text-xs text-[#9CA3AF]">Students</div>
            </div>
          </div>
        </div>

        {/* Instructor */}
        <div className="mb-4 px-5">
          <DarkCard hover={false} className="flex items-center gap-3 p-4">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#FACC15]">
              <div className="h-full w-full bg-gradient-to-br from-[#FACC15] to-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Sarah Chen</div>
              <div className="text-xs text-[#9CA3AF]">Senior UX Designer at Google</div>
            </div>
            <button className="rounded-lg bg-[#2A2A2A] px-4 py-2 text-xs font-medium text-[#FACC15]">
              Follow
            </button>
          </DarkCard>
        </div>

        {/* Lessons List */}
        <div className="mb-4 px-5">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeading className="text-base text-white">Course Content</SectionHeading>
            <Caption className="text-xs text-[#9CA3AF]">2/5 completed</Caption>
          </div>
          <DarkCard hover={false} className="divide-y divide-[#333333]">
            {lessons.map((lesson, index) => (
              <LessonItem key={index} {...lesson} />
            ))}
          </DarkCard>
        </div>

        {/* Buy Button */}
        <div className="px-5 pt-2">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FACC15] py-4 text-base font-bold text-[#0A0A0A] transition-colors hover:bg-[#EAB308]">
            <Award size={20} />
            Buy The Course - $49.99
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
  const importOptions = [
    { icon: <FileUp size={24} />, label: 'Upload File', desc: 'MD, JSON, CSV' },
    { icon: <Link2 size={24} />, label: 'Import URL', desc: 'Paste a link' },
    { icon: <HardDrive size={24} />, label: 'Cloud Storage', desc: 'Google Drive' },
  ];

  const recentImports = [
    { name: 'Design Principles.md', size: '24 KB', time: '2 min ago' },
    { name: 'UI Patterns.json', size: '156 KB', time: '1 hour ago' },
    { name: 'Color Theory.csv', size: '89 KB', time: 'Yesterday' },
  ];

  return (
    <div style={darkThemeStyles}>
      <ScreenContainer className="bg-[#0A0A0A] px-0 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-[#1A1A1A]">
            <ChevronRight size={18} className="rotate-180 text-white" />
          </button>
          <div className="text-base font-semibold text-white">Import Content</div>
          <div className="w-10" />
        </div>

        {/* Upload Area */}
        <div className="mb-6 px-5">
          <DarkCard
            hover={false}
            className="border-2 border-dashed border-[#FACC15]/30 bg-[#FACC15]/5 p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FACC15]/20">
                <Upload size={32} className="text-[#FACC15]" />
              </div>
              <div className="mb-2 text-base font-semibold text-white">Drop your files here</div>
              <div className="mb-4 text-sm text-[#9CA3AF]">or tap to browse from device</div>
              <button className="rounded-xl bg-[#FACC15] px-6 py-3 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#EAB308]">
                Choose Files
              </button>
            </div>
          </DarkCard>
        </div>

        {/* Import Options */}
        <div className="mb-6 px-5">
          <SectionHeading className="mb-4 text-base text-white">Import From</SectionHeading>
          <div className="grid grid-cols-3 gap-3">
            {importOptions.map((option, index) => (
              <DarkCard key={index} className="flex flex-col items-center p-4 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FACC15]/20 text-[#FACC15]">
                  {option.icon}
                </div>
                <div className="mb-1 text-xs font-semibold text-white">{option.label}</div>
                <div className="text-[10px] text-[#9CA3AF]">{option.desc}</div>
              </DarkCard>
            ))}
          </div>
        </div>

        {/* Supported Formats */}
        <div className="mb-6 px-5">
          <SectionHeading className="mb-4 text-base text-white">Supported Formats</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {['Markdown', 'JSON', 'CSV', 'APKG', 'Anki', 'Quizlet'].map((format) => (
              <span
                key={format}
                className="rounded-full border border-[#333333] bg-[#1A1A1A] px-4 py-2 text-sm text-white"
              >
                {format}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Imports */}
        <div className="px-5">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading className="text-base text-white">Recent Imports</SectionHeading>
            <Caption className="cursor-pointer text-xs font-semibold text-[#FACC15]">
              See All
            </Caption>
          </div>
          <div className="space-y-2">
            {recentImports.map((file, index) => (
              <DarkCard key={index} className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACC15]/20">
                  <FileText size={20} className="text-[#FACC15]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{file.name}</div>
                  <div className="text-xs text-[#9CA3AF]">
                    {file.size} • {file.time}
                  </div>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2A2A2A]">
                  <ChevronRight size={16} className="text-[#9CA3AF]" />
                </button>
              </DarkCard>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeIndex={1}
          items={[
            { icon: <Home size={24} />, label: 'Home' },
            { icon: <Plus size={24} />, label: 'Import' },
            { icon: <BarChart3 size={24} />, label: 'Stats' },
            { icon: <Settings size={24} />, label: 'Settings' },
          ]}
          className="border-[#333333] bg-[#0A0A0A]"
        />
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function DarkThemePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="border-b border-[#333333] px-6 py-12 text-center">
        <div className="mb-3 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FACC15]">
            <Layers size={24} className="text-[#0A0A0A]" />
          </div>
          <h1 className="text-4xl font-bold text-white">Dark Premium Theme</h1>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-[#9CA3AF]">
          A premium dark mode design with bold yellow accents. Inspired by modern subscription-based
          learning platforms with elegant visual hierarchy.
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

          <DesignFrame themeName="Course Detail (SRS)" className="flex-shrink-0">
            <SRSReviewScreen />
          </DesignFrame>

          <DesignFrame themeName="Import" className="flex-shrink-0">
            <ImportScreen />
          </DesignFrame>
        </div>
      </div>

      {/* Color Palette Reference */}
      <div className="mx-auto max-w-4xl px-8 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Color Palette</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl border border-[#333333] bg-[#0A0A0A]" />
            <div className="text-sm font-medium text-white">Background</div>
            <div className="text-xs text-[#9CA3AF]">#0A0A0A</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl border border-[#333333] bg-[#1A1A1A]" />
            <div className="text-sm font-medium text-white">Card</div>
            <div className="text-xs text-[#9CA3AF]">#1A1A1A</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl border border-[#333333] bg-[#2A2A2A]" />
            <div className="text-sm font-medium text-white">Secondary</div>
            <div className="text-xs text-[#9CA3AF]">#2A2A2A</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#FACC15]" />
            <div className="text-sm font-medium text-white">Accent</div>
            <div className="text-xs text-[#9CA3AF]">#FACC15</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-white" />
            <div className="text-sm font-medium text-white">Text Primary</div>
            <div className="text-xs text-[#9CA3AF]">#FFFFFF</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#9CA3AF]" />
            <div className="text-sm font-medium text-white">Text Muted</div>
            <div className="text-xs text-[#9CA3AF]">#9CA3AF</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#333333]" />
            <div className="text-sm font-medium text-white">Border</div>
            <div className="text-xs text-[#9CA3AF]">#333333</div>
          </div>
        </div>
      </div>

      {/* Design Features */}
      <div className="mx-auto max-w-4xl px-8 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Design Features</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACC15]/20">
              <Zap size={20} className="text-[#FACC15]" />
            </div>
            <div className="mb-1 font-semibold text-white">Yellow Accent Pops</div>
            <div className="text-sm text-[#9CA3AF]">Bright yellow highlights on dark surfaces</div>
          </div>
          <div className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACC15]/20">
              <Star size={20} className="text-[#FACC15]" />
            </div>
            <div className="mb-1 font-semibold text-white">Featured Cards</div>
            <div className="text-sm text-[#9CA3AF]">Bold yellow background featured content</div>
          </div>
          <div className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACC15]/20">
              <Target size={20} className="text-[#FACC15]" />
            </div>
            <div className="mb-1 font-semibold text-white">Progress Indicators</div>
            <div className="text-sm text-[#9CA3AF]">
              Yellow-filled progress bars and percentages
            </div>
          </div>
          <div className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACC15]/20">
              <Layers size={20} className="text-[#FACC15]" />
            </div>
            <div className="mb-1 font-semibold text-white">Pill-Shaped Tabs</div>
            <div className="text-sm text-[#9CA3AF]">Smooth rounded category navigation</div>
          </div>
          <div className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACC15]/20">
              <User size={20} className="text-[#FACC15]" />
            </div>
            <div className="mb-1 font-semibold text-white">Rounded Avatars</div>
            <div className="text-sm text-[#9CA3AF]">
              Circular profile images with accent borders
            </div>
          </div>
          <div className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACC15]/20">
              <Box size={20} className="text-[#FACC15]" />
            </div>
            <div className="mb-1 font-semibold text-white">Course Thumbnails</div>
            <div className="text-sm text-[#9CA3AF]">Gradient thumbnails with overlay text</div>
          </div>
        </div>
      </div>
    </main>
  );
}
