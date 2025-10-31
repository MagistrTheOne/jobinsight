"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0b0b] text-white antialiased">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-900/20 border border-orange-800/30 backdrop-blur-sm mb-4">
                <AlertTriangle className="h-10 w-10 text-orange-500" />
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-white">Critical Error</h1>
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-300">
                Application Error
              </h2>
              <p className="text-base sm:text-lg text-neutral-400 max-w-sm mx-auto leading-relaxed">
                A critical error occurred. The application needs to be reloaded.
              </p>
              {error.digest && (
                <p className="text-xs text-neutral-600 font-mono mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                onClick={reset}
                className="w-full sm:w-auto bg-neutral-800 hover:bg-neutral-700 text-white h-11 px-6"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload App
              </Button>
              <Link href="/landing">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-neutral-800/50 hover:bg-neutral-900/50 h-11 px-6"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

