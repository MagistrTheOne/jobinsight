import { Suspense } from "react";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </Suspense>
  );
}

