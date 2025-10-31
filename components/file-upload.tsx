"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader as Loader2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onAnalyze: (content: string) => void;
  isLoading: boolean;
  type: 'resume' | 'job-content';
  title: string;
  placeholder: string;
}

export function FileUpload({ onAnalyze, isLoading, type, title, placeholder }: FileUploadProps) {
  const [content, setContent] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [hhUrl, setHhUrl] = useState('');
  const [isLoadingHH, setIsLoadingHH] = useState(false);
  const [hhError, setHhError] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      setUploadedFileName(file.name);
    };
    reader.readAsText(file);
  }, []);

  const isValidHHUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return (urlObj.hostname.includes('hh.ru') || urlObj.hostname.includes('headhunter.ru')) &&
             url.includes('vacancy');
    } catch {
      return false;
    }
  };

  const handleHHFetch = async () => {
    if (!hhUrl.trim()) {
      setHhError('Пожалуйста, введите ссылку на вакансию');
      return;
    }

    if (!isValidHHUrl(hhUrl)) {
      setHhError('Некорректная ссылка HeadHunter. Ожидается формат: https://hh.ru/vacancy/12345678');
      return;
    }

    setIsLoadingHH(true);
    setHhError('');
    setContent('');

    try {
      const response = await fetch('/api/fetch/hh-vacancy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: hhUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch vacancy');
      }

      setContent(data.content);
      setHhError('');
    } catch (err: any) {
      setHhError(err.message || 'Ошибка при загрузке вакансии');
    } finally {
      setIsLoadingHH(false);
    }
  };

  const isValidResumeUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleResumeFetch = async () => {
    if (!resumeUrl.trim()) {
      setResumeError('Пожалуйста, введите ссылку на резюме');
      return;
    }

    if (!isValidResumeUrl(resumeUrl)) {
      setResumeError('Некорректная ссылка. Пожалуйста, введите валидный URL');
      return;
    }

    setIsLoadingResume(true);
    setResumeError('');
    setContent('');

    try {
      const response = await fetch('/api/fetch/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: resumeUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch resume');
      }

      setContent(data.content);
      setResumeError('');
    } catch (err: any) {
      setResumeError(err.message || 'Ошибка при загрузке резюме');
    } finally {
      setIsLoadingResume(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAnalyze(content);
    }
  };

  return (
    <GlassCard className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="text-gray-300">Upload a file or paste your content directly</p>
        </div>

        <Tabs defaultValue={type === 'job-content' ? 'hh-url' : type === 'resume' ? 'url-link' : 'upload'} className="w-full">
          <TabsList className={`grid w-full ${type === 'job-content' ? 'grid-cols-3' : type === 'resume' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {type === 'job-content' && (
              <TabsTrigger value="hh-url">
                <LinkIcon className="h-4 w-4 mr-2 inline" />
                HH.ru Link
              </TabsTrigger>
            )}
            {type === 'resume' && (
              <TabsTrigger value="url-link">
                <LinkIcon className="h-4 w-4 mr-2 inline" />
                URL Link
              </TabsTrigger>
            )}
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="paste">Paste Content</TabsTrigger>
          </TabsList>

          {type === 'job-content' && (
            <TabsContent value="hh-url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hh-url" className="text-sm font-medium text-gray-200">
                  HeadHunter вакансия URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="hh-url"
                    type="url"
                    placeholder="https://hh.ru/vacancy/12345678"
                    value={hhUrl}
                    onChange={(e) => {
                      setHhUrl(e.target.value);
                      setHhError('');
                    }}
                    className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                    disabled={isLoadingHH || isLoading}
                  />
                  <Button
                    type="button"
                    onClick={handleHHFetch}
                    disabled={isLoadingHH || isLoading || !hhUrl.trim()}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {isLoadingHH ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Загрузить
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Вставьте ссылку на вакансию с сайта HeadHunter.ru. Данные будут автоматически загружены.
                </p>
                {hhError && (
                  <Alert variant="destructive">
                    <AlertDescription>{hhError}</AlertDescription>
                  </Alert>
                )}
                {content && !hhError && (
                  <Alert>
                    <AlertDescription className="text-green-400">
                      ✅ Вакансия успешно загружена! Перейдите на вкладку "Paste Content" для просмотра или сразу нажмите кнопку "Analyze".
                    </AlertDescription>
                  </Alert>
                )}
                {content && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        if (content.trim()) {
                          onAnalyze(content);
                        }
                      }}
                      disabled={isLoading || !content.trim()}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Анализирую...
                        </>
                      ) : (
                        'Проанализировать вакансию'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {type === 'resume' && (
            <TabsContent value="url-link" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume-url" className="text-sm font-medium text-gray-200">
                  Ссылка на резюме (HH.ru, LinkedIn и др.)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="resume-url"
                    type="url"
                    placeholder="https://hh.ru/resume/... или другая ссылка"
                    value={resumeUrl}
                    onChange={(e) => {
                      setResumeUrl(e.target.value);
                      setResumeError('');
                    }}
                    className="bg-gray-800/50 border-gray-600/30 focus:border-blue-400"
                    disabled={isLoadingResume || isLoading}
                  />
                  <Button
                    type="button"
                    onClick={handleResumeFetch}
                    disabled={isLoadingResume || isLoading || !resumeUrl.trim()}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {isLoadingResume ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Загрузить
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Вставьте публичную ссылку на резюме. Поддерживаются HeadHunter, LinkedIn и другие сайты.
                </p>
                {resumeError && (
                  <Alert variant="destructive">
                    <AlertDescription>{resumeError}</AlertDescription>
                  </Alert>
                )}
                {content && !resumeError && (
                  <Alert>
                    <AlertDescription className="text-green-400">
                      ✅ Резюме успешно загружено! Перейдите на вкладку "Paste Content" для просмотра или сразу нажмите кнопку "Analyze".
                    </AlertDescription>
                  </Alert>
                )}
                {content && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        if (content.trim()) {
                          onAnalyze(content);
                        }
                      }}
                      disabled={isLoading || !content.trim()}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Анализирую...
                        </>
                      ) : (
                        'Проанализировать резюме'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-sm font-medium text-gray-200 cursor-pointer">
                  Choose a file to upload
                </Label>
                <p className="text-xs text-gray-400">TXT, DOC, PDF files supported</p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            {uploadedFileName && (
              <div className="flex items-center justify-center space-x-2 text-sm text-green-400">
                <FileText className="h-4 w-4" />
                <span>Uploaded: {uploadedFileName}</span>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium text-gray-200">
                Paste your content
              </Label>
              <Textarea
                id="content"
                placeholder={placeholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] bg-gray-800/50 border-gray-600/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit}>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
            disabled={isLoading || !content.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Content...
              </>
            ) : (
              `Analyze ${type === 'resume' ? 'Resume' : 'Job Content'}`
            )}
          </Button>
        </form>
      </div>
    </GlassCard>
  );
}