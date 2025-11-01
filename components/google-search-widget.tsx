"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Google Custom Search Element Widget
 * Используется для встраивания виджета поиска на страницу
 * 
 * Для использования добавьте компонент на страницу:
 * <GoogleSearchWidget />
 */
export function GoogleSearchWidget() {
  useEffect(() => {
    // Google Custom Search Element автоматически инициализируется после загрузки скрипта
    // cx=4640afe7d8a674032 - ваш Engine ID
  }, []);

  return (
    <>
      <Script
        src="https://cse.google.com/cse.js?cx=4640afe7d8a674032"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Google Custom Search Element loaded');
        }}
      />
      <div className="gcse-search" style={{ minHeight: '400px' }} />
    </>
  );
}

/**
 * Google Custom Search Results Only Widget
 * Показывает только результаты поиска (без формы поиска)
 * 
 * Использование:
 * <GoogleSearchResultsWidget query="your search query" />
 */
interface GoogleSearchResultsProps {
  query?: string;
}

export function GoogleSearchResultsWidget({ query }: GoogleSearchResultsProps) {
  return (
    <>
      <Script
        src="https://cse.google.com/cse.js?cx=4640afe7d8a674032"
        strategy="lazyOnload"
      />
      <div 
        className="gcse-searchresults-only" 
        data-queryParameterName="q"
        data-as_sitesearch=""
        style={{ minHeight: '400px' }}
      >
        {query && (
          <div className="gcse-searchresults" data-query={query} />
        )}
      </div>
    </>
  );
}

