"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, Bot, Briefcase, FileText, Mail, Workflow, Sparkles, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabConfig: Record<string, { label: string; icon: React.ReactNode; path: string }> = {
  chat: { label: 'AI Chat', icon: <Bot className="h-4 w-4" />, path: '/dashboard?tab=chat' },
  'job-analysis': { label: 'Job Analysis', icon: <Briefcase className="h-4 w-4" />, path: '/dashboard?tab=job-analysis' },
  'resume-analysis': { label: 'Resume Analysis', icon: <FileText className="h-4 w-4" />, path: '/dashboard?tab=resume-analysis' },
  'cover-letter': { label: 'Cover Letter', icon: <Mail className="h-4 w-4" />, path: '/dashboard?tab=cover-letter' },
  applications: { label: 'Applications', icon: <Workflow className="h-4 w-4" />, path: '/dashboard?tab=applications' },
  'hr-autopilot': { label: 'HR Autopilot', icon: <Sparkles className="h-4 w-4" />, path: '/dashboard?tab=hr-autopilot' },
  'salary-ai': { label: 'Salary AI', icon: <DollarSign className="h-4 w-4" />, path: '/dashboard?tab=salary-ai' },
  pipeline: { label: 'Pipeline', icon: <TrendingUp className="h-4 w-4" />, path: '/dashboard?tab=pipeline' },
  advanced: { label: 'Advanced Tools', icon: <BarChart3 className="h-4 w-4" />, path: '/dashboard?tab=advanced' },
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
    <nav className="flex items-center gap-2 text-sm text-neutral-400 px-4 py-2">
      <Link
        href="/dashboard?tab=chat"
        className="flex items-center gap-1.5 hover:text-white transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
      <ChevronRight className="h-4 w-4 text-neutral-600" />
      <div className="flex items-center gap-1.5 text-white">
        <div className="flex items-center gap-1.5">
          {currentTab.icon}
          <span className="font-medium">{currentTab.label}</span>
        </div>
      </div>
    </nav>
  );
}

