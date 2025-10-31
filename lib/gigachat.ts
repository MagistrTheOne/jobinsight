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

class GigaChatAPI {
  private token: GigaChatToken | null = null;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly authKey: string;
  private readonly oauthUrl: string;
  private readonly apiUrl: string;

  constructor() {
    this.clientId = process.env.GIGACHAT_CLIENT_ID!;
    this.clientSecret = process.env.GIGACHAT_CLIENT_SECRET!;
    this.authKey = process.env.GIGACHAT_AUTHORIZATION_KEY!;
    this.oauthUrl = process.env.GIGACHAT_OAUTH_URL || 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
    this.apiUrl = process.env.GIGACHAT_API_URL || 'https://gigachat.devices.sberbank.ru/api/v1';
  }

  private async getAccessToken(): Promise<string> {
    // Check if token is valid and not expired
    if (this.token && Date.now() < this.token.expires_at) {
      return this.token.access_token;
    }

    try {
      const response = await fetch(this.oauthUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.authKey}`,
          'RqUID': crypto.randomUUID(),
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: 'scope=GIGACHAT_API_PERS'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OAuth response:', errorText);
        throw new Error(`OAuth request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      this.token = {
        access_token: data.access_token,
        expires_in: data.expires_in,
        expires_at: Date.now() + (data.expires_in * 1000) - 60000 // Refresh 1 minute early
      };

      return this.token.access_token;
    } catch (error) {
      console.error('Failed to obtain GigaChat access token:', error);
      throw new Error('Authentication failed');
    }
  }

  async sendMessage(messages: GigaChatMessage[], model: string = 'GigaChat'): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: GigaChatResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('GigaChat API error:', error);
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
      return JSON.parse(response);
    } catch {
      // If JSON parsing fails, return a structured response
      return {
        error: 'Failed to parse analysis',
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
      return JSON.parse(response);
    } catch {
      return {
        error: 'Failed to parse analysis',
        rawResponse: response
      };
    }
  }
}

export const gigachatAPI = new GigaChatAPI();