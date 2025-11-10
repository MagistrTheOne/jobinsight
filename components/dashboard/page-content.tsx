"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent } from '@/components/ui/tabs';
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
import { UpgradeModal } from '@/components/usage/upgrade-modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GlassCard } from '@/components/ui/glass-card';
import { CircleAlert as AlertCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JobAnalysis, UserInfo } from '@/lib/types';
import { useAnalysisStore } from '@/store/analysis-store';
import { useAuthStore } from '@/store/auth-store';
import { AIChat } from '@/components/chat/ai-chat';
import { ApplicationTracker } from '@/components/applications/application-tracker';
import { HRAutopilot } from '@/components/automation/hr-autopilot';
import { SalaryNegotiationAI } from '@/components/automation/salary-negotiation';
import { PipelineAutomation } from '@/components/automation/pipeline-automation';
import { ResumeBuilder } from '@/components/resume/resume-builder';
import { UserProfileSettings } from '@/components/profile/user-profile-settings';

export function DashboardPageContent() {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  
  // State hooks
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverLetterUserInfo, setCoverLetterUserInfo] = useState<UserInfo | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{
    type?: 'resume' | 'job' | 'cover-letter';
    used?: number;
    limit?: number;
  }>({});
  
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

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'chat';

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/landing');
    }
  }, [authLoading, isAuthenticated, router]);

  // Smooth scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleJobAnalysis = async (url: string) => {
    setIsLoading(true);
    setError('');
    setJobAnalysis(null);
    setJobUrl(url);

    try {
      const response = await fetch('/api/analyze/job-posting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      window.dispatchEvent(new Event('usage-refresh'));
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeAnalysis = async (content: string) => {
    setIsLoading(true);
    setError('');
    setResumeAnalysis(null);
    setResumeContent(content);

    try {
      const response = await fetch('/api/analyze/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      setResumeAnalysis(data.analysis);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
      window.dispatchEvent(new Event('usage-refresh'));
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-black overflow-hidden flex flex-col">
      {/* Error Display - Compact */}
      {error && (
        <div className="p-4 border-b border-white/5 bg-red-950/30">
          <Alert variant="destructive" className="bg-transparent border-0 py-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs text-red-300">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content - AI Chat is default, other tabs for specific features */}
      {activeTab === 'chat' ? (
        <div className="flex-1 w-full max-w-full animate-fade-in overflow-hidden p-2 sm:p-4 md:p-6">
          <GlassCard className="h-full w-full bg-gradient-to-br from-neutral-950/90 via-neutral-900/80 to-neutral-950/90 backdrop-blur-xl border border-neutral-700/50 rounded-xl shadow-2xl overflow-hidden">
            <AIChat />
          </GlassCard>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Tabs value={activeTab} className="h-full transition-tab">
          {/* Job URL Analysis */}
          <TabsContent value="job-analysis" className="space-y-4 mt-0">
            <UrlInput 
              onAnalyze={handleJobAnalysis} 
              isLoading={isLoading}
            />
            {jobAnalysis && (
              <AnalysisResults 
                analysis={jobAnalysis} 
                jobUrl={currentJobUrl} 
                jobContent={jobContentText} 
              />
            )}
          </TabsContent>

          {/* Job Content Analysis */}
          <TabsContent value="job-content" className="space-y-4 mt-0">
            <FileUpload
              onAnalyze={handleJobContentAnalysis}
              isLoading={isLoading}
              type="job-content"
              title="Job Content Analysis"
              placeholder="Paste the job posting content here..."
            />
            {jobAnalysis && (
              <AnalysisResults 
                analysis={jobAnalysis} 
                jobUrl={currentJobUrl} 
                jobContent={jobContentText} 
              />
            )}
          </TabsContent>

          {/* Resume Analysis */}
          <TabsContent value="resume-analysis" className="space-y-4 mt-0">
            <FileUpload
              onAnalyze={handleResumeAnalysis}
              isLoading={isLoading}
              type="resume"
              title="Resume Analysis & Optimization"
              placeholder="Paste your resume content here..."
            />
            
            {resumeContent && (
              <ATSCompatibilityChecker 
                resumeContent={resumeContent}
                jobDescription={jobAnalysis ? 
                  `${jobAnalysis.requirements?.realistic?.join(', ') || ''} ${jobAnalysis.atsKeywords?.join(', ') || ''}`.trim()
                  : undefined
                }
              />
            )}
            
            {resumeAnalysis && <ResumeAnalysisResults analysis={resumeAnalysis} />}
            
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

          {/* Cover Letter Generation */}
          <TabsContent value="cover-letter" className="space-y-4 mt-0">
            <CoverLetterGenerator
              jobUrl={currentJobUrl}
              jobContent={jobContentText}
              onGenerate={handleCoverLetterGeneration}
              isLoading={isLoading}
              generatedLetter={generatedCoverLetter}
            />
            
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

          {/* Advanced ATS Tools */}
          <TabsContent value="advanced" className="space-y-4 mt-0">
            {resumeContent && jobAnalysis ? (
              <>
                <SkillsGapAnalyzer 
                  resumeContent={resumeContent}
                  jobDescription={jobContentText || 
                    `${jobAnalysis.requirements?.realistic?.join(', ') || ''}
                    ${jobAnalysis.requirements?.unrealistic?.join(', ') || ''}
                    ${jobAnalysis.atsKeywords?.join(', ') || ''}
                    ${jobAnalysis.recommendedSkills?.join(', ') || ''}`.trim()
                  }
                />
                
                <ImpactOptimizer
                  resumeContent={resumeContent}
                  jobDescription={jobContentText || 
                    `${jobAnalysis.requirements?.realistic?.join(', ') || ''}
                    ${jobAnalysis.requirements?.unrealistic?.join(', ') || ''}
                    ${jobAnalysis.atsKeywords?.join(', ') || ''}
                    ${jobAnalysis.recommendedSkills?.join(', ') || ''}`.trim()
                  }
                />
                
                <ATSChallengeReportComponent
                  resumeContent={resumeContent}
                  jobDescription={jobContentText || 
                    `${jobAnalysis.requirements?.realistic?.join(', ') || ''}
                    ${jobAnalysis.requirements?.unrealistic?.join(', ') || ''}
                    ${jobAnalysis.atsKeywords?.join(', ') || ''}
                    ${jobAnalysis.recommendedSkills?.join(', ') || ''}`.trim()
                  }
                />
              </>
            ) : (
              <GlassCard className="py-12 animate-fade-in">
                <div className="text-center">
                  <div className="p-4 rounded-full bg-linear-to-br from-blue-600/20 to-purple-600/20 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <BarChart3 className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Доступны продвинутые инструменты
                  </h3>
                  <p className="text-sm text-neutral-400 mb-6 max-w-md mx-auto">
                    Для использования продвинутых инструментов необходимо:
                  </p>
                  <ul className="text-left text-sm text-neutral-300 space-y-2 max-w-md mx-auto mb-6">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400">•</span>
                      Проанализировать вакансию (вкладка Анализ вакансий)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400">•</span>
                      Проанализировать резюме (вкладка Анализ резюме)
                    </li>
                  </ul>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => router.push('/dashboard?tab=job-analysis')}
                      variant="outline"
                      className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10 bg-white/5"
                    >
                      Анализ вакансии
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard?tab=resume-analysis')}
                      variant="outline"
                      className="border-purple-600/50 text-purple-400 hover:bg-purple-600/10 bg-white/5"
                    >
                      Анализ резюме
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}
          </TabsContent>

          {/* Applications Tracking */}
          <TabsContent value="applications" className="space-y-4 mt-0">
            <ApplicationTracker />
          </TabsContent>

          {/* HR Autopilot */}
          <TabsContent value="hr-autopilot" className="space-y-4 mt-0">
            <HRAutopilot />
          </TabsContent>

          {/* Salary Negotiation AI */}
          <TabsContent value="salary-ai" className="space-y-4 mt-0">
            <SalaryNegotiationAI />
          </TabsContent>

          {/* Pipeline Automation */}
          <TabsContent value="pipeline" className="space-y-4 mt-0">
            <PipelineAutomation />
          </TabsContent>

          {/* Resume Builder */}
          <TabsContent value="resume-builder" className="space-y-4 mt-0">
            <ResumeBuilder />
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4 mt-0">
            <UserProfileSettings />
          </TabsContent>
        </Tabs>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        limitType={upgradeModalData.type}
        used={upgradeModalData.used}
        limit={upgradeModalData.limit}
      />
    </div>
  );
}

