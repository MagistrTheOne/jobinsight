import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gigachatAPI } from '@/lib/gigachat';
import { createResumeVersion, incrementUsageLimit } from '@/lib/db/queries';
import { checkUsageLimit, getCurrentPeriodStart } from '@/lib/usage-limits';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { prompt1, prompt2, jobAnalysis, jobContent, resumeAnalysis, resumeContent } = body;

    if (!prompt1 || typeof prompt1 !== 'string' || prompt1.trim().length === 0) {
      return NextResponse.json(
        { error: 'First prompt is required' },
        { status: 400 }
      );
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(userId, 'resume');
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit exceeded',
          type: 'resume',
          limit: usageCheck.limit,
          used: usageCheck.used,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Step 1: Generate resume structure from first prompt
    let structurePrompt = `Ты профессиональный карьерный консультант. На основе следующей информации о соискателе, создай структуру резюме в формате JSON:

${prompt1}`;

    // Добавляем данные анализа резюме, если есть
    if (resumeAnalysis && resumeContent) {
      structurePrompt += `\n\nДополнительная информация из анализа резюме:\n${resumeContent.substring(0, 2000)}`;
    }

    structurePrompt += `\n\nВерни JSON со следующей структурой:
{
  "personalInfo": {
    "name": "ФИО",
    "email": "email",
    "phone": "телефон",
    "location": "локация",
    "linkedin": "linkedin (если есть)",
    "summary": "краткое профессиональное резюме (2-3 предложения)"
  },
  "experience": [
    {
      "company": "название компании",
      "position": "должность",
      "period": "период работы",
      "description": "описание обязанностей и достижений"
    }
  ],
  "education": [
    {
      "institution": "учебное заведение",
      "degree": "степень/специальность",
      "period": "период обучения"
    }
  ],
  "skills": ["навык1", "навык2"],
  "languages": ["язык1 - уровень"],
  "certifications": ["сертификат1"]
}

Если информации недостаточно, используй разумные предположения, но отметь это в комментариях.`;

    const structureResponse = await gigachatAPI.sendMessage([
      { role: 'user', content: structurePrompt }
    ]);

    // Parse structure
    let structure;
    try {
      let jsonString = structureResponse.trim();
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      } else {
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }
      }
      jsonString = jsonString.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      structure = JSON.parse(jsonString);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse resume structure', details: error },
        { status: 500 }
      );
    }

    // Step 2: Generate final resume from structure and second prompt
    let finalPrompt = '';
    
    if (jobAnalysis && jobContent) {
      // Оптимизация под вакансию
      finalPrompt = `На основе структуры резюме и требований вакансии, создай оптимизированное резюме в формате Markdown:

Структура резюме:
${JSON.stringify(structure, null, 2)}

Требования вакансии:
${jobContent.substring(0, 3000)}

${prompt2 ? `Дополнительные требования:\n${prompt2}\n` : ''}

Создай профессиональное резюме в формате Markdown, которое:
1. Оптимизировано под требования вакансии (используй ключевые слова из описания)
2. Выделяет релевантный опыт и навыки
3. Использует action verbs и количественные показатели
4. Оптимизировано для ATS систем
5. Имеет четкую структуру и читаемость
6. Подчеркивает соответствие требованиям вакансии`;
    } else {
      // Обычная генерация
      finalPrompt = prompt2 
        ? `На основе структуры резюме и дополнительных требований, создай финальное резюме в формате Markdown:

Структура резюме:
${JSON.stringify(structure, null, 2)}

Дополнительные требования:
${prompt2}

Создай профессиональное резюме в формате Markdown, которое:
1. Выделяет ключевые достижения и навыки
2. Использует action verbs и количественные показатели
3. Оптимизировано для ATS систем
4. Имеет четкую структуру и читаемость
5. Подчеркивает уникальную ценность кандидата`
        : `На основе структуры резюме, создай финальное резюме в формате Markdown:

Структура резюме:
${JSON.stringify(structure, null, 2)}

Создай профессиональное резюме в формате Markdown, которое:
1. Выделяет ключевые достижения и навыки
2. Использует action verbs и количественные показатели
3. Оптимизировано для ATS систем
4. Имеет четкую структуру и читаемость
5. Подчеркивает уникальную ценность кандидата`;
    }

    const finalResponse = await gigachatAPI.sendMessage([
      { role: 'user', content: finalPrompt }
    ]);

    // Save resume version
    const resumeTitle = structure.personalInfo?.name 
      ? `Резюме ${structure.personalInfo.name}`
      : 'Новое резюме';

    const resume = await createResumeVersion({
      id: crypto.randomUUID(),
      userId,
      title: resumeTitle,
      content: finalResponse,
      template: 'modern',
      isDefault: 0,
      optimizedFor: null,
      tags: null,
    });

    // Increment usage counter
    const periodStart = getCurrentPeriodStart();
    await incrementUsageLimit(userId, 'resume', periodStart);

    return NextResponse.json({
      success: true,
      resume: {
        ...resume,
        structure,
      },
    });

  } catch (error: any) {
    console.error('Generate resume error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate resume',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

