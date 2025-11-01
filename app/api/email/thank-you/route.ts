import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gigachatAPI } from '@/lib/gigachat';
import { getApplicationById } from '@/lib/db/queries';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-ip';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const identifier = getClientIp(request);
    const rateLimitResult = await rateLimit(identifier, 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      applicationId, 
      interviewerName,
      interviewDate,
      interviewType,
      notes,
      keyPoints 
    } = body;

    if (!applicationId || !interviewDate || !interviewType) {
      return NextResponse.json(
        { error: 'Application ID, interview date and type are required' },
        { status: 400 }
      );
    }

    // Получаем данные отклика
    const application = await getApplicationById(applicationId, session.user.id);
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Генерируем thank you письмо
    const emailContent = await gigachatAPI.generateThankYouEmail({
      company: application.company,
      position: application.title,
      interviewerName,
      interviewDate,
      interviewType,
      notes: notes || application.notes || undefined,
      keyPoints: keyPoints || undefined,
    });

    return NextResponse.json({ 
      success: true, 
      email: {
        subject: `Благодарность за собеседование: ${application.title} в ${application.company}`,
        body: emailContent,
      }
    });
  } catch (error: any) {
    console.error('Thank you email generation error:', error);
    
    // Determine status code and detailed message
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to generate thank you email';
    let errorDetails: any = null;

    if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
      statusCode = 422;
      errorMessage = 'Invalid request format. Please check your interview data.';
      errorDetails = {
        type: 'validation_error',
        suggestion: 'Ensure all required fields are properly filled.'
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

