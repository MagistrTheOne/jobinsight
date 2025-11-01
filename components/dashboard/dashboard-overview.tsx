"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  FileText,
  Mail,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalApplications: number;
  interviewsCount: number;
  conversionRate: number;
  recentActivity: Array<{
    id: string;
    type: 'application' | 'analysis' | 'chat';
    title: string;
    time: string;
  }>;
}

export function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch applications stats
      const appsResponse = await fetch('/api/applications?stats=true');
      const appsData = await appsResponse.json();
      
      const appsStats = appsData.success ? appsData.stats : null;
      const interviewsCount = appsStats?.byStatus?.reduce((sum: number, s: any) => {
        if (['interview', 'technical_interview', 'final_interview'].includes(s.status)) {
          return sum + (s.count || 0);
        }
        return sum;
      }, 0) || 0;
      
      const totalApplied = appsStats?.byStatus?.find((s: any) => s.status === 'applied')?.count || 0;
      const conversionRate = totalApplied > 0 
        ? Math.round((interviewsCount / totalApplied) * 100) 
        : 0;
      
      setStats({
        totalApplications: appsStats?.total || 0,
        interviewsCount,
        conversionRate,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const quickActions = [
    {
      title: 'Analyze Job',
      description: 'Get insights on job postings',
      icon: Briefcase,
      action: () => router.push('/dashboard?tab=job-analysis'),
      color: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'Resume Analysis',
      description: 'Optimize your resume',
      icon: FileText,
      action: () => router.push('/dashboard?tab=resume-analysis'),
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Cover Letter',
      description: 'Generate ATS-optimized letters',
      icon: Mail,
      action: () => router.push('/dashboard?tab=cover-letter'),
      color: 'from-green-600 to-emerald-600',
    },
    {
      title: 'Applications',
      description: 'Track your applications',
      icon: Target,
      action: () => router.push('/dashboard?tab=applications'),
      color: 'from-orange-600 to-red-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-4">
              <Skeleton className="h-6 w-24 mb-2 bg-neutral-800" />
              <Skeleton className="h-8 w-16 bg-neutral-800" />
            </GlassCard>
          ))}
        </div>
        <GlassCard>
          <Skeleton className="h-6 w-32 mb-4 bg-neutral-800" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-neutral-800" />
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 sm:p-6 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-neutral-400 mb-1">Total Applications</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{stats?.totalApplications || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-neutral-400 mb-1">Interviews</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-400">{stats?.interviewsCount || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-600/20 to-red-600/20">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-neutral-400 mb-1">Conversion Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">{stats?.conversionRate || 0}%</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-600/20 to-emerald-600/20">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Quick Actions
            </h3>
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={cn(
                "group relative p-4 rounded-xl border border-neutral-800/50",
                "bg-gradient-to-br", action.color,
                "hover:border-neutral-700 hover:scale-105 transition-all duration-200",
                "text-left overflow-hidden"
              )}
            >
              <div className="relative z-10">
                <action.icon className="h-6 w-6 text-white mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-semibold text-white mb-1">{action.title}</h4>
                <p className="text-xs text-white/80">{action.description}</p>
              </div>
              <ArrowRight className="absolute bottom-3 right-3 h-4 w-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
        </GlassCard>

        {/* Tips & Motivation */}
        <GlassCard className="p-4 sm:p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-800/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-400" />
              Pro Tip
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-black/30 border border-purple-800/30">
              <p className="text-sm text-neutral-200 leading-relaxed">
                <strong className="text-white">Optimize your resume</strong> for each job application. 
                Use our AI-powered analysis to match keywords and improve your ATS compatibility score.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-black/30 border border-purple-800/30">
              <p className="text-sm text-neutral-200 leading-relaxed">
                <strong className="text-white">Track all applications</strong> in one place. 
                Set reminders for follow-ups and never miss an opportunity.
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard?tab=applications')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              View All Applications
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

