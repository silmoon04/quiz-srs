'use client';

import React from 'react';
import {
  Home,
  BookOpen,
  BarChart3,
  Settings,
  ChevronRight,
  Upload,
  FileText,
  Check,
  Type,
  Image,
  Layers,
  Grid,
  FolderOpen,
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
// TESTREE BRAND THEME CSS VARIABLES
// ============================================================================

const brandThemeStyles: Record<string, string> = {
  // Primary backgrounds
  '--ds-bg-primary': '#FFFFFF',
  '--ds-card-bg': '#FFFFFF',
  '--ds-nav-bg': '#FFFFFF',
  '--ds-input-bg': '#F8F9FA',

  // Brand accents - Testree colors
  '--ds-accent': '#E63946', // Coral red - main brand color
  '--ds-accent-hover': '#D62839',
  '--ds-accent-secondary': '#457B9D', // Teal blue
  '--ds-accent-tertiary': '#1D3557', // Dark navy

  // Text colors
  '--ds-text-primary': '#1D3557',
  '--ds-text-secondary': '#457B9D',
  '--ds-text-muted': '#6B7B8C',

  // Card styling
  '--ds-card-border': '#E8ECF0',
  '--ds-secondary-bg': '#F8F9FA',
  '--ds-secondary-bg-hover': '#EEF1F4',

  // Progress
  '--ds-progress-bg': '#E8ECF0',

  // Status colors
  '--ds-success': '#2A9D8F', // Turquoise
  '--ds-error': '#E63946',
  '--ds-warning': '#F4A261',

  // Frame
  '--ds-frame-border': '#1D3557',
};

// ============================================================================
// BRAND LOGO COMPONENT
// ============================================================================

function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: { container: 'w-8 h-8', text: 'text-xs' },
    md: { container: 'w-12 h-12', text: 'text-sm' },
    lg: { container: 'w-20 h-20', text: 'text-xl' },
  };

  return (
    <div className={cn('relative', sizeMap[size].container)}>
      {/* The organic "ee" curve shapes */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full">
          {/* Left curve */}
          <div
            className="absolute left-0 top-1/2 h-3/4 w-1/2 -translate-y-1/2 rounded-full"
            style={{
              backgroundColor: '#E63946',
              borderTopRightRadius: '50%',
              borderBottomRightRadius: '50%',
              borderTopLeftRadius: '20%',
              borderBottomLeftRadius: '20%',
            }}
          />
          {/* Right curve */}
          <div
            className="absolute right-0 top-1/2 h-3/4 w-1/2 -translate-y-1/2 rounded-full"
            style={{
              backgroundColor: '#457B9D',
              borderTopLeftRadius: '50%',
              borderBottomLeftRadius: '50%',
              borderTopRightRadius: '20%',
              borderBottomRightRadius: '20%',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STACKED BAR CHART COMPONENT
// ============================================================================

interface StackedBarProps {
  segments: { value: number; color: string; label: string }[];
  height?: number;
}

function StackedBar({ segments, height = 24 }: StackedBarProps) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex h-full overflow-hidden rounded-lg">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="h-full transition-all duration-300"
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COLOR BLOCK CARD COMPONENT
// ============================================================================

interface ColorBlockCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color: string;
  textColor?: string;
  onClick?: () => void;
}

function ColorBlockCard({
  title,
  subtitle,
  icon,
  color,
  textColor = '#FFFFFF',
  onClick,
}: ColorBlockCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold" style={{ color: textColor }}>
            {title}
          </div>
          {subtitle && (
            <div className="text-sm opacity-80" style={{ color: textColor }}>
              {subtitle}
            </div>
          )}
        </div>
        {icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"
            style={{ color: textColor }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// BRAND BUTTON COMPONENT
// ============================================================================

interface BrandButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  className?: string;
}

function BrandButton({ children, variant = 'primary', icon, className }: BrandButtonProps) {
  const variants = {
    primary: 'bg-[#E63946] hover:bg-[#D62839] text-white',
    secondary: 'bg-[#1D3557] hover:bg-[#152A47] text-white',
    outline: 'bg-transparent border-2 border-[#E63946] text-[#E63946] hover:bg-[#E63946]/5',
  };

  return (
    <button
      className={cn(
        'w-full rounded-xl px-6 py-3.5 text-base font-semibold',
        'flex items-center justify-center gap-2',
        'transition-all duration-200',
        variants[variant],
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

// ============================================================================
// PERCENTAGE INDICATOR
// ============================================================================

interface PercentageIndicatorProps {
  value: number;
  color: string;
  label: string;
}

function PercentageIndicator({ value, color, label }: PercentageIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-4 w-4 rounded" style={{ backgroundColor: color }} />
      <div className="flex-1">
        <div className="text-sm font-medium text-[#1D3557]">{label}</div>
      </div>
      <div className="text-lg font-bold" style={{ color }}>
        {value}%
      </div>
    </div>
  );
}

// ============================================================================
// QUIZ OPTION FOR BRAND THEME
// ============================================================================

interface BrandOptionProps {
  letter: string;
  label: string;
  color: string;
  selected?: boolean;
  onClick?: () => void;
}

function BrandOption({ letter, label, color, selected, onClick }: BrandOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200',
        selected
          ? 'border-[#E63946] shadow-lg shadow-[#E63946]/20'
          : 'border-[#E8ECF0] hover:border-[#457B9D]',
      )}
    >
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {letter}
      </span>
      <span className="text-base font-medium text-[#1D3557]">{label}</span>
      {selected && <Check size={20} className="ml-auto text-[#E63946]" />}
    </button>
  );
}

// ============================================================================
// TYPOGRAPHY SCALE COMPONENT
// ============================================================================

interface TypeScaleItemProps {
  name: string;
  size: string;
  weight: string;
  sample: string;
  style?: React.CSSProperties;
}

function TypeScaleItem({ name, size, weight, sample, style }: TypeScaleItemProps) {
  return (
    <div className="border-b border-[#E8ECF0] pb-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-[#457B9D]">{name}</span>
        <span className="text-xs text-[#6B7B8C]">
          {size} / {weight}
        </span>
      </div>
      <div style={style} className="truncate text-[#1D3557]">
        {sample}
      </div>
    </div>
  );
}

// ============================================================================
// CLEAR SPACE GUIDE COMPONENT
// ============================================================================

function ClearSpaceGuide() {
  return (
    <div className="relative">
      {/* Clear space boundary */}
      <div className="rounded-2xl border-2 border-dashed border-[#E63946]/30 p-8">
        {/* Inner content with guides */}
        <div className="relative flex items-center justify-center">
          {/* X markers on edges */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-xs font-bold text-[#E63946]">
            X
          </div>
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-[#E63946]">
            X
          </div>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#E63946]">
            X
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#E63946]">
            X
          </div>

          {/* Logo centered */}
          <div className="flex items-center gap-3">
            <BrandLogo size="lg" />
            <span className="text-2xl font-bold text-[#1D3557]">Testree</span>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className="text-sm text-[#6B7B8C]">Minimum clear space = 1x logo height</span>
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN 1: DASHBOARD
// ============================================================================

function DashboardScreen() {
  const colorUsage = [
    { value: 40, color: '#E63946', label: 'Primary Red' },
    { value: 30, color: '#457B9D', label: 'Teal Blue' },
    { value: 20, color: '#1D3557', label: 'Navy' },
    { value: 10, color: '#2A9D8F', label: 'Turquoise' },
  ];

  const categories = [
    { title: 'Mathematics', subtitle: '42 questions', color: '#E63946', icon: <Grid size={20} /> },
    { title: 'Science', subtitle: '38 questions', color: '#457B9D', icon: <Layers size={20} /> },
    { title: 'Language', subtitle: '25 questions', color: '#1D3557', icon: <Type size={20} /> },
    { title: 'History', subtitle: '31 questions', color: '#2A9D8F', icon: <BookOpen size={20} /> },
  ];

  return (
    <div style={brandThemeStyles}>
      <ScreenContainer className="bg-white pb-24">
        {/* Header with Brand */}
        <div className="-mx-4 -mt-6 flex items-center justify-between border-b border-[#E8ECF0] px-4 py-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-lg font-bold text-[#1D3557]">Testree</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#E63946]/10 px-3 py-1 text-sm font-semibold text-[#E63946]">
              Pro
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mt-6">
          <Caption className="text-[#457B9D]">Welcome back</Caption>
          <h1 className="mt-1 text-2xl font-bold text-[#1D3557]">Brand Guidelines</h1>
        </div>

        {/* Color Usage Chart */}
        <div className="mt-6 rounded-2xl bg-[#F8F9FA] p-5">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading className="text-base text-[#1D3557]">Color Usage</SectionHeading>
            <span className="text-xs text-[#6B7B8C]">Brand distribution</span>
          </div>

          {/* Stacked Bar */}
          <StackedBar segments={colorUsage} height={32} />

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {colorUsage.map((segment, index) => (
              <PercentageIndicator
                key={index}
                value={segment.value}
                color={segment.color}
                label={segment.label}
              />
            ))}
          </div>
        </div>

        {/* Category Cards */}
        <div className="mt-6">
          <SectionHeading className="mb-4 text-base text-[#1D3557]">Quiz Categories</SectionHeading>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, index) => (
              <ColorBlockCard
                key={index}
                title={cat.title}
                subtitle={cat.subtitle}
                color={cat.color}
                icon={cat.icon}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#E63946]/10 p-3 text-center">
            <div className="text-2xl font-bold text-[#E63946]">156</div>
            <div className="text-xs text-[#6B7B8C]">Total</div>
          </div>
          <div className="rounded-xl bg-[#457B9D]/10 p-3 text-center">
            <div className="text-2xl font-bold text-[#457B9D]">89%</div>
            <div className="text-xs text-[#6B7B8C]">Score</div>
          </div>
          <div className="rounded-xl bg-[#2A9D8F]/10 p-3 text-center">
            <div className="text-2xl font-bold text-[#2A9D8F]">12</div>
            <div className="text-xs text-[#6B7B8C]">Streak</div>
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
          className="border-[#E8ECF0]"
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
    { letter: 'A', label: 'Primary brand color', color: '#E63946', selected: true },
    { letter: 'B', label: 'Secondary accent color', color: '#457B9D', selected: false },
    { letter: 'C', label: 'Tertiary dark color', color: '#1D3557', selected: false },
    { letter: 'D', label: 'Success indicator', color: '#2A9D8F', selected: false },
  ];

  return (
    <div style={brandThemeStyles}>
      <ScreenContainer className="flex min-h-full flex-col bg-white">
        {/* Header */}
        <div className="-mx-4 -mt-6 flex items-center justify-between border-b border-[#E8ECF0] px-4 py-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F9FA]">
            <ChevronRight size={20} className="rotate-180 text-[#1D3557]" />
          </button>
          <span className="font-bold text-[#1D3557]">Brand Quiz</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-[#E63946]">7</span>
            <span className="text-sm text-[#6B7B8C]">/ 15</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <StackedBar
            segments={[
              { value: 47, color: '#E63946', label: 'Progress' },
              { value: 53, color: '#E8ECF0', label: 'Remaining' },
            ]}
            height={8}
          />
        </div>

        {/* Question Card */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#1D3557] to-[#457B9D] p-5">
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <span className="text-sm font-bold text-white">Q7</span>
            </div>
            <span className="text-sm text-white/60">Color Theory</span>
          </div>
          <CardTitle className="text-lg leading-relaxed text-white">
            Which color represents the primary brand identity in the Testree color system?
          </CardTitle>
        </div>

        {/* Options */}
        <div className="mt-6 flex-1 space-y-3">
          {options.map((option) => (
            <BrandOption
              key={option.letter}
              letter={option.letter}
              label={option.label}
              color={option.color}
              selected={option.selected}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-6 pb-6">
          <BrandButton variant="primary" icon={<ChevronRight size={20} />}>
            Continue
          </BrandButton>
        </div>
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 3: SRS REVIEW (TYPOGRAPHY FOCUSED)
// ============================================================================

function SRSReviewScreen() {
  return (
    <div style={brandThemeStyles}>
      <ScreenContainer className="flex min-h-full flex-col bg-white">
        {/* Header */}
        <div className="-mx-4 -mt-6 flex items-center justify-between border-b border-[#E8ECF0] px-4 py-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F9FA]">
            <ChevronRight size={20} className="rotate-180 text-[#1D3557]" />
          </button>
          <span className="font-bold text-[#1D3557]">Typography</span>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E63946]/10">
            <Type size={18} className="text-[#E63946]" />
          </button>
        </div>

        {/* Section Header */}
        <div className="mt-6">
          <Caption className="font-semibold text-[#E63946]">BRAND GUIDELINES</Caption>
          <h1 className="mt-1 text-2xl font-bold text-[#1D3557]">Font Scale</h1>
        </div>

        {/* Typography Scale */}
        <div className="mt-6 space-y-4">
          <TypeScaleItem
            name="Display"
            size="288pt"
            weight="Bold"
            sample="Aa"
            style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1.1 }}
          />
          <TypeScaleItem
            name="Headline 1"
            size="144pt"
            weight="Bold"
            sample="Testree"
            style={{ fontSize: '36px', fontWeight: 700, lineHeight: 1.2 }}
          />
          <TypeScaleItem
            name="Headline 2"
            size="72pt"
            weight="Semibold"
            sample="Brand Identity"
            style={{ fontSize: '24px', fontWeight: 600, lineHeight: 1.3 }}
          />
          <TypeScaleItem
            name="Headline 3"
            size="48pt"
            weight="Medium"
            sample="Typography Guidelines"
            style={{ fontSize: '18px', fontWeight: 500, lineHeight: 1.4 }}
          />
          <TypeScaleItem
            name="Body"
            size="24pt"
            weight="Regular"
            sample="The quick brown fox jumps over the lazy dog."
            style={{ fontSize: '14px', fontWeight: 400, lineHeight: 1.5 }}
          />
          <TypeScaleItem
            name="Caption"
            size="18pt"
            weight="Regular"
            sample="Supporting text and labels"
            style={{ fontSize: '12px', fontWeight: 400, lineHeight: 1.5 }}
          />
        </div>

        {/* Imagery Guidelines */}
        <div className="mt-6 rounded-2xl bg-[#F8F9FA] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#457B9D]">
              <Image size={20} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-[#1D3557]">Imagery</div>
              <div className="text-xs text-[#6B7B8C]">Photography guidelines</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-[#E63946] to-[#E63946]/60" />
            <div className="aspect-square rounded-xl bg-gradient-to-br from-[#457B9D] to-[#457B9D]/60" />
            <div className="aspect-square rounded-xl bg-gradient-to-br from-[#1D3557] to-[#1D3557]/60" />
          </div>
          <div className="mt-3 text-sm text-[#6B7B8C]">
            Use vibrant, high-contrast imagery with brand color overlays
          </div>
        </div>

        {/* Review Progress */}
        <div className="mt-6 pb-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[#1D3557]">Review Progress</span>
            <span className="text-sm font-bold text-[#2A9D8F]">4/6 Mastered</span>
          </div>
          <StackedBar
            segments={[
              { value: 4, color: '#2A9D8F', label: 'Mastered' },
              { value: 2, color: '#E8ECF0', label: 'Remaining' },
            ]}
            height={12}
          />
        </div>
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// SCREEN 4: IMPORT
// ============================================================================

function ImportScreen() {
  const fileTypes = [
    { type: 'MD', color: '#E63946', active: true },
    { type: 'JSON', color: '#457B9D', active: false },
    { type: 'CSV', color: '#1D3557', active: false },
    { type: 'APKG', color: '#2A9D8F', active: false },
  ];

  return (
    <div style={brandThemeStyles}>
      <ScreenContainer className="bg-white pb-6">
        {/* Header */}
        <div className="-mx-4 -mt-6 flex items-center justify-between border-b border-[#E8ECF0] px-4 py-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F9FA]">
            <ChevronRight size={20} className="rotate-180 text-[#1D3557]" />
          </button>
          <span className="font-bold text-[#1D3557]">Import Quiz</span>
          <div className="w-10" />
        </div>

        {/* Logo Display & Clear Space */}
        <div className="mt-6">
          <Caption className="mb-3 font-semibold text-[#E63946]">BRAND IDENTITY</Caption>
          <ClearSpaceGuide />
        </div>

        {/* File Type Selection */}
        <div className="mt-8">
          <SectionHeading className="mb-4 text-base text-[#1D3557]">Select Format</SectionHeading>
          <div className="flex gap-3">
            {fileTypes.map((file, index) => (
              <button
                key={index}
                className={cn(
                  'flex-1 rounded-xl py-3 text-sm font-bold transition-all',
                  file.active
                    ? 'text-white shadow-lg'
                    : 'bg-[#F8F9FA] text-[#6B7B8C] hover:bg-[#EEF1F4]',
                )}
                style={
                  file.active
                    ? { backgroundColor: file.color, boxShadow: `0 4px 14px ${file.color}40` }
                    : {}
                }
              >
                {file.type}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div className="mt-6 rounded-2xl border-2 border-dashed border-[#E8ECF0] bg-[#F8F9FA] p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E63946]/10">
            <Upload size={28} className="text-[#E63946]" />
          </div>
          <div className="font-semibold text-[#1D3557]">Upload Quiz File</div>
          <div className="mt-1 text-sm text-[#6B7B8C]">Drag & drop or click to browse</div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#1D3557] p-4 text-center">
            <FolderOpen size={24} className="mx-auto mb-2 text-white" />
            <span className="text-sm font-medium text-white">Browse Files</span>
          </div>
          <div className="rounded-xl bg-[#457B9D] p-4 text-center">
            <FileText size={24} className="mx-auto mb-2 text-white" />
            <span className="text-sm font-medium text-white">From URL</span>
          </div>
        </div>

        {/* Color Palette Reference */}
        <div className="mt-6 rounded-2xl bg-[#F8F9FA] p-4">
          <div className="mb-3 text-sm font-medium text-[#1D3557]">Brand Colors</div>
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="h-12 rounded-lg bg-[#E63946]" />
              <div className="mt-1 text-center text-xs text-[#6B7B8C]">#E63946</div>
            </div>
            <div className="flex-1">
              <div className="h-12 rounded-lg bg-[#457B9D]" />
              <div className="mt-1 text-center text-xs text-[#6B7B8C]">#457B9D</div>
            </div>
            <div className="flex-1">
              <div className="h-12 rounded-lg bg-[#1D3557]" />
              <div className="mt-1 text-center text-xs text-[#6B7B8C]">#1D3557</div>
            </div>
            <div className="flex-1">
              <div className="h-12 rounded-lg bg-[#2A9D8F]" />
              <div className="mt-1 text-center text-xs text-[#6B7B8C]">#2A9D8F</div>
            </div>
          </div>
        </div>

        {/* Import Button */}
        <div className="mt-6">
          <BrandButton variant="primary">Import Quiz</BrandButton>
        </div>
      </ScreenContainer>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function BrandThemePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E8ECF0]">
      {/* Header */}
      <div className="px-6 py-12 text-center">
        <div className="mb-4 flex items-center justify-center gap-4">
          <BrandLogo size="lg" />
          <h1 className="text-4xl font-bold text-[#1D3557]">Testree Brand Theme</h1>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-[#457B9D]">
          A polished brand identity system for educational products. Features bold color blocks,
          organic shapes, clear typography hierarchy, and professional design.
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

          <DesignFrame themeName="SRS Review (Typography)" className="flex-shrink-0">
            <SRSReviewScreen />
          </DesignFrame>

          <DesignFrame themeName="Import" className="flex-shrink-0">
            <ImportScreen />
          </DesignFrame>
        </div>
      </div>

      {/* Color Palette Reference */}
      <div className="mx-auto max-w-4xl px-8 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-[#1D3557]">
          🎨 Brand Color Palette
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl border border-[#E8ECF0] bg-[#FFFFFF]" />
            <div className="text-sm font-medium text-[#1D3557]">Background</div>
            <div className="text-xs text-[#6B7B8C]">#FFFFFF</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#E63946]" />
            <div className="text-sm font-medium text-[#1D3557]">Primary</div>
            <div className="text-xs text-[#6B7B8C]">#E63946</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#457B9D]" />
            <div className="text-sm font-medium text-[#1D3557]">Secondary</div>
            <div className="text-xs text-[#6B7B8C]">#457B9D</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#1D3557]" />
            <div className="text-sm font-medium text-[#1D3557]">Tertiary</div>
            <div className="text-xs text-[#6B7B8C]">#1D3557</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#2A9D8F]" />
            <div className="text-sm font-medium text-[#1D3557]">Success</div>
            <div className="text-xs text-[#6B7B8C]">#2A9D8F</div>
          </div>
          <div className="text-center">
            <div className="mb-2 h-16 w-full rounded-xl bg-[#F4A261]" />
            <div className="text-sm font-medium text-[#1D3557]">Warning</div>
            <div className="text-xs text-[#6B7B8C]">#F4A261</div>
          </div>
        </div>

        {/* Design Characteristics */}
        <div className="mt-12 rounded-2xl border border-[#E8ECF0] bg-white p-6">
          <h3 className="mb-4 text-xl font-bold text-[#1D3557]">Design Characteristics</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#E63946]/10">
                <div className="h-4 w-4 rounded-full bg-[#E63946]" />
              </div>
              <div>
                <div className="font-medium text-[#1D3557]">Bold Color Blocks</div>
                <div className="text-sm text-[#6B7B8C]">
                  Strong visual hierarchy with brand colors
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#457B9D]/10">
                <div className="h-4 w-4 rounded-full bg-[#457B9D]" />
              </div>
              <div>
                <div className="font-medium text-[#1D3557]">Organic Shapes</div>
                <div className="text-sm text-[#6B7B8C]">Rounded corners and curved elements</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#1D3557]/10">
                <div className="h-4 w-4 rounded-full bg-[#1D3557]" />
              </div>
              <div>
                <div className="font-medium text-[#1D3557]">Clear Typography</div>
                <div className="text-sm text-[#6B7B8C]">
                  Modern sans-serif with defined hierarchy
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#2A9D8F]/10">
                <div className="h-4 w-4 rounded-full bg-[#2A9D8F]" />
              </div>
              <div>
                <div className="font-medium text-[#1D3557]">Professional Balance</div>
                <div className="text-sm text-[#6B7B8C]">Playful yet sophisticated aesthetic</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
