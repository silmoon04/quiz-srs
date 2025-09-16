import { PercentIcon } from "lucide-react"

interface ProgressBarProps {
  current: number
  total: number
  className?: string
  showText?: boolean
  variant?: "default" | "success" | "warning"
  label?: string
  showPercentage?: boolean
  compact?: boolean
}

export function ProgressBar({
  current,
  total,
  className = "",
  showText = true,
  variant = "default",
  label = "questions completed",
  showPercentage = true,
  compact = false,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  const variantClasses = {
    default: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
  }

  if (compact) {
    // Compact mode for chapter cards - just the bar with percentage on the right
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex-1" />
          {showPercentage && <span className="text-sm font-medium text-gray-300 tabular-nums">{percentage}%</span>}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${variantClasses[variant]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  // Full mode for dashboard and quiz sessions - Enhanced alignment
  return (
    <div className={`w-full ${className}`}>
      {/* Display label above the aligned row if showText is true */}
      {showText && <div className="text-sm font-medium text-gray-400 mb-1">{label}</div>}

      {/* Horizontally aligned row */}
      <div className="flex space-x-3 items-start">
        {/* Icon */}
        

        {/* Progress Bar */}
        <div className="flex-grow bg-gray-700 rounded-full h-2.5 leading-3 leading-4 leading-5 leading-6 leading-5 leading-4 leading-3 leading-7">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${variantClasses[variant]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Percentage Text */}
        {showPercentage && (
          <span className="text-sm font-medium text-gray-300 tabular-nums w-12 text-right flex-shrink-0">
            {percentage}%
          </span>
        )}

        {/* Score Text ("current/total") */}
        {showText && (
          <span className="text-sm text-gray-400 tabular-nums whitespace-nowrap flex-shrink-0">
            {current}/{total}
          </span>
        )}
      </div>
    </div>
  )
}
