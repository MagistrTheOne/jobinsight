import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateATSChallengeReport } from '@/lib/advanced-ats-analysis';
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

    // Rate limiting
    const identifier = request.ip || 'anonymous';
    const rateLimitResult = await rateLimit(identifier, 5, 60000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { resumeContent, jobDescription, atsSystemName } = body;

    if (!resumeContent || resumeContent.trim().length < 100) {
      return NextResponse.json(
        { error: 'Resume content is required and must be substantial' },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: 'Job description is required for ATS challenge report' },
        { status: 400 }
      );
    }

    const report = await generateATSChallengeReport(
      resumeContent,
      jobDescription,
      atsSystemName
    );

    // Increment usage (counts as resume analysis)
    const periodStart = getCurrentPeriodStart();
    await incrementUsageLimit(session.user.id, 'resume', periodStart);

    return NextResponse.json({
      success: true,
      report,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('ATS challenge report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'ATS challenge report generation failed',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

