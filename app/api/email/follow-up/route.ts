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
    const { applicationId, customNotes } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
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

    // Генерируем follow-up письмо
    const emailContent = await gigachatAPI.generateFollowUpEmail({
      company: application.company,
      position: application.title,
      appliedDate: application.appliedDate 
        ? new Date(application.appliedDate).toLocaleDateString('ru-RU')
        : new Date(application.createdAt).toLocaleDateString('ru-RU'),
      notes: customNotes || application.notes || undefined,
      status: application.status,
    });

    return NextResponse.json({ 
      success: true, 
      email: {
        subject: `Follow-up: ${application.title} в ${application.company}`,
        body: emailContent,
      }
    });
  } catch (error: any) {
    console.error('Follow-up email generation error:', error);
    
    // Determine status code and detailed message
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to generate follow-up email';
    let errorDetails: any = null;

    if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
      statusCode = 422;
      errorMessage = 'Invalid request format. Please check your application data.';
      errorDetails = {
        type: 'validation_error',
        suggestion: 'Ensure application ID is valid and all required data is available.'
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

