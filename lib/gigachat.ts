import https from 'https';
import { Agent } from 'https';
import axios, { AxiosInstance } from 'axios';

interface GigaChatToken {
  access_token: string;
  expires_in: number;
  expires_at: number;
}

interface GigaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GigaChatResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }>;
  created: number;
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Создаём HTTPS агент для работы с сертификатами Минцифры
function createGigaChatAgent(): Agent {
  const fs = require('fs');
  const path = require('path');
  
  // Проверяем переменную окружения для пути к сертификату
  let certPath = process.env.GIGACHAT_CA_BUNDLE_PATH;
  
  // Если путь не указан, пытаемся использовать сертификат из папки certs
  if (!certPath) {
    const defaultCertPath = path.join(process.cwd(), 'certs', 'russian_trusted_root_ca_pem.crt');
    if (fs.existsSync(defaultCertPath)) {
      certPath = defaultCertPath;
    }
  }
  
  // Если сертификат найден, используем его
  if (certPath && fs.existsSync(certPath)) {
    try {
      const ca = fs.readFileSync(certPath);
      console.log('✅ Using Russian Trusted Root CA certificate:', certPath);
      return new https.Agent({
        ca,
        rejectUnauthorized: true
      });
    } catch (error) {
      console.warn('⚠️  Failed to load CA bundle, falling back to insecure agent:', error);
    }
  }

  // Для разработки: используем небезопасный агент (только для dev!)
  if (process.env.NODE_ENV === 'development' || process.env.GIGACHAT_INSECURE === 'true') {
    console.warn('⚠️  WARNING: Using insecure HTTPS agent. Only for development!');
    console.warn('⚠️  To fix this, set GIGACHAT_CA_BUNDLE_PATH or place certificate in certs/russian_trusted_root_ca_pem.crt');
    return new https.Agent({
      rejectUnauthorized: false
    });
  }

  // По умолчанию - стандартный агент (может не работать с сертификатами Минцифры)
  console.warn('⚠️  No certificate configured. Requests may fail. Set GIGACHAT_CA_BUNDLE_PATH or GIGACHAT_INSECURE=true');
  return new https.Agent();
}

class GigaChatAPI {
  private token: GigaChatToken | null = null;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly authKey: string;
  private readonly oauthUrl: string;
  private readonly apiUrl: string;
  private readonly httpsAgent: Agent;
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.clientId = process.env.GIGACHAT_CLIENT_ID!;
    this.clientSecret = process.env.GIGACHAT_CLIENT_SECRET!;
    this.authKey = process.env.GIGACHAT_AUTHORIZATION_KEY!;
    this.oauthUrl = process.env.GIGACHAT_OAUTH_URL || 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
    this.apiUrl = process.env.GIGACHAT_API_URL || 'https://gigachat.devices.sberbank.ru/api/v1';
    this.httpsAgent = createGigaChatAgent();
    
