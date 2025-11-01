import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gigachatAPI } from '@/lib/gigachat';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-ip';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const identifier = getClientIp(request);
    const rateLimitResult = await rateLimit(identifier, 20, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { question, answer, jobDescription } = body;

    if (!question || !answer || !jobDescription) {
      return NextResponse.json(
        { error: 'Question, answer and job description are required' },
        { status: 400 }
      );
    }

    // Оцениваем ответ
    const evaluation = await gigachatAPI.evaluateInterviewAnswer(question, answer, jobDescription);

    return NextResponse.json({ 
      success: true, 
      evaluation 
    });
  } catch (error: any) {
    console.error('Interview answer evaluation error:', error);
    
    // Determine status code and detailed message
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to evaluate answer';
    let errorDetails: any = null;

    if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
      statusCode = 422;
      errorMessage = 'Invalid request format. Please check your question, answer, and job description.';
      errorDetails = {
        type: 'validation_error',
        suggestion: 'Ensure all required fields are properly formatted.'
      };
    } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      statusCode = 401;
      errorMessage = 'Authentication failed. Please check GigaChat API credentials.';
    } else if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
      statusCode = 429;
      errorMessage = 'Rate limit exceeded. Please try again later.';
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      },
      { status: statusCode }
    );
  }
}

