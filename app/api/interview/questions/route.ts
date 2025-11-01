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
    const { applicationId, jobDescription } = body;

    if (!jobDescription && !applicationId) {
      return NextResponse.json(
        { error: 'Either applicationId or jobDescription is required' },
        { status: 400 }
      );
    }

    let description = jobDescription;
    let jobAnalysis = null;

    // Если передан applicationId, получаем данные отклика
    if (applicationId) {
      const application = await getApplicationById(applicationId, session.user.id);
      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      
      // Получаем описание из jobPosting если есть
      if (application.jobPosting?.description) {
        description = application.jobPosting.description;
      } else {
        // Формируем описание из доступных данных
        description = `Позиция: ${application.title}\nКомпания: ${application.company}`;
      }
    }

    // Генерируем вопросы для подготовки
    const questions = await gigachatAPI.generateInterviewQuestions(description, jobAnalysis);

    return NextResponse.json({ 
      success: true, 
      questions 
    });
  } catch (error: any) {
    console.error('Interview questions generation error:', error);
    
    // Determine status code and detailed message
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to generate interview questions';
    let errorDetails: any = null;

    if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
      statusCode = 422;
      errorMessage = 'Invalid request format. Please check your job description.';
      errorDetails = {
        type: 'validation_error',
        suggestion: 'Ensure your job description is properly formatted.'
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

