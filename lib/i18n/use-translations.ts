"use client";

import { useState, useEffect } from 'react';
import { translations, Language, TranslationKeys } from './translations';

export type { Language };

// Helper function to get nested translation
function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// Hook for using translations
export function useTranslations() {
  const [language, setLanguage] = useState<Language>('ru');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    } else {
      // Default to Russian for Russian-speaking users
      const userLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
      setLanguage(userLang);
    }
  }, []);

  // Save language to localStorage when changed
  useEffect(() => {
    localStorage.setItem('language', language);
    // Update document language
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translation = getNestedTranslation(translations[language], key);
    return typeof translation === 'string' ? translation : key;
  };

  const changeLanguage = (newLanguage: Language) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  };

  return {
    t,
    language,
    changeLanguage,
    availableLanguages: Object.keys(translations) as Language[],
  };
}
