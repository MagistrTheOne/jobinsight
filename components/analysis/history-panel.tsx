"use client";

import { useEffect, useState } from 'react';
import { useAnalysisStore } from '@/store/analysis-store';
import { useAuthStore } from '@/store/auth-store';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  Trash2, 
  FileText, 
  Briefcase, 
  Mail,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { JobAnalysis, ResumeAnalysis } from '@/lib/types';

interface HistoryItem {
  id: string;
  type: 'job' | 'resume' | 'cover-letter';
  title: string;
  data: JobAnalysis | ResumeAnalysis | string;
  createdAt?: string;
  timestamp?: string;
  jobUrl?: string | null;
}

export function HistoryPanel() {
  const { history: localHistory, removeFromHistory, clearHistory, setJobAnalysis, setResumeAnalysis, setCoverLetter } = useAnalysisStore();
  const { isAuthenticated } = useAuthStore();
  const [dbHistory, setDbHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем историю из БД при монтировании и изменении авторизации
  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    } else {
      setDbHistory([]);
    }
  }, [isAuthenticated]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analysis/history?limit=50');
      if (response.ok) {
        const data = await response.json();
        setDbHistory(data.history || []);
      } else {
        setError('Failed to load history');
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/analysis/history?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Удаляем из локального состояния
        removeFromHistory(id);
        // Обновляем БД историю
        setDbHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleLoadItem = (item: HistoryItem) => {
    if (item.type === 'job' && typeof item.data !== 'string') {
      setJobAnalysis(item.data as JobAnalysis);
    } else if (item.type === 'resume' && typeof item.data !== 'string') {
      setResumeAnalysis(item.data as ResumeAnalysis);
    } else if (item.type === 'cover-letter' && typeof item.data === 'string') {
      setCoverLetter(item.data);
    }
  };

  // Объединяем историю из БД и localStorage (приоритет БД)
  const displayHistory: HistoryItem[] = isAuthenticated 
    ? dbHistory.map(item => ({
        ...item,
        timestamp: item.createdAt,
      }))
    : localHistory.map(item => ({
        ...item,
        createdAt: item.timestamp,
      }));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'resume':
        return <FileText className="h-4 w-4" />;
      case 'cover-letter':
        return <Mail className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-blue-900/50 text-blue-300 border-blue-700/50';
      case 'resume':
        return 'bg-green-900/50 text-green-300 border-green-700/50';
      case 'cover-letter':
        return 'bg-purple-900/50 text-purple-300 border-purple-700/50';
      default:
        return '';
    }
  };

  if (isLoading && displayHistory.length === 0) {
    return (
      <GlassCard className="w-full max-w-md">
        <div className="text-center py-8 text-gray-400">
          <Loader2 className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
          <p>Loading history...</p>
        </div>
      </GlassCard>
    );
  }

  if (displayHistory.length === 0) {
    return (
      <GlassCard className="w-full max-w-md">
        <div className="text-center py-8 text-gray-400">
          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No analysis history yet</p>
          <p className="text-sm mt-2">Your analyses will appear here</p>
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadHistory}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-white">History</h3>
          <Badge variant="secondary" className="bg-gray-700/50">
            {displayHistory.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={loadHistory}
              disabled={isLoading}
              className="text-gray-400 hover:text-blue-400"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {displayHistory.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <Badge
                    variant="outline"
                    className={getTypeColor(item.type)}
                  >
                    {getTypeIcon(item.type)}
                    <span className="ml-1 capitalize">{item.type}</span>
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {format(new Date(item.createdAt || item.timestamp || new Date()), 'MMM dd, HH:mm')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(item.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                {item.title}
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLoadItem(item)}
                className="w-full bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50"
              >
                Load
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}

