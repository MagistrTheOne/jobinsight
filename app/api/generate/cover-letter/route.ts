import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gigachatAPI } from '@/lib/gigachat';
import { scrapeJobPosting } from '@/lib/scraper';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-ip';
import { checkUsageLimit, getCurrentPeriodStart } from '@/lib/usage-limits';
import { incrementUsageLimit } from '@/lib/db/queries';

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

    const identifier = getClientIp(request);
    const rateLimitResult = await rateLimit(identifier, 3, 60000); // 3 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(session.user.id, 'coverLetter');
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit exceeded',
          type: 'cover-letter',
          limit: usageCheck.limit,
          used: usageCheck.used,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { url, jobContent, userInfo, jobAnalysis } = body;

    if (!url && !jobContent) {
      return NextResponse.json(
        { error: 'Either URL or job content is required' },
        { status: 400 }
      );
    }

    if (!userInfo || !userInfo.name) {
      return NextResponse.json(
        { error: 'User information with at least a name is required' },
        { status: 400 }
      );
    }

    let contentToUse = jobContent;

    if (url && !jobContent) {
      try {
        const scrapedData = await scrapeJobPosting(url);
        contentToUse = `${scrapedData.title}\n\nКомпания: ${scrapedData.company}\n\nОписание: ${scrapedData.description}\n\nТребования: ${scrapedData.requirements}`;
      } catch (scrapeError) {
        return NextResponse.json(
          { error: 'Failed to fetch job posting content from URL' },
          { status: 400 }
        );
      }
    }

    const coverLetter = await gigachatAPI.generateCoverLetter(contentToUse, userInfo, jobAnalysis);

    // Increment usage counter after successful generation
    const periodStart = getCurrentPeriodStart();
    await incrementUsageLimit(session.user.id, 'coverLetter', periodStart);

    return NextResponse.json({
      success: true,
      coverLetter,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Cover letter generation error:', error);
    
    // Determine status code and detailed message
    let statusCode = 500;
    let errorMessage = error.message || 'Unknown error occurred';
    let errorDetails: any = null;

    if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
      statusCode = 422;
      errorMessage = 'Invalid request format or content. Please check your job content and user info.';
      errorDetails = {
        type: 'validation_error',
        suggestion: 'Ensure your job content and user information are properly formatted and not too long.'
      };
    } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      statusCode = 401;
      errorMessage = 'Authentication failed. Please check GigaChat API credentials.';
    } else if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
      statusCode = 429;
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      statusCode = 504;
      errorMessage = 'Request timeout. The generation took too long. Please try again.';
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Cover letter generation failed',
        message: errorMessage,
        details: errorDetails
      },
      { status: statusCode }
    );
  }
}