"use client";

import * as React from "react";
import { Briefcase, FileText, Mail, BarChart3, Bot, Sparkles, TrendingUp, Workflow, DollarSign, Home, History, Menu, X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth-store";
import { UsageLimits } from "@/components/usage/usage-limits";
import { UserButton } from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export function DashboardSidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const activeTab = searchParams.get('tab') || 'chat';
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    type: 'application' | 'analysis' | 'chat';
    title: string;
    time: string;
  }>>([]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(newState));
      window.dispatchEvent(new Event('sidebar-toggle'));
    }
  };

  useEffect(() => {
    // Fetch recent activity
    const fetchRecentActivity = async () => {
      try {
        const chatsResponse = await fetch('/api/chat/history?limit=3');
        const chatsData = await chatsResponse.json();
        
        if (chatsData.success && chatsData.chats?.length > 0) {
          const activity = chatsData.chats.slice(0, 3).map((chat: any) => {
            const d = typeof chat.updatedAt === 'string' ? new Date(chat.updatedAt) : chat.updatedAt || new Date();
            const now = new Date();
            const diffMs = now.getTime() - d.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            let timeStr = 'Just now';
            if (diffMins >= 1 && diffMins < 60) timeStr = `${diffMins}m ago`;
            else if (diffHours < 24) timeStr = `${diffHours}h ago`;
            else if (diffDays < 7) timeStr = `${diffDays}d ago`;
            else timeStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return {
              id: chat.id,
              type: 'chat' as const,
              title: chat.title || 'Chat conversation',
              time: timeStr,
            };
          });
          setRecentActivity(activity);
        }
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      }
    };

    if (!isCollapsed) {
      fetchRecentActivity();
    }
  }, [isCollapsed]);

  const navItems: NavItem[] = [
    {
      title: "AI Chat",
      href: "/dashboard?tab=chat",
      icon: <Bot className="h-4 w-4" />,
    },
    {
      title: "Job Analysis",
      href: "/dashboard?tab=job-analysis",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      title: "Resume Analysis",
      href: "/dashboard?tab=resume-analysis",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Cover Letter",
      href: "/dashboard?tab=cover-letter",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      title: "Applications",
      href: "/dashboard?tab=applications",
      icon: <Workflow className="h-4 w-4" />,
    },
    {
      title: "HR Autopilot",
      href: "/dashboard?tab=hr-autopilot",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      title: "Salary AI",
      href: "/dashboard?tab=salary-ai",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Pipeline",
      href: "/dashboard?tab=pipeline",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      title: "Advanced Tools",
      href: "/dashboard?tab=advanced",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo/Header */}
      <div className={cn(
        "border-b border-neutral-800/50 flex items-center justify-between",
        isCollapsed ? "p-4" : "p-4 sm:p-6"
      )}>
        <Link 
          href="/dashboard?tab=chat" 
          className={cn(
            "flex items-center gap-2 group transition-all",
            isCollapsed && "justify-center"
          )}
          onClick={() => setMobileOpen(false)}
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-500 transition-all">
            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">JobInsight</h2>
              <p className="text-xs text-neutral-400 hidden sm:block">AI Assistant</p>
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800/50 mx-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 sm:px-3 py-4">
        <TooltipProvider delayDuration={300}>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.href.split('tab=')[1];
              const button = (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center rounded-lg text-xs sm:text-sm font-medium transition-all relative",
                    "hover:bg-neutral-800/50 hover:text-white",
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                      : "text-neutral-400",
                    isCollapsed 
                      ? "justify-center px-2 py-2.5" 
                      : "gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5"
                  )}
                >
                  <div className="flex items-center">
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-blue-600/20 text-blue-400">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {button}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-neutral-900 border-neutral-800 text-white">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </nav>
        </TooltipProvider>

        <Separator className="my-4 bg-neutral-800/50" />

        {/* Quick Actions */}
        <TooltipProvider delayDuration={300}>
          <div className="space-y-1">
            {[
              { icon: Home, label: 'Back to Landing', action: () => { router.push('/landing'); setMobileOpen(false); } },
              { icon: History, label: 'History', action: () => { router.push('/dashboard?tab=history'); setMobileOpen(false); } }
            ].map((item, index) => {
              const button = (
                <button
                  key={index}
                  onClick={item.action}
                  className={cn(
                    "w-full flex items-center rounded-lg text-xs sm:text-sm font-medium text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-all",
                    isCollapsed 
                      ? "justify-center px-2 py-2.5" 
                      : "gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5"
                  )}
                >
                  <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      {button}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-neutral-900 border-neutral-800 text-white">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </div>
        </TooltipProvider>
      </ScrollArea>

      {/* Recent Activity - only show when not collapsed */}
      {!isCollapsed && (
        <>
          <Separator className="bg-neutral-800/50" />
          <div className="px-2 sm:px-3 py-3">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Recent Activity
              </h3>
            </div>
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => {
                      if (activity.type === 'chat') {
                        router.push('/dashboard?tab=chat');
                      }
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/50 hover:border-neutral-700/50 hover:bg-neutral-900/70 transition-colors text-left group"
                  >
                    <div className="p-1.5 rounded bg-blue-600/20 flex-shrink-0">
                      <Sparkles className="h-3 w-3 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-xs text-neutral-500">{activity.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-neutral-500">
                <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No recent activity</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer with Usage Limits and User Button */}
      <div className={cn(
        "border-t border-neutral-800/50 space-y-2 sm:space-y-3",
        isCollapsed ? "p-2" : "p-3 sm:p-4"
      )}>
        {/* Usage Limits - Compact Version */}
        {!isCollapsed && (
          <div className="hidden sm:block">
            <UsageLimits />
          </div>
        )}
        
        {/* User Button */}
        <div className={cn("flex", isCollapsed ? "justify-center" : "justify-start")}>
          <UserButton />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex h-screen flex-col bg-black/40 backdrop-blur-xl border-r border-neutral-800/50 fixed left-0 top-0 z-40 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Sheet */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 lg:hidden bg-black/60 backdrop-blur-sm border border-neutral-800/50 hover:bg-neutral-800/50"
            >
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-black/95 backdrop-blur-xl border-neutral-800/50">
            <div className="flex flex-col h-full">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
