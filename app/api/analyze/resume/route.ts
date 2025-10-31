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
    
    // Определяем статус код и детальное сообщение
    let statusCode = 500;
    let errorMessage = error.message || 'Unknown error occurred';
    let errorDetails: any = null;

    if (error.message?.includes('422') || error.message?.includes('Unprocessable Entity')) {
      statusCode = 422;
      errorMessage = 'Invalid request format or content. Please check your resume content.';
      errorDetails = {
        type: 'validation_error',
        suggestion: 'Ensure your resume content is properly formatted and not too long (max ~25000 characters).'
      };
    } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      statusCode = 401;
      errorMessage = 'Authentication failed. Please check GigaChat API credentials.';
    } else if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
      statusCode = 429;
      errorMessage = 'Rate limit exceeded. Please try again later.';
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Resume analysis failed',
        message: errorMessage,
        details: errorDetails
      },
      { status: statusCode }
    );
  }
}