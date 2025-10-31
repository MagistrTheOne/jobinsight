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
          <div className="text-2xl font-bold text-blue-600">
            {scoreValue}/10
          </div>
        </div>
        <Progress value={scoreValue * 10} className="mb-3" />
        <p className="text-gray-300">{analysis.overallScore}</p>
      </GlassCard>

      {/* ATS Compatibility */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <Zap className="mr-2 h-5 w-5 text-yellow-600" />
          ATS Compatibility
        </h3>
        <p className="text-gray-300">{analysis.atsCompatibility}</p>
      </GlassCard>

      {/* Strengths and Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard variant="default">
          <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Strengths
          </h3>
          <div className="space-y-2">
            {analysis.strengths?.map((strength, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">{strength}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="muted">
          <h3 className="text-lg font-semibold text-orange-600 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Areas for Improvement
          </h3>
          <div className="space-y-2">
            {analysis.improvements?.map((improvement, index) => (
              <div key={index} className="flex items-start">
                <AlertTriangle className="mr-2 h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">{improvement}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Formatting Assessment */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-indigo-600" />
          Formatting & Structure
        </h3>
        <p className="text-gray-300">{analysis.formatting}</p>
      </GlassCard>

      {/* Missing Keywords and Skills Gap */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="mr-2 h-5 w-5 text-red-600" />
            Missing Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords?.map((keyword, index) => (
              <Badge key={index} variant="destructive" className="bg-red-900/50 text-red-300 border-red-700/50">
                {keyword}
              </Badge>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
            Skills Gap Analysis
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.skillsGap?.map((skill, index) => (
              <Badge key={index} variant="outline" className="border-emerald-600/50 text-emerald-400">
                {skill}
              </Badge>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}