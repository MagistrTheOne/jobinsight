"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/glass-card';
import { Sparkles, FileText, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export function Hero() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [jobInput, setJobInput] = useState('');
  const [resumeInput, setResumeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = (type: 'job' | 'resume') => {
    if (!isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/dashboard&action=' + type);
      return;
    }
    setIsLoading(true);
    router.push(`/dashboard?tab=${type === 'job' ? 'job-analysis' : 'resume-analysis'}`);
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-[#0b0b0b] text-white pt-16 lg:pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-10 lg:space-y-12">
          {/* Header */}
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
              <span className="text-xs sm:text-sm text-neutral-300 font-medium">AI-Powered Job Assistant</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight px-2">
              Land Your Dream Job with{' '}
              <span className="text-neutral-300 block sm:inline">AI Intelligence</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto px-4 leading-relaxed">
              Analyze job postings, optimize your resume, and generate ATS-ready cover letters.
            </p>
          </div>

          {/* Input Card */}
          <GlassCard className="w-full max-w-2xl mx-auto p-6 sm:p-8 lg:p-10 bg-neutral-950/60 backdrop-blur-md border border-neutral-800/50 shadow-xl">
            <Tabs defaultValue="job" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 sm:mb-8 bg-neutral-900/50 border border-neutral-800/50 rounded-lg overflow-hidden h-auto">
                <TabsTrigger
                  value="job"
                  className="py-2.5 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-neutral-800/80 data-[state=active]:text-white text-neutral-400 font-medium"
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">Analyze Job</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="resume"
                  className="py-2.5 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-neutral-800/80 data-[state=active]:text-white text-neutral-400 font-medium"
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">Optimize Resume</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="job" className="space-y-3 sm:space-y-4 mt-0">
                <Input
                  type="url"
                  placeholder="Paste job posting URL or description..."
                  value={jobInput}
                  onChange={(e) => setJobInput(e.target.value)}
                  className="h-11 sm:h-12 text-sm sm:text-base bg-neutral-950/80 border border-neutral-700/50 text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:border-neutral-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && jobInput.trim() && handleAction('job')}
                />
                <Button
                  onClick={() => handleAction('job')}
                  disabled={!jobInput.trim() || isLoading}
                  className="w-full h-11 sm:h-12 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900/50 disabled:text-neutral-600 text-white text-sm sm:text-base font-medium flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Job Posting</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="resume" className="space-y-3 sm:space-y-4 mt-0">
                <Input
                  type="text"
                  placeholder="Paste your resume text..."
                  value={resumeInput}
                  onChange={(e) => setResumeInput(e.target.value)}
                  className="h-11 sm:h-12 text-sm sm:text-base bg-neutral-950/80 border border-neutral-700/50 text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:border-neutral-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && resumeInput.trim() && handleAction('resume')}
                />
                <Button
                  onClick={() => handleAction('resume')}
                  disabled={!resumeInput.trim() || isLoading}
                  className="w-full h-11 sm:h-12 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900/50 disabled:text-neutral-600 text-white text-sm sm:text-base font-medium flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Optimize Resume</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </GlassCard>

          {/* Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-neutral-500 px-4">
            <span>AI-Powered Analysis</span>
            <span className="text-neutral-700">•</span>
            <span>ATS Optimized</span>
            <span className="text-neutral-700">•</span>
            <span>Real-Time Processing</span>
          </div>
        </div>
      </div>
    </section>
  );
}
