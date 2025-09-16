"use client"
import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"

export interface Toast {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message?: string
  duration?: number
}

interface ToastNotificationProps {
  toast: Toast
  onRemove: (id: string) => void
}

export function ToastNotification({ toast, onRemove }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Auto-remove after duration
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      handleRemove()
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.duration])

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300) // Match exit animation duration
  }

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getColorClasses = () => {
    switch (toast.type) {
      case "success":
        return "border-green-700 bg-green-950/90"
      case "error":
        return "border-red-700 bg-red-950/90"
      case "warning":
        return "border-yellow-700 bg-yellow-950/90"
      case "info":
      default:
        return "border-blue-700 bg-blue-950/90"
    }
  }

  return (
    <Card
      className={`
        ${getColorClasses()}
        backdrop-blur-sm shadow-lg border-2 min-w-[300px] max-w-[500px]
        transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${isExiting ? "scale-95" : "scale-100"}
      `}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm">{toast.title}</h4>
          {toast.message && <p className="text-gray-300 text-sm mt-1 leading-relaxed">{toast.message}</p>}
        </div>

        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded hover:bg-white/10"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Card>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemoveToast: (id: string) => void
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastNotification toast={toast} onRemove={onRemoveToast} />
        </div>
      ))}
    </div>
  )
}
