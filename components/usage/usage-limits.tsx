"use client";

import { useEffect, useState, useCallback } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Infinity, FileText, Briefcase, Mail } from 'lucide-react';

interface UsageData {
  plan: 'free' | 'pro' | 'enterprise';
  resume: { used: number; limit: number; remaining: number };
  job: { used: number; limit: number; remaining: number };
  coverLetter: { used: number; limit: number; remaining: number };
  periodStart: string;
}

export function UsageLimits() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/usage/limits');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      } else {
        // Use fallback values for free plan on error
        setUsage({
          plan: 'free',
          resume: { used: 0, limit: 5, remaining: 5 },
          job: { used: 0, limit: 5, remaining: 5 },
          coverLetter: { used: 0, limit: 3, remaining: 3 },
          periodStart: new Date().toISOString(),
        });
        setError(null);
      }
    } catch (err) {
      // Silently handle error - use fallback values
      setUsage({
        plan: 'free',
        resume: { used: 0, limit: 5, remaining: 5 },
        job: { used: 0, limit: 5, remaining: 5 },
        coverLetter: { used: 0, limit: 3, remaining: 3 },
        periodStart: new Date().toISOString(),
      });
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  // Expose refresh function for parent components
  useEffect(() => {
    // Listen for custom events to refresh usage
    const handleRefresh = () => fetchUsage();
    window.addEventListener('usage-refresh', handleRefresh);
    return () => window.removeEventListener('usage-refresh', handleRefresh);
  }, []);

  if (isLoading) {
    return (
      <GlassCard className="p-3 bg-neutral-950/60 backdrop-blur-sm border border-neutral-800/50">
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading usage...</span>
        </div>
      </GlassCard>
    );
  }

  if (!usage) {
    return null;
  }

  // Pro and Enterprise users see unlimited badge
  if (usage.plan === 'pro' || usage.plan === 'enterprise') {
    const planName = usage.plan === 'enterprise' ? 'Enterprise' : 'Pro';
    const badgeClass = usage.plan === 'enterprise' 
      ? 'bg-linear-to-r from-purple-600 to-pink-600' 
      : 'bg-linear-to-r from-blue-600 to-purple-600';
    
    return (
      <GlassCard className="p-3 bg-neutral-950/60 backdrop-blur-sm border border-neutral-800/50">
        <Badge className={`${badgeClass} text-white border-0`}>
          <Infinity className="h-3 w-3 mr-1" />
          {planName} - Unlimited
        </Badge>
      </GlassCard>
    );
  }

  // Free users see usage stats
  const UsageItem = ({ 
    icon: Icon, 
    label, 
    used, 
    limit, 
    remaining 
  }: { 
    icon: any; 
    label: string; 
    used: number; 
    limit: number; 
    remaining: number;
  }) => {
    // Handle unlimited (limit = -1)
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : (used / limit) * 100;
    const isNearLimit = !isUnlimited && percentage >= 80;
    
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Icon className="h-3 w-3" />
            <span>{label}</span>
          </div>
          <span className={`font-medium ${isNearLimit ? 'text-amber-400' : 'text-neutral-400'}`}>
            {isUnlimited ? '∞' : `${used}/${limit}`}
          </span>
        </div>
        {!isUnlimited && (
          <Progress 
            value={percentage} 
            className={`h-1.5 ${isNearLimit ? 'bg-amber-900/30' : ''}`}
          />
        )}
      </div>
    );
  };

  return (
    <GlassCard className="p-3 bg-neutral-950/60 backdrop-blur-sm border border-neutral-800/50">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-300">Месячное использование</span>
          <Badge variant="outline" className="text-xs border-neutral-700/50 text-neutral-400 capitalize">
            {usage.plan === 'free' ? 'Бесплатный' : usage.plan === 'pro' ? 'Pro' : usage.plan === 'enterprise' ? 'Enterprise' : 'Free'} план
          </Badge>
        </div>
        
        <UsageItem
          icon={FileText}
          label="Resume"
          used={usage.resume.used}
          limit={usage.resume.limit}
          remaining={usage.resume.remaining}
        />
        
        <UsageItem
          icon={Briefcase}
          label="Job"
          used={usage.job.used}
          limit={usage.job.limit}
          remaining={usage.job.remaining}
        />
        
        <UsageItem
          icon={Mail}
          label="Cover Letter"
          used={usage.coverLetter.used}
          limit={usage.coverLetter.limit}
          remaining={usage.coverLetter.remaining}
        />
      </div>
    </GlassCard>
  );
}

