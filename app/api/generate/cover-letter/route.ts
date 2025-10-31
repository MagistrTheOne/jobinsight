import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gigachatAPI } from '@/lib/gigachat';
import { scrapeJobPosting } from '@/lib/scraper';
import { rateLimit } from '@/lib/rate-limit';
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

    const identifier = request.ip || 'anonymous';
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
    return NextResponse.json(
      {
        success: false,
        error: 'Cover letter generation failed',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}