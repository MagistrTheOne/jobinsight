"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "./sidebar-client";
import { DashboardNavbar } from "./navbar-client";
import { cn } from "@/lib/utils";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export default function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const handleSidebarToggle = () => {
      if (typeof window !== 'undefined') {
        setIsCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
      }
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle);
  }, []);

  return (
    <div className="flex min-h-dvh w-full bg-black">
      <DashboardSidebar />
      <div 
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all duration-300",
          isCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <DashboardNavbar />
        <main className="flex-1 overflow-hidden bg-black w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
