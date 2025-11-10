// Action Handlers - обработчики действий для автоматизации функций через GigaChat

import { gigachatAPI } from '@/lib/gigachat';
import { IntentDetection, ActionIntent } from './intent-detector';
import { getUserById } from '@/lib/db/queries';
import { createResumeVersion } from '@/lib/db/queries';
import { getAnalysisHistory } from '@/lib/db/queries';
import { getUserApplications } from '@/lib/db/queries';

export interface ActionResult {
  success: boolean;
  actionType: ActionIntent;
  content: string;
  metadata?: {
    title?: string;
    downloadUrl?: string;
    [key: string]: any;
  };
  error?: string;
}

// Получение контекста пользователя (резюме, вакансии, приложения)
async function getUserContext(userId: string) {
  const [user, analysisHistory, applications] = await Promise.all([
    getUserById(userId),
    getAnalysisHistory(userId, 10), // Последние 10 анализов
    getUserApplications(userId, { limit: 10 }), // Последние 10 приложений
  ]);

  return {
    user,
    recentAnalyses: analysisHistory || [],
    recentApplications: applications || [],
  };
}

// Handler для генерации Cover Letter
async function handleCoverLetter(
  intent: IntentDetection,
  userId: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ActionResult> {
  try {
    const context = await getUserContext(userId);
    
    // Поиск информации о вакансии из контекста или параметров
    let jobInfo = '';
    if (intent.parameters?.jobTitle || intent.parameters?.company) {
      jobInfo = `Вакансия: ${intent.parameters.jobTitle || 'не указана'}, Компания: ${intent.parameters.company || 'не указана'}`;
    } else if (context.recentAnalyses.length > 0) {
      const lastJobAnalysis = context.recentAnalyses.find(a => a.type === 'job');
      if (lastJobAnalysis) {
        const jobData = lastJobAnalysis.data as any;
        jobInfo = `Вакансия: ${lastJobAnalysis.title || 'не указана'}, Компания: ${jobData?.company || 'не указана'}`;
      }
    }

    const userInfo = context.user ? {
      name: context.user.name || 'Кандидат',
      email: context.user.email || '',
      title: context.user.title || '',
    } : {};

    const prompt = `Создай профессиональное сопроводительное письмо (cover letter) на русском языке.

${jobInfo ? `Информация о вакансии:\n${jobInfo}\n` : ''}
Информация о кандидате:
- Имя: ${userInfo.name}
- Email: ${userInfo.email}
- Должность: ${userInfo.title || 'не указана'}

Требования к письму:
1. Профессиональный, но дружелюбный тон
2. Персонализированное под вакансию
3. Подчеркивание релевантного опыта и навыков
4. Краткость (1-2 абзаца)
5. Призыв к действию в конце

Создай cover letter:`;

    const coverLetter = await gigachatAPI.sendMessage([
      { role: 'user', content: prompt }
    ]);

    return {
      success: true,
      actionType: 'cover_letter',
      content: coverLetter,
      metadata: {
        title: `Cover Letter для ${intent.parameters?.jobTitle || 'вакансии'}`,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      actionType: 'cover_letter',
      content: '',
      error: error.message || 'Ошибка генерации cover letter',
    };
  }
}

// Handler для генерации резюме
async function handleResumeGenerate(
  intent: IntentDetection,
  userId: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ActionResult> {
  try {
    const context = await getUserContext(userId);
    
    // Извлечение информации об опыте из истории чата
    const experienceInfo = conversationHistory
      .filter(msg => msg.role === 'user')
      .slice(-3)
      .map(msg => msg.content)
      .join('\n');

    const prompt = `Создай профессиональное резюме на русском языке на основе следующей информации:

${experienceInfo || 'Информация об опыте не предоставлена. Создай шаблон резюме.'}

Требования:
1. Структурированный формат (личная информация, опыт, образование, навыки)
2. Использование action verbs и количественных показателей
3. Оптимизация для ATS систем
4. Профессиональный стиль
5. Четкая структура и читаемость

Создай резюме в формате Markdown:`;

    const resume = await gigachatAPI.sendMessage([
      { role: 'user', content: prompt }
    ]);

    // Сохранение резюме в БД
    const resumeTitle = context.user?.name 
      ? `Резюме ${context.user.name}`
      : 'Новое резюме';

    await createResumeVersion({
      id: crypto.randomUUID(),
      userId,
      title: resumeTitle,
      content: resume,
      template: 'modern',
      isDefault: 0,
      optimizedFor: null,
      tags: null,
    });

    return {
      success: true,
      actionType: 'resume_generate',
      content: resume,
      metadata: {
        title: resumeTitle,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      actionType: 'resume_generate',
      content: '',
      error: error.message || 'Ошибка генерации резюме',
    };
  }
}

// Handler для оптимизации резюме
async function handleResumeOptimize(
  intent: IntentDetection,
  userId: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ActionResult> {
  try {
    const context = await getUserContext(userId);
    
    // Поиск последнего анализа резюме
    const lastResumeAnalysis = context.recentAnalyses.find(a => a.type === 'resume');
    const lastJobAnalysis = context.recentAnalyses.find(a => a.type === 'job');

    if (!lastResumeAnalysis) {
      return {
        success: false,
        actionType: 'resume_optimize',
        content: '',
        error: 'Не найдено резюме для оптимизации. Сначала проанализируйте резюме.',
      };
    }

    const resumeData = lastResumeAnalysis.data as any;
    const jobData = lastJobAnalysis?.data as any;

    const prompt = `Оптимизируй резюме под вакансию.

Резюме:
${JSON.stringify(resumeData, null, 2) || 'Резюме не найдено'}

${lastJobAnalysis ? `Вакансия:\n${JSON.stringify(jobData, null, 2) || ''}\n` : ''}

Требования к оптимизации:
1. Добавить ключевые слова из вакансии
2. Подчеркнуть релевантный опыт
3. Оптимизировать под ATS
4. Сохранить структуру и читаемость
5. Использовать количественные показатели

Верни оптимизированное резюме в формате Markdown:`;

    const optimizedResume = await gigachatAPI.sendMessage([
      { role: 'user', content: prompt }
    ]);

    return {
      success: true,
      actionType: 'resume_optimize',
      content: optimizedResume,
      metadata: {
        title: `Оптимизированное резюме`,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      actionType: 'resume_optimize',
      content: '',
      error: error.message || 'Ошибка оптимизации резюме',
    };
  }
}

// Handler для анализа разрыва навыков
async function handleSkillsGap(
  intent: IntentDetection,
  userId: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ActionResult> {
  try {
    const context = await getUserContext(userId);
    
    const lastResumeAnalysis = context.recentAnalyses.find(a => a.type === 'resume');
    const lastJobAnalysis = context.recentAnalyses.find(a => a.type === 'job');

    if (!lastResumeAnalysis || !lastJobAnalysis) {
      return {
        success: false,
        actionType: 'skills_gap',
        content: '',
        error: 'Необходимо проанализировать резюме и вакансию перед анализом разрыва навыков.',
      };
    }

    const resumeData = lastResumeAnalysis.data as any;
    const jobData = lastJobAnalysis.data as any;

    const prompt = `Проанализируй разрыв навыков между резюме кандидата и требованиями вакансии.

Резюме:
${JSON.stringify(resumeData, null, 2) || ''}

Вакансия:
${JSON.stringify(jobData, null, 2) || ''}

Создай детальный анализ:
1. Навыки, которые есть у кандидата и требуются
2. Навыки, которых не хватает (критичные и некритичные)
3. Рекомендации по закрытию пробелов
4. Приоритетность изучения недостающих навыков

Формат: структурированный отчет с приоритетами.`;

    const analysis = await gigachatAPI.sendMessage([
      { role: 'user', content: prompt }
    ]);

    return {
      success: true,
      actionType: 'skills_gap',
      content: analysis,
      metadata: {
        title: 'Анализ разрыва навыков',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      actionType: 'skills_gap',
      content: '',
      error: error.message || 'Ошибка анализа разрыва навыков',
    };
  }
}

// Handler для переговоров по зарплате
async function handleSalaryNegotiation(
  intent: IntentDetection,
  userId: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ActionResult> {
  try {
    const salaryOffer = intent.parameters?.salaryOffer || '';
    const targetSalary = intent.parameters?.targetSalary || '';
    const jobTitle = intent.parameters?.jobTitle || '';

    const prompt = `Помоги с переговорами по зарплате.

${jobTitle ? `Должность: ${jobTitle}\n` : ''}
${salaryOffer ? `Предложенная зарплата: ${salaryOffer}\n` : ''}
${targetSalary ? `Желаемая зарплата: ${targetSalary}\n` : ''}

Создай стратегию переговоров:
1. Анализ предложения (справедливо ли?)
2. Рекомендации по counter-offer
3. Аргументы для переговоров
4. Шаблон письма для переговоров
5. Тактика ведения переговоров

Формат: структурированный план с конкретными рекомендациями.`;

    const strategy = await gigachatAPI.sendMessage([
      { role: 'user', content: prompt }
    ]);

    return {
      success: true,
      actionType: 'salary_negotiation',
      content: strategy,
      metadata: {
        title: 'Стратегия переговоров по зарплате',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      actionType: 'salary_negotiation',
      content: '',
      error: error.message || 'Ошибка создания стратегии переговоров',
    };
  }
}

// Главная функция-роутер для обработки действий
export async function executeAction(
  intent: IntentDetection,
  userId: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ActionResult> {
  switch (intent.intent) {
    case 'cover_letter':
      return await handleCoverLetter(intent, userId, conversationHistory);
    
    case 'resume_generate':
      return await handleResumeGenerate(intent, userId, conversationHistory);
    
    case 'resume_optimize':
      return await handleResumeOptimize(intent, userId, conversationHistory);
    
    case 'skills_gap':
      return await handleSkillsGap(intent, userId, conversationHistory);
    
    case 'salary_negotiation':
      return await handleSalaryNegotiation(intent, userId, conversationHistory);
    
    case 'hr_email_response':
    case 'follow_up_email':
    case 'thank_you_email':
    case 'interview_prep':
    case 'impact_optimization':
    case 'ats_report':
      // TODO: Реализовать остальные handlers
      return {
        success: false,
        actionType: intent.intent,
        content: '',
        error: `Handler для ${intent.intent} еще не реализован`,
      };
    
    case 'chat':
    default:
      return {
        success: false,
        actionType: 'chat',
        content: '',
        error: 'Обычный чат, действие не требуется',
      };
  }
}

