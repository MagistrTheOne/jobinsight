import { Suspense } from 'react';
import { DashboardPageWrapper } from '@/components/dashboard/page-client-wrapper';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          <span className="text-sm text-neutral-400">Loading...</span>
        </div>
      </div>
    }>
      <DashboardPageWrapper />
    </Suspense>
  );
}
