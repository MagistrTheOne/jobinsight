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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Redirecting...</div>
    </div>
  );
}
