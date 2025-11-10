"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  FileText,
  Briefcase,
  Bot,
  Mail,
  BarChart3,
  TrendingUp,
  Workflow,
  DollarSign,
  History,
  Settings,
  User,
  Sparkles,
  Search,
  Plus,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [search, setSearch] = React.useState("");

  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  const navigationItems = [
    {
      icon: Bot,
      label: "AI Чат",
      shortcut: "C",
      command: () => router.push("/dashboard?tab=chat"),
    },
    {
      icon: Briefcase,
      label: "Анализ вакансии",
      shortcut: "J",
      command: () => router.push("/dashboard?tab=job-analysis"),
    },
    {
      icon: FileText,
      label: "Анализ резюме",
      shortcut: "R",
      command: () => router.push("/dashboard?tab=resume-analysis"),
    },
    {
      icon: Mail,
      label: "Cover Letter",
      shortcut: "L",
      command: () => router.push("/dashboard?tab=cover-letter"),
    },
    {
      icon: BarChart3,
      label: "Приложения",
      shortcut: "A",
      command: () => router.push("/dashboard?tab=applications"),
    },
    {
      icon: Workflow,
      label: "HR Autopilot",
      shortcut: "H",
      command: () => router.push("/dashboard?tab=hr-autopilot"),
    },
    {
      icon: DollarSign,
      label: "Зарплатные переговоры",
      shortcut: "S",
      command: () => router.push("/dashboard?tab=salary-ai"),
    },
    {
      icon: TrendingUp,
      label: "Pipeline Automation",
      shortcut: "P",
      command: () => router.push("/dashboard?tab=pipeline"),
    },
    {
      icon: History,
      label: "История анализов",
      shortcut: "I",
      command: () => router.push("/dashboard?tab=history"),
    },
  ];

  const actionItems = [
    {
      icon: Plus,
      label: "Новый чат",
      shortcut: "N",
      command: () => {
        router.push("/dashboard?tab=chat");
        setTimeout(() => {
          window.dispatchEvent(new Event("chat-create-new"));
        }, 100);
      },
    },
    {
      icon: FileText,
      label: "Создать резюме",
      shortcut: "CR",
      command: () => router.push("/dashboard?tab=resume-builder"),
    },
    {
      icon: Search,
      label: "Поиск по приложениям",
      shortcut: "F",
      command: () => {
        router.push("/dashboard?tab=applications");
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="поиск" i]') as HTMLInputElement;
          searchInput?.focus();
        }, 100);
      },
    },
  ];

  const settingsItems = [
    {
      icon: User,
      label: "Профиль",
      shortcut: "U",
      command: () => router.push("/dashboard?tab=profile"),
    },
    {
      icon: Settings,
      label: "Настройки",
      shortcut: ",",
      command: () => router.push("/dashboard?tab=settings"),
    },
  ];

  const filteredNavigation = navigationItems.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );
  const filteredActions = actionItems.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSettings = settingsItems.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Поиск команд и навигация..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[500px]">
        <CommandEmpty>Ничего не найдено.</CommandEmpty>
        
        {filteredNavigation.length > 0 && (
          <>
            <CommandGroup heading="Навигация">
              {filteredNavigation.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={() => runCommand(item.command)}
                  className={`cursor-pointer ${item.label === 'AI Чат' ? 'bg-linear-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 hover:border-blue-400/50 shadow-lg shadow-blue-500/10' : ''}`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {filteredActions.length > 0 && (
          <>
            <CommandGroup heading="Действия">
              {filteredActions.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={() => runCommand(item.command)}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {filteredSettings.length > 0 && (
          <CommandGroup heading="Настройки">
            {filteredSettings.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => runCommand(item.command)}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

