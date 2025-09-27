// import { PercentIcon } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'success' | 'warning';
  label?: string;
  showPercentage?: boolean;
  compact?: boolean;
}

export function ProgressBar({
  current,
  total,
  className = '',
  showText = true,
  variant = 'default',
  label = 'questions completed',
  showPercentage = true,
  compact = false,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const variantClasses = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
  };

  if (compact) {
    // Compact mode for chapter cards - just the bar with percentage on the right
    return (
      <div className={`w-full ${className}`}>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex-1" />
          {showPercentage && (
            <span className="text-sm font-medium tabular-nums text-gray-300">{percentage}%</span>
          )}
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-700">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${variantClasses[variant]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // Full mode for dashboard and quiz sessions - Enhanced alignment
  return (
    <div className={`w-full ${className}`}>
      {/* Display label above the aligned row if showText is true */}
      {showText && <div className="mb-1 text-sm font-medium text-gray-400">{label}</div>}

      {/* Horizontally aligned row */}
      <div className="flex items-start space-x-3">
        {/* Icon */}

        {/* Progress Bar */}
        <div className="h-2.5 flex-grow rounded-full bg-gray-700 leading-3 leading-4 leading-5 leading-6 leading-7">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${variantClasses[variant]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Percentage Text */}
        {showPercentage && (
          <span className="w-12 flex-shrink-0 text-right text-sm font-medium tabular-nums text-gray-300">
            {percentage}%
          </span>
        )}

        {/* Score Text ("current/total") */}
        {showText && (
          <span className="flex-shrink-0 whitespace-nowrap text-sm tabular-nums text-gray-400">
            {current}/{total}
          </span>
        )}
      </div>
    </div>
  );
}
