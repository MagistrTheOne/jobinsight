"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Bell, Command, Menu, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatSidebar } from "@/components/chat/chat-sidebar";

import { UsageLimits } from "@/components/usage/usage-limits";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LanguageToggle } from "@/components/dashboard/language-toggle";
import { LandingToggle } from "@/components/dashboard/landing-toggle";

export function DashboardNavbar() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [chatSidebarOpen, setChatSidebarOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'chat';

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // --- CMD + K / CMD + L shortcut ---
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "k" || e.key.toLowerCase() === "l")) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search:", searchQuery);
  };

  const handleNavigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleChatSelect = (chatId: string | null) => {
    setChatSidebarOpen(false);
    // Dispatch event to AIChat component
    window.dispatchEvent(new CustomEvent('chat-selected', { detail: { chatId } }));
  };

  return (
    <div className="bg-black/60 backdrop-blur-2xl border-b border-white/5">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Main Navbar */}
      <div className="h-10 sm:h-11 flex items-center justify-center px-2 sm:px-4 md:px-6 gap-2 sm:gap-3 border-t border-white/5">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl min-w-0 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 sm:pl-10 pr-2 sm:pr-3 h-8 sm:h-9 text-xs sm:text-sm bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-white/20 focus:ring-1 focus:ring-white/10 w-full backdrop-blur-sm"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Chat Sidebar Toggle - Mobile Only */}
          {activeTab === 'chat' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatSidebarOpen(true)}
              className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
            >
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          )}

          <div className="lg:hidden">
            <UsageLimits />
          </div>

          <div className="hidden sm:block">
            <LanguageToggle />
          </div>

          <ThemeToggle />

          <div className="hidden md:block">
            <LandingToggle />
          </div>

          {/* CMD+K / CMD+L Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="h-8 w-8 sm:h-9 sm:w-9 bg-white/5 border border-white/10 hover:bg-white/10 text-white relative"
            title="Командная палитра (Cmd+K / Cmd+L)"
          >
            <Command className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="absolute -top-1 -right-1 text-[8px] font-bold text-white bg-blue-600 rounded px-0.5">K</span>
          </Button>

          {/* Notifications */}
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                >
                  <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 sm:w-72 bg-black/95 backdrop-blur-xl border-white/10">
                <DropdownMenuLabel className="text-xs text-white">Уведомления</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <div className="p-4 text-center text-xs text-neutral-500">
                  Нет новых уведомлений
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 bg-white/5 border border-white/10 hover:bg-white/10 text-white">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Command Palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Быстрые действия или переход..." />
        <CommandList>
          <CommandEmpty>Ничего не найдено.</CommandEmpty>
          <CommandGroup heading="Навигация">
            <CommandItem onSelect={() => handleNavigate("/dashboard")}>
              <Menu className="mr-2 h-4 w-4" /> Панель управления
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/projects")}>
              <Menu className="mr-2 h-4 w-4" /> Проекты
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/team")}>
              <Menu className="mr-2 h-4 w-4" /> Команда
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/settings")}>
              <Menu className="mr-2 h-4 w-4" /> Настройки
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Системные">
            <CommandItem onSelect={() => setOpen(false)}>
              <Command className="mr-2 h-4 w-4" /> Закрыть палитру
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Chat Sidebar Modal - Mobile Only */}
      <Dialog open={chatSidebarOpen} onOpenChange={setChatSidebarOpen}>
        <DialogContent className="w-[90vw] max-w-sm h-[80vh] bg-black/95 border-white/10 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>История чатов</DialogTitle>
          </DialogHeader>
          <ChatSidebar
            onSelectChat={handleChatSelect}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
