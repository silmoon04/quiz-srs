"use client";

import { memo } from "react";
import { processMarkdownSync } from "@/lib/markdown/sync-pipeline";

interface SimpleSafeRendererProps {
  content: string;
  className?: string;
}

export const SimpleSafeRenderer = memo(function SimpleSafeRenderer({
  content,
  className = "",
}: SimpleSafeRendererProps) {
  console.log(
    "SimpleSafeRenderer: Processing content:",
    content.substring(0, 100) + "...",
  );

  const processedHtml = processMarkdownSync(content);

  console.log(
    "SimpleSafeRenderer: Processed HTML:",
    processedHtml.substring(0, 200) + "...",
  );

  return (
    <div
      className={`simple-safe-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
});
