"use client";

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Shield, 
  FileText,
  Zap,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';
import { ATSCompatibilityResult } from '@/lib/ats-checker';

interface ATSCompatibilityCheckerProps {
  resumeContent: string;
  jobDescription?: string;
  onOptimize?: (optimizedContent: string) => void;
}

export function ATSCompatibilityChecker({ 
  resumeContent, 
  jobDescription,
  onOptimize 
}: ATSCompatibilityCheckerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSCompatibilityResult | null>(null);
  const [error, setError] = useState('');

  const checkCompatibility = async () => {
    if (!resumeContent || resumeContent.trim().length < 100) {
      setError('Резюме слишком короткое для анализа');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze/ats-compatibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeContent,
          jobDescription
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ATS check failed');
      }

      setAtsResult(data.atsCompatibility);
    } catch (err: any) {
      setError(err.message || 'Ошибка при проверке ATS совместимости');
    } finally {
      setIsLoading(false);
    }
  };

  // Не запускаем автоматически, только по кнопке
  // useEffect(() => {
  //   if (resumeContent) {
  //     checkCompatibility();
  //   }
  // }, [resumeContent]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/50';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'formatting': 'Форматирование',
      'structure': 'Структура',
      'keywords': 'Ключевые слова',
      'content': 'Содержание',
      'compatibility': 'Совместимость'
    };
    return labels[category] || category;
  };

  if (error && !atsResult) {
    return (
      <GlassCard>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={checkCompatibility} className="mt-4" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Попробовать снова
        </Button>
      </GlassCard>
    );
  }

  if (!atsResult) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          {isLoading ? (
            <>
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-300">Анализ ATS совместимости...</p>
            </>
          ) : (
            <Button onClick={checkCompatibility} className="bg-linear-to-r from-blue-600 to-purple-600">
              <Shield className="mr-2 h-4 w-4" />
              Проверить ATS совместимость
            </Button>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Overall Score */}
      <GlassCard variant="accent" className={getScoreBgColor(atsResult.overallScore)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-white">
                ATS Compatibility Score
              </h3>
              <p className="text-sm text-gray-400">
                Оценка совместимости с системами отбора кандидатов
              </p>
            </div>
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(atsResult.overallScore)}`}>
            {atsResult.overallScore}%
          </div>
        </div>
        <Progress value={atsResult.overallScore} className="mb-3" />
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <span className="text-gray-300">Форматирование: <span className={getScoreColor(atsResult.formattingScore)}>{atsResult.formattingScore}%</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-gray-300">Структура: <span className={getScoreColor(atsResult.structureScore)}>{atsResult.structureScore}%</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-300">Ключевые слова: <span className={getScoreColor(atsResult.keywordScore)}>{atsResult.keywordScore}%</span></span>
          </div>
        </div>
      </GlassCard>

      {/* Recommendations */}
      {atsResult.recommendations.length > 0 && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            Рекомендации по улучшению
          </h3>
          <ul className="space-y-2">
            {atsResult.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* Issues */}
      {atsResult.issues.length > 0 && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
            Найденные проблемы ({atsResult.issues.length})
          </h3>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="critical">Критичные</TabsTrigger>
              <TabsTrigger value="warning">Предупреждения</TabsTrigger>
              <TabsTrigger value="info">Информация</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              {atsResult.issues.map((issue, index) => (
                <Alert key={index} variant={issue.type === 'critical' ? 'destructive' : 'default'}>
                  <div className="flex items-start space-x-2">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(issue.category)}
                        </Badge>
                        <span className="text-sm font-medium">{issue.message}</span>
                      </div>
                      <AlertDescription className="text-sm mt-1">
                        💡 {issue.suggestion}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </TabsContent>

            <TabsContent value="critical" className="space-y-3 mt-4">
              {atsResult.issues.filter(i => i.type === 'critical').map((issue, index) => (
                <Alert key={index} variant="destructive">
                  <div className="flex items-start space-x-2">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(issue.category)}
                        </Badge>
                        <span className="text-sm font-medium">{issue.message}</span>
                      </div>
                      <AlertDescription className="text-sm mt-1">
                        💡 {issue.suggestion}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </TabsContent>

            <TabsContent value="warning" className="space-y-3 mt-4">
              {atsResult.issues.filter(i => i.type === 'warning').map((issue, index) => (
                <Alert key={index}>
                  <div className="flex items-start space-x-2">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(issue.category)}
                        </Badge>
                        <span className="text-sm font-medium">{issue.message}</span>
                      </div>
                      <AlertDescription className="text-sm mt-1">
                        💡 {issue.suggestion}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </TabsContent>

            <TabsContent value="info" className="space-y-3 mt-4">
              {atsResult.issues.filter(i => i.type === 'info').map((issue, index) => (
                <Alert key={index}>
                  <div className="flex items-start space-x-2">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(issue.category)}
                        </Badge>
                        <span className="text-sm font-medium">{issue.message}</span>
                      </div>
                      <AlertDescription className="text-sm mt-1">
                        💡 {issue.suggestion}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </TabsContent>
          </Tabs>
        </GlassCard>
      )}

      {/* ATS Systems Compatibility */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-blue-600" />
          Совместимость с ATS системами
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(atsResult.atsSystems).map(([system, data]) => (
            <div
              key={system}
              className={`p-4 rounded-lg border ${
                data.compatible
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-red-500/10 border-red-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{system}</span>
                {data.compatible ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <Progress value={data.score} className="mb-2" />
              <span className={`text-sm ${getScoreColor(data.score)}`}>
                {data.score}%
              </span>
              {data.issues.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {data.issues.map((issue, idx) => (
                    <li key={idx} className="text-xs text-gray-400">
                      • {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Keyword Density */}
      {Object.keys(atsResult.keywordDensity).length > 0 && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Zap className="mr-2 h-5 w-5 text-yellow-600" />
            Плотность ключевых слов
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(atsResult.keywordDensity)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 20)
              .map(([keyword, density]) => (
                <Badge
                  key={keyword}
                  variant={density > 0.5 ? 'default' : 'outline'}
                  className={density > 0.5 ? 'bg-green-500/20 text-green-300' : ''}
                >
                  {keyword}: {density.toFixed(2)}%
                </Badge>
              ))}
          </div>
        </GlassCard>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          onClick={checkCompatibility}
          disabled={isLoading}
          variant="outline"
          className="bg-gray-800/50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Обновить анализ
        </Button>
      </div>
    </div>
  );
}

