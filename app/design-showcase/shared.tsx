'use client';

import React from 'react';
import { ArrowLeft, Home, BookOpen, BarChart3, Settings, Search, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface DesignFrameProps extends BaseComponentProps {
  themeName: string;
}

export interface StatCardProps extends BaseComponentProps {
  value: string | number;
  label: string;
}

export interface ProgressCardProps extends BaseComponentProps {
  title: string;
  progress: number;
  subtitle?: string;
}

export interface ButtonProps extends BaseComponentProps {
  onClick?: () => void;
  disabled?: boolean;
}

export interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  'aria-label': string;
}

export interface ProgressBarProps extends BaseComponentProps {
  value: number;
  max?: number;
}

export interface CircularProgressProps extends BaseComponentProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export interface BottomNavProps extends BaseComponentProps {
  activeIndex?: number;
  items?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }>;
}

export interface TopBarProps extends BaseComponentProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export interface SearchBarProps extends BaseComponentProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export type OptionState = 'default' | 'selected' | 'correct' | 'incorrect';

export interface OptionCardProps extends BaseComponentProps {
  label: string;
  state?: OptionState;
  onClick?: () => void;
  optionLetter?: string;
}

export type BadgeStatus = 'completed' | 'in-progress' | 'not-started' | 'locked';

export interface StatusBadgeProps extends BaseComponentProps {
  status: BadgeStatus;
  label?: string;
}

export interface CategoryTagProps extends BaseComponentProps {
  label: string;
}

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

/**
 * DesignFrame - A wrapper that renders children with mobile frame styling (iPhone mockup)
 */
