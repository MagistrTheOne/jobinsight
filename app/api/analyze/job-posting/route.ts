import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gigachatAPI } from '@/lib/gigachat';
import { scrapeJobPosting } from '@/lib/scraper';
import { rateLimit } from '@/lib/rate-limit';
import { checkUsageLimit, getCurrentPeriodStart } from '@/lib/usage-limits';
import { incrementUsageLimit } from '@/lib/db/queries';
import { getClientIp } from '@/lib/get-ip';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const identifier = getClientIp(request);
    const rateLimitResult = await rateLimit(identifier, 5, 60000); // 5 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(session.user.id, 'job');
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit exceeded',
          type: 'job',
          limit: usageCheck.limit,
          used: usageCheck.used,
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

    // Analyze job posting with GigaChat API
    let analysis;
    try {
      analysis = await gigachatAPI.analyzeJobPosting(contentToAnalyze);
    } catch (gigachatError: any) {
      console.error('GigaChat API error:', gigachatError);
      
      // Determine status code and detailed message
      let statusCode = 500;
      let errorMessage = gigachatError.message || 'Unknown error occurred';
      let errorDetails: any = null;

      if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
        statusCode = 422;
        errorMessage = 'Invalid request format or content. Please check your job posting content.';
        errorDetails = {
          type: 'validation_error',
          suggestion: 'Ensure your job posting content is properly formatted and not too long (max ~25000 characters).'
        };
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        statusCode = 401;
        errorMessage = 'Authentication failed. Please check GigaChat API credentials.';
      } else if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
        statusCode = 429;
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        statusCode = 504;
        errorMessage = 'Request timeout. The analysis took too long. Please try again with shorter content.';
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Job analysis failed',
          message: errorMessage,
          details: errorDetails
        },
        { status: statusCode }
      );
    }

    // Increment usage counter after successful analysis
    try {
      const periodStart = getCurrentPeriodStart();
      await incrementUsageLimit(session.user.id, 'job', periodStart);
    } catch (dbError: any) {
      // Log but don't fail the request if usage tracking fails
      console.error('Failed to increment usage limit:', dbError);
    }

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