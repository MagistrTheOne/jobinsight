import { gigachatAPI } from './gigachat';

export interface SkillsGap {
  skill: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  currentLevel: number; // 0-5
  requiredLevel: number; // 0-5
  gap: number;
  impact: string; // Как это влияет на прохождение ATS
  recommendations: string[]; // Конкретные рекомендации как закрыть gap
  resources?: string[]; // Ресурсы для изучения
  estimatedTimeToClose: string; // "2 недели", "1 месяц", etc.
}

export interface ImpactMetric {
  type: 'revenue' | 'efficiency' | 'scale' | 'quality' | 'leadership';
  description: string;
  value: string; // "Увеличил на 40%", "Сократил на 3 часа"
  context: string; // Контекст достижения
  suggestion?: string; // Как улучшить формулировку
}

export interface ATSChallengeReport {
  candidateProfile: {
    skills: string[];
    experience: string;
    strengths: string[];
  };
  atsFilterIssues: {
    reason: string;
    severity: 'critical' | 'warning' | 'info';
    explanation: string;
    evidence: string; // Почему ATS ошибся
    recommendation: string; // Что HR должен сделать
  }[];
  humanReviewRecommendation: {
    shouldReview: boolean;
    reasoning: string;
    estimatedFitScore: number; // 0-100
  };
  executiveSummary: string;
}

/**
 * Advanced Skills Gap Analysis with AI
 * Анализирует разрыв навыков и дает конкретные рекомендации
 */
export async function analyzeSkillsGap(
  resumeContent: string,
  jobDescription: string
): Promise<{ gaps: SkillsGap[]; summary: string }> {
  const prompt = `Проанализируй разрыв навыков между резюме кандидата и требованиями вакансии.

Резюме кандидата:
${resumeContent}

Описание вакансии:
${jobDescription}

Верни детальный анализ в JSON формате:
{
  "gaps": [
    {
      "skill": "название навыка",
      "priority": "critical|high|medium|low",
      "currentLevel": 0-5,
      "requiredLevel": 0-5,
      "gap": разница между required и current,
      "impact": "как отсутствие этого навыка влияет на прохождение через ATS фильтры",
      "recommendations": ["конкретная рекомендация 1", "конкретная рекомендация 2"],
      "resources": ["ресурс для изучения 1", "ресурс 2"],
      "estimatedTimeToClose": "реалистичная оценка времени (например, '2 недели', '1 месяц')"
    }
  ],
  "summary": "краткое резюме основных проблем и приоритетов"
}

В 2025 году важно не количество проектов, а:
- Impact (влияние на бизнес-метрики)
- Quality (качество решений)
- Relevance (релевантность опыта требованиям)
- Continuous Learning (непрерывное обучение)

Приоритизируй навыки, которые:
1. Критичны для прохождения ATS фильтров
2. Имеют максимальный impact на релевантность резюме
3. Реально достижимы в короткие сроки`;

  try {
    const response = await gigachatAPI.sendMessage([
      {
        role: 'system',
        content: 'Ты эксперт по анализу резюме и ATS системам. Анализируй навыки и давай конкретные, практичные рекомендации.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');
  } catch (error: any) {
    console.error('Skills gap analysis failed:', error);
    throw error;
  }
}

/**
 * Impact-Based Resume Optimization
 * Фокус на метрики и влияние, а не количество проектов
 */
export async function optimizeForImpact(
  resumeContent: string,
  jobDescription: string
): Promise<{
  currentImpact: ImpactMetric[];
  suggestions: ImpactMetric[];
  optimizedSections: { section: string; original: string; optimized: string; reasoning: string }[];
}> {
  const prompt = `Оптимизируй резюме с фокусом на IMPACT и METRICS (подход 2025 года).

В 2025 году рекрутеры ищут:
- Не "сделал 10 проектов", а "увеличил конверсию на 30%"
- Не "работал с React", а "оптимизировал производительность на 40%"
- Не "знаю SQL", а "сократил время запросов с 5 сек до 0.2 сек"

Резюме:
${resumeContent}

Вакансия:
${jobDescription}

Верни оптимизацию в JSON:
{
  "currentImpact": [
    {
      "type": "revenue|efficiency|scale|quality|leadership",
      "description": "текущее описание достижения",
      "value": "метрика или число",
      "context": "контекст",
      "suggestion": "как улучшить формулировку для большего impact"
    }
  ],
  "suggestions": [
    {
      "type": "revenue|efficiency|scale|quality|leadership",
      "description": "новое достижение которое можно добавить или улучшить",
      "value": "предполагаемая метрика",
      "context": "в каком контексте это будет уместно",
      "suggestion": "как сформулировать для максимального impact"
    }
  ],
  "optimizedSections": [
    {
      "section": "название секции",
      "original": "оригинальный текст",
      "optimized": "оптимизированный текст с метриками",
      "reasoning": "почему это лучше"
    }
  ]
}`;

  try {
    const response = await gigachatAPI.sendMessage([
      {
        role: 'system',
        content: 'Ты эксперт по оптимизации резюме с фокусом на метрики и влияние на бизнес. Помогай кандидатам выделяться через конкретные достижения.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');
  } catch (error: any) {
    console.error('Impact optimization failed:', error);
    throw error;
  }
}

/**
 * ATS Challenge Report - отчет для HR о проблемах их ATS
 */
export async function generateATSChallengeReport(
  resumeContent: string,
  jobDescription: string,
  atsSystemName?: string
): Promise<ATSChallengeReport> {
  const prompt = `Создай отчет-вызов для HR отдела о том, почему их ATS система может отфильтровать хорошего кандидата.

Резюме кандидата:
${resumeContent}

Описание вакансии:
${jobDescription}

${atsSystemName ? `ATS система: ${atsSystemName}` : ''}

Верни профессиональный отчет в JSON формате:
{
  "candidateProfile": {
    "skills": ["навык1", "навык2"],
    "experience": "опыт кандидата",
    "strengths": ["сильная сторона 1", "сильная сторона 2"]
  },
  "atsFilterIssues": [
    {
      "reason": "почему ATS может отфильтровать",
      "severity": "critical|warning|info",
      "explanation": "детальное объяснение проблемы",
      "evidence": "конкретные доказательства что ATS ошибся",
      "recommendation": "что HR должен сделать (например, провести ручную проверку)"
    }
  ],
  "humanReviewRecommendation": {
    "shouldReview": true/false,
    "reasoning": "почему нужен human review",
    "estimatedFitScore": 0-100
  },
  "executiveSummary": "краткое резюме для HR руководителя о том, почему этот кандидат достоин внимания несмотря на фильтры ATS"
}

Будь профессиональным, но покажи реальные проблемы ATS фильтров.`;

  try {
    const response = await gigachatAPI.sendMessage([
      {
        role: 'system',
        content: 'Ты эксперт по HR и ATS системам. Создавай профессиональные отчеты, которые показывают ограничения ATS и важность human review.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');
  } catch (error: any) {
    console.error('ATS challenge report generation failed:', error);
    throw error;
  }
}