    // Создаём axios instance с кастомным HTTPS agent
    this.axiosInstance = axios.create({
      httpsAgent: this.httpsAgent,
      timeout: 30000
    });
  }

  private async getAccessToken(retries: number = 3): Promise<string> {
    // Check if token is valid and not expired
    if (this.token && Date.now() < this.token.expires_at) {
      return this.token.access_token;
    }

    let lastError: any = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Используем axios с кастомным HTTPS agent для поддержки сертификатов Минцифры
        const response = await this.axiosInstance.post(
          this.oauthUrl,
          'scope=GIGACHAT_API_PERS',
          {
            headers: {
              'Authorization': `Basic ${this.authKey}`,
              'RqUID': crypto.randomUUID(),
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            }
          }
        );

        const data = response.data;
        
        this.token = {
          access_token: data.access_token,
          expires_in: data.expires_in,
          expires_at: Date.now() + (data.expires_in * 1000) - 60000 // Refresh 1 minute early
        };

        return this.token.access_token;
      } catch (error: any) {
        lastError = error;
        
        // Handle 429 Too Many Requests with exponential backoff
        if (error.response?.status === 429) {
          if (attempt < retries) {
            // Exponential backoff: 2s, 4s, 8s
            const delay = Math.min(Math.pow(2, attempt + 1) * 1000, 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw new Error(`Rate limit exceeded. Please try again later.`);
        }

        // For other errors, throw immediately
        if (error.response) {
          throw new Error(`OAuth request failed: ${error.response.status} ${error.response.statusText || 'Unknown error'}`);
        }
        
        // Network errors - retry with backoff
        if (attempt < retries && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND')) {
          const delay = Math.min(Math.pow(2, attempt + 1) * 1000, 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw new Error('Authentication failed');
      }
    }

    throw lastError || new Error('Authentication failed after retries');
  }

  async sendMessage(messages: GigaChatMessage[], model: string = process.env.GIGACHAT_MODEL || 'GigaChat', retries: number = 2): Promise<string> {
    let lastError: any = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const accessToken = await this.getAccessToken();

        // Валидация размера сообщений перед отправкой
        // GigaChat 2.0 поддерживает до 200 страниц A4 (~128k токенов)
        // Более консервативный лимит: ~100k символов для безопасности
        const MAX_CONTENT_LENGTH = 100000;
        const totalContentLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
        if (totalContentLength > MAX_CONTENT_LENGTH) {
          console.warn(`⚠️  Content length (${totalContentLength}) exceeds limit (${MAX_CONTENT_LENGTH}). Truncating...`);
          
          // Обрезаем самое длинное user сообщение, если оно слишком большое
          const userMessages = messages.filter(m => m.role === 'user');
          if (userMessages.length > 0) {
            const longestUserMsg = userMessages.reduce((longest, msg) => 
              msg.content.length > longest.content.length ? msg : longest
            );
            const maxUserContentLength = MAX_CONTENT_LENGTH - 10000; // Оставляем место для system messages
            if (longestUserMsg.content.length > maxUserContentLength) {
              longestUserMsg.content = longestUserMsg.content.substring(0, maxUserContentLength) + '... [truncated]';
            }
          }
        }

        // Request is being sent (no logging to reduce noise)

        // Используем axios с кастомным HTTPS agent
        const response = await this.axiosInstance.post<GigaChatResponse>(
          `${this.apiUrl}/chat/completions`,
          {
            model,
            messages,
            temperature: 0.7,
            // GigaChat 2.0 поддерживает большие контексты, увеличиваем max_tokens
            // Для анализа резюме и вакансий нужны детальные ответы
            max_tokens: parseInt(process.env.GIGACHAT_MAX_TOKENS || '4096', 10)
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const data = response.data;
        
        if (!data.choices || data.choices.length === 0) {
          throw new Error('No response generated');
        }

        // Response received successfully

        return data.choices[0].message.content;
      } catch (error: any) {
        lastError = error;
        
        if (error.response) {
          const errorData = error.response.data;

          // Retry только для временных ошибок (5xx) или rate limit (429)
          const isRetryable = error.response.status >= 500 || error.response.status === 429;
          
          if (isRetryable && attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          // Для 422 и других клиентских ошибок не делаем retry
          throw new Error(`API request failed: ${error.response.status} ${error.response.statusText}. Details: ${JSON.stringify(errorData)}`);
        }

        // Для сетевых ошибок делаем retry
        if (attempt < retries && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND')) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Failed after retries');
  }

  async estimateJobGrade(jobContent: string): Promise<any> {
    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты эксперт по оценке уровня позиций в IT и других сферах. Определяй грейд позиции (Junior, Middle, Senior, Lead) на основе требований, ответственности, опыта и других факторов. Даже если название вакансии неточное, анализируй реальное содержание. Верни оценку в JSON формате:
        {
          "level": "Junior" | "Middle" | "Senior" | "Lead" | "Unknown",
          "score": число от 1 до 5 (1=Junior, 2=Junior+, 3=Middle, 4=Senior, 5=Lead),
          "confidence": число от 0 до 100 (уверенность в оценке),
          "reasoning": "краткое обоснование оценки на основе требований, опыта, ответственности, зарплаты"
        }`
      },
      {
        role: 'user',
        content: `Определи грейд этой позиции: ${jobContent}`
      }
    ];

    const response = await this.sendMessage(messages);
    
    try {
      let jsonString = response.trim();
      
      // Try to extract JSON from markdown code blocks
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      } else {
        // Try to find JSON object
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }
      }
      
      // Aggressive cleanup of common JSON issues
      jsonString = jsonString
        // Remove trailing commas
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        // Remove control characters
        .replace(/[\x00-\x1F\x7F]/g, '')
        // Fix unescaped quotes in strings (basic fix)
        .replace(/([{,]\s*"[^"]*)"([^"]*"[^"]*":)/g, '$1\\"$2')
        // Remove comments (if any)
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Fix single quotes to double quotes (basic)
        .replace(/'/g, '"')
        // Remove any text before first {
        .replace(/^[^{]*/, '')
        // Remove any text after last }
        .replace(/[^}]*$/, '');
      
      // Try to parse, if fails try to fix more aggressively
      let grade: any;
      try {
        grade = JSON.parse(jsonString);
      } catch (parseError) {
        // Last resort: try to extract just the values we need
        const levelMatch = jsonString.match(/"level"\s*:\s*"([^"]+)"/);
        const scoreMatch = jsonString.match(/"score"\s*:\s*(\d+)/);
        const confidenceMatch = jsonString.match(/"confidence"\s*:\s*(\d+)/);
        const reasoningMatch = jsonString.match(/"reasoning"\s*:\s*"([^"]+)"/);
        
        grade = {
          level: levelMatch ? levelMatch[1] : 'Unknown',
          score: scoreMatch ? parseInt(scoreMatch[1]) : 3,
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
          reasoning: reasoningMatch ? reasoningMatch[1] : 'Оценка на основе анализа требований'
        };
      }
      
      // Валидация и нормализация данных
      const validLevels = ['Junior', 'Middle', 'Senior', 'Lead', 'Unknown'];
      
      // Ensure level is a string
      let levelValue: string = 'Unknown';
      if (typeof grade.level === 'string') {
        levelValue = validLevels.includes(grade.level) ? grade.level : 'Unknown';
      } else if (grade.level && typeof grade.level === 'object') {
        // Handle case where level might be an object like {positive: true}
        levelValue = 'Unknown';
      }
      
      // Ensure score is a number
      let scoreValue = 3;
      if (typeof grade.score === 'number') {
        scoreValue = Math.max(1, Math.min(5, grade.score));
      } else if (typeof grade.score === 'string') {
        scoreValue = Math.max(1, Math.min(5, parseInt(grade.score) || 3));
      }
      
      // Ensure confidence is a number
      let confidenceValue = 50;
      if (typeof grade.confidence === 'number') {
        confidenceValue = Math.max(0, Math.min(100, grade.confidence));
      } else if (typeof grade.confidence === 'string') {
        confidenceValue = Math.max(0, Math.min(100, parseInt(grade.confidence) || 50));
      }
      
      // Ensure reasoning is a string
      let reasoningValue = 'Оценка на основе анализа требований';
      if (typeof grade.reasoning === 'string') {
        reasoningValue = grade.reasoning;
      } else if (grade.reasoning) {
        reasoningValue = String(grade.reasoning);
      }
      
      return {
        level: levelValue,
        score: scoreValue,
        confidence: confidenceValue,
        reasoning: reasoningValue
      };
    } catch (error) {
      // Silently return fallback values
      return {
        level: 'Unknown',
        score: 3,
        confidence: 0,
        reasoning: 'Не удалось определить грейд позиции'
      };
    }
  }

  async analyzeJobPosting(jobContent: string): Promise<any> {
    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты эксперт по анализу рынка труда. Анализируй вакансии на предмет красных флагов, оценки требований и предоставляй инсайты. Верни анализ в следующем JSON формате:
        {
          "redFlags": ["список найденных красных флагов"],
          "requirements": {
            "realistic": ["реалистичные требования"],
            "unrealistic": ["нереалистичные или чрезмерные требования"]
          },
          "salaryInsight": "оценка зарплатных ожиданий",
          "workLifeBalance": "оценка индикаторов work-life balance",
          "companyInsights": "инсайты о корпоративной культуре",
          "atsKeywords": ["важные ключевые слова для ATS оптимизации"],
          "recommendedSkills": ["навыки, которые будут ценными"],
          "overallScore": "оценка из 10 с обоснованием"
        }`
      },
      {
        role: 'user',
        content: `Проанализируй эту вакансию: ${jobContent}`
      }
    ];

    // Запускаем анализ и оценку грейда параллельно
    const [analysisResponse, jobGrade] = await Promise.all([
      this.sendMessage(messages),
      this.estimateJobGrade(jobContent)
    ]);
    
    try {
      // Try to extract JSON from response if it's wrapped in text
      let jsonString = analysisResponse.trim();
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      const analysis = JSON.parse(jsonString);
      
      // Normalize all fields to ensure they are strings/arrays, not objects
      const normalizedAnalysis: any = {
        redFlags: Array.isArray(analysis.redFlags) 
          ? analysis.redFlags.map((f: any) => typeof f === 'string' ? f : String(f))
          : [],
        requirements: {
          realistic: Array.isArray(analysis.requirements?.realistic)
            ? analysis.requirements.realistic.map((r: any) => typeof r === 'string' ? r : String(r))
            : [],
          unrealistic: Array.isArray(analysis.requirements?.unrealistic)
            ? analysis.requirements.unrealistic.map((r: any) => typeof r === 'string' ? r : String(r))
            : []
        },
        salaryInsight: typeof analysis.salaryInsight === 'string' 
          ? analysis.salaryInsight 
          : String(analysis.salaryInsight || 'Не удалось проанализировать зарплатные ожидания'),
        workLifeBalance: typeof analysis.workLifeBalance === 'string'
          ? analysis.workLifeBalance
          : String(analysis.workLifeBalance || 'Не удалось оценить work-life balance'),
        companyInsights: typeof analysis.companyInsights === 'string'
          ? analysis.companyInsights
          : String(analysis.companyInsights || 'Не удалось получить инсайты о компании'),
        atsKeywords: Array.isArray(analysis.atsKeywords)
          ? analysis.atsKeywords.map((k: any) => typeof k === 'string' ? k : String(k))
          : [],
        recommendedSkills: Array.isArray(analysis.recommendedSkills)
          ? analysis.recommendedSkills.map((s: any) => typeof s === 'string' ? s : String(s))
          : [],
        overallScore: typeof analysis.overallScore === 'string'
          ? analysis.overallScore
          : typeof analysis.overallScore === 'number'
          ? String(analysis.overallScore)
          : String(analysis.overallScore || 'Не удалось оценить (0/10)'),
        jobGrade
      };
      
      return normalizedAnalysis;
    } catch (error) {
      // If JSON parsing fails, return fallback response
      return {
        redFlags: [],
        requirements: { realistic: [], unrealistic: [] },
        salaryInsight: 'Не удалось проанализировать зарплатные ожидания',
        workLifeBalance: 'Не удалось оценить work-life balance',
        companyInsights: 'Не удалось получить инсайты о компании',
        atsKeywords: [],
        recommendedSkills: [],
        overallScore: 'Не удалось оценить (0/10)',
        jobGrade,
        rawResponse: analysisResponse
      };
    }
  }

  async generateCoverLetter(jobContent: string, userInfo: any, jobAnalysis?: any): Promise<string> {
    const analysisContext = jobAnalysis ? `
Дополнительный контекст из анализа вакансии:
- Грейд позиции: ${jobAnalysis.jobGrade?.level || 'не определен'}
- ATS ключевые слова: ${jobAnalysis.atsKeywords?.join(', ') || 'нет'}
- Рекомендуемые навыки: ${jobAnalysis.recommendedSkills?.join(', ') || 'нет'}
- Красные флаги (избегать упоминания): ${jobAnalysis.redFlags?.join(', ') || 'нет'}
- Общая оценка вакансии: ${jobAnalysis.overallScore || 'нет'}
` : '';

    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты профессиональный писатель сопроводительных писем, специализирующийся на ATS-оптимизированных заявлениях. Создавай убедительные, персонализированные сопроводительные письма, которые включают релевантные ключевые слова и подчеркивают сильные стороны кандидата. Используй данные анализа вакансии для оптимизации под конкретную позицию.`
      },
      {
        role: 'user',
        content: `Создай ATS-оптимизированное сопроводительное письмо для этой вакансии: ${jobContent}

Информация о пользователе: ${JSON.stringify(userInfo)}
${analysisContext}

Пожалуйста, создай профессиональное сопроводительное письмо, которое:
1. Использует релевантные ключевые слова из вакансии и анализа
2. Подчеркивает релевантный опыт и навыки под конкретную позицию
3. Учитывает грейд позиции (${jobAnalysis?.jobGrade?.level || 'не определен'})
4. Показывает энтузиазм к роли
5. Дружелюбно к ATS с правильным форматированием
6. Избегает упоминания проблемных моментов из красных флагов`
      }
    ];

    return await this.sendMessage(messages);
  }

  async optimizeResumeForJob(resumeContent: string, jobContent: string, jobAnalysis?: any, currentResume?: string): Promise<string> {
    // Валидация размера
    // GigaChat 2.0 поддерживает большие тексты
    const MAX_RESUME_LENGTH = 80000;
    let processedResumeContent = resumeContent.trim();
    if (processedResumeContent.length > MAX_RESUME_LENGTH) {
      processedResumeContent = processedResumeContent.substring(0, MAX_RESUME_LENGTH) + '... [truncated]';
    }

    const MAX_JOB_CONTENT_LENGTH = 40000;
    let processedJobContent = jobContent.trim();
    if (processedJobContent.length > MAX_JOB_CONTENT_LENGTH) {
      processedJobContent = processedJobContent.substring(0, MAX_JOB_CONTENT_LENGTH) + '... [truncated]';
    }

    const analysisContext = jobAnalysis ? `
Дополнительный контекст из анализа вакансии:
- Грейд позиции: ${jobAnalysis.jobGrade?.level || 'не определен'}
- ATS ключевые слова (обязательно включить): ${jobAnalysis.atsKeywords?.join(', ') || 'нет'}
- Рекомендуемые навыки: ${jobAnalysis.recommendedSkills?.join(', ') || 'нет'}
- Реалистичные требования: ${jobAnalysis.requirements?.realistic?.join(', ') || 'нет'}
` : '';

    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты эксперт по оптимизации резюме под конкретные вакансии. Создавай оптимизированную версию резюме, которая максимально соответствует требованиям вакансии, используя ATS-оптимизацию и релевантные ключевые слова. Сохраняй структуру и правдивость информации, но адаптируй формулировки под вакансию.`
      },
      {
        role: 'user',
        content: `Оптимизируй это резюме под конкретную вакансию:

ВАКАНСИЯ:
${processedJobContent}
${analysisContext}

ТЕКУЩЕЕ РЕЗЮМЕ:
${processedResumeContent}

Создай оптимизированную версию резюме, которая:
1. Сохраняет всю важную информацию из оригинала
2. Добавляет релевантные ключевые слова из вакансии (ATS-оптимизация)
3. Переформулирует опыт и навыки под требования вакансии
4. Подчеркивает соответствие грейду позиции (${jobAnalysis?.jobGrade?.level || 'не определен'})
5. Сохраняет структуру и читаемость
6. Делает акцент на релевантном опыте

Верни оптимизированное резюме полностью, готовое к использованию.`
      }
    ];

    return await this.sendMessage(messages);
  }

  async analyzeResume(resumeContent: string, jobContent?: string): Promise<any> {
    // Валидация и обрезка контента резюме перед отправкой
    // GigaChat 2.0 поддерживает большие тексты (до 200 страниц A4)
    const MAX_RESUME_LENGTH = 80000; // Увеличено для поддержки длинных резюме
    const MAX_JOB_CONTENT_LENGTH = 40000; // Увеличено для длинных описаний вакансий
    
    let processedResumeContent = resumeContent.trim();
    if (processedResumeContent.length > MAX_RESUME_LENGTH) {
      console.warn(`⚠️  Resume content too long (${processedResumeContent.length} chars), truncating to ${MAX_RESUME_LENGTH} chars`);
      processedResumeContent = processedResumeContent.substring(0, MAX_RESUME_LENGTH) + '... [truncated]';
    }

    let processedJobContent = jobContent?.trim();
    if (processedJobContent && processedJobContent.length > MAX_JOB_CONTENT_LENGTH) {
      console.warn(`⚠️  Job content too long (${processedJobContent.length} chars), truncating to ${MAX_JOB_CONTENT_LENGTH} chars`);
      processedJobContent = processedJobContent.substring(0, MAX_JOB_CONTENT_LENGTH) + '... [truncated]';
    }

    const jobContext = processedJobContent ? `\n\nВакансия для сравнения: ${processedJobContent}` : '';
    
    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты эксперт по оптимизации резюме. Анализируй резюме и предоставляй практические рекомендации. Верни анализ в JSON формате:
        {
          "atsCompatibility": "оценка и анализ совместимости с ATS",
          "strengths": ["список сильных сторон"],
          "improvements": ["конкретные предложения по улучшению"],
          "missingKeywords": ["ключевые слова, которые следует добавить"],
          "formatting": "оценка форматирования и структуры",
          "skillsGap": ["навыки, которые можно добавить или подчеркнуть"],
          "overallScore": "оценка из 10 с обоснованием"
        }`
      },
      {
        role: 'user',
        content: `Проанализируй это резюме: ${processedResumeContent}${jobContext}`
      }
    ];

    try {
      const response = await this.sendMessage(messages);
      
      try {
        // Try to extract JSON from response if it's wrapped in text
        let jsonString = response.trim();
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }
        return JSON.parse(jsonString);
      } catch (error) {
        // If JSON parsing fails, return fallback response
        return {
          atsCompatibility: 'Не удалось оценить совместимость с ATS',
          strengths: [],
          improvements: [],
          missingKeywords: [],
          formatting: 'Не удалось оценить форматирование',
          skillsGap: [],
          overallScore: 'Не удалось оценить (0/10)',
          rawResponse: response
        };
      }
    } catch (error: any) {
      throw error;
    }
  }

  async generateFollowUpEmail(applicationData: {
    company: string;
    position: string;
    appliedDate: string;
    notes?: string;
    status?: string;
  }): Promise<string> {
    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты профессиональный писатель деловых писем. Создавай вежливые, профессиональные follow-up письма для HR-менеджеров после отправки отклика на вакансию. Письма должны быть краткими, вежливыми и демонстрировать заинтересованность в позиции.`
      },
      {
        role: 'user',
        content: `Создай профессиональное follow-up письмо для HR-менеджера компании ${applicationData.company} по позиции "${applicationData.position}".

Контекст:
- Дата отклика: ${applicationData.appliedDate}
- Текущий статус: ${applicationData.status || 'applied'}
${applicationData.notes ? `- Заметки: ${applicationData.notes}` : ''}

Требования к письму:
1. Вежливое и профессиональное обращение
2. Краткое напоминание о своем отклике (название позиции, дата)
3. Выражение заинтересованности в позиции
4. Предложение предоставить дополнительную информацию при необходимости
5. Профессиональное завершение с контактами

Формат: Только текст письма, без темы (subject).`
      }
    ];

    return await this.sendMessage(messages);
  }

  async generateThankYouEmail(interviewData: {
    company: string;
    position: string;
    interviewerName?: string;
    interviewDate: string;
    interviewType: 'phone_screen' | 'interview' | 'technical_interview' | 'final_interview';
    notes?: string;
    keyPoints?: string[];
  }): Promise<string> {
    const interviewTypeNames: Record<string, string> = {
      phone_screen: 'телефонного собеседования',
      interview: 'собеседования',
      technical_interview: 'технического собеседования',
      final_interview: 'финального собеседования'
    };

    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты профессиональный писатель деловых писем. Создавай персональные thank you письма после интервью, которые показывают благодарность, энтузиазм и заинтересованность в позиции. Письма должны быть теплыми, но профессиональными.`
      },
      {
        role: 'user',
        content: `Создай персональное thank you письмо после ${interviewTypeNames[interviewData.interviewType] || 'собеседования'} в компании ${interviewData.company} на позицию "${interviewData.position}".

Контекст:
- Дата собеседования: ${interviewData.interviewDate}
- Тип собеседования: ${interviewTypeNames[interviewData.interviewType]}
${interviewData.interviewerName ? `- Собеседующий: ${interviewData.interviewerName}` : ''}
${interviewData.notes ? `- Заметки о собеседовании: ${interviewData.notes}` : ''}
${interviewData.keyPoints && interviewData.keyPoints.length > 0 ? `- Ключевые моменты обсуждения: ${interviewData.keyPoints.join(', ')}` : ''}

Требования к письму:
1. Персональное обращение ${interviewData.interviewerName ? `к ${interviewData.interviewerName}` : 'к команде'}
2. Выражение благодарности за время и возможность
3. Краткое упоминание ключевых моментов обсуждения (если есть)
4. Подтверждение заинтересованности в позиции
5. Профессиональное завершение

Формат: Только текст письма, без темы (subject).`
      }
    ];

    return await this.sendMessage(messages);
  }

  async generateInterviewQuestions(jobDescription: string, jobAnalysis?: any): Promise<string> {
    const analysisContext = jobAnalysis ? `
Дополнительный контекст:
- Грейд позиции: ${jobAnalysis.jobGrade?.level || 'не определен'}
- Требуемые навыки: ${jobAnalysis.recommendedSkills?.join(', ') || 'нет'}
- ATS ключевые слова: ${jobAnalysis.atsKeywords?.join(', ') || 'нет'}
` : '';

    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты эксперт по подготовке к собеседованиям. Генерируй релевантные вопросы для практики интервью, основанные на описании вакансии. Включай технические, поведенческие и ситуационные вопросы.`
      },
      {
        role: 'user',
        content: `Создай список вопросов для подготовки к собеседованию на основе этой вакансии:

ОПИСАНИЕ ВАКАНСИИ:
${jobDescription}
${analysisContext}

Требования:
1. 5-7 технических вопросов по навыкам из вакансии
2. 3-5 поведенческих вопросов (STAR метод)
3. 2-3 вопроса о мотивации и интересе к позиции
4. 1-2 ситуационных вопроса
5. 2-3 вопроса, которые кандидат может задать интервьюеру

Формат: Список вопросов с кратким указанием типа (Технический/Поведенческий/Ситуационный/Вопрос для интервьюера).`
      }
    ];

    return await this.sendMessage(messages);
  }

  async evaluateInterviewAnswer(question: string, answer: string, jobDescription: string): Promise<string> {
    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты эксперт по оценке ответов на собеседованиях. Анализируй ответы кандидатов, давай конструктивную обратную связь и рекомендации по улучшению. Используй метод STAR для поведенческих вопросов.`
      },
      {
        role: 'user',
        content: `Оцени этот ответ на вопрос интервью и дай обратную связь:

ВОПРОС: ${question}

ОТВЕТ КАНДИДАТА: ${answer}

КОНТЕКСТ ВАКАНСИИ:
${jobDescription}

Предоставь оценку в следующем формате:
1. Сильные стороны ответа (2-3 пункта)
2. Что можно улучшить (2-3 пункта)
3. Конкретные рекомендации для улучшения
4. Оценка (1-10) с кратким обоснованием

Будь конструктивным и полезным.`
      }
    ];

    return await this.sendMessage(messages);
  }
}

export const gigachatAPI = new GigaChatAPI();

// Helper function for chat messages with system prompt
export async function sendChatMessage(
  userMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt?: string
): Promise<string> {
  const defaultSystemPrompt = "Ты профессиональный помощник по составлению резюме и поиску работы. Помогай пользователям создавать эффективные резюме, готовиться к собеседованиям, искать вакансии. Отвечай дружелюбно и профессионально.";
  
  const messages: GigaChatMessage[] = [];
  
  // Add system message if provided or use default
  if (systemPrompt || defaultSystemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt || defaultSystemPrompt,
    });
  }
  
  // Add user messages
  userMessages.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  });
  
  return await gigachatAPI.sendMessage(messages);
}