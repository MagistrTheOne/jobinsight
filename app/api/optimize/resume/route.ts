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
    const { resumeContent, url, jobContent, jobAnalysis } = body;

    if (!resumeContent || resumeContent.trim().length < 100) {
      return NextResponse.json(
        { error: 'Resume content is required and must be substantial' },
        { status: 400 }
      );
    }

    if (!url && !jobContent) {
      return NextResponse.json(
        { error: 'Either URL or job content is required' },
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

    const optimizedResume = await gigachatAPI.optimizeResumeForJob(
      resumeContent,
      contentToUse,
      jobAnalysis,
      resumeContent
    );

    const keywordsAdded = jobAnalysis?.atsKeywords || [];
    const improvements: string[] = [
      'Резюме адаптировано под конкретную вакансию',
      'Добавлены релевантные ATS ключевые слова',
      'Опыт переформулирован под требования вакансии',
      'Структура оптимизирована для ATS систем'
    ];

    if (jobAnalysis?.jobGrade) {
      improvements.push(`Оптимизировано под уровень: ${jobAnalysis.jobGrade.level}`);
    }

    return NextResponse.json({
      success: true,
      optimized: {
        original: resumeContent,
        optimized: optimizedResume,
        improvements,
        keywordsAdded,
        type: 'resume' as const
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Resume optimization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Resume optimization failed',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

