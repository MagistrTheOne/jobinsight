"use client";

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, TrendingUp, Users, DollarSign, Clock, Target, Award, BarChart3 } from 'lucide-react';
import { JobAnalysis } from '@/lib/types';

interface AnalysisResultsProps {
  analysis: JobAnalysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const scoreText = String(analysis.overallScore || '0');
  const scoreValue = parseInt(scoreText.match(/\d+/)?.[0] || '0', 10);

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Overall Score */}
      <GlassCard variant="accent">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Award className="mr-2 h-5 w-5 text-blue-600" />
            Overall Assessment
          </h3>
          <div className="text-2xl font-bold text-blue-600">
            {scoreValue}/10
          </div>
        </div>
        <Progress value={scoreValue * 10} className="mb-3" />
        <p className="text-gray-300">{analysis.overallScore}</p>
      </GlassCard>

      {/* Job Grade Assessment */}
      {analysis.jobGrade && (
        <GlassCard variant="accent">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white flex items-center mb-2">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
                Job Level Assessment
              </h3>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {analysis.jobGrade.level}
                  </div>
                  <div className="text-sm text-gray-400">Level</div>
                </div>
                <div className="h-12 w-px bg-gray-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.jobGrade.score}/5
                  </div>
                  <div className="text-sm text-gray-400">Score</div>
                </div>
                <div className="h-12 w-px bg-gray-600" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Confidence</span>
                    <span className="text-sm font-medium text-gray-300">{analysis.jobGrade.confidence}%</span>
                  </div>
                  <Progress value={analysis.jobGrade.confidence} className="h-2" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-sm text-gray-300">{analysis.jobGrade.reasoning}</p>
          </div>
        </GlassCard>
      )}

      {/* Red Flags */}
      {analysis.redFlags && analysis.redFlags.length > 0 && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Red Flags Detected
          </h3>
          <div className="space-y-2">
            {analysis.redFlags.map((flag, index) => (
              <Alert key={index} variant="destructive">
                <AlertDescription>{flag}</AlertDescription>
              </Alert>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Requirements Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard variant="default">
          <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Realistic Requirements
          </h3>
          <div className="space-y-2">
            {analysis.requirements?.realistic?.map((req, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">{req}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="muted">
          <h3 className="text-lg font-semibold text-orange-600 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Questionable Requirements
          </h3>
          <div className="space-y-2">
            {analysis.requirements?.unrealistic?.map((req, index) => (
              <div key={index} className="flex items-start">
                <AlertTriangle className="mr-2 h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">{req}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Insights Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Salary Insight */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-green-600" />
            Salary Assessment
          </h3>
          <p className="text-gray-300">{analysis.salaryInsight}</p>
        </GlassCard>

        {/* Work-Life Balance */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-blue-600" />
            Work-Life Balance
          </h3>
          <p className="text-gray-300">{analysis.workLifeBalance}</p>
        </GlassCard>
      </div>

      {/* Company Insights */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <Users className="mr-2 h-5 w-5 text-purple-600" />
          Company Culture Insights
        </h3>
        <p className="text-gray-300">{analysis.companyInsights}</p>
      </GlassCard>

      {/* ATS Keywords and Recommended Skills */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="mr-2 h-5 w-5 text-indigo-600" />
            ATS Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.atsKeywords?.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="bg-indigo-900/50 text-indigo-300 border-indigo-700/50">
                {keyword}
              </Badge>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
            Recommended Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.recommendedSkills?.map((skill, index) => (
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