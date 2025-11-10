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

    console.log('🔄 Starting resume generation for user:', userId);

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

    console.log('📤 Step 1: Sending structure request to GigaChat');

    let structureResponse;
    try {
      structureResponse = await gigachatAPI.sendMessage([
        { role: 'user', content: structurePrompt }
      ]);
    } catch (apiError: any) {
      console.error('❌ Step 1: GigaChat API error:', apiError);
      return NextResponse.json(
        {
          error: 'Failed to generate resume structure from AI',
          details: apiError.message || 'AI service unavailable',
          type: 'api_error'
        },
        { status: 500 }
      );
    }

    console.log('📥 Step 1: Received structure response, length:', structureResponse.length);

    // Parse structure
    let structure;
    try {
      console.log('🔍 Step 1: Parsing JSON structure');
      let jsonString = structureResponse.trim();

      // More robust JSON extraction
      // First try to find JSON in code blocks
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      } else {
        // Try to find JSON object in the text
        const jsonMatch = jsonString.match(/\{[\s\S]*?\}(?=\s*$|\s*[^}])/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        } else {
          // Last resort: try to extract anything that looks like JSON
          const startIndex = jsonString.indexOf('{');
          const endIndex = jsonString.lastIndexOf('}');
          if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            jsonString = jsonString.substring(startIndex, endIndex + 1);
          }
        }
      }

      // Clean up the JSON string
      jsonString = jsonString
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Quote unquoted keys
        .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}\]])/g, ':"$1"$2'); // Quote unquoted string values

      console.log('🔧 Cleaned JSON string length:', jsonString.length);
      console.log('🔧 JSON preview:', jsonString.substring(0, 200) + '...');

      structure = JSON.parse(jsonString);
      console.log('✅ Step 1: JSON parsed successfully');

      // Validate structure has required fields
      if (!structure || typeof structure !== 'object') {
        throw new Error('Parsed structure is not a valid object');
      }

      // Ensure required fields exist with defaults
      structure.personalInfo = structure.personalInfo || {};
      structure.experience = structure.experience || [];
      structure.education = structure.education || [];
      structure.skills = structure.skills || [];
      structure.languages = structure.languages || [];
      structure.certifications = structure.certifications || [];

    } catch (error: any) {
      console.error('❌ Step 1: JSON parsing failed:', error);
      console.error('❌ Full response:', structureResponse);
      console.error('❌ Error details:', error.message);
      return NextResponse.json(
        {
          error: 'Failed to parse resume structure from AI response',
          details: error.message,
          responsePreview: structureResponse.substring(0, 300)
        },
        { status: 500 }
      );
    }

    // Step 2: Generate final resume from structure and second prompt
    console.log('📤 Step 2: Generating final resume');
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

    console.log('📤 Step 2: Sending final resume request to GigaChat');

    let finalResponse;
    try {
      finalResponse = await gigachatAPI.sendMessage([
        { role: 'user', content: finalPrompt }
      ]);
    } catch (apiError: any) {
      console.error('❌ Step 2: GigaChat API error:', apiError);
      return NextResponse.json(
        {
          error: 'Failed to generate final resume from AI',
          details: apiError.message || 'AI service unavailable',
          type: 'api_error'
        },
        { status: 500 }
      );
    }

    console.log('📥 Step 2: Received final resume response, length:', finalResponse.length);

    // Save resume version
    console.log('💾 Saving resume to database');
    const resumeTitle = structure.personalInfo?.name
      ? `Резюме ${structure.personalInfo.name}`
      : 'Новое резюме';

    let resume;
    try {
      resume = await createResumeVersion({
        id: crypto.randomUUID(),
        userId,
        title: resumeTitle,
        content: finalResponse,
        template: 'modern',
        isDefault: 0,
        optimizedFor: null,
        tags: null,
      });

      console.log('✅ Resume saved successfully, ID:', resume.id);
    } catch (dbError: any) {
      console.error('❌ Database save error:', dbError);
      return NextResponse.json(
        {
          error: 'Failed to save resume to database',
          details: dbError.message,
          type: 'database_error'
        },
        { status: 500 }
      );
    }

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

