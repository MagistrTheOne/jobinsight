"use client";

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, Bot, Briefcase, FileText, Mail, Workflow, Sparkles, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabConfig: Record<string, { label: string; icon: React.ReactNode; path: string }> = {
  chat: { label: 'AI Чат', icon: <Bot className="h-4 w-4" />, path: '/dashboard?tab=chat' },
  'job-analysis': { label: 'Анализ вакансий', icon: <Briefcase className="h-4 w-4" />, path: '/dashboard?tab=job-analysis' },
  'resume-analysis': { label: 'Анализ резюме', icon: <FileText className="h-4 w-4" />, path: '/dashboard?tab=resume-analysis' },
  'cover-letter': { label: 'Сопроводительное письмо', icon: <Mail className="h-4 w-4" />, path: '/dashboard?tab=cover-letter' },
  applications: { label: 'Заявки', icon: <Workflow className="h-4 w-4" />, path: '/dashboard?tab=applications' },
  'hr-autopilot': { label: 'HR Автопилот', icon: <Sparkles className="h-4 w-4" />, path: '/dashboard?tab=hr-autopilot' },
  'salary-ai': { label: 'Зарплата AI', icon: <DollarSign className="h-4 w-4" />, path: '/dashboard?tab=salary-ai' },
  pipeline: { label: 'Пайплайн', icon: <TrendingUp className="h-4 w-4" />, path: '/dashboard?tab=pipeline' },
  advanced: { label: 'Продвинутые инструменты', icon: <BarChart3 className="h-4 w-4" />, path: '/dashboard?tab=advanced' },
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'chat';

  // Don't show breadcrumbs on landing or auth pages
  if (pathname?.startsWith('/auth') || pathname === '/landing' || pathname === '/') {
    return null;
  }

  const currentTab = tabConfig[activeTab] || tabConfig.chat;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-neutral-400 px-4 sm:px-6 py-2 border-b border-white/5 bg-black/40 backdrop-blur-sm">
      <Link
        href="/dashboard?tab=chat"
        className="flex items-center gap-1.5 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline font-medium">Дашборд</span>
      </Link>
      <ChevronRight className="h-3 w-3 text-neutral-600" />
      <div className="flex items-center gap-2 text-white px-2 py-1 rounded-md bg-white/5 border border-white/10">
        <div className="flex items-center gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5">
          {currentTab.icon}
          <span className="font-semibold text-xs">{currentTab.label}</span>
        </div>
      </div>
    </nav>
  );
}

