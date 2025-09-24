import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { ScreenReaderAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quiz‑SRS',
  description: 'Secure spaced-repetition quizzes with rich Markdown and math.',
  applicationName: 'Quiz‑SRS',
  generator: 'next',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ScreenReaderAnnouncer>{children}</ScreenReaderAnnouncer>
        <Analytics />
      </body>
    </html>
  );
}
