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

    // Get user subscription with fallback
    let subscription;
    let plan = 'free';
    try {
      subscription = await getUserSubscription(userId);
      plan = subscription?.plan || 'free';
    } catch (error) {
      console.warn('Failed to get subscription, using free plan fallback:', error);
      // Continue with free plan
    }

    // Get usage for all types with fallback
    let resumeUsage, jobUsage, coverLetterUsage;
    try {
      [resumeUsage, jobUsage, coverLetterUsage] = await Promise.all([
        checkUsageLimit(userId, 'resume'),
        checkUsageLimit(userId, 'job'),
        checkUsageLimit(userId, 'coverLetter'),
      ]);
    } catch (error) {
      console.warn('Failed to get usage limits, using fallback values:', error);
      // Fallback values for free plan
      const fallbackUsage = {
        allowed: true,
        remaining: 10,
        limit: 10,
        used: 0,
      };
      resumeUsage = jobUsage = coverLetterUsage = fallbackUsage;
    }

    return NextResponse.json({
      success: true,
      plan,
      resume: {
        used: resumeUsage.used === Infinity ? 0 : resumeUsage.used,
        limit: resumeUsage.limit === Infinity ? -1 : resumeUsage.limit,
        remaining: resumeUsage.remaining === Infinity ? -1 : resumeUsage.remaining,
      },
      job: {
        used: jobUsage.used === Infinity ? 0 : jobUsage.used,
        limit: jobUsage.limit === Infinity ? -1 : jobUsage.limit,
        remaining: jobUsage.remaining === Infinity ? -1 : jobUsage.remaining,
      },
      coverLetter: {
        used: coverLetterUsage.used === Infinity ? 0 : coverLetterUsage.used,
        limit: coverLetterUsage.limit === Infinity ? -1 : coverLetterUsage.limit,
        remaining: coverLetterUsage.remaining === Infinity ? -1 : coverLetterUsage.remaining,
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

