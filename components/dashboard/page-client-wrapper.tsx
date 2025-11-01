"use client";

import { Suspense } from "react";
import { DashboardPageContent } from "./page-content";

export function DashboardPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}

