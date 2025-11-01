import { NextRequest, NextResponse } from 'next/server';
import { checkATSCompatibility } from '@/lib/ats-checker';
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
    const { resumeContent, jobDescription } = body;

    if (!resumeContent || resumeContent.trim().length < 100) {
      return NextResponse.json(
        { error: 'Resume content is required and must be substantial' },
        { status: 400 }
      );
    }

    // Проверка ATS совместимости
    const atsResult = checkATSCompatibility(resumeContent, jobDescription);

    return NextResponse.json({
      success: true,
      atsCompatibility: atsResult,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('ATS compatibility check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'ATS compatibility check failed',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

