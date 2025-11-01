// Web Search Tool using Google Custom Search API or Serper API

import { ToolResult } from './types';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export async function webSearch(query: string, maxResults: number = 5): Promise<ToolResult> {
  try {
    // Option 1: Use Serper API (recommended, easier to use)
    const serperApiKey = process.env.SERPER_API_KEY;
    if (serperApiKey) {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: maxResults,
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`);
      }

      const data = await response.json();
      const results: SearchResult[] = (data.organic || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));

      return {
        success: true,
        data: {
          query,
          results,
          totalResults: data.searchInformation?.totalResults || 0,
        },
      };
    }

    // Option 2: Use Google Custom Search API (fallback)
    const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const googleCx = process.env.GOOGLE_SEARCH_ENGINE_ID || '4640afe7d8a674032'; // Default from user's config

    if (googleApiKey && googleCx) {
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.append('key', googleApiKey);
      url.searchParams.append('cx', googleCx);
      url.searchParams.append('q', query);
      url.searchParams.append('num', String(Math.min(maxResults, 10))); // Max 10 per request

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Google Search API error: ${response.statusText}`);
      }

      const data = await response.json();
      const results: SearchResult[] = (data.items || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));

      return {
        success: true,
        data: {
          query,
          results,
          totalResults: data.searchInformation?.totalResults || 0,
        },
      };
    }
    
    // Option 3: Use Google Custom Search Element (client-side fallback, но не работает в server-side API)
    // Для этого нужно использовать на фронтенде или создать отдельный endpoint

    // If no API keys configured
    return {
      success: false,
      error: 'No search API configured. Please set SERPER_API_KEY or GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.',
    };
  } catch (error: any) {
    console.error('Web search error:', error);
    return {
      success: false,
      error: error.message || 'Failed to perform web search',
    };
  }
}

// Helper to format search results for AI
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'Результаты поиска не найдены.';
  }

  return results
    .map(
      (result, index) =>
        `${index + 1}. **${result.title}**\n   ${result.link}\n   ${result.snippet}\n`
    )
    .join('\n');
}

