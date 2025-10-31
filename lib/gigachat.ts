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

  private async getAccessToken(): Promise<string> {
    // Check if token is valid and not expired
    if (this.token && Date.now() < this.token.expires_at) {
      return this.token.access_token;
    }

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
      console.error('Failed to obtain GigaChat access token:', error);
      if (error.response) {
        console.error('OAuth response:', error.response.data);
        throw new Error(`OAuth request failed: ${error.response.status} ${error.response.statusText}`);
      }
      throw new Error('Authentication failed');
    }
  }

  async sendMessage(messages: GigaChatMessage[], model: string = 'GigaChat'): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();

      // Используем axios с кастомным HTTPS agent
      const response = await this.axiosInstance.post<GigaChatResponse>(
        `${this.apiUrl}/chat/completions`,
        {
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2048
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

      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('GigaChat API error:', error);
      if (error.response) {
        console.error('API response:', error.response.data);
        throw new Error(`API request failed: ${error.response.status} ${error.response.statusText}`);
      }
      throw error;
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
      // If JSON parsing fails, try to return a structured response with fallback
      console.error('Failed to parse job analysis JSON:', error);
      return {
        redFlags: [],
        requirements: { realistic: [], unrealistic: [] },
        salaryInsight: 'Не удалось проанализировать зарплатные ожидания',
        workLifeBalance: 'Не удалось оценить work-life balance',
        companyInsights: 'Не удалось получить инсайты о компании',
        atsKeywords: [],
        recommendedSkills: [],
        overallScore: 'Не удалось оценить (0/10)',
        rawResponse: response
      };
    }
  }

  async generateCoverLetter(jobContent: string, userInfo: any): Promise<string> {
    const messages: GigaChatMessage[] = [
      {
        role: 'system',
        content: `Ты профессиональный писатель сопроводительных писем, специализирующийся на ATS-оптимизированных заявлениях. Создавай убедительные, персонализированные сопроводительные письма, которые включают релевантные ключевые слова и подчеркивают сильные стороны кандидата.`
      },
      {
        role: 'user',
        content: `Создай ATS-оптимизированное сопроводительное письмо для этой вакансии: ${jobContent}

Информация о пользователе: ${JSON.stringify(userInfo)}

Пожалуйста, создай профессиональное сопроводительное письмо, которое:
1. Использует релевантные ключевые слова из вакансии
2. Подчеркивает релевантный опыт и навыки
3. Показывает энтузиазм к роли
4. Дружелюбно к ATS с правильным форматированием`
      }
    ];

    return await this.sendMessage(messages);
  }

  async analyzeResume(resumeContent: string, jobContent?: string): Promise<any> {
    const jobContext = jobContent ? `\n\nВакансия для сравнения: ${jobContent}` : '';
    
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
        content: `Проанализируй это резюме: ${resumeContent}${jobContext}`
      }
    ];

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
      // If JSON parsing fails, try to return a structured response with fallback
      console.error('Failed to parse resume analysis JSON:', error);
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
  }
}

export const gigachatAPI = new GigaChatAPI();