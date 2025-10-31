import { NextRequest, NextResponse } from 'next/server';
import { gigachatAPI } from '@/lib/gigachat';
import { scrapeJobPosting } from '@/lib/scraper';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous';
    const rateLimitResult = await rateLimit(identifier, 5, 60000); // 5 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
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

    const analysis = await gigachatAPI.analyzeJobPosting(contentToAnalyze);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      contentLength: contentToAnalyze.length
    });

  } catch (error: any) {
    console.error('Job analysis error:', error);
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