"use client";

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Loader2,
  Download,
  FileText,
  Send
} from 'lucide-react';
import { ATSChallengeReport } from '@/lib/advanced-ats-analysis';

interface ATSChallengeReportProps {
  resumeContent: string;
  jobDescription: string;
}

export function ATSChallengeReportComponent({ resumeContent, jobDescription }: ATSChallengeReportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ATSChallengeReport | null>(null);
  const [error, setError] = useState('');
  const [atsSystemName, setAtsSystemName] = useState('');

  const generate = async () => {
    if (!resumeContent || !jobDescription) {
      setError('Резюме и описание вакансии обязательны');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze/ats-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, jobDescription, atsSystemName: atsSystemName || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Report generation failed');
      }

      setReport(data.report);
    } catch (err: any) {
      setError(err.message || 'Ошибка генерации отчета');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    const content = `
ATS CHALLENGE REPORT
${'='.repeat(50)}

EXECUTIVE SUMMARY
${report.executiveSummary}

${'='.repeat(50)}

CANDIDATE PROFILE
Skills: ${report.candidateProfile.skills.join(', ')}
Experience: ${report.candidateProfile.experience}
Strengths: ${report.candidateProfile.strengths.join(', ')}

${'='.repeat(50)}

ATS FILTER ISSUES
${report.atsFilterIssues.map((issue, idx) => `
Issue ${idx + 1} [${issue.severity.toUpperCase()}]
Reason: ${issue.reason}
Explanation: ${issue.explanation}
Evidence: ${issue.evidence}
Recommendation: ${issue.recommendation}
`).join('\n')}

${'='.repeat(50)}

HUMAN REVIEW RECOMMENDATION
Should Review: ${report.humanReviewRecommendation.shouldReview ? 'YES' : 'NO'}
Fit Score: ${report.humanReviewRecommendation.estimatedFitScore}/100
Reasoning: ${report.humanReviewRecommendation.reasoning}

Generated: ${new Date().toISOString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats-challenge-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'warning': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  if (!report) {
    return (
      <GlassCard>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <Shield className="mr-2 h-5 w-5 text-red-600" />
              ATS Challenge Report для HR
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              Генерация профессионального отчета для HR отдела о том, почему их ATS система 
              может отфильтровать хорошего кандидата и почему нужен human review.
            </p>
            <Alert className="bg-amber-950/30 border-amber-800/50">
              <AlertDescription className="text-amber-300 text-xs">
                Этот отчет можно отправить HR отделу для обоснования ручной проверки резюме.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ats-system" className="text-gray-300">
              ATS система (опционально)
            </Label>
            <Input
              id="ats-system"
              placeholder="Taleo, Workday, Greenhouse, etc."
              value={atsSystemName}
              onChange={(e) => setAtsSystemName(e.target.value)}
              className="bg-neutral-900/50 border-neutral-700/50 text-white"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={generate} 
            disabled={isLoading}
            className="w-full bg-linear-to-r from-red-600 to-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Генерация отчета...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Сгенерировать отчет для HR
              </>
            )}
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <GlassCard variant="accent">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          Executive Summary
        </h3>
        <p className="text-gray-300 leading-relaxed">{report.executiveSummary}</p>
      </GlassCard>

      {/* Candidate Profile */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
          Профиль кандидата
        </h3>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-400 mb-1">Навыки:</div>
            <div className="flex flex-wrap gap-2">
              {report.candidateProfile.skills.map((skill, idx) => (
                <Badge key={idx} variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Опыт:</div>
            <div className="text-white">{report.candidateProfile.experience}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Сильные стороны:</div>
            <ul className="space-y-1">
              {report.candidateProfile.strengths.map((strength, idx) => (
                <li key={idx} className="text-white flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* ATS Filter Issues */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
          Проблемы ATS фильтров
        </h3>
        <div className="space-y-4">
          {report.atsFilterIssues.map((issue, idx) => (
            <div key={idx} className="p-4 bg-neutral-900/30 rounded-lg border border-neutral-800/50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(issue.severity)}>
                    {issue.severity === 'critical' ? 'Критично' :
                     issue.severity === 'warning' ? 'Предупреждение' : 'Информация'}
                  </Badge>
                  <span className="text-sm font-semibold text-white">{issue.reason}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Объяснение: </span>
                  <span className="text-gray-300">{issue.explanation}</span>
                </div>
                <Alert className="bg-amber-950/30 border-amber-800/50">
                  <AlertDescription className="text-amber-300 text-xs">
                    <strong>Доказательство:</strong> {issue.evidence}
                  </AlertDescription>
                </Alert>
                <Alert className="bg-blue-950/30 border-blue-800/50">
                  <AlertDescription className="text-blue-300 text-xs">
                    <strong>Рекомендация HR:</strong> {issue.recommendation}
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Human Review Recommendation */}
      <GlassCard variant={report.humanReviewRecommendation.shouldReview ? 'accent' : undefined}>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-purple-600" />
          Рекомендация Human Review
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Рекомендуется ручная проверка:</span>
            <Badge className={report.humanReviewRecommendation.shouldReview 
              ? 'bg-green-500/20 text-green-400 border-green-500/50' 
              : 'bg-red-500/20 text-red-400 border-red-500/50'}
            >
              {report.humanReviewRecommendation.shouldReview ? 'ДА' : 'НЕТ'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Оценка соответствия:</span>
            <span className="text-lg font-bold text-white">
              {report.humanReviewRecommendation.estimatedFitScore}/100
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-400">Обоснование:</span>
            <p className="text-sm text-gray-300 mt-1">{report.humanReviewRecommendation.reasoning}</p>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={downloadReport} 
          variant="outline"
          className="flex-1"
        >
          <Download className="mr-2 h-4 w-4" />
          Скачать отчет
        </Button>
        <Button 
          onClick={() => setReport(null)} 
          variant="outline"
          className="flex-1"
        >
          Новый отчет
        </Button>
      </div>
    </div>
  );
}

