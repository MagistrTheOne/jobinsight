"use client";

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  DollarSign,
  Zap,
  Users,
  Award,
  BarChart3,
  Loader2,
  ArrowRight,
  Copy,
  CheckCircle
} from 'lucide-react';
import { ImpactMetric } from '@/lib/advanced-ats-analysis';

interface ImpactOptimizerProps {
  resumeContent: string;
  jobDescription: string;
}

export function ImpactOptimizer({ resumeContent, jobDescription }: ImpactOptimizerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [optimization, setOptimization] = useState<{
    currentImpact: ImpactMetric[];
    suggestions: ImpactMetric[];
    optimizedSections: { section: string; original: string; optimized: string; reasoning: string }[];
  } | null>(null);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const optimize = async () => {
    if (!resumeContent || !jobDescription) {
      setError('Резюме и описание вакансии обязательны');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze/impact-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Optimization failed');
      }

      setOptimization(data.optimization);
    } catch (err: any) {
      setError(err.message || 'Ошибка оптимизации');
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      case 'efficiency': return <Zap className="h-4 w-4" />;
      case 'scale': return <TrendingUp className="h-4 w-4" />;
      case 'quality': return <Award className="h-4 w-4" />;
      case 'leadership': return <Users className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getImpactColor = (type: string) => {
    switch (type) {
      case 'revenue': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'efficiency': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'scale': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'quality': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'leadership': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!optimization) {
    return (
      <GlassCard>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-yellow-600" />
              Оптимизация через Impact (2025)
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              В 2025 году важно не количество проектов, а <strong>влияние на бизнес-метрики</strong>.
            </p>
            <Alert className="bg-blue-950/30 border-blue-800/50">
              <AlertDescription className="text-blue-300 text-xs">
                Вместо "сделал 10 проектов" → "увеличил конверсию на 30%"
              </AlertDescription>
            </Alert>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button 
            onClick={optimize} 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Оптимизация...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Оптимизировать через Impact
              </>
            )}
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Impact */}
      {optimization.currentImpact.length > 0 && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
            Текущие Impact метрики
          </h3>
          <div className="space-y-3">
            {optimization.currentImpact.map((impact, idx) => (
              <div key={idx} className="p-3 bg-neutral-900/30 rounded-lg border border-neutral-800/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getImpactColor(impact.type)}>
                      <span className="mr-1">{getImpactIcon(impact.type)}</span>
                      {impact.type}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-green-400">{impact.value}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{impact.description}</p>
                <p className="text-xs text-gray-400 mb-2">Контекст: {impact.context}</p>
                {impact.suggestion && (
                  <Alert className="bg-blue-950/30 border-blue-800/50 mt-2">
                    <AlertDescription className="text-blue-300 text-xs">
                      💡 <strong>Улучшение:</strong> {impact.suggestion}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Optimized Sections */}
      {optimization.optimizedSections.length > 0 && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ArrowRight className="mr-2 h-5 w-5 text-blue-600" />
            Оптимизированные секции
          </h3>
          <div className="space-y-4">
            {optimization.optimizedSections.map((section, idx) => (
              <div key={idx} className="p-4 bg-neutral-900/30 rounded-lg border border-neutral-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white">{section.section}</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(section.optimized, idx)}
                    className="h-7"
                  >
                    {copiedIndex === idx ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Было:</div>
                    <div className="text-sm text-gray-400 p-2 bg-red-950/20 rounded border border-red-800/30 line-through">
                      {section.original}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Стало (с метриками):</div>
                    <div className="text-sm text-white p-2 bg-green-950/20 rounded border border-green-800/30">
                      {section.optimized}
                    </div>
                  </div>
                  
                  <Alert className="bg-blue-950/30 border-blue-800/50">
                    <AlertDescription className="text-blue-300 text-xs">
                      <strong>Почему лучше:</strong> {section.reasoning}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Suggestions */}
      {optimization.suggestions.length > 0 && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Award className="mr-2 h-5 w-5 text-purple-600" />
            Новые Impact достижения для добавления
          </h3>
          <div className="space-y-3">
            {optimization.suggestions.map((suggestion, idx) => (
              <div key={idx} className="p-3 bg-neutral-900/30 rounded-lg border border-neutral-800/50">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getImpactColor(suggestion.type)}>
                    <span className="mr-1">{getImpactIcon(suggestion.type)}</span>
                    {suggestion.type}
                  </Badge>
                  <span className="text-sm font-semibold text-green-400">{suggestion.value}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{suggestion.description}</p>
                <p className="text-xs text-gray-400 mb-2">Контекст: {suggestion.context}</p>
                {suggestion.suggestion && (
                  <p className="text-xs text-blue-400">💡 {suggestion.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <Button 
        onClick={() => setOptimization(null)} 
        variant="outline"
        className="w-full"
      >
        Новый анализ
      </Button>
    </div>
  );
}

