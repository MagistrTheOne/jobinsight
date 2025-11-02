"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/glass-card';
import { Sparkles, FileText, Briefcase, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Real analysis result will come from API

export function Hero() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [jobInput, setJobInput] = useState('');
  const [resumeInput, setResumeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoResult, setShowDemoResult] = useState(false);
  const [demoAttempts, setDemoAttempts] = useState(0);
  const [demoAnalysis, setDemoAnalysis] = useState<any>(null);
  const [demoError, setDemoError] = useState<string>('');

  // Load demo attempts from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const attempts = parseInt(localStorage.getItem('landing-demo-attempts') || '0', 10);
      setDemoAttempts(attempts);
    }
  }, []);

  const handleJobDemo = async () => {
    if (!jobInput.trim()) return;

    setIsLoading(true);
    setDemoError('');
    setDemoAnalysis(null);
    setShowDemoResult(false);

    try {
      // Real API call - тратим реальные токены GigaChat
      const response = await fetch('/api/analyze/demo/job-posting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: jobInput.trim().startsWith('http') ? jobInput.trim() : null,
          jobContent: jobInput.trim().startsWith('http') ? null : jobInput.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.demoUsed || data.upgradeRequired) {
          // Demo уже использован - редирект на авторизацию
          setDemoError(data.message || 'Demo limit reached');
          const newAttempts = demoAttempts + 1;
          setDemoAttempts(newAttempts);
          if (typeof window !== 'undefined') {
            localStorage.setItem('landing-demo-attempts', newAttempts.toString());
          }
          setTimeout(() => {
            router.push('/auth/signin?callbackUrl=/dashboard&action=job');
          }, 2000);
        } else {
          setDemoError(data.message || data.error || 'Analysis failed');
        }
        setIsLoading(false);
        return;
      }

      if (data.success && data.analysis) {
        setDemoAnalysis(data.analysis);
        setShowDemoResult(true);
        
        // Increment demo attempts locally
        const newAttempts = demoAttempts + 1;
        setDemoAttempts(newAttempts);
        if (typeof window !== 'undefined') {
          localStorage.setItem('landing-demo-attempts', newAttempts.toString());
        }
      } else {
        setDemoError('Failed to analyze job posting');
      }
    } catch (error: any) {
      console.error('Demo analysis error:', error);
      setDemoError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (type: 'job' | 'resume') => {
    if (isAuthenticated) {
      setIsLoading(true);
      router.push(`/dashboard?tab=${type === 'job' ? 'job-analysis' : 'resume-analysis'}`);
      return;
    }

    // Check if this is a demo attempt (first try for job analysis, only if demo not used yet)
    if (type === 'job' && demoAttempts === 0 && !showDemoResult && jobInput.trim()) {
      handleJobDemo();
      return;
    }

    // After first demo or resume analysis - redirect to sign in
    router.push('/auth/signin?callbackUrl=/dashboard&action=' + type);
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-[#0b0b0b] text-white pt-14 sm:pt-16 md:pt-20 lg:pt-24 pb-12 sm:pb-16 md:pb-20 lg:pb-24">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
          {/* Header */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-yellow-400" />
              <span className="text-[10px] sm:text-xs md:text-sm text-neutral-300 font-medium">AI-Powered Job Assistant</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-tight px-2 sm:px-4">
              Land Your Dream Job with{' '}
              <span className="text-neutral-300 block sm:inline">AI Intelligence</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto px-3 sm:px-4 md:px-6 leading-relaxed">
              Analyze job postings, optimize your resume, and generate ATS-ready cover letters.
            </p>
          </div>

          {/* Input Card */}
          <GlassCard className="w-full max-w-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-neutral-950/60 backdrop-blur-md border border-neutral-800/50 shadow-xl">
            <Tabs defaultValue="job" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4 sm:mb-6 md:mb-8 bg-neutral-900/50 border border-neutral-800/50 rounded-lg overflow-hidden h-auto">
                <TabsTrigger
                  value="job"
                  className="py-2 sm:py-2.5 md:py-3 text-[11px] sm:text-xs md:text-sm data-[state=active]:bg-neutral-800/80 data-[state=active]:text-white text-neutral-400 font-medium"
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2">
                    <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                    <span className="whitespace-nowrap">Analyze Job</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="resume"
                  className="py-2 sm:py-2.5 md:py-3 text-[11px] sm:text-xs md:text-sm data-[state=active]:bg-neutral-800/80 data-[state=active]:text-white text-neutral-400 font-medium"
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2">
                    <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                    <span className="whitespace-nowrap">Optimize Resume</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="job" className="space-y-2.5 sm:space-y-3 md:space-y-4 mt-0">
                {demoAttempts === 0 && (
                  <Alert className="bg-blue-950/30 border-blue-800/50 py-2 sm:py-3">
                    <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                    <AlertDescription className="text-blue-300 text-[11px] sm:text-xs md:text-sm">
                      Try a free demo analysis! After this, sign in for unlimited access.
                    </AlertDescription>
                  </Alert>
                )}
                {demoAttempts > 0 && (
                  <Alert className="bg-amber-950/30 border-amber-800/50 py-2 sm:py-3">
                    <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
                    <AlertDescription className="text-amber-300 text-[11px] sm:text-xs md:text-sm">
                      Demo used ({demoAttempts}/1). Sign in for full access to unlimited analyses.
                    </AlertDescription>
                  </Alert>
                )}
                <Input
                  type="url"
                  placeholder="Paste job posting URL or description..."
                  value={jobInput}
                  onChange={(e) => setJobInput(e.target.value)}
                  className="h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base bg-neutral-950/80 border border-neutral-700/50 text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:border-neutral-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && jobInput.trim() && handleAction('job')}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleAction('job')}
                  disabled={!jobInput.trim() || isLoading}
                  className="w-full h-10 sm:h-11 md:h-12 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900/50 disabled:text-neutral-600 text-white text-xs sm:text-sm md:text-base font-medium flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin" />
                      <span className="whitespace-nowrap">Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="whitespace-nowrap">Analyze Job Posting</span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    </>
                  )}
                </Button>

                {/* Error Display */}
                {demoError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{demoError}</AlertDescription>
                  </Alert>
                )}

                {/* Demo Result - Real Analysis */}
                {showDemoResult && demoAnalysis && (
                  <div className="mt-4 pt-4 border-t border-neutral-800/50 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-semibold text-white">Demo Analysis Result</h3>
                      {demoAnalysis.jobGrade && (
                        <Badge className="bg-green-900/30 text-green-400 border-green-800/50">
                          {demoAnalysis.jobGrade.level} Level
                        </Badge>
                      )}
                    </div>
                    
                    {demoAnalysis.overallScore && (
                      <div className="p-3 bg-neutral-900/30 rounded-lg border border-neutral-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm text-neutral-300">Overall Score</span>
                          <span className="text-sm sm:text-base font-semibold text-white">{demoAnalysis.overallScore}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {demoAnalysis.requirements?.realistic && demoAnalysis.requirements.realistic.length > 0 && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Realistic Requirements
                          </h4>
                          <ul className="space-y-1">
                            {demoAnalysis.requirements.realistic.slice(0, 3).map((item: string, idx: number) => (
                              <li key={idx} className="text-xs sm:text-sm text-neutral-300 flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {demoAnalysis.redFlags && demoAnalysis.redFlags.length > 0 && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-red-400 mb-2 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Red Flags
                          </h4>
                          <ul className="space-y-1">
                            {demoAnalysis.redFlags.slice(0, 3).map((item: string, idx: number) => (
                              <li key={idx} className="text-xs sm:text-sm text-neutral-300 flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {demoAnalysis.recommendedSkills && demoAnalysis.recommendedSkills.length > 0 && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-amber-400 mb-2">Recommended Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {demoAnalysis.recommendedSkills.slice(0, 6).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="bg-neutral-900/50 text-neutral-300 border-neutral-700/50 text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-800/50">
                      <p className="text-xs text-neutral-500 mb-3 text-center">
                        This was your free demo using real AI analysis. Sign in for unlimited access with full detailed insights.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-neutral-800/50 hover:bg-neutral-900/50"
                          onClick={() => {
                            setShowDemoResult(false);
                            setJobInput('');
                            setDemoAnalysis(null);
                          }}
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => router.push('/auth/signin?callbackUrl=/dashboard&action=job')}
                        >
                          Sign In for Full Access
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="resume" className="space-y-2.5 sm:space-y-3 md:space-y-4 mt-0">
                <Input
                  type="text"
                  placeholder="Paste your resume text..."
                  value={resumeInput}
                  onChange={(e) => setResumeInput(e.target.value)}
                  className="h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base bg-neutral-950/80 border border-neutral-700/50 text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:border-neutral-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && resumeInput.trim() && handleAction('resume')}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleAction('resume')}
                  disabled={!resumeInput.trim() || isLoading}
                  className="w-full h-10 sm:h-11 md:h-12 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900/50 disabled:text-neutral-600 text-white text-xs sm:text-sm md:text-base font-medium flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin" />
                      <span className="whitespace-nowrap">Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="whitespace-nowrap">Optimize Resume</span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </GlassCard>

          {/* Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6 text-[10px] sm:text-xs md:text-sm text-neutral-500 px-3 sm:px-4">
            <span>AI-Powered Analysis</span>
            <span className="text-neutral-700 hidden sm:inline">•</span>
            <span>ATS Optimized</span>
            <span className="text-neutral-700 hidden sm:inline">•</span>
            <span>Real-Time Processing</span>
          </div>
        </div>
      </div>
    </section>
  );
}
