"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader as Loader2 } from 'lucide-react';

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

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="paste">Paste Content</TabsTrigger>
          </TabsList>
          
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