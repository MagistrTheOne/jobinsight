import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/components/providers/session-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { CommandProvider } from '@/components/command-provider';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'JobInsight AI - AI-Powered Job Application Analysis',
  description: 'AI-powered job application analysis system with red flag detection, ATS-optimized cover letters, and resume optimization using GigaChat API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const lang = localStorage.getItem('language') || 'ru';
                document.documentElement.lang = lang;
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${inter.className} font-sans bg-background text-foreground`}>
        <ThemeProvider>
          <SessionProvider>
            <CommandProvider>
              {children}
            </CommandProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
