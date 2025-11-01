"use client";

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, TrendingUp, FileText, Target, Award, Zap } from 'lucide-react';
import { ResumeAnalysis } from '@/lib/types';

interface ResumeAnalysisProps {
  analysis: ResumeAnalysis;
}

export function ResumeAnalysisResults({ analysis }: ResumeAnalysisProps) {
  const scoreText = String(analysis.overallScore || '0');
  const scoreValue = parseInt(scoreText.match(/\d+/)?.[0] || '0', 10);

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Overall Score */}
      <GlassCard variant="accent">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Award className="mr-2 h-5 w-5 text-blue-600" />
            Resume Overall Score
          </h3>
          <div className="text-xl font-bold text-white">
            {scoreValue}/10
          </div>
        </div>
        <Progress value={scoreValue * 10} className="mb-3 h-2 bg-white/5" />
        <p className="text-sm text-neutral-300">{analysis.overallScore}</p>
      </GlassCard>

      {/* ATS Compatibility */}
      <GlassCard className="bg-black/40 border-white/10 backdrop-blur-xl">
        <h3 className="text-base font-semibold text-white mb-3 flex items-center">
          <Zap className="mr-2 h-4 w-4 text-white" />
          ATS Compatibility
        </h3>
        <p className="text-sm text-neutral-300">{analysis.atsCompatibility}</p>
      </GlassCard>

      {/* Strengths and Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard variant="default" className="bg-black/40 border-white/10 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-green-400 mb-4 flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            Strengths
          </h3>
          <div className="space-y-2">
            {analysis.strengths?.map((strength, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="mr-2 h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm text-neutral-300">{strength}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="muted" className="bg-black/40 border-white/10 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-orange-400 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Areas for Improvement
          </h3>
          <div className="space-y-2">
            {analysis.improvements?.map((improvement, index) => (
              <div key={index} className="flex items-start">
                <AlertTriangle className="mr-2 h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" />
                <span className="text-sm text-neutral-300">{improvement}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Formatting Assessment */}
      <GlassCard className="bg-black/40 border-white/10 backdrop-blur-xl">
        <h3 className="text-base font-semibold text-white mb-3 flex items-center">
          <FileText className="mr-2 h-4 w-4 text-white" />
          Formatting & Structure
        </h3>
        <p className="text-sm text-neutral-300">{analysis.formatting}</p>
      </GlassCard>

      {/* Missing Keywords and Skills Gap */}
      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard className="bg-black/40 border-white/10 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center">
            <Target className="mr-2 h-4 w-4 text-white" />
            Missing Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords?.map((keyword, index) => (
              <Badge key={index} variant="destructive" className="bg-red-950/30 text-red-300 border-red-800/30 text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="bg-black/40 border-white/10 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-white" />
            Skills Gap Analysis
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.skillsGap?.map((skill, index) => (
              <Badge key={index} variant="outline" className="border-white/10 text-white bg-white/5 text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}