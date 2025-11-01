"use client";

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, TrendingUp, Users, DollarSign, Clock, Target, Award, BarChart3, Plus, Loader2 } from 'lucide-react';
import { JobAnalysis } from '@/lib/types';
import { ApplicationDialog } from '@/components/applications/application-dialog';

interface AnalysisResultsProps {
  analysis: JobAnalysis;
  jobUrl?: string;
  jobContent?: string;
}

export function AnalysisResults({ analysis, jobUrl, jobContent }: AnalysisResultsProps) {
  const scoreText = String(analysis.overallScore || '0');
  const scoreValue = parseInt(scoreText.match(/\d+/)?.[0] || '0', 10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Extract company name from job content or URL
  const getCompanyName = () => {
    // Try to extract from jobContent first
    if (jobContent) {
      const companyMatch = jobContent.match(/компани[яи][:\s]+([^\n,\r]+)/i) || 
                          jobContent.match(/company[:\s]+([^\n,\r]+)/i) ||
                          jobContent.match(/работодатель[:\s]+([^\n,\r]+)/i);
      if (companyMatch) return companyMatch[1].trim();
    }
    
    // Try to extract from URL (hh.ru format)
    if (jobUrl && jobUrl.includes('hh.ru')) {
      const urlMatch = jobUrl.match(/\/vacancy\/(\d+)/);
      if (urlMatch) {
        // Company might be in the page, but we can't access it here
        // User will need to fill it manually
      }
    }
    
    // Try from companyInsights as fallback
    if (analysis.companyInsights && typeof analysis.companyInsights === 'string') {
      const match = analysis.companyInsights.match(/(?:company|компания)[:\s]+([^\n,]+)/i);
      if (match) return match[1].trim();
    }
    
    return '';
  };

  // Extract job title from job content or analysis
  const getJobTitle = () => {
    if (jobContent) {
      // Try common patterns
      const titleMatch = jobContent.match(/(?:должность|позиция|вакансия|position|title)[:\s]+([^\n,\r]+)/i) ||
                        jobContent.match(/^([^\n]+)\n/); // First line often contains title
      if (titleMatch) return titleMatch[1].trim();
    }
    return '';
  };

  const handleAddToApplications = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Quick Add Button */}
      <GlassCard variant="muted" className="bg-black/40 border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-1">Track This Application</h3>
            <p className="text-xs text-neutral-400">Save this job to your applications tracker</p>
          </div>
          <Button
            onClick={handleAddToApplications}
            disabled={isSaving}
            className="bg-white/10 border border-white/10 hover:bg-white/15 text-white backdrop-blur-sm h-9 px-4"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to Applications
              </>
            )}
          </Button>
        </div>
      </GlassCard>

      {/* Overall Score */}
      <GlassCard variant="accent" className="bg-black/40 border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Award className="mr-2 h-4 w-4 text-white" />
            Overall Assessment
          </h3>
          <div className="text-xl font-bold text-white">
            {scoreValue}/10
          </div>
        </div>
        <Progress value={scoreValue * 10} className="mb-3 h-2 bg-white/5" />
        <p className="text-sm text-neutral-300">
          {typeof analysis.overallScore === 'string' 
            ? analysis.overallScore 
            : typeof analysis.overallScore === 'number'
            ? String(analysis.overallScore)
            : JSON.stringify(analysis.overallScore)}
        </p>
      </GlassCard>

      {/* Job Grade Assessment */}
      {analysis.jobGrade && (
        <GlassCard variant="accent" className="bg-black/40 border-white/10 backdrop-blur-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white flex items-center mb-2">
                <BarChart3 className="mr-2 h-4 w-4 text-white" />
                Job Level Assessment
              </h3>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {typeof analysis.jobGrade.level === 'string' 
                      ? analysis.jobGrade.level 
                      : String(analysis.jobGrade.level || 'Unknown')}
                  </div>
                  <div className="text-xs text-neutral-400">Level</div>
                </div>
                <div className="h-12 w-px bg-white/10" />
                <div>
                  <div className="text-xl font-bold text-white">
                    {typeof analysis.jobGrade.score === 'number' 
                      ? analysis.jobGrade.score 
                      : typeof analysis.jobGrade.score === 'string'
                      ? parseInt(analysis.jobGrade.score) || 0
                      : 0}/5
                  </div>
                  <div className="text-xs text-neutral-400">Score</div>
                </div>
                <div className="h-12 w-px bg-white/10" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neutral-400">Confidence</span>
                    <span className="text-xs font-medium text-white">
                      {typeof analysis.jobGrade.confidence === 'number' 
                        ? analysis.jobGrade.confidence 
                        : typeof analysis.jobGrade.confidence === 'string'
                        ? parseInt(analysis.jobGrade.confidence) || 0
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={
                      typeof analysis.jobGrade.confidence === 'number' 
                        ? analysis.jobGrade.confidence 
                        : typeof analysis.jobGrade.confidence === 'string'
                        ? parseInt(analysis.jobGrade.confidence) || 0
                        : 0
                    } 
                    className="h-1.5 bg-white/5" 
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-sm text-neutral-300">
              {typeof analysis.jobGrade.reasoning === 'string' 
                ? analysis.jobGrade.reasoning 
                : JSON.stringify(analysis.jobGrade.reasoning)}
            </p>
          </div>
        </GlassCard>
      )}

      {/* Red Flags */}
      {analysis.redFlags && analysis.redFlags.length > 0 && (
        <GlassCard className="bg-black/40 border-white/10 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-red-400 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Red Flags Detected
          </h3>
          <div className="space-y-2">
            {analysis.redFlags.map((flag, index) => (
              <Alert key={index} variant="destructive" className="bg-red-950/30 border-red-800/30">
                <AlertDescription className="text-sm text-red-300">
                  {typeof flag === 'string' ? flag : JSON.stringify(flag)}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Requirements Analysis */}
      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard variant="default" className="bg-black/40 border-white/10 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-green-400 mb-4 flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            Realistic Requirements
          </h3>
          <div className="space-y-2">
            {analysis.requirements?.realistic?.map((req, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="mr-2 h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm text-neutral-300">
                  {typeof req === 'string' ? req : JSON.stringify(req)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="muted" className="bg-black/40 border-white/10 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-orange-400 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Questionable Requirements
          </h3>
          <div className="space-y-2">
            {analysis.requirements?.unrealistic?.map((req, index) => (
              <div key={index} className="flex items-start">
                <AlertTriangle className="mr-2 h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" />
                <span className="text-sm text-neutral-300">
                  {typeof req === 'string' ? req : JSON.stringify(req)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Insights Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Salary Insight */}
        <GlassCard className="bg-black/40 border-white/10 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-white" />
            Salary Assessment
          </h3>
          <p className="text-sm text-neutral-300">
            {typeof analysis.salaryInsight === 'string' 
              ? analysis.salaryInsight 
              : JSON.stringify(analysis.salaryInsight)}
          </p>
        </GlassCard>

        {/* Work-Life Balance */}
        <GlassCard className="bg-black/40 border-white/10 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center">
            <Clock className="mr-2 h-4 w-4 text-white" />
            Work-Life Balance
          </h3>
          <p className="text-sm text-neutral-300">
            {typeof analysis.workLifeBalance === 'string' 
              ? analysis.workLifeBalance 
              : JSON.stringify(analysis.workLifeBalance)}
          </p>
        </GlassCard>
      </div>

      {/* Company Insights */}
      <GlassCard className="bg-black/40 border-white/10 backdrop-blur-xl">
        <h3 className="text-base font-semibold text-white mb-3 flex items-center">
          <Users className="mr-2 h-4 w-4 text-white" />
          Company Culture Insights
        </h3>
        <p className="text-sm text-neutral-300">
          {typeof analysis.companyInsights === 'string' 
            ? analysis.companyInsights 
            : JSON.stringify(analysis.companyInsights)}
        </p>
      </GlassCard>

      {/* ATS Keywords and Recommended Skills */}
      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard className="bg-black/40 border-white/10 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center">
            <Target className="mr-2 h-4 w-4 text-white" />
            ATS Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.atsKeywords?.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="bg-white/5 text-white border-white/10 text-xs">
                {typeof keyword === 'string' ? keyword : JSON.stringify(keyword)}
              </Badge>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="bg-black/40 border-white/10 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-white" />
            Recommended Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.recommendedSkills?.map((skill, index) => (
              <Badge key={index} variant="outline" className="border-white/10 text-white bg-white/5 text-xs">
                {typeof skill === 'string' ? skill : JSON.stringify(skill)}
              </Badge>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Application Dialog */}
      <ApplicationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultData={{
          title: getJobTitle() || 'Unknown Position',
          company: getCompanyName() || '',
          url: jobUrl || undefined,
          jobAnalysis: analysis,
        }}
        onSaved={() => {
          setIsSaving(false);
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
}