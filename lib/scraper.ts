interface ScrapedContent {
  title: string;
  company: string;
  description: string;
  requirements: string;
  fullContent: string;
  url: string;
}

// Парсинг вакансии с HeadHunter (hh.ru)
async function parseHHVacancy(url: string): Promise<ScrapedContent> {
  try {
    // Извлекаем ID вакансии из URL (например: https://hh.ru/vacancy/12345678)
    const vacancyIdMatch = url.match(/vacancy\/(\d+)/);
    if (!vacancyIdMatch || !vacancyIdMatch[1]) {
      throw new Error('Invalid HeadHunter URL format. Expected: https://hh.ru/vacancy/12345678');
    }

    const vacancyId = vacancyIdMatch[1];
    
    // Используем публичное API HeadHunter
    const apiUrl = `https://api.hh.ru/vacancies/${vacancyId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'JobInsight/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HH API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Парсим данные из API
    const description = data.description || '';
    const requirements = data.key_skills?.map((skill: any) => skill.name).join(', ') || '';
    const experience = data.experience?.name || '';
    const schedule = data.schedule?.name || '';
    const employment = data.employment?.name || '';
    
    // Формируем полный контент
    const fullContent = [
      `Название: ${data.name || 'Не указано'}`,
      `Компания: ${data.employer?.name || 'Не указано'}`,
      `Опыт работы: ${experience}`,
      `График работы: ${schedule}`,
      `Тип занятости: ${employment}`,
      `Город: ${data.area?.name || 'Не указано'}`,
      `Зарплата: ${data.salary ? `${data.salary.from ? `от ${data.salary.from}` : ''} ${data.salary.to ? `до ${data.salary.to}` : ''} ${data.salary.currency || 'рублей'}` : 'Не указана'}`,
      '',
      'Описание:',
      description,
      '',
      `Ключевые навыки: ${requirements}`
    ].join('\n');

    return {
      title: data.name || 'Вакансия',
      company: data.employer?.name || 'Компания',
      description: description.substring(0, 2000),
      requirements: `${experience}. ${requirements}. ${schedule}. ${employment}`,
      fullContent: fullContent.substring(0, 8000),
      url
    };
  } catch (error) {
    console.error('HH parsing error:', error);
    throw error;
  }
}

export async function scrapeJobPosting(url: string): Promise<ScrapedContent> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!urlObj.hostname) {
      throw new Error('Invalid URL provided');
    }

    // Проверяем, является ли это ссылкой на HeadHunter
    if (urlObj.hostname.includes('hh.ru') || urlObj.hostname.includes('headhunter.ru')) {
      return await parseHHVacancy(url);
    }

    // Для остальных сайтов используем обычный парсинг
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : 'Job Position';

    // Remove script and style tags, then extract text content
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract structured information
    const company = extractCompanyName(textContent, html) || 'Company';
    const description = extractJobDescription(textContent);
    const requirements = extractRequirements(textContent);

    return {
      title: cleanText(title),
      company: cleanText(company),
      description: cleanText(description),
      requirements: cleanText(requirements),
      fullContent: cleanText(textContent.substring(0, 8000)), // Limit content size
      url
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to extract job posting content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractCompanyName(text: string, html: string): string | null {
  // Try to extract from structured data first
  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis);
  if (jsonLdMatch) {
    for (const match of jsonLdMatch) {
      try {
        const jsonData = JSON.parse(match.replace(/<script[^>]*>|<\/script>/gi, ''));
        if (jsonData.hiringOrganization?.name) {
          return jsonData.hiringOrganization.name;
        }
      } catch (e) {
        // Continue to next match
      }
    }
  }

  // Fallback to text patterns
  const patterns = [
    /(?:company|employer|organization)[:\s]+([^\n\r.]{1,100})/i,
    /(?:работодатель|компания)[:\s]+([^\n\r.]{1,100})/i,
    /(?:at|в)\s+([A-Z][a-zA-Z\s&.,-]{2,50})(?:\s|$)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const company = match[1].trim();
      if (company.length > 2 && company.length < 100) {
        return company;
      }
    }
  }
  
  return null;
}

function extractJobDescription(text: string): string {
  const descriptionPatterns = [
    /(?:job description|описание вакансии|about the role|о позиции)[:\s]*(.*?)(?:requirements|требования|qualifications|квалификация)/is,
    /(?:responsibilities|обязанности)[:\s]*(.*?)(?:requirements|требования|qualifications|квалификация)/is,
    /(?:what you.ll do|чем предстоит заниматься)[:\s]*(.*?)(?:requirements|требования)/is
  ];

  for (const pattern of descriptionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const description = match[1].trim();
      if (description.length > 50) {
        return description.substring(0, 2000);
      }
    }
  }
  
  // Fallback: take first substantial paragraph
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 100);
  return paragraphs[0]?.substring(0, 2000) || text.substring(0, 1500);
}

function extractRequirements(text: string): string {
  const requirementPatterns = [
    /(?:requirements|требования|qualifications|квалификация)[:\s]*(.*?)(?:benefits|льготы|salary|зарплата|apply|подать заявку|contact|контакты|$)/is,
    /(?:must have|обязательно)[:\s]*(.*?)(?:nice to have|желательно|benefits|льготы|$)/is,
    /(?:skills|навыки)[:\s]*(.*?)(?:experience|опыт|education|образование|$)/is
  ];

  for (const pattern of requirementPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const requirements = match[1].trim();
      if (requirements.length > 30) {
        return requirements.substring(0, 2000);
      }
    }
  }
  
  return '';
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-.,!?():;'"]/g, '')
    .trim();
}