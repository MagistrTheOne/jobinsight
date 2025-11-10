"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Language = 'ru' | 'en';

export function LanguageToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [language, setLanguage] = React.useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as Language) || 'ru';
    }
    return 'ru';
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
      window.dispatchEvent(new CustomEvent('language-change', { detail: { language } }));
    }
  }, [language, mounted]);

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
      >
        <span className="sr-only">Toggle language</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
        >
          <Languages className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/95 backdrop-blur-xl border-white/10">
        <DropdownMenuItem 
          onClick={() => setLanguage('ru')}
          className={`text-white hover:bg-white/10 cursor-pointer ${language === 'ru' ? 'bg-white/10' : ''}`}
        >
          <span>🇷🇺 Русский</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={`text-white hover:bg-white/10 cursor-pointer ${language === 'en' ? 'bg-white/10' : ''}`}
        >
          <span>🇬🇧 English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
