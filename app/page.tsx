"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UrlInput } from '@/components/url-input';
import { AnalysisResults } from '@/components/analysis-results';
import { FileUpload } from '@/components/file-upload';
import { CoverLetterGenerator } from '@/components/cover-letter-generator';
import { ResumeAnalysisResults } from '@/components/resume-analysis';
import { ATSCompatibilityChecker } from '@/components/ats-compatibility-checker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CircleAlert as AlertCircle, Briefcase } from 'lucide-react';
import { JobAnalysis, ResumeAnalysis, UserInfo } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Job Analysis State
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [currentJobUrl, setCurrentJobUrl] = useState('');
  
  // Resume Analysis State
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [resumeContent, setResumeContent] = useState('');
  
  // Cover Letter State
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');

  const handleJobAnalysis = async (url: string) => {
    setIsLoading(true);
    setError('');
    setJobAnalysis(null);
    setCurrentJobUrl(url);

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
        throw new Error(data.error || 'Analysis failed');
      }

      setJobAnalysis(data.analysis);
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
    setResumeContent(content); // Сохраняем контент для ATS checker

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
        throw new Error(data.error || 'Analysis failed');
      }

      setJobAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverLetterGeneration = async (userInfo: UserInfo, url?: string, content?: string) => {
    setIsLoading(true);
    setError('');
    setGeneratedCoverLetter('');

    try {
      const response = await fetch('/api/generate/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url || currentJobUrl, 
          jobContent: content,
          userInfo 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Cover letter generation failed');
      }

      setGeneratedCoverLetter(data.coverLetter);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-white">
              JobInsight AI
            </h1>
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
        <Tabs defaultValue="job-analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="job-analysis">Job Analysis</TabsTrigger>
            <TabsTrigger value="job-content">Job Content</TabsTrigger>
            <TabsTrigger value="resume-analysis">Resume</TabsTrigger>
            <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
          </TabsList>

          {/* Job URL Analysis Tab */}
          <TabsContent value="job-analysis" className="space-y-6">
            <UrlInput 
              onAnalyze={handleJobAnalysis} 
              isLoading={isLoading}
            />
            {jobAnalysis && <AnalysisResults analysis={jobAnalysis} />}
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
            {jobAnalysis && <AnalysisResults analysis={jobAnalysis} />}
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
          </TabsContent>

          {/* Cover Letter Generation Tab */}
          <TabsContent value="cover-letter" className="space-y-6">
            <CoverLetterGenerator
              jobUrl={currentJobUrl}
              onGenerate={handleCoverLetterGeneration}
              isLoading={isLoading}
              generatedLetter={generatedCoverLetter}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}