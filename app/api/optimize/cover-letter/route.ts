import { NextRequest, NextResponse } from 'next/server';
import { gigachatAPI } from '@/lib/gigachat';
import { scrapeJobPosting } from '@/lib/scraper';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-ip';

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIp(request);
    const rateLimitResult = await rateLimit(identifier, 3, 60000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { url, jobContent, userInfo, jobAnalysis, currentCoverLetter } = body;

    if (!url && !jobContent) {
      return NextResponse.json(
        { error: 'Either URL or job content is required' },
        { status: 400 }
      );
    }

    if (!userInfo || !userInfo.name) {
      return NextResponse.json(
        { error: 'User information with at least a name is required' },
        { status: 400 }
      );
    }

    let contentToUse = jobContent;

    if (url && !jobContent) {
      try {
        const scrapedData = await scrapeJobPosting(url);
        contentToUse = `${scrapedData.title}\n\nКомпания: ${scrapedData.company}\n\nОписание: ${scrapedData.description}\n\nТребования: ${scrapedData.requirements}`;
      } catch (scrapeError) {
        return NextResponse.json(
          { error: 'Failed to fetch job posting content from URL' },
          { status: 400 }
        );
      }
    }

    const optimizedCoverLetter = await gigachatAPI.generateCoverLetter(
      contentToUse, 
      userInfo, 
      jobAnalysis
    );

    // Извлекаем ключевые слова, которые были добавлены
    const keywordsAdded = jobAnalysis?.atsKeywords || [];

    return NextResponse.json({
      success: true,
      optimized: {
        original: currentCoverLetter || '',
        optimized: optimizedCoverLetter,
        improvements: [
          'Оптимизировано под конкретную вакансию',
          'Добавлены релевантные ATS ключевые слова',
          'Учтен грейд позиции',
          'Улучшена структура для ATS систем'
        ],
        keywordsAdded,
        type: 'cover-letter' as const
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Cover letter optimization error:', error);
    
    // Determine status code and detailed message
    let statusCode = 500;
    let errorMessage = error.message || 'Unknown error occurred';
    let errorDetails: any = null;

    if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
      statusCode = 422;
      errorMessage = 'Invalid request format or content. Please check your cover letter and job content.';
      errorDetails = {
        type: 'validation_error',
        suggestion: 'Ensure your content is properly formatted and not too long.'
      };
    } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      statusCode = 401;
      errorMessage = 'Authentication failed. Please check GigaChat API credentials.';
    } else if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
      statusCode = 429;
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      statusCode = 504;
      errorMessage = 'Request timeout. The optimization took too long. Please try again.';
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Cover letter optimization failed',
        message: errorMessage,
        details: errorDetails
      },
      { status: statusCode }
    );
  }
}

