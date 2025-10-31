import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkUsageLimit, getCurrentPeriodStart } from '@/lib/usage-limits';
import { getUserSubscription } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get user subscription
    const subscription = await getUserSubscription(userId);
    const plan = subscription?.plan || 'free';
    
    // Get usage for all types
    const [resumeUsage, jobUsage, coverLetterUsage] = await Promise.all([
      checkUsageLimit(userId, 'resume'),
      checkUsageLimit(userId, 'job'),
      checkUsageLimit(userId, 'coverLetter'),
    ]);

    return NextResponse.json({
      success: true,
      plan,
      resume: {
        used: resumeUsage.used,
        limit: resumeUsage.limit,
        remaining: resumeUsage.remaining,
      },
      job: {
        used: jobUsage.used,
        limit: jobUsage.limit,
        remaining: jobUsage.remaining,
      },
      coverLetter: {
        used: coverLetterUsage.used,
        limit: coverLetterUsage.limit,
        remaining: coverLetterUsage.remaining,
      },
      periodStart: getCurrentPeriodStart().toISOString(),
    });

  } catch (error: any) {
    console.error('Failed to get usage limits:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get usage limits',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

