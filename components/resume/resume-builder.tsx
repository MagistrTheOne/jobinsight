"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Loader2, Download, Copy, CheckCircle2, Briefcase, FileCheck } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useAnalysisStore } from "@/store/analysis-store";

export function ResumeBuilder() {
  const { 
    currentJobAnalysis, 
    currentJobContent, 
    currentResumeAnalysis, 
    currentResumeContent 
  } = useAnalysisStore();
  
  const [prompt1, setPrompt1] = useState("");
  const [prompt2, setPrompt2] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [useJobAnalysis, setUseJobAnalysis] = useState(false);
  const [useResumeAnalysis, setUseResumeAnalysis] = useState(false);

  // Автозаполнение из анализа, если доступно
  useEffect(() => {
    if (useResumeAnalysis && currentResumeContent && !prompt1) {
      setPrompt1(currentResumeContent.substring(0, 1000)); // Первые 1000 символов
    }
  }, [useResumeAnalysis, currentResumeContent, prompt1]);

  const handleGenerate = async () => {
    if (!prompt1.trim()) {
      toast.error("Первый промпт обязателен");
      return;
    }

    setLoading(true);
    setGeneratedResume(null);

    try {
      const requestBody: any = {
        prompt1: prompt1.trim(),
        prompt2: prompt2.trim() || undefined,
      };

      // Добавляем данные анализа, если выбрано
      if (useJobAnalysis && currentJobAnalysis) {
        requestBody.jobAnalysis = currentJobAnalysis;
        requestBody.jobContent = currentJobContent;
      }
      if (useResumeAnalysis && currentResumeAnalysis) {
        requestBody.resumeAnalysis = currentResumeAnalysis;
        requestBody.resumeContent = currentResumeContent;
      }

      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.upgradeRequired) {
          toast.error("Превышен лимит использования. Требуется обновление плана.");
        } else {
          throw new Error(data.error || "Failed to generate resume");
        }
        return;
      }

      if (data.success && data.resume) {
        setGeneratedResume(data.resume.content);
        toast.success("Резюме успешно создано!");
      } else {
        throw new Error("Invalid response");
      }
    } catch (error: any) {
      toast.error("Ошибка генерации резюме: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (generatedResume) {
      await navigator.clipboard.writeText(generatedResume);
      setCopied(true);
      toast.success("Резюме скопировано в буфер обмена");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedResume) {
      const blob = new Blob([generatedResume], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Резюме скачано");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-400" />
            Генератор резюме
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Создание профессионального резюме с использованием AI и данных анализа
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Интеграция с анализом */}
          {(currentJobAnalysis || currentResumeAnalysis) && (
            <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <Label className="text-white text-sm font-semibold">Использовать данные анализа</Label>
              <div className="flex flex-wrap gap-3">
                {currentResumeAnalysis && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="use-resume-analysis"
                      checked={useResumeAnalysis}
                      onChange={(e) => {
                        setUseResumeAnalysis(e.target.checked);
                        if (e.target.checked && currentResumeContent) {
                          setPrompt1(currentResumeContent.substring(0, 1000));
                        }
                      }}
                      className="rounded border-white/20"
                    />
                    <Label htmlFor="use-resume-analysis" className="text-sm text-neutral-300 cursor-pointer flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Использовать проанализированное резюме
                    </Label>
                  </div>
                )}
                {currentJobAnalysis && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="use-job-analysis"
                      checked={useJobAnalysis}
                      onChange={(e) => setUseJobAnalysis(e.target.checked)}
                      className="rounded border-white/20"
                    />
                    <Label htmlFor="use-job-analysis" className="text-sm text-neutral-300 cursor-pointer flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Оптимизировать под вакансию
                      {currentJobAnalysis && (
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-600/20 border-blue-500/30 text-blue-300">
                          Анализ загружен
                        </Badge>
                      )}
                    </Label>
                  </div>
                )}
              </div>
            </div>
          )}

          <Alert className="bg-blue-600/10 border-blue-500/30">
            <FileText className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300 text-sm">
              Укажите информацию о вашем опыте, навыках и достижениях. AI создаст структурированное резюме.
              {useJobAnalysis && currentJobAnalysis && " Резюме будет оптимизировано под требования вакансии."}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="prompt1" className="text-white text-base">
              Информация о кандидате *
            </Label>
            <Textarea
              id="prompt1"
              value={prompt1}
              onChange={(e) => setPrompt1(e.target.value)}
              placeholder="Опишите ваш опыт работы, образование, навыки, достижения, языки, сертификаты. Например: Разработчик с 5 годами опыта в React и Node.js. Работал в компаниях X и Y. Основные достижения: увеличил производительность на 40%, внедрил микросервисную архитектуру. Образование: МГУ, факультет ВМК. Английский B2. Сертификаты: AWS, Docker."
              rows={8}
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500"
            />
            <p className="text-xs text-neutral-500">
              Опыт работы, образование, навыки, достижения, языки, сертификаты
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt2" className="text-white text-base">
              Дополнительные требования (опционально)
            </Label>
            <Textarea
              id="prompt2"
              value={prompt2}
              onChange={(e) => setPrompt2(e.target.value)}
              placeholder="Укажите стиль, акценты, формат или дополнительные секции. Например: Акцент на технических навыках, больше количественных показателей, секция с проектами."
              rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500"
            />
            <p className="text-xs text-neutral-500">
              Стиль, акценты, формат или дополнительные секции для резюме
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt1.trim()}
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Генерация резюме...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Создать резюме
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedResume && (
        <Card className="bg-black/60 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Сгенерированное резюме
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Копировать
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Скачать
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none bg-white/5 rounded-lg p-6 border border-white/10 text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_p]:text-neutral-300 [&_li]:text-neutral-300 [&_strong]:text-white">
              <ReactMarkdown>
                {generatedResume}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

