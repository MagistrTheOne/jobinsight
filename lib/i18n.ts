"use client"

import React from 'react';

export type Language = 'ru' | 'en';

export const translations = {
  ru: {
    // Navigation
    dashboard: 'Дашборд',
    landing: 'Главная',
    // Common
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    search: 'Поиск',
    // Chat
    startConversation: 'Начните разговор с AI Hunter',
    chatDescription: 'Я помогу вам составить резюме, подготовиться к собеседованию или найти подходящие вакансии',
    writeMessage: 'Напишите сообщение...',
    enterToSend: 'Enter — отправить',
    shiftEnterNewLine: 'Shift + Enter — новая строка',
    // Dashboard
    aiChat: 'AI Чат',
    jobAnalysis: 'Анализ вакансий',
    resumeAnalysis: 'Анализ резюме',
    coverLetter: 'Сопроводительное письмо',
    applications: 'Заявки',
    hrAutopilot: 'HR Автопилот',
    salaryAI: 'Зарплата AI',
    pipeline: 'Пайплайн',
    advancedTools: 'Продвинутые инструменты',
    // Stats
    totalApplications: 'Всего заявок',
    interviews: 'Собеседования',
    conversionRate: 'Конверсия',
    // Quick Actions
    analyzeJob: 'Анализ вакансии',
    optimizeResume: 'Оптимизация резюме',
    generateCoverLetter: 'Создать письмо',
    trackApplications: 'Отслеживание заявок',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    landing: 'Landing',
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    // Chat
    startConversation: 'Start a conversation with AI Hunter',
    chatDescription: 'I will help you create a resume, prepare for an interview, or find suitable vacancies',
    writeMessage: 'Write a message...',
    enterToSend: 'Enter — send',
    shiftEnterNewLine: 'Shift + Enter — new line',
    // Dashboard
    aiChat: 'AI Chat',
    jobAnalysis: 'Job Analysis',
    resumeAnalysis: 'Resume Analysis',
    coverLetter: 'Cover Letter',
    applications: 'Applications',
    hrAutopilot: 'HR Autopilot',
    salaryAI: 'Salary AI',
    pipeline: 'Pipeline',
    advancedTools: 'Advanced Tools',
    // Stats
    totalApplications: 'Total Applications',
    interviews: 'Interviews',
    conversionRate: 'Conversion Rate',
    // Quick Actions
    analyzeJob: 'Analyze Job',
    optimizeResume: 'Optimize Resume',
    generateCoverLetter: 'Generate Cover Letter',
    trackApplications: 'Track Applications',
  },
};

export function useLanguage() {
  const [language, setLanguage] = React.useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as Language) || 'ru';
    }
    return 'ru';
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  const t = (key: keyof typeof translations.ru) => translations[language][key] || key;

  return { language, setLanguage, t };
}
