"use client";

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Loader2,
  Target,
  Zap
} from 'lucide-react';
import { SkillsGap } from '@/lib/advanced-ats-analysis';

interface SkillsGapAnalyzerProps {
  resumeContent: string;
  jobDescription: string;
}

export function SkillsGapAnalyzer({ resumeContent, jobDescription }: SkillsGapAnalyzerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{ gaps: SkillsGap[]; summary: string } | null>(null);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!resumeContent || !jobDescription) {
      setError('Резюме и описание вакансии обязательны');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze/skills-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Ошибка анализа');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  const getGapSizeColor = (gap: number) => {
    if (gap >= 3) return 'text-red-400';
    if (gap >= 2) return 'text-orange-400';
    if (gap >= 1) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (!analysis) {
    return (
      <GlassCard>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <Target className="mr-2 h-5 w-5 text-blue-600" />
              Анализ разрыва навыков
            </h3>
            <p className="text-sm text-neutral-400">
              AI анализирует разницу между вашими навыками и требованиями вакансии, 
              дает конкретные рекомендации как закрыть пробелы.
            </p>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button 
            onClick={analyze} 
            disabled={isLoading}
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Анализ...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Начать анализ навыков
              </>
            )}
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <Target className="mr-2 h-5 w-5 text-blue-600" />
          Резюме анализа
        </h3>
        <p className="text-neutral-300">{analysis.summary}</p>
      </GlassCard>

      {/* Skills Gaps */}
      <div className="space-y-4">
        {analysis.gaps.map((gap, idx) => (
          <GlassCard key={idx} className="border-l-4 border-l-blue-600">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-base font-semibold text-white">{gap.skill}</h4>
                    <Badge className={getPriorityColor(gap.priority)}>
                      {gap.priority === 'critical' ? 'Критично' :
                       gap.priority === 'high' ? 'Высокий' :
                       gap.priority === 'medium' ? 'Средний' : 'Низкий'}
                    </Badge>
                  </div>
                  
                  {/* Levels */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-400">Ваш уровень</span>
                        <span className="text-sm font-medium text-white">{gap.currentLevel}/5</span>
                      </div>
                      <Progress value={(gap.currentLevel / 5) * 100} className="h-2" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-400">Требуется</span>
                        <span className="text-sm font-medium text-white">{gap.requiredLevel}/5</span>
                      </div>
                      <Progress value={(gap.requiredLevel / 5) * 100} className="h-2" />
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getGapSizeColor(gap.gap)}`}>
                        -{gap.gap}
                      </div>
                      <div className="text-xs text-neutral-400">Разрыв</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact */}
              <Alert className="bg-amber-950/30 border-amber-800/50">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-300">
                  <strong>Влияние на ATS:</strong> {gap.impact}
                </AlertDescription>
              </Alert>

              {/* Recommendations */}
              <div>
                <h5 className="text-sm font-semibold text-green-400 mb-2 flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Как закрыть разрыв:
                </h5>
                <ul className="space-y-2">
                  {gap.recommendations.map((rec, recIdx) => (
                    <li key={recIdx} className="text-sm text-neutral-300 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              {gap.resources && gap.resources.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-blue-400 mb-2 flex items-center">
                    <BookOpen className="mr-1 h-4 w-4" />
                    Ресурсы для изучения:
                  </h5>
                  <ul className="space-y-1">
                    {gap.resources.map((resource, resIdx) => (
                      <li key={resIdx} className="text-sm text-neutral-400 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">→</span>
                        <span>{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Time Estimate */}
              <div className="flex items-center gap-2 text-sm text-neutral-400 pt-2 border-t border-white/10">
                <Clock className="h-4 w-4" />
                <span>Ориентировочное время: <strong className="text-white">{gap.estimatedTimeToClose}</strong></span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <Button 
        onClick={() => setAnalysis(null)} 
        variant="outline"
        className="w-full"
      >
        Новый анализ
      </Button>
    </div>
  );
}

