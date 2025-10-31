interface ScrapedContent {
  title: string;
  company: string;
  description: string;
  requirements: string;
  fullContent: string;
  url: string;
}

export async function scrapeJobPosting(url: string): Promise<ScrapedContent> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!urlObj.hostname) {
      throw new Error('Invalid URL provided');
    }

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
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