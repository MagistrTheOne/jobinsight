import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JobAnalysis, ResumeAnalysis } from '@/lib/types';
import { useAuthStore } from './auth-store';

interface AnalysisHistoryItem {
  id: string;
  type: 'job' | 'resume' | 'cover-letter';
  title: string;
  data: JobAnalysis | ResumeAnalysis | string;
  timestamp: string; // ISO string for serialization
  jobUrl?: string;
}

interface AnalysisState {
  // Job Analysis
  currentJobAnalysis: JobAnalysis | null;
  currentJobUrl: string;
  currentJobContent: string;

  // Resume Analysis
  currentResumeAnalysis: ResumeAnalysis | null;
  currentResumeContent: string;

  // Cover Letter
  currentCoverLetter: string;

  // History
  history: AnalysisHistoryItem[];

  // Actions
  setJobAnalysis: (analysis: JobAnalysis | null) => void;
  setJobUrl: (url: string) => void;
  setJobContent: (content: string) => void;
  setResumeAnalysis: (analysis: ResumeAnalysis | null) => void;
  setResumeContent: (content: string) => void;
  setCoverLetter: (letter: string) => void;
  addToHistory: (item: Omit<AnalysisHistoryItem, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  clearCurrent: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentJobAnalysis: null,
      currentJobUrl: '',
      currentJobContent: '',
      currentResumeAnalysis: null,
      currentResumeContent: '',
      currentCoverLetter: '',
      history: [],

      setJobAnalysis: (analysis) => {
        set({ currentJobAnalysis: analysis });
        if (analysis) {
          get().addToHistory({
            type: 'job',
            title: `Job Analysis - ${new Date().toLocaleDateString()}`,
            data: analysis,
            jobUrl: get().currentJobUrl,
          });
        }
      },

      setJobUrl: (url) => set({ currentJobUrl: url }),
      setJobContent: (content) => set({ currentJobContent: content }),

      setResumeAnalysis: (analysis) => {
        set({ currentResumeAnalysis: analysis });
        if (analysis) {
          get().addToHistory({
            type: 'resume',
            title: `Resume Analysis - ${new Date().toLocaleDateString()}`,
            data: analysis,
          });
        }
      },

      setResumeContent: (content) => set({ currentResumeContent: content }),

      setCoverLetter: (letter) => {
        set({ currentCoverLetter: letter });
        if (letter) {
          get().addToHistory({
            type: 'cover-letter',
            title: `Cover Letter - ${new Date().toLocaleDateString()}`,
            data: letter,
          });
        }
      },

      addToHistory: async (item) => {
        const newItem: AnalysisHistoryItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          timestamp: new Date().toISOString(),
        };
        
        // Сохраняем в localStorage для быстрого доступа
        set((state) => ({
          history: [newItem, ...state.history].slice(0, 50), // Keep last 50 items
        }));

        // Также сохраняем в БД, если пользователь авторизован
        try {
          const { isAuthenticated } = useAuthStore.getState();
          if (isAuthenticated) {
            const response = await fetch('/api/analysis/history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: item.type,
                title: item.title,
                data: item.data,
                jobUrl: item.jobUrl,
              }),
            });
            
            if (response.ok) {
              const result = await response.json();
              // Обновляем ID с сервера
              newItem.id = result.item.id;
            }
          }
        } catch (error) {
          console.error('Failed to save history to DB:', error);
          // Не блокируем UI, если сохранение в БД не удалось
        }
      },

      removeFromHistory: async (id) => {
        // Удаляем из localStorage
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));

        // Также удаляем из БД, если пользователь авторизован
        try {
          const { isAuthenticated } = useAuthStore.getState();
          if (isAuthenticated) {
            await fetch(`/api/analysis/history?id=${id}`, {
              method: 'DELETE',
            });
          }
        } catch (error) {
          console.error('Failed to delete history from DB:', error);
        }
      },

      clearHistory: () => {
        set({ history: [] });
      },

      clearCurrent: () => {
        set({
          currentJobAnalysis: null,
          currentResumeAnalysis: null,
          currentCoverLetter: '',
        });
      },
    }),
    {
      name: 'analysis-storage',
      partialize: (state) => ({
        history: state.history,
        // Сохраняем только последние данные для быстрого восстановления
        currentJobAnalysis: state.currentJobAnalysis,
        currentResumeAnalysis: state.currentResumeAnalysis,
        currentCoverLetter: state.currentCoverLetter,
      }),
    }
  )
);

