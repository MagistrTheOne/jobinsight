"use client";

import { Suspense } from "react";
import DashboardLayoutClient from "@/components/dashboard/dashboard-layout-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-black text-white">
      <Suspense
        fallback={
          <div className="flex min-h-dvh flex-col items-center justify-center bg-black text-neutral-300">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              <span className="text-sm font-medium tracking-wide">
                Загрузка панели...
              </span>
            </div>
          </div>
        }
      >
        <DashboardLayoutClient>{children}</DashboardLayoutClient>
      </Suspense>
    </div>
  )
}
