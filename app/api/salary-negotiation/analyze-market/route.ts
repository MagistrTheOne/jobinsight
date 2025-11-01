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

    const { applicationId, targetSalary, initialOffer } = await request.json();

    const application = await getApplicationById(applicationId, session.user.id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // TODO: Integrate with real salary data API (Glassdoor, Payscale, etc.)
    // For now, use GigaChat to analyze market average based on job title and location
    
    const marketAnalysis = await gigachatAPI.sendMessage([
      {
        role: 'system',
        content: 'Ты эксперт по анализу рынка труда и зарплат. Анализируй предложения по зарплате, сравнивай с рынком и давай рекомендации по переговорам.',
      },
      {
        role: 'user',
        content: `Проанализируй зарплату для позиции:

Позиция: ${application.title}
Компания: ${application.company}
Предложенная зарплата: ${initialOffer}
Целевая зарплата кандидата: ${targetSalary}

Дай:
1. Оценку среднерыночной зарплаты для этой позиции
2. Рекомендации по переговорам
3. Стратегию достижения целевой зарплаты

Формат: JSON с полями marketAverage, recommendation, strategy`,
      },
    ]);

    // Parse AI response
    let marketAverage = 'N/A';
    let recommendation = '';

    try {
      if (typeof marketAnalysis === 'string') {
        const cleaned = marketAnalysis.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        marketAverage = parsed.marketAverage || 'N/A';
        recommendation = parsed.recommendation || parsed.strategy || '';
      } else {
        // If response is not a string, try to extract from object
        recommendation = JSON.stringify(marketAnalysis);
        if (typeof marketAnalysis === 'object' && marketAnalysis !== null) {
          marketAverage = (marketAnalysis as any).marketAverage || 'N/A';
          recommendation = (marketAnalysis as any).recommendation || (marketAnalysis as any).strategy || recommendation;
        }
      }
    } catch {
      // Fallback: use raw response
      if (typeof marketAnalysis === 'string') {
        recommendation = marketAnalysis;
        // Try to extract number from response
        const match = marketAnalysis.match(/\$[\d,]+|\d+[\d,]*\s*(k|тыс|thousand)/i);
        if (match) {
          marketAverage = match[0];
        }
      } else {
        recommendation = String(marketAnalysis);
      }
    }

    return NextResponse.json({
      success: true,
      marketAverage,
      recommendation,
    });
  } catch (error: any) {
    console.error('Error analyzing market:', error);
    
    // Determine status code and detailed message
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to analyze market';
    let errorDetails: any = null;

    if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
      statusCode = 422;
      errorMessage = 'Invalid request format. Please check your application and salary data.';
      errorDetails = {
        type: 'validation_error',
        suggestion: 'Ensure application ID is valid and salary fields are properly filled.'
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
        error: 'Failed to analyze market', 
        message: errorMessage,
        details: errorDetails
      },
      { status: statusCode }
    );
  }
}

