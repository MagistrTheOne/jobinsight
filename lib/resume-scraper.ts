interface ScrapedResume {
  content: string;
  title: string;
  url: string;
}

// Парсинг резюме с HeadHunter (hh.ru) через публичное API
async function parseHHResume(url: string): Promise<ScrapedResume> {
  try {
    // Извлекаем ID резюме из URL (например: https://hh.ru/resume/12345678901234567890123456789012)
    const resumeIdMatch = url.match(/resume\/([a-f0-9]{32})/);
    if (!resumeIdMatch || !resumeIdMatch[1]) {
      throw new Error('Invalid HeadHunter resume URL format');
    }

    const resumeId = resumeIdMatch[1];
    
    // Используем публичное API HeadHunter для резюме
    const apiUrl = `https://api.hh.ru/resumes/${resumeId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'JobInsight/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // Если API требует авторизацию, пробуем парсить HTML
      if (response.status === 403 || response.status === 401) {
        throw new Error('Это резюме требует авторизации или является приватным. Пожалуйста, скопируйте текст резюме вручную.');
      }
      throw new Error(`HH API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Формируем текстовое содержимое резюме
    const resumeContent = [
      `ФИО: ${data.first_name || ''} ${data.middle_name || ''} ${data.last_name || ''}`,
      `Город: ${data.area?.name || 'Не указан'}`,
      `Дата рождения: ${data.birth_date ? new Date(data.birth_date).toLocaleDateString('ru-RU') : 'Не указана'}`,
      '',
      'Контактная информация:',
      data.contacts?.map((contact: any) => `${contact.type}: ${contact.value}`).join('\n') || 'Не указана',
      '',
      'Опыт работы:',
      ...(data.experience || []).map((exp: any, idx: number) => [
        `\n${idx + 1}. ${exp.position || 'Не указана позиция'}`,
        `   Компания: ${exp.company || 'Не указана'}`,
        `   Период: ${exp.start ? new Date(exp.start).toLocaleDateString('ru-RU') : 'Не указано'} - ${exp.end ? new Date(exp.end).toLocaleDateString('ru-RU') : 'по настоящее время'}`,
        `   Описание: ${exp.description || ''}`
      ].join('\n')),
      '',
      'Образование:',
      ...(data.education || []).map((edu: any, idx: number) => [
        `\n${idx + 1}. ${edu.name || 'Не указано'}`,
        `   Организация: ${edu.organization || 'Не указана'}`,
        `   Год окончания: ${edu.year || 'Не указан'}`
      ].join('\n')),
      '',
      `Ключевые навыки: ${data.skills || 'Не указаны'}`,
      '',
      `О себе: ${data.title || ''}`,
      data.description || ''
    ].join('\n').trim();

    return {
      content: resumeContent,
      title: `${data.first_name || ''} ${data.last_name || ''} - Резюме`.trim(),
      url
    };
  } catch (error) {
    console.error('HH resume parsing error:', error);
    throw error;
  }
}

// Универсальный парсер резюме с любого URL
export async function scrapeResume(url: string): Promise<ScrapedResume> {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname) {
      throw new Error('Invalid URL provided');
    }

    // Проверяем, является ли это ссылкой на HeadHunter резюме
    if ((urlObj.hostname.includes('hh.ru') || urlObj.hostname.includes('headhunter.ru')) && url.includes('resume')) {
      try {
        return await parseHHResume(url);
      } catch (error) {
        // Если не удалось через API, пробуем парсить HTML
        console.warn('HH API failed, trying HTML parsing:', error);
      }
    }

    // Для остальных сайтов парсим HTML
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
    
    // Извлекаем текст из HTML
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Извлекаем заголовок
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : 'Resume';

    return {
      content: textContent.substring(0, 15000), // Ограничиваем размер
      title,
      url
    };
  } catch (error) {
    console.error('Resume scraping error:', error);
    throw new Error(`Failed to extract resume content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

