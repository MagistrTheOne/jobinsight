import { NextRequest, NextResponse } from 'next/server';
import { scrapeJobPosting } from '@/lib/scraper';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-ip';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIp(request);
    const rateLimitResult = await rateLimit(identifier, 10, 60000); // 10 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Проверяем, что это ссылка на HeadHunter
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('hh.ru') && !urlObj.hostname.includes('headhunter.ru')) {
      return NextResponse.json(
        { error: 'URL must be from HeadHunter (hh.ru)' },
        { status: 400 }
      );
    }

    // Парсим вакансию
    const scrapedData = await scrapeJobPosting(url);

    // Форматируем контент для анализа
    const formattedContent = `${scrapedData.title}\n\nКомпания: ${scrapedData.company}\n\nОписание: ${scrapedData.description}\n\nТребования: ${scrapedData.requirements}\n\nПолный контент: ${scrapedData.fullContent}`;

    return NextResponse.json({
      success: true,
      content: formattedContent,
      title: scrapedData.title,
      company: scrapedData.company,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('HH vacancy fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch vacancy',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

