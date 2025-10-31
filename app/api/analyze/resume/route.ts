import { NextRequest, NextResponse } from 'next/server';
import { gigachatAPI } from '@/lib/gigachat';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const identifier = request.ip || 'anonymous';
    const rateLimitResult = await rateLimit(identifier, 5, 60000); // 5 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { resumeContent, jobContent } = body;

    if (!resumeContent || resumeContent.trim().length < 100) {
      return NextResponse.json(
        { error: 'Resume content is required and must be substantial' },
        { status: 400 }
      );
    }

    const analysis = await gigachatAPI.analyzeResume(resumeContent, jobContent);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      resumeLength: resumeContent.length
    });

  } catch (error: any) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Resume analysis failed',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}