"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { Loader as Loader2, Link, CircleAlert as AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onAnalyze, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a job posting URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com/job)');
      return;
    }

    onAnalyze(url);
  };

  return (
    <GlassCard className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-white">
            Job Posting Analysis
          </h2>
          <p className="text-gray-300">
            Paste a job posting URL to get AI-powered insights and red flag analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-url" className="text-sm font-medium text-gray-200">
              Job Posting URL
            </Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                id="job-url"
                type="url"
                placeholder="https://company.com/careers/job-posting"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Job Posting...
              </>
            ) : (
              'Analyze Job Posting'
            )}
          </Button>
        </form>

        <div className="text-xs text-gray-400 text-center">
          Supported sites: LinkedIn, Indeed, Glassdoor, company career pages, and more
        </div>
      </div>
    </GlassCard>
  );
}