export function DesignFrame({ themeName, className, children }: DesignFrameProps) {
  return (
    <div className={cn('flex flex-col items-center p-4', className)}>
      {/* Theme label */}
      <div className="mb-2 text-sm font-medium text-[var(--ds-text-secondary,#6b7280)]">
        {themeName}
      </div>
      {/* Phone frame */}
      <div
        className={cn(
          'relative h-[844px] w-[390px] overflow-hidden rounded-[48px]',
          'bg-[var(--ds-bg-primary,#ffffff)] dark:bg-[var(--ds-bg-primary,#0f0f0f)]',
          'border-[12px] border-[var(--ds-frame-border,#1f1f1f)]',
          'shadow-2xl',
        )}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-50 h-[32px] w-[120px] -translate-x-1/2 rounded-b-2xl bg-[var(--ds-frame-border,#1f1f1f)]" />
        {/* Screen content */}
        <div className="h-full w-full overflow-auto pt-8">{children}</div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-[var(--ds-text-primary,#000)] opacity-30 dark:bg-[var(--ds-text-primary,#fff)]" />
      </div>
    </div>
  );
}

/**
 * ScreenContainer - Full screen container with proper padding
 */
export function ScreenContainer({ className, children }: BaseComponentProps) {
  return (
    <div
      className={cn(
        'min-h-full w-full px-4 py-6',
        'bg-[var(--ds-bg-primary,#ffffff)] dark:bg-[var(--ds-bg-primary,#0f0f0f)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// TYPOGRAPHY COMPONENTS
// ============================================================================

/**
 * DisplayHeading - Large hero text
 */
export function DisplayHeading({ className, children }: BaseComponentProps) {
  return (
    <h1
      className={cn(
        'text-4xl font-bold tracking-tight',
        'text-[var(--ds-text-primary,#111827)] dark:text-[var(--ds-text-primary,#f9fafb)]',
        className,
      )}
    >
      {children}
    </h1>
  );
}

/**
 * SectionHeading - Section titles
 */
export function SectionHeading({ className, children }: BaseComponentProps) {
  return (
    <h2
      className={cn(
        'text-xl font-semibold',
        'text-[var(--ds-text-primary,#111827)] dark:text-[var(--ds-text-primary,#f9fafb)]',
        className,
      )}
    >
      {children}
    </h2>
  );
}

/**
 * CardTitle - Card/item titles
 */
export function CardTitle({ className, children }: BaseComponentProps) {
  return (
    <h3
      className={cn(
        'text-lg font-medium',
        'text-[var(--ds-text-primary,#111827)] dark:text-[var(--ds-text-primary,#f9fafb)]',
        className,
      )}
    >
      {children}
    </h3>
  );
}

/**
 * BodyText - Regular body text
 */
export function BodyText({ className, children }: BaseComponentProps) {
  return (
    <p
      className={cn(
        'text-base',
        'text-[var(--ds-text-secondary,#4b5563)] dark:text-[var(--ds-text-secondary,#9ca3af)]',
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Caption - Small caption text
 */
export function Caption({ className, children }: BaseComponentProps) {
  return (
    <span
      className={cn(
        'text-sm',
        'text-[var(--ds-text-muted,#6b7280)] dark:text-[var(--ds-text-muted,#9ca3af)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

// ============================================================================
// CARD COMPONENTS
// ============================================================================

/**
 * BaseCard - Flexible card with rounded corners, shadows
 */
export function BaseCard({ className, children }: BaseComponentProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        'bg-[var(--ds-card-bg,#ffffff)] dark:bg-[var(--ds-card-bg,#1f1f1f)]',
        'border border-[var(--ds-card-border,#e5e7eb)] dark:border-[var(--ds-card-border,#2d2d2d)]',
        'shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * StatCard - For displaying statistics (value + label)
 */
export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <BaseCard className={cn('text-center', className)}>
      <div className={cn('text-3xl font-bold', 'text-[var(--ds-accent,#6366f1)]')}>{value}</div>
      <div
        className={cn(
          'mt-1 text-sm',
          'text-[var(--ds-text-muted,#6b7280)] dark:text-[var(--ds-text-muted,#9ca3af)]',
        )}
      >
        {label}
      </div>
    </BaseCard>
  );
}

/**
 * ProgressCard - Card with progress indicator
 */
export function ProgressCard({
  title,
  progress,
  subtitle,
  className,
  children,
}: ProgressCardProps) {
  return (
    <BaseCard className={className}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <Caption>{subtitle}</Caption>}
        </div>
        <CircularProgress value={progress} size={48} strokeWidth={4} showLabel />
      </div>
      {children}
    </BaseCard>
  );
}

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================

/**
 * PrimaryButton - Main action button
 */
export function PrimaryButton({ className, children, onClick, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-xl px-6 py-3 text-base font-semibold',
        'bg-[var(--ds-accent,#6366f1)] hover:bg-[var(--ds-accent-hover,#4f46e5)]',
        'text-white',
        'transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus:outline-none focus:ring-2 focus:ring-[var(--ds-accent,#6366f1)] focus:ring-offset-2',
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * SecondaryButton - Secondary actions
 */
export function SecondaryButton({ className, children, onClick, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-xl px-6 py-3 text-base font-semibold',
        'bg-[var(--ds-secondary-bg,#f3f4f6)] dark:bg-[var(--ds-secondary-bg,#2d2d2d)]',
        'text-[var(--ds-text-primary,#111827)] dark:text-[var(--ds-text-primary,#f9fafb)]',
        'hover:bg-[var(--ds-secondary-bg-hover,#e5e7eb)] dark:hover:bg-[var(--ds-secondary-bg-hover,#3d3d3d)]',
        'transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus:outline-none focus:ring-2 focus:ring-[var(--ds-accent,#6366f1)] focus:ring-offset-2',
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * IconButton - Icon-only button
 */
export function IconButton({
  icon,
  className,
  onClick,
  disabled,
  'aria-label': ariaLabel,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'rounded-full p-2',
        'bg-[var(--ds-secondary-bg,#f3f4f6)] dark:bg-[var(--ds-secondary-bg,#2d2d2d)]',
        'text-[var(--ds-text-primary,#111827)] dark:text-[var(--ds-text-primary,#f9fafb)]',
        'hover:bg-[var(--ds-secondary-bg-hover,#e5e7eb)] dark:hover:bg-[var(--ds-secondary-bg-hover,#3d3d3d)]',
        'transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus:outline-none focus:ring-2 focus:ring-[var(--ds-accent,#6366f1)]',
        className,
      )}
    >
      {icon}
    </button>
  );
}

// ============================================================================
// PROGRESS COMPONENTS
// ============================================================================

/**
 * ProgressBar - Linear progress
 */
export function ProgressBar({ value, max = 100, className }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full',
        'bg-[var(--ds-progress-bg,#e5e7eb)] dark:bg-[var(--ds-progress-bg,#2d2d2d)]',
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300',
          'bg-[var(--ds-accent,#6366f1)]',
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

/**
 * CircularProgress - Circular/radial progress
 */
export function CircularProgress({
  value,
  size = 64,
  strokeWidth = 6,
  showLabel = false,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, value));
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ds-progress-bg, #e5e7eb)"
          strokeWidth={strokeWidth}
          className="dark:stroke-[var(--ds-progress-bg,#2d2d2d)]"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ds-accent, #6366f1)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      {showLabel && (
        <span
          className={cn(
            'absolute text-xs font-semibold',
            'text-[var(--ds-text-primary,#111827)] dark:text-[var(--ds-text-primary,#f9fafb)]',
          )}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

/**
 * ProgressRing - Ring-style progress indicator
 */
export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 8,
  className,
  children,
}: CircularProgressProps & { children?: React.ReactNode }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, value));
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ds-progress-bg, #e5e7eb)"
          strokeWidth={strokeWidth}
          className="dark:stroke-[var(--ds-progress-bg,#2d2d2d)]"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ds-accent, #6366f1)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================

const defaultNavItems = [
  { icon: <Home size={24} />, label: 'Home' },
  { icon: <BookOpen size={24} />, label: 'Learn' },
  { icon: <BarChart3 size={24} />, label: 'Stats' },
  { icon: <Settings size={24} />, label: 'Settings' },
];

/**
 * BottomNav - Bottom navigation bar with icons
 */
export function BottomNav({ activeIndex = 0, items = defaultNavItems, className }: BottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 h-20 px-6 pb-6',
        'bg-[var(--ds-nav-bg,#ffffff)] dark:bg-[var(--ds-nav-bg,#1f1f1f)]',
        'border-t border-[var(--ds-card-border,#e5e7eb)] dark:border-[var(--ds-card-border,#2d2d2d)]',
        className,
      )}
    >
      <div className="flex h-full items-center justify-around">
        {items.map((item, index) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors',
              index === activeIndex
                ? 'text-[var(--ds-accent,#6366f1)]'
                : 'text-[var(--ds-text-muted,#6b7280)] dark:text-[var(--ds-text-muted,#9ca3af)]',
            )}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/**
 * TopBar - Top navigation with back button and title
 */
export function TopBar({ title, onBack, showBackButton = true, className }: TopBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center gap-4 px-4',
        'bg-[var(--ds-bg-primary,#ffffff)] dark:bg-[var(--ds-bg-primary,#0f0f0f)]',
        className,
      )}
    >
      {showBackButton && (
        <button
          onClick={onBack}
          className={cn(
            '-ml-2 rounded-full p-2',
            'text-[var(--ds-text-primary,#111827)] dark:text-[var(--ds-text-primary,#f9fafb)]',
            'hover:bg-[var(--ds-secondary-bg,#f3f4f6)] dark:hover:bg-[var(--ds-secondary-bg,#2d2d2d)]',
            'transition-colors',
          )}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
      )}
      <h1
        className={cn(
          'text-lg font-semibold',
          'text-[var(--ds-text-primary,#111827)] dark:text-[var(--ds-text-primary,#f9fafb)]',
        )}
      >
        {title}
      </h1>
    </header>
  );
}

// ============================================================================
// INPUT COMPONENTS
// ============================================================================

/**
 * SearchBar - Search input with icon
 */
export function SearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search
        size={20}
        className={cn(
          'absolute left-4',
          'text-[var(--ds-text-muted,#6b7280)] dark:text-[var(--ds-text-muted,#9ca3af)]',
        )}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-12 w-full rounded-xl pl-12 pr-4',
          'bg-[var(--ds-input-bg,#f3f4f6)] dark:bg-[var(--ds-input-bg,#2d2d2d)]',
          'text-[var(--ds-text-primary,#111827)] dark:text-[var(--ds-text-primary,#f9fafb)]',
          'placeholder:text-[var(--ds-text-muted,#6b7280)] dark:placeholder:text-[var(--ds-text-muted,#9ca3af)]',
          'border border-transparent',
          'focus:ring-[var(--ds-accent,#6366f1)]/20 focus:border-[var(--ds-accent,#6366f1)] focus:outline-none focus:ring-2',
          'transition-colors',
        )}
      />
    </div>
  );
}

/**
 * OptionCard - Selectable option for quiz answers
 */
export function OptionCard({
  label,
  state = 'default',
  onClick,
  optionLetter,
  className,
}: OptionCardProps) {
  const stateStyles = {
    default: cn(
      'bg-[var(--ds-card-bg,#ffffff)] dark:bg-[var(--ds-card-bg,#1f1f1f)]',
      'border-[var(--ds-card-border,#e5e7eb)] dark:border-[var(--ds-card-border,#2d2d2d)]',
      'hover:border-[var(--ds-accent,#6366f1)]',
    ),
    selected: cn(
      'bg-[var(--ds-accent,#6366f1)]/10',
      'border-[var(--ds-accent,#6366f1)]',
      'ring-2 ring-[var(--ds-accent,#6366f1)]/20',
    ),
    correct: cn(
      'bg-[var(--ds-success,#22c55e)]/10',
      'border-[var(--ds-success,#22c55e)]',
      'ring-2 ring-[var(--ds-success,#22c55e)]/20',
    ),
    incorrect: cn(
      'bg-[var(--ds-error,#ef4444)]/10',
      'border-[var(--ds-error,#ef4444)]',
      'ring-2 ring-[var(--ds-error,#ef4444)]/20',
    ),
  };

  const iconByState = {
    correct: <Check size={20} className="text-[var(--ds-success,#22c55e)]" />,
    incorrect: <X size={20} className="text-[var(--ds-error,#ef4444)]" />,
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border-2 p-4 text-left',
        'flex items-center gap-4',
        'transition-all duration-200',
        stateStyles[state],
        className,
      )}
    >
      {optionLetter && (
        <span
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
            'text-sm font-semibold',
            state === 'default'
              ? 'bg-[var(--ds-secondary-bg,#f3f4f6)] text-[var(--ds-text-primary,#111827)] dark:bg-[var(--ds-secondary-bg,#2d2d2d)] dark:text-[var(--ds-text-primary,#f9fafb)]'
              : state === 'selected'
                ? 'bg-[var(--ds-accent,#6366f1)] text-white'
                : state === 'correct'
                  ? 'bg-[var(--ds-success,#22c55e)] text-white'
                  : 'bg-[var(--ds-error,#ef4444)] text-white',
          )}
        >
          {optionLetter}
        </span>
      )}
      <span
        className={cn(
          'flex-1 text-base',
          'text-[var(--ds-text-primary,#111827)] dark:text-[var(--ds-text-primary,#f9fafb)]',
        )}
      >
        {label}
      </span>
      {(state === 'correct' || state === 'incorrect') && iconByState[state]}
    </button>
  );
}

// ============================================================================
// BADGE/TAG COMPONENTS
// ============================================================================

const statusConfig: Record<BadgeStatus, { bg: string; text: string; label: string }> = {
  completed: {
    bg: 'bg-[var(--ds-success,#22c55e)]/10',
    text: 'text-[var(--ds-success,#22c55e)]',
    label: 'Completed',
  },
  'in-progress': {
    bg: 'bg-[var(--ds-warning,#f59e0b)]/10',
    text: 'text-[var(--ds-warning,#f59e0b)]',
    label: 'In Progress',
  },
  'not-started': {
    bg: 'bg-[var(--ds-text-muted,#6b7280)]/10',
    text: 'text-[var(--ds-text-muted,#6b7280)]',
    label: 'Not Started',
  },
  locked: {
    bg: 'bg-[var(--ds-text-muted,#6b7280)]/10',
    text: 'text-[var(--ds-text-muted,#6b7280)]',
    label: 'Locked',
  },
};

/**
 * StatusBadge - Status indicators
 */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        config.bg,
        config.text,
        className,
      )}
    >
      {label || config.label}
    </span>
  );
}

/**
 * CategoryTag - Category labels
 */
export function CategoryTag({ label, className }: CategoryTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        'bg-[var(--ds-accent,#6366f1)]/10',
        'text-[var(--ds-accent,#6366f1)]',
        className,
      )}
    >
      {label}
    </span>
  );
}
