// Intent Detector - определяет тип действия из запроса пользователя через GigaChat

import { gigachatAPI } from '@/lib/gigachat';

export type ActionIntent = 
  | 'cover_letter'
  | 'resume_generate'
  | 'resume_optimize'
  | 'skills_gap'
  | 'salary_negotiation'
  | 'hr_email_response'
  | 'follow_up_email'
  | 'thank_you_email'
  | 'interview_prep'
  | 'impact_optimization'
  | 'ats_report'
  | 'chat'; // обычный чат, без действия

export interface IntentDetection {
  intent: ActionIntent;
  confidence: number;
  parameters?: {
    jobTitle?: string;
    company?: string;
    jobUrl?: string;
    salaryOffer?: string;
    targetSalary?: string;
    emailContent?: string;
    [key: string]: any;
  };
  reasoning: string;
}

const INTENT_DETECTION_PROMPT = `Ты умный помощник, который анализирует запросы пользователя и определяет, какое действие нужно выполнить.

Доступные действия:
- cover_letter: Генерация сопроводительного письма для вакансии
- resume_generate: Создание нового резюме на основе опыта пользователя
- resume_optimize: Оптимизация существующего резюме под вакансию
- skills_gap: Анализ разрыва навыков между резюме и вакансией
- salary_negotiation: Помощь в переговорах по зарплате
- hr_email_response: Генерация ответа на письмо от HR
- follow_up_email: Создание follow-up письма после отклика
- thank_you_email: Создание благодарственного письма после интервью
- interview_prep: Подготовка к интервью (вопросы, ответы)
- impact_optimization: Оптимизация impact statements в резюме
- ats_report: Отчет по ATS совместимости резюме
- chat: Обычный разговор, консультация, общие вопросы

Отвечай ТОЛЬКО JSON в формате:
{
  "intent": "action_name",
  "confidence": 0.0-1.0,
  "parameters": {
    "jobTitle": "название должности если упомянуто",
    "company": "название компании если упомянуто",
    "jobUrl": "URL вакансии если упомянут",
    "salaryOffer": "предложенная зарплата если упомянута",
    "targetSalary": "желаемая зарплата если упомянута",
    "emailContent": "содержимое письма если упомянуто"
  },
  "reasoning": "краткое объяснение почему выбран этот intent"
}

Примеры:
- "Создай cover letter для вакансии React Developer в компании X" -> {"intent": "cover_letter", "parameters": {"jobTitle": "React Developer", "company": "X"}}
- "Сгенерируй резюме на основе моего опыта" -> {"intent": "resume_generate"}
- "Оптимизируй мое резюме под эту вакансию" -> {"intent": "resume_optimize"}
- "Какие навыки мне не хватает?" -> {"intent": "skills_gap"}
- "Помоги с переговорами: предложили 200k, хочу 250k" -> {"intent": "salary_negotiation", "parameters": {"salaryOffer": "200k", "targetSalary": "250k"}}
- "Сгенерируй ответ на письмо от HR" -> {"intent": "hr_email_response"}
- "Как подготовиться к интервью?" -> {"intent": "interview_prep"}
- "Расскажи о себе" -> {"intent": "chat"}`;

export async function detectIntent(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<IntentDetection> {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: INTENT_DETECTION_PROMPT,
      },
      ...conversationHistory.slice(-5), // Последние 5 сообщений для контекста
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    const response = await gigachatAPI.sendMessage(messages);
    
    // Парсинг JSON из ответа
    let jsonString = response.trim();
    const codeBlockMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
    } else {
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
    }
    
    // Очистка от лишних запятых
    jsonString = jsonString.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    
    const parsed = JSON.parse(jsonString);
    
    // Валидация intent
    const validIntents: ActionIntent[] = [
      'cover_letter',
      'resume_generate',
      'resume_optimize',
      'skills_gap',
      'salary_negotiation',
      'hr_email_response',
      'follow_up_email',
      'thank_you_email',
      'interview_prep',
      'impact_optimization',
      'ats_report',
      'chat',
    ];
    
    const intent = validIntents.includes(parsed.intent) ? parsed.intent : 'chat';
    const confidence = typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5;
    
    return {
      intent,
      confidence,
      parameters: parsed.parameters || {},
      reasoning: parsed.reasoning || 'Intent detected',
    };
  } catch (error: any) {
    console.error('Intent detection error:', error);
    
    // Fallback: простая проверка по ключевым словам
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('cover letter') || lowerMessage.includes('сопроводительное') || lowerMessage.includes('письмо для вакансии')) {
      return {
        intent: 'cover_letter',
        confidence: 0.7,
        parameters: {},
        reasoning: 'Fallback: keyword detection for cover letter',
      };
    }
    
    if (lowerMessage.includes('создай резюме') || lowerMessage.includes('сгенерируй резюме') || lowerMessage.includes('generate resume')) {
      return {
        intent: 'resume_generate',
        confidence: 0.7,
        parameters: {},
        reasoning: 'Fallback: keyword detection for resume generation',
      };
    }
    
    if (lowerMessage.includes('оптимизируй резюме') || lowerMessage.includes('optimize resume')) {
      return {
        intent: 'resume_optimize',
        confidence: 0.7,
        parameters: {},
        reasoning: 'Fallback: keyword detection for resume optimization',
      };
    }
    
    if (lowerMessage.includes('зарплат') || lowerMessage.includes('salary') || lowerMessage.includes('переговоры')) {
      return {
        intent: 'salary_negotiation',
        confidence: 0.7,
        parameters: {},
        reasoning: 'Fallback: keyword detection for salary negotiation',
      };
    }
    
    // По умолчанию - обычный чат
    return {
      intent: 'chat',
      confidence: 0.5,
      parameters: {},
      reasoning: 'Fallback: default to chat',
    };
  }
}

