"use client"

import * as React from "react"
import {
  Briefcase, FileText, Mail, BarChart3, Bot, Sparkles, TrendingUp,
  Workflow, DollarSign, Home, History, Menu, X, ChevronLeft, ChevronRight,
  Clock, Plus, User, FileCheck
} from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/auth-store"
import { UsageLimits } from "@/components/usage/usage-limits"
import { UserButton } from "@/components/auth/user-button"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function DashboardSidebar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const activeTab = searchParams.get("tab") || "chat"
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true"
    }
    return false
  })
  const [recentActivity, setRecentActivity] = React.useState<
    { id: string; type: "chat"; title: string; time: string }[]
  >([])

  React.useEffect(() => setMounted(true), [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", String(newState))
      window.dispatchEvent(new Event("sidebar-toggle"))
    }
  }

  React.useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const res = await fetch("/api/chat/history?limit=5")
        const data = await res.json()
        if (data.success && data.chats?.length) {
          const mapped = data.chats.slice(0, 5).map((chat: any) => {
            const d = new Date(chat.updatedAt)
            const now = new Date()
            const diff = now.getTime() - d.getTime()
            const mins = Math.floor(diff / 60000)
            const hrs = Math.floor(diff / 3600000)
            const days = Math.floor(diff / 86400000)
            let t = "Только что"
            if (mins >= 1 && mins < 60) t = `${mins} мин назад`
            else if (hrs < 24) t = `${hrs} ч назад`
            else if (days < 7) t = `${days} дн назад`
            else t = d.toLocaleDateString("ru-RU", { month: "short", day: "numeric" })
            return { id: chat.id, type: "chat", title: chat.title || "Новый чат", time: t }
          })
          setRecentActivity(mapped)
        }
      } catch (e) {
        console.error(e)
      }
    }
    if (!isCollapsed) fetchRecentActivity()
    window.addEventListener("chat-created", fetchRecentActivity)
    window.addEventListener("chat-deleted", fetchRecentActivity)
    window.addEventListener("chat-updated", fetchRecentActivity)
    return () => {
      window.removeEventListener("chat-created", fetchRecentActivity)
      window.removeEventListener("chat-deleted", fetchRecentActivity)
      window.removeEventListener("chat-updated", fetchRecentActivity)
    }
  }, [isCollapsed])

  const navItems = [
    { title: "AI Чат", href: "/dashboard?tab=chat", icon: <Bot className="h-4 w-4" /> },
    { title: "Анализ вакансий", href: "/dashboard?tab=job-analysis", icon: <Briefcase className="h-4 w-4" /> },
    { title: "Анализ резюме", href: "/dashboard?tab=resume-analysis", icon: <FileText className="h-4 w-4" /> },
    { title: "Сопроводительное письмо", href: "/dashboard?tab=cover-letter", icon: <Mail className="h-4 w-4" /> },
    { title: "Заявки", href: "/dashboard?tab=applications", icon: <Workflow className="h-4 w-4" /> },
    { title: "HR Автопилот", href: "/dashboard?tab=hr-autopilot", icon: <Sparkles className="h-4 w-4" /> },
    { title: "Зарплата AI", href: "/dashboard?tab=salary-ai", icon: <DollarSign className="h-4 w-4" /> },
    { title: "Резюме Builder", href: "/dashboard?tab=resume-builder", icon: <FileCheck className="h-4 w-4" />, badge: "NEW" },
    { title: "Профиль", href: "/dashboard?tab=profile", icon: <User className="h-4 w-4" /> },
    { title: "Пайплайн", href: "/dashboard?tab=pipeline", icon: <TrendingUp className="h-4 w-4" /> },
    { title: "Продвинутые инструменты", href: "/dashboard?tab=advanced", icon: <BarChart3 className="h-4 w-4" /> },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setMobileOpen(false)
  }

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className={cn("border-b border-white/5 flex items-center justify-between",
        isCollapsed ? "p-3" : "p-3 sm:p-4")}>
        <Link 
          href="/dashboard?tab=chat" 
          className={cn("flex items-center gap-2.5 group transition-all",
            isCollapsed && "justify-center w-full")}
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
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-7 w-7 text-neutral-500 hover:text-white hover:bg-white/5"
          >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </Button>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
        <TooltipProvider delayDuration={300}>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.href.split("tab=")[1]
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                        "relative w-full flex items-center rounded-md text-[11px] sm:text-xs font-medium transition-all duration-200 ease-out",
                    "hover:bg-white/5 hover:text-white",
                    isActive
                          ? "text-white before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[2px] before:rounded-r before:bg-linear-to-b before:from-blue-500/70 before:to-purple-500/70"
                          : "text-neutral-400",
                    isCollapsed 
                          ? "justify-center px-2 py-1.5"
                          : "gap-2 px-2.5 py-1.5"
                  )}
                >
                      <div className="flex items-center shrink-0 [&_svg]:h-3 w-3 sm:[&_svg]:h-3.5 sm:[&_svg]:w-3.5">{item.icon}</div>
                  {!isCollapsed && (
                    <>
                          <span className="truncate font-semibold">{item.title}</span>
                      {item.badge && (
                            <span className="ml-auto px-1 py-0.5 text-[10px] rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
                    </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="bg-neutral-900 border-neutral-800 text-white">
                      <p>{item.title}</p>
                    </TooltipContent>
                  )}
                  </Tooltip>
              )
            })}
          </nav>
        </TooltipProvider>

        <Separator className="my-3 bg-white/5" />

        {/* Recent */}
      {!isCollapsed && (
          <div className="px-1.5 py-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 text-neutral-500">
                <Clock className="h-3 w-3" />
                <h3 className="text-[10px] font-medium uppercase tracking-wider">Recent</h3>
              </div>
              <button
                onClick={() => {
                  const u = new URL(window.location.href)
                  u.searchParams.set("tab", "chat")
                  u.searchParams.delete("chatId")
                  router.push(u.toString())
                  setTimeout(() => window.dispatchEvent(new Event("chat-create-new")), 100)
                }}
                className="p-1 rounded hover:bg-white/5 transition-colors group"
              >
                <Plus className="h-3 w-3 text-neutral-500 group-hover:text-white" />
              </button>
            </div>

            {recentActivity.length ? (
              <div className="space-y-1">
                {recentActivity.map((a) => (
                  <div key={a.id}
                    className="group flex items-center gap-2 p-1.5 rounded-md bg-white/3 hover:bg-white/5 transition-all duration-200 ease-out hover:scale-[1.02]">
                    <button
                      onClick={() => {
                        router.push(`/dashboard?tab=chat&chatId=${a.id}`)
                        window.dispatchEvent(new CustomEvent("chat-selected", { detail: { chatId: a.id } }))
                        setMobileOpen(false)
                      }}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      <div className="p-1 rounded bg-blue-500/20 shrink-0">
                        <Sparkles className="h-2.5 w-2.5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{a.title}</p>
                        <p className="text-[10px] text-neutral-500">{a.time}</p>
                      </div>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (!confirm("Удалить чат?")) return
                        await fetch(`/api/chat/history/${a.id}`, { method: "DELETE" })
                        setRecentActivity((p) => p.filter((x) => x.id !== a.id))
                        window.dispatchEvent(new Event("chat-deleted"))
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-neutral-500 hover:text-red-400 transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-[10px] text-neutral-600">Нет недавних чатов</div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed ? (
        <div className="border-t border-white/5 p-2.5 space-y-2">
          <div className="hidden sm:block">
            <UsageLimits />
          </div>
          <div className="flex justify-start">
            <UserButton />
          </div>
        </div>
      ) : (
        <div className="border-t border-white/5 p-2 flex justify-center">
          <UserButton />
        </div>
      )}
    </>
  )

  return (
    <>
      {mounted && (
      <aside 
        className={cn(
            "hidden lg:flex h-screen flex-col bg-black/50 backdrop-blur-lg border-r border-white/5 fixed left-0 top-0 z-40 transition-[width] duration-300 ease-in-out",
            isCollapsed ? "w-16 xl:w-20 2xl:w-24" : "w-64 xl:w-72 2xl:w-80"
        )}
      >
        <SidebarContent />
      </aside>
      )}

      {/* Mobile */}
      <div className="lg:hidden">
        {mounted ? (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
                className="fixed top-4 left-4 z-50 bg-black/60 backdrop-blur-sm border border-neutral-800/50 hover:bg-neutral-800/50"
            >
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-64 md:w-72 lg:w-80 p-0 bg-black/90 backdrop-blur-lg border-neutral-800/50">
              <SidebarContent />
          </SheetContent>
        </Sheet>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 bg-black/60 backdrop-blur-sm border border-neutral-800/50 hover:bg-neutral-800/50"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5 text-white" />
          </Button>
        )}
      </div>
    </>
  )
}
