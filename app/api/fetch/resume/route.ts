import { NextRequest, NextResponse } from 'next/server';
import { scrapeResume } from '@/lib/resume-scraper';
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

    // Парсим резюме с URL
    const scrapedData = await scrapeResume(url);

    return NextResponse.json({
      success: true,
      content: scrapedData.content,
      title: scrapedData.title,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Resume fetch error:', error);
    
    // Обрабатываем специфичные ошибки
    const errorMessage = error.message || 'Unknown error occurred';
    
    // Если это ошибка авторизации или приватного резюме
    if (errorMessage.includes('авторизации') || errorMessage.includes('приватным') || errorMessage.includes('403') || errorMessage.includes('401')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Private or authorized resume',
          message: 'Это резюме требует авторизации или является приватным. Пожалуйста, скопируйте текст резюме вручную.'
        },
        { status: 403 }
      );
    }
    
    // Если это ошибка неверного URL
    if (errorMessage.includes('Invalid URL') || errorMessage.includes('Invalid')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL',
          message: errorMessage
        },
        { status: 400 }
      );
    }
    
    // Для остальных ошибок возвращаем 500
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch resume',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

