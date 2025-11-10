"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "./sidebar-client";
import { DashboardNavbar } from "./navbar-client";
import { cn } from "@/lib/utils";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export default function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize collapsed state from localStorage after mount
    const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    setIsCollapsed(collapsed);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleSidebarToggle = () => {
      if (typeof window !== 'undefined') {
        setIsCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
      }
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle);
  }, [mounted]);

  return (
    <div className="flex min-h-dvh w-full bg-black overflow-safe">
      <DashboardSidebar />
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all duration-300 w-full",
          // Mobile: sidebar скрыт, контент на всю ширину
          // Desktop: контент смещается в зависимости от состояния sidebar
          mounted && (isCollapsed ? "lg:ml-16 xl:ml-20 2xl:ml-24" : "lg:ml-64 xl:ml-72 2xl:ml-80")
        )}
      >
        <DashboardNavbar />
        <main className="flex-1 overflow-hidden bg-black w-full container-global">
          {children}
        </main>
      </div>
    </div>
  );
}
