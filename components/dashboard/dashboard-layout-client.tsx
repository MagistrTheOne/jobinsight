"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar-client";
import { DashboardNavbar } from "@/components/dashboard/navbar-client";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar - Fixed on desktop, Sheet on mobile */}
      <DashboardSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Navbar */}
        <DashboardNavbar />
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

