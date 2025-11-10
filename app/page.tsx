"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/landing');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center overflow-safe">
      <div className="bg-neutral-950/50 backdrop-blur-lg border border-neutral-800/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
          <div className="text-white text-center">
            <h3 className="text-lg font-semibold mb-2">JobInsight AI</h3>
            <p className="text-neutral-400 text-sm">Redirecting...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
