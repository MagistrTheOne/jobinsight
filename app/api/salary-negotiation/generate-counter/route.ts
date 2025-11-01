import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getApplicationById } from '@/lib/db/queries';
import { gigachatAPI } from '@/lib/gigachat';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, initialOffer, targetSalary, marketAverage } = await request.json();

    const application = await getApplicationById(applicationId, session.user.id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Generate counter-offer email using GigaChat
    const counterOfferEmail = await gigachatAPI.sendMessage([
      {
        role: 'system',
        content: 'Ты профессиональный переговорщик по зарплате. Создавай вежливые, но убедительные письма с counter-offer для HR. Письма должны быть профессиональными, обоснованными и конструктивными.',
      },
      {
        role: 'user',
        content: `Создай письмо с counter-offer для HR:

Позиция: ${application.title}
Компания: ${application.company}
Предложенная зарплата: ${initialOffer}
Моя целевая зарплата: ${targetSalary}
${marketAverage ? `Среднерыночная зарплата: ${marketAverage}` : ''}

Требования к письму:
1. Вежливое и профессиональное обращение
2. Благодарность за предложение
3. Обоснование counter-offer (на основе опыта, навыков, рыночной стоимости)
4. Гибкость и готовность к обсуждению
5. Профессиональное завершение

Формат: Только текст письма, без темы.`,
      },
    ]);

    // Generate negotiation strategy
    const strategy = await gigachatAPI.sendMessage([
      {
        role: 'system',
        content: 'Дай краткую стратегию переговоров по зарплате (2-3 пункта)',
      },
      {
        role: 'user',
        content: `Стратегия для переговоров:
Исходное предложение: ${initialOffer}
Целевая зарплата: ${targetSalary}
Рыночная средняя: ${marketAverage || 'не указана'}`,
      },
    ]);

    return NextResponse.json({
      success: true,
      counterOffer: counterOfferEmail,
      recommendation: strategy,
    });
  } catch (error: any) {
    console.error('Error generating counter-offer:', error);
    
    // Determine status code and detailed message
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to generate counter-offer';
    let errorDetails: any = null;

    if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
      statusCode = 422;
      errorMessage = 'Invalid request format. Please check your salary negotiation data.';
      errorDetails = {
        type: 'validation_error',
        suggestion: 'Ensure all salary fields are properly filled.'
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
        error: 'Failed to generate counter-offer', 
        message: errorMessage,
        details: errorDetails
      },
      { status: statusCode }
    );
  }
}

