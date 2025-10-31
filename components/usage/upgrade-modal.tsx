"use client";

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Sparkles, X } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType?: 'resume' | 'job' | 'cover-letter';
  used?: number;
  limit?: number;
}

const limitLabels = {
  resume: 'Resume Analysis',
  job: 'Job Analysis',
  'cover-letter': 'Cover Letter Generation',
};

export function UpgradeModal({
  open,
  onOpenChange,
  limitType = 'resume',
  used = 0,
  limit = 0,
}: UpgradeModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push('/landing#pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-950/95 backdrop-blur-md border border-neutral-800/50 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Usage Limit Reached
          </DialogTitle>
          <DialogDescription className="text-neutral-400 pt-2">
            You've used all {limit} of your monthly {limitLabels[limitType]} on the Free plan.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-neutral-900/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-300">{limitLabels[limitType]}</span>
              <span className="font-medium text-amber-400">{used}/{limit}</span>
            </div>
            <div className="text-xs text-neutral-500">
              Upgrade to Pro for unlimited access to all features.
            </div>
          </div>

          <div className="space-y-2 text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Unlimited resume analyses</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Unlimited job analyses</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Unlimited cover letters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Priority AI processing</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto border-neutral-800/50 hover:bg-neutral-900/50"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

