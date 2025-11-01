"use client";

import { Suspense } from "react";
import { DashboardPageContent } from "./page-content";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 bg-neutral-900" />
            ))}
          </div>
          <Skeleton className="h-64 bg-neutral-900" />
        </div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}

