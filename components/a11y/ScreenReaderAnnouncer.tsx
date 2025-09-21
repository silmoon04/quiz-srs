'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';

interface AnnouncerContextType {
  announce: (message: string) => void;
  announcement: string | null;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export function useAnnouncer() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error('useAnnouncer must be used within a ScreenReaderAnnouncer');
  }
  return context;
}

interface ScreenReaderAnnouncerProps {
  children: ReactNode;
}

/**
 * Screen reader announcer provider that manages aria-live announcements
 * Provides a polite live region for screen readers and visible status for inversion safety
 */
export function ScreenReaderAnnouncer({ children }: ScreenReaderAnnouncerProps) {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((message: string) => {
    setAnnouncement(message);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Clear the announcement after a short delay to allow for new announcements
    timeoutRef.current = setTimeout(() => {
      setAnnouncement(null);
      timeoutRef.current = null;
    }, 100);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce, announcement }}>
      {children}

      {/* Screen reader live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {announcement}
      </div>

      {/* Visible status for inversion safety */}
      {announcement && (
        <div className="fixed right-4 top-4 z-50 rounded bg-blue-600 px-4 py-2 text-white shadow-lg">
          {announcement}
        </div>
      )}
    </AnnouncerContext.Provider>
  );
}
