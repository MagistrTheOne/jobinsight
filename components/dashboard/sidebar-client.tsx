"use client";

import * as React from "react";
import { Briefcase, FileText, Mail, BarChart3, Bot, Sparkles, TrendingUp, Workflow, DollarSign, Home, History, Menu, X, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
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
        const chatsResponse = await fetch('/api/chat/history?limit=5');
        const chatsData = await chatsResponse.json();
        
        if (chatsData.success && chatsData.chats?.length > 0) {
          const activity = chatsData.chats.slice(0, 5).map((chat: any) => {
            const d = typeof chat.updatedAt === 'string' ? new Date(chat.updatedAt) : chat.updatedAt || new Date();
            const now = new Date();
            const diffMs = now.getTime() - d.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            let timeStr = 'Только что';
            if (diffMins >= 1 && diffMins < 60) timeStr = `${diffMins} мин назад`;
            else if (diffHours < 24) timeStr = `${diffHours} ч назад`;
            else if (diffDays < 7) timeStr = `${diffDays} дн назад`;
            else timeStr = d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });

            return {
              id: chat.id,
              type: 'chat' as const,
              title: chat.title || 'Новый чат',
              time: timeStr,
            };
          });
          setRecentActivity(activity);
        } else {
          setRecentActivity([]);
        }
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
        setRecentActivity([]);
      }
    };

    if (!isCollapsed) {
      fetchRecentActivity();
    }

    // Refresh on chat events
    const handleChatEvent = () => {
      setTimeout(() => fetchRecentActivity(), 100); // Small delay to ensure DB is updated
    };
    window.addEventListener('chat-created', handleChatEvent);
    window.addEventListener('chat-deleted', handleChatEvent);
    window.addEventListener('chat-updated', handleChatEvent);
    return () => {
      window.removeEventListener('chat-created', handleChatEvent);
      window.removeEventListener('chat-deleted', handleChatEvent);
      window.removeEventListener('chat-updated', handleChatEvent);
    };
  }, [isCollapsed]);

  const navItems: NavItem[] = [
    {
      title: "AI Чат",
      href: "/dashboard?tab=chat",
      icon: <Bot className="h-4 w-4" />,
    },
    {
      title: "Анализ вакансий",
      href: "/dashboard?tab=job-analysis",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      title: "Анализ резюме",
      href: "/dashboard?tab=resume-analysis",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Сопроводительное письмо",
      href: "/dashboard?tab=cover-letter",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      title: "Заявки",
      href: "/dashboard?tab=applications",
      icon: <Workflow className="h-4 w-4" />,
    },
    {
      title: "HR Автопилот",
      href: "/dashboard?tab=hr-autopilot",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      title: "Зарплата AI",
      href: "/dashboard?tab=salary-ai",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Пайплайн",
      href: "/dashboard?tab=pipeline",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      title: "Продвинутые инструменты",
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
      {/* Logo/Header - Compact */}
      <div className={cn(
        "border-b border-white/5 flex items-center justify-between",
        isCollapsed ? "p-3" : "p-3 sm:p-4"
      )}>
        <Link 
          href="/dashboard?tab=chat" 
          className={cn(
            "flex items-center gap-2.5 group transition-all",
            isCollapsed && "justify-center w-full"
          )}
          onClick={() => setMobileOpen(false)}
        >
          <div className="p-1.5 rounded-md bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
            <Bot className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sm text-white">JobInsight</h2>
              <p className="text-xs text-neutral-500">AI</p>
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-7 w-7 text-neutral-500 hover:text-white hover:bg-white/5"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-7 w-7 text-neutral-500 hover:text-white hover:bg-white/5"
          >
            <ChevronRight className="h-3.5 w-3.5" />
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
                    "w-full flex items-center rounded-md text-xs font-medium transition-all relative",
                    "hover:bg-white/5 hover:text-white",
                    isActive
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-neutral-400 border border-transparent",
                    isCollapsed 
                      ? "justify-center px-2 py-2" 
                      : "gap-2.5 px-2.5 py-2"
                  )}
                >
                  <div className="flex items-center shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5">
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">
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

        <Separator className="my-3 bg-white/5" />

        {/* Quick Actions */}
        <TooltipProvider delayDuration={300}>
          <div className="space-y-1">
            {[
              { icon: Home, label: 'На главную', action: () => { router.push('/landing'); setMobileOpen(false); } },
              { icon: History, label: 'История', action: () => { router.push('/dashboard?tab=history'); setMobileOpen(false); } }
            ].map((item, index) => {
              const button = (
                <button
                  key={index}
                  onClick={item.action}
                  className={cn(
                    "w-full flex items-center rounded-md text-xs font-medium text-neutral-500 hover:bg-white/5 hover:text-white transition-all",
                    isCollapsed 
                      ? "justify-center px-2 py-2" 
                      : "gap-2.5 px-2.5 py-2"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
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

      {/* Recent Activity - Compact, only show when not collapsed */}
      {!isCollapsed && (
        <>
          <Separator className="bg-white/5" />
          <div className="px-2.5 py-2.5">
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-neutral-500" />
                <h3 className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                  Recent
                </h3>
              </div>
              <button
                onClick={() => {
                  router.push('/dashboard?tab=chat');
                  window.dispatchEvent(new Event('chat-create-new'));
                }}
                className="p-1 rounded hover:bg-white/5 transition-colors group"
                title="Новый чат"
              >
                <Plus className="h-3 w-3 text-neutral-500 group-hover:text-white transition-colors" />
              </button>
            </div>
            {recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="group relative w-full flex items-center gap-2 p-1.5 rounded-md bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (activity.type === 'chat') {
                          router.push(`/dashboard?tab=chat&chatId=${activity.id}`);
                          setMobileOpen(false);
                          // Dispatch event to load chat
                          window.dispatchEvent(new CustomEvent('chat-selected', { detail: { chatId: activity.id } }));
                        }
                      }}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <div className="p-1 rounded bg-blue-500/20 shrink-0">
                        <Sparkles className="h-2.5 w-2.5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-[10px] text-neutral-500">{activity.time}</p>
                      </div>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm('Удалить этот чат?')) return;
                        try {
                          const res = await fetch(`/api/chat/history/${activity.id}`, {
                            method: 'DELETE',
                          });
                          if (res.ok) {
                            setRecentActivity(prev => prev.filter(a => a.id !== activity.id));
                            window.dispatchEvent(new Event('chat-deleted'));
                          }
                        } catch (error) {
                          console.error('Failed to delete chat:', error);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-neutral-500 hover:text-red-400 transition-all shrink-0"
                      title="Удалить чат"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-[10px] text-neutral-600">Нет недавних чатов</p>
                <button
                  onClick={() => {
                    router.push('/dashboard?tab=chat');
                    window.dispatchEvent(new Event('chat-create-new'));
                  }}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Создать новый чат
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer - Compact */}
      <div className={cn(
        "border-t border-white/5 space-y-2",
        isCollapsed ? "p-2" : "p-2.5"
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
          "hidden lg:flex h-screen flex-col bg-black/60 backdrop-blur-2xl border-r border-white/5 fixed left-0 top-0 z-40 transition-all duration-300",
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
