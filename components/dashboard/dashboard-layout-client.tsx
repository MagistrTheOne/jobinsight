"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar-client";
import { DashboardNavbar } from "@/components/dashboard/navbar-client";
import { KeyboardShortcuts } from "@/components/dashboard/keyboard-shortcuts";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true' ? 64 : 256;
    }
    return 256;
  });

  useEffect(() => {
    const handleSidebarToggle = () => {
      const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      setSidebarWidth(isCollapsed ? 64 : 256);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle);
  }, []);

  return (
    <>
      <KeyboardShortcuts />
      <div className="flex h-screen bg-black overflow-hidden">
        {/* Sidebar - Fixed on desktop, Sheet on mobile */}
        <DashboardSidebar />
        
      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{ marginLeft: `clamp(0px, ${sidebarWidth}px, 100vw)` }}
      >
          {/* Navbar */}
          <DashboardNavbar />
          
          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

