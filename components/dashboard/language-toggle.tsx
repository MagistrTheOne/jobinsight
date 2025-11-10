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
import { useTranslations, Language } from "@/lib/i18n/use-translations"

export function LanguageToggle() {
  const { t, language, changeLanguage, availableLanguages } = useTranslations();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
      >
        <span className="sr-only">{t('language')}</span>
      </Button>
    );
  }

  const handleLanguageChange = (newLanguage: Language) => {
    console.log('Changing language to:', newLanguage);
    changeLanguage(newLanguage);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
          title={`${t('language')}: ${t(language === 'ru' ? 'russian' : 'english')}`}
        >
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/95 backdrop-blur-xl border-white/10">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`text-white hover:bg-white/10 cursor-pointer transition-colors ${language === lang ? 'bg-white/10' : ''}`}
          >
            <span>{lang === 'ru' ? '🇷🇺' : '🇬🇧'} {t(lang === 'ru' ? 'russian' : 'english')}</span>
            {language === lang && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
