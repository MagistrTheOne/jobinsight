"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UrlInput } from '@/components/url-input';
import { AnalysisResults } from '@/components/analysis-results';
import { FileUpload } from '@/components/file-upload';
import { CoverLetterGenerator } from '@/components/cover-letter-generator';
import { ResumeAnalysisResults } from '@/components/resume-analysis';
import { ATSCompatibilityChecker } from '@/components/ats-compatibility-checker';
import { SkillsGapAnalyzer } from '@/components/advanced/skills-gap-analyzer';
import { ImpactOptimizer } from '@/components/advanced/impact-optimizer';
import { ATSChallengeReportComponent } from '@/components/advanced/ats-challenge-report';
import { JobResponseOptimizer } from '@/components/job-response-optimizer';
import { UserButton } from '@/components/auth/user-button';
import { UsageLimits } from '@/components/usage/usage-limits';
import { UpgradeModal } from '@/components/usage/upgrade-modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { CircleAlert as AlertCircle, Briefcase, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { JobAnalysis, ResumeAnalysis, UserInfo } from '@/lib/types';
import { useAnalysisStore } from '@/store/analysis-store';
import { useAuthStore } from '@/store/auth-store';
import { HistoryPanel } from '@/components/analysis/history-panel';
import { AIChat } from '@/components/chat/ai-chat';
import { ApplicationTracker } from '@/components/applications/application-tracker';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Zustand stores
  const {
    currentJobAnalysis: jobAnalysis,
    currentJobUrl,
    currentJobContent: jobContentText,
    currentResumeAnalysis: resumeAnalysis,
    currentResumeContent: resumeContent,
    currentCoverLetter: generatedCoverLetter,
    setJobAnalysis,
    setJobUrl,
    setJobContent,
    setResumeAnalysis,
    setResumeContent,
    setCoverLetter,
  } = useAnalysisStore();

  const { isAuthenticated, user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'job-analysis';

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/landing');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading or nothing while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to landing
  }
  
  // Cover Letter State (локальный, не сохраняем в store)
  const [coverLetterUserInfo, setCoverLetterUserInfo] = useState<UserInfo | null>(null);
  
  // Upgrade modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{
    type?: 'resume' | 'job' | 'cover-letter';
    used?: number;
    limit?: number;
  }>({});

  const handleJobAnalysis = async (url: string) => {
    if (!isAuthenticated) {
      router.push('/landing?action=job');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setJobAnalysis(null);
    setJobUrl(url);

    try {
      const response = await fetch('/api/analyze/job-posting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          setUpgradeModalData({
            type: data.type || 'job',
            used: data.used,
            limit: data.limit,
          });
          setUpgradeModalOpen(true);
        }
        throw new Error(data.error || 'Analysis failed');
      }

      setJobAnalysis(data.analysis);
      // Refresh usage limits after successful analysis
      window.dispatchEvent(new Event('usage-refresh'));
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeAnalysis = async (content: string) => {
    if (!isAuthenticated) {
      router.push('/landing?action=resume');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setResumeAnalysis(null);
    setResumeContent(content);

    try {
      const response = await fetch('/api/analyze/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeContent: content }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          setUpgradeModalData({
            type: data.type || 'resume',
            used: data.used,
            limit: data.limit,
          });
          setUpgradeModalOpen(true);
        }
        throw new Error(data.error || 'Resume analysis failed');
      }

      const analysis = data.analysis;
      setResumeAnalysis(analysis);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobContentAnalysis = async (content: string) => {
    setIsLoading(true);
    setError('');
    setJobAnalysis(null);
    setJobContent(content);

    try {
      const response = await fetch('/api/analyze/job-posting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobContent: content }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          setUpgradeModalData({
            type: data.type || 'job',
            used: data.used,
            limit: data.limit,
          });
          setUpgradeModalOpen(true);
        }
        throw new Error(data.error || 'Analysis failed');
      }

      setJobAnalysis(data.analysis);
      // Refresh usage limits after successful analysis
      window.dispatchEvent(new Event('usage-refresh'));
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverLetterGeneration = async (userInfo: UserInfo, url?: string, content?: string) => {
    setIsLoading(true);
    setError('');
    setCoverLetter('');
    setCoverLetterUserInfo(userInfo);
    if (content) {
      setJobContent(content);
    }

    try {
      const response = await fetch('/api/generate/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url || currentJobUrl, 
          jobContent: content,
          userInfo,
          jobAnalysis: jobAnalysis || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          setUpgradeModalData({
            type: data.type || 'cover-letter',
            used: data.used,
            limit: data.limit,
          });
          setUpgradeModalOpen(true);
        }
        throw new Error(data.error || 'Cover letter generation failed');
      }

      setCoverLetter(data.coverLetter);
      // Refresh usage limits after successful generation
      window.dispatchEvent(new Event('usage-refresh'));
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
                <div className="flex items-center justify-between mb-4 gap-4">
                    <div className="flex-1 flex items-center justify-start">
                      <Link href="/landing">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800/50">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Landing
                        </Button>
                      </Link>
                    </div>
                    <div className="flex items-center justify-center flex-1">
                      <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
                      <h1 className="text-4xl font-bold text-white">
                        JobInsight AI
                      </h1>
                    </div>
                    <div className="flex-1 flex items-center justify-end gap-3">
                      <UsageLimits />
                      <UserButton />
                    </div>
            {isAuthenticated && user && (
              <div className="absolute top-4 right-4 text-xs text-gray-500">
                Logged in as {user.name}
              </div>
            )}
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            AI-powered job application analysis system with red flag detection, 
            ATS-optimized cover letters, and resume optimization
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={(value) => router.replace(`/dashboard?tab=${value}`)} className="w-full">
                  <TabsList className="grid w-full grid-cols-7 max-w-5xl mx-auto mb-8">
                    <TabsTrigger value="job-analysis">Job Analysis</TabsTrigger>
                    <TabsTrigger value="job-content">Job Content</TabsTrigger>
                    <TabsTrigger value="resume-analysis">Resume</TabsTrigger>
                    <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                    <TabsTrigger value="ai-chat">AI Assistant</TabsTrigger>
                  </TabsList>

                  {/* Job URL Analysis Tab */}
                  <TabsContent value="job-analysis" className="space-y-6">
                    <UrlInput 
                      onAnalyze={handleJobAnalysis} 
                      isLoading={isLoading}
                    />
                    {jobAnalysis && <AnalysisResults analysis={jobAnalysis} jobUrl={currentJobUrl} jobContent={jobContentText} />}
                  </TabsContent>

                  {/* Job Content Analysis Tab */}
                  <TabsContent value="job-content" className="space-y-6">
                    <FileUpload
                      onAnalyze={handleJobContentAnalysis}
                      isLoading={isLoading}
                      type="job-content"
                      title="Job Content Analysis"
                      placeholder="Paste the job posting content here..."
                    />
                    {jobAnalysis && <AnalysisResults analysis={jobAnalysis} jobUrl={currentJobUrl} jobContent={jobContentText} />}
                  </TabsContent>

                  {/* Resume Analysis Tab */}
                  <TabsContent value="resume-analysis" className="space-y-6">
                    <FileUpload
                      onAnalyze={handleResumeAnalysis}
                      isLoading={isLoading}
                      type="resume"
                      title="Resume Analysis & Optimization"
                      placeholder="Paste your resume content here..."
                    />
                    
                    {/* ATS Compatibility Checker */}
                    {resumeContent && (
                      <ATSCompatibilityChecker 
                        resumeContent={resumeContent}
                        jobDescription={jobAnalysis ? 
                          `${jobAnalysis.requirements?.realistic?.join(', ') || ''} ${jobAnalysis.atsKeywords?.join(', ') || ''}`.trim()
                          : undefined
                        }
                      />
                    )}
                    
                    {/* Resume Analysis Results */}
                    {resumeAnalysis && <ResumeAnalysisResults analysis={resumeAnalysis} />}
                    
                    {/* Resume Optimizer */}
                    {resumeContent && jobAnalysis && (
                      <JobResponseOptimizer
                        type="resume"
                        originalContent={resumeContent}
                        jobAnalysis={jobAnalysis}
                        jobContent={jobContentText}
                        jobUrl={currentJobUrl}
                      />
                    )}
                  </TabsContent>

                  {/* Cover Letter Generation Tab */}
                  <TabsContent value="cover-letter" className="space-y-6">
                    <CoverLetterGenerator
                      jobUrl={currentJobUrl}
                      jobContent={jobContentText}
                      onGenerate={handleCoverLetterGeneration}
                      isLoading={isLoading}
                      generatedLetter={generatedCoverLetter}
                    />
                    
                    {/* Cover Letter Optimizer */}
                    {generatedCoverLetter && jobAnalysis && coverLetterUserInfo && (
                      <JobResponseOptimizer
                        type="cover-letter"
                        originalContent={generatedCoverLetter}
                        jobAnalysis={jobAnalysis}
                        jobContent={jobContentText}
                        jobUrl={currentJobUrl}
                        userInfo={coverLetterUserInfo}
                      />
                    )}
                  </TabsContent>

                  {/* Advanced ATS Tools Tab */}
                  <TabsContent value="advanced" className="space-y-6">
                    {resumeContent && jobAnalysis && (() => {
                      // Формируем полное описание вакансии из доступных данных
                      const jobDescription = jobContentText || 
                        `${jobAnalysis.requirements?.realistic?.join(', ') || ''}
                        ${jobAnalysis.requirements?.unrealistic?.join(', ') || ''}
                        ${jobAnalysis.atsKeywords?.join(', ') || ''}
                        ${jobAnalysis.recommendedSkills?.join(', ') || ''}
                        ${jobAnalysis.companyInsights || ''}
                        ${jobAnalysis.workLifeBalance || ''}
                        ${jobAnalysis.salaryInsight || ''}`.trim();
                      
                      return (
                        <>
                          <SkillsGapAnalyzer 
                            resumeContent={resumeContent}
                            jobDescription={jobDescription}
                          />
                          
                          <ImpactOptimizer
                            resumeContent={resumeContent}
                            jobDescription={jobDescription}
                          />
                          
                          <ATSChallengeReportComponent
                            resumeContent={resumeContent}
                            jobDescription={jobDescription}
                          />
                        </>
                      );
                    })()}
                    {(!resumeContent || !jobAnalysis) && (
                      <GlassCard>
                        <div className="text-center py-8">
                          <p className="text-gray-400 mb-4">
                            Для использования продвинутых инструментов необходимо:
                          </p>
                          <ul className="text-left text-sm text-gray-400 space-y-2 max-w-md mx-auto">
                            <li>• Проанализировать вакансию (вкладка Job Analysis)</li>
                            <li>• Проанализировать резюме (вкладка Resume)</li>
                          </ul>
                        </div>
                      </GlassCard>
                    )}
                  </TabsContent>

                          {/* Applications Tracking Tab */}
                          <TabsContent value="applications" className="space-y-6">
                            <ApplicationTracker />
                          </TabsContent>

                          {/* AI Chat Assistant Tab */}
                          <TabsContent value="ai-chat" className="space-y-6">
                            <AIChat />
                          </TabsContent>
                        </Tabs>
          </div>
          
          {/* History Panel */}
          <div className="lg:col-span-1">
            <HistoryPanel />
          </div>
        </div>

        {/* Upgrade Modal */}
        <UpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          limitType={upgradeModalData.type}
          used={upgradeModalData.used}
          limit={upgradeModalData.limit}
        />
      </div>
    </div>
  );
}

