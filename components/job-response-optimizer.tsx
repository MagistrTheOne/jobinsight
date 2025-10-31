"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, Download, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { OptimizedContent, JobAnalysis, UserInfo } from '@/lib/types';

interface JobResponseOptimizerProps {
  type: 'cover-letter' | 'resume';
  originalContent: string;
  jobAnalysis?: JobAnalysis;
  jobContent?: string;
  jobUrl?: string;
  userInfo?: UserInfo;
  onOptimized?: (optimized: OptimizedContent) => void;
}

export function JobResponseOptimizer({
  type,
  originalContent,
  jobAnalysis,
  jobContent,
  jobUrl,
  userInfo,
  onOptimized
}: JobResponseOptimizerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [optimized, setOptimized] = useState<OptimizedContent | null>(null);

  const handleOptimize = async () => {
    if (!jobAnalysis && !jobContent && !jobUrl) {
      setError('Необходим анализ вакансии или содержание вакансии для оптимизации');
      return;
    }

    if (type === 'cover-letter' && !userInfo?.name) {
      setError('Для оптимизации сопроводительного письма необходима информация о пользователе');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = type === 'cover-letter' 
        ? '/api/optimize/cover-letter'
        : '/api/optimize/resume';

      const body: any = {
        [type === 'resume' ? 'resumeContent' : 'currentCoverLetter']: originalContent,
      };

      if (jobUrl) {
        body.url = jobUrl;
      }
      if (jobContent) {
        body.jobContent = jobContent;
      }
      if (jobAnalysis) {
        body.jobAnalysis = jobAnalysis;
      }
      if (userInfo && type === 'cover-letter') {
        body.userInfo = userInfo;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Optimization failed');
      }

      setOptimized(data.optimized);
      if (onOptimized) {
        onOptimized(data.optimized);
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при оптимизации');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = (text: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!optimized) {
    return (
      <GlassCard className="w-full max-w-4xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-yellow-600" />
                {type === 'cover-letter' ? 'Оптимизация сопроводительного письма' : 'Оптимизация резюме'}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Создайте улучшенную версию, оптимизированную под конкретную вакансию
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
            <p className="text-sm text-gray-300 mb-4">
              {type === 'cover-letter' 
                ? 'Для оптимизации сопроводительного письма необходим анализ вакансии и информация о пользователе.'
                : 'Для оптимизации резюме необходим анализ вакансии или содержание вакансии.'}
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              {jobAnalysis && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Анализ вакансии доступен</span>
                  {jobAnalysis.jobGrade && (
                    <Badge variant="secondary" className="ml-2">
                      {jobAnalysis.jobGrade.level}
                    </Badge>
                  )}
                </div>
              )}
              {jobContent && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Содержание вакансии доступно</span>
                </div>
              )}
              {jobUrl && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>URL вакансии доступен</span>
                </div>
              )}
              {type === 'cover-letter' && userInfo?.name && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Информация о пользователе доступна</span>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleOptimize}
            disabled={isLoading || (!jobAnalysis && !jobContent && !jobUrl) || (type === 'cover-letter' && !userInfo?.name)}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Оптимизирую...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Оптимизировать {type === 'cover-letter' ? 'сопроводительное письмо' : 'резюме'}
              </>
            )}
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full max-w-5xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-yellow-600" />
              Оптимизированная версия
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {type === 'cover-letter' ? 'Сопроводительное письмо' : 'Резюме'} оптимизировано под вакансию
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => copyToClipboard(optimized.optimized)}
              variant="outline"
              size="sm"
              className="bg-gray-800/50 border-gray-600/50"
            >
              <Copy className="mr-2 h-4 w-4" />
              Копировать
            </Button>
            <Button
              onClick={() => downloadText(optimized.optimized, `${type === 'cover-letter' ? 'cover-letter' : 'resume'}-optimized.txt`)}
              variant="outline"
              size="sm"
              className="bg-gray-800/50 border-gray-600/50"
            >
              <Download className="mr-2 h-4 w-4" />
              Скачать
            </Button>
          </div>
        </div>

        {/* Improvements */}
        {optimized.improvements && optimized.improvements.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold text-green-400 mb-2">Улучшения:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {optimized.improvements.map((improvement, index) => (
                    <li key={index} className="text-gray-300">{improvement}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Keywords Added */}
        {optimized.keywordsAdded && optimized.keywordsAdded.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-white mb-2">Добавленные ключевые слова:</div>
            <div className="flex flex-wrap gap-2">
              {optimized.keywordsAdded.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-900/50 text-blue-300 border-blue-700/50">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Tabs */}
        <Tabs defaultValue="optimized" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="optimized">
              <Sparkles className="mr-2 h-4 w-4" />
              Оптимизированная версия
            </TabsTrigger>
            <TabsTrigger value="original">
              <FileText className="mr-2 h-4 w-4" />
              Оригинальная версия
            </TabsTrigger>
          </TabsList>

          <TabsContent value="optimized" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono">
                  {optimized.optimized}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="original" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono opacity-75">
                  {optimized.original || originalContent}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button
          onClick={() => {
            setOptimized(null);
            setError('');
          }}
          variant="outline"
          className="w-full"
        >
          Создать новую оптимизацию
        </Button>
      </div>
    </GlassCard>
  );
}

