import { NextRequest, NextResponse } from 'next/server';
import { gigachatAPI } from '@/lib/gigachat';
import { scrapeJobPosting } from '@/lib/scraper';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-ip';

// In-memory storage for demo attempts tracking (by IP)
// В production можно использовать Redis для этого
const demoAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Очистка старых записей каждые 24 часа
setInterval(() => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  Array.from(demoAttempts.entries()).forEach(([ip, data]) => {
    if (now - data.lastAttempt > oneDay) {
      demoAttempts.delete(ip);
    }
  });
}, 60 * 60 * 1000); // Проверка каждый час

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - более строгий для демо
    const identifier = getClientIp(request);
    const rateLimitResult = await rateLimit(identifier, 2, 60000); // 2 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Check if demo attempt was already used
    const ipData = demoAttempts.get(identifier);
    if (ipData && ipData.count >= 1) {
      return NextResponse.json(
        {
          error: 'Demo limit reached',
          message: 'You have already used your free demo. Please sign in for unlimited access.',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { url, jobContent } = body;

    if (!url && !jobContent) {
      return NextResponse.json(
        { error: 'Either URL or job content is required' },
        { status: 400 }
      );
    }

    let contentToAnalyze = jobContent;

    // If URL is provided and no direct content, scrape the URL
    if (url && !jobContent) {
      try {
        const scrapedData = await scrapeJobPosting(url);
        contentToAnalyze = `${scrapedData.title}\n\nКомпания: ${scrapedData.company}\n\nОписание: ${scrapedData.description}\n\nТребования: ${scrapedData.requirements}\n\nПолный контент: ${scrapedData.fullContent}`;
      } catch (scrapeError) {
        console.error('Scraping error:', scrapeError);
        return NextResponse.json(
          { error: 'Failed to fetch job posting content from URL. Please try pasting the content directly.' },
          { status: 400 }
        );
      }
    }

    if (!contentToAnalyze || contentToAnalyze.trim().length < 50) {
      return NextResponse.json(
        { error: 'Job content is too short or empty' },
        { status: 400 }
      );
    }

    // Real GigaChat API call - тратим реальные токены
    const analysis = await gigachatAPI.analyzeJobPosting(contentToAnalyze);

    // Mark demo as used for this IP
    demoAttempts.set(identifier, {
      count: (ipData?.count || 0) + 1,
      lastAttempt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      analysis,
      demo: true,
      demoUsed: true,
      message: 'This was your free demo. Sign in for unlimited access.',
      timestamp: new Date().toISOString(),
      contentLength: contentToAnalyze.length
    });

  } catch (error: any) {
    console.error('Demo job analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Analysis failed',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

