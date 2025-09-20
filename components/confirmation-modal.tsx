"use client";
import { Button } from "@/components/ui/button";
import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecureTextRenderer } from "./secure-text-renderer";
import { AlertTriangle, Info, X, AlertCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  questionPreview?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  questionPreview,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-400" />,
          headerBg: "from-red-950 to-red-900",
          borderColor: "border-red-700",
          confirmBg: "bg-red-700 hover:bg-red-800 active:bg-red-900",
          confirmRing: "focus-visible:ring-red-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
          headerBg: "from-yellow-950 to-yellow-900",
          borderColor: "border-yellow-700",
          confirmBg: "bg-yellow-700 hover:bg-yellow-800 active:bg-yellow-900",
          confirmRing: "focus-visible:ring-yellow-500",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-6 h-6 text-blue-400" />,
          headerBg: "from-blue-950 to-blue-900",
          borderColor: "border-blue-700",
          confirmBg: "bg-blue-700 hover:bg-blue-800 active:bg-blue-900",
          confirmRing: "focus-visible:ring-blue-500",
        };
    }
  };

  const styles = getVariantStyles();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Card
        className={`bg-gradient-to-r ${styles.headerBg} ${styles.borderColor} backdrop-blur-sm shadow-xl max-w-2xl w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0 mt-1">{styles.icon}</div>
              <CardTitle className="text-white text-xl leading-tight break-words">
                {title}
              </CardTitle>
            </div>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10 flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main message */}
          <div className="prose prose-invert max-w-none">
            <SecureTextRenderer
              content={message}
              className="text-white leading-relaxed break-words"
            />
          </div>

          {/* Optional question preview */}
          {questionPreview && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Preview:
              </h4>
              <div className="prose prose-invert max-w-none">
                <SecureTextRenderer
                  content={questionPreview}
                  className="text-gray-200 text-sm leading-relaxed break-words"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-gray-700 bg-gray-900/70 text-gray-200 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-all duration-200"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={`${styles.confirmBg} text-white transition-all duration-200 ${styles.confirmRing} focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900`}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
