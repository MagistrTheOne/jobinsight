import { NextRequest, NextResponse } from 'next/server';
import { scrapeResume } from '@/lib/resume-scraper';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous';
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
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch resume',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

