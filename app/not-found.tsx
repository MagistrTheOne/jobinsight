"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center px-4 overflow-safe">
      <div className="max-w-md w-full">
        {/* Glass Card Container */}
        <div className="bg-neutral-950/50 backdrop-blur-lg border border-neutral-800/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-900/50 border border-neutral-800/50 backdrop-blur-sm mb-4">
                <Briefcase className="h-10 w-10 text-neutral-500" />
              </div>
              <h1 className="text-6xl sm:text-7xl font-bold text-white">404</h1>
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-300">
                Page Not Found
              </h2>
              <p className="text-base sm:text-lg text-neutral-400 max-w-sm mx-auto leading-relaxed">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/landing">
                <Button className="w-full sm:w-auto bg-neutral-800 hover:bg-neutral-700 text-white h-11 px-6 transition-all duration-200 shadow-sm hover:shadow-md">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full sm:w-auto border-neutral-800/50 hover:bg-neutral-900/50 text-white h-11 px-6 transition-all duration-200"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>

            {/* Additional Help */}
            <div className="pt-4 border-t border-neutral-800/30">
              <p className="text-xs text-neutral-500 text-center">
                Looking for something specific? Try our{' '}
                <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 underline">
                  dashboard
                </Link>
                {' '}or{' '}
                <Link href="/landing#features" className="text-blue-400 hover:text-blue-300 underline">
                  features page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

