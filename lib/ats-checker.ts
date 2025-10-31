export interface ATSIssue {
  type: 'critical' | 'warning' | 'info';
  category: 'formatting' | 'structure' | 'keywords' | 'content' | 'compatibility';
  message: string;
  suggestion: string;
  position?: number;
}

export interface ATSCompatibilityResult {
  overallScore: number; // 0-100
  issues: ATSIssue[];
  recommendations: string[];
  keywordDensity: {
    [key: string]: number;
  };
  formattingScore: number;
  structureScore: number;
  keywordScore: number;
  atsSystems: {
    [key: string]: {
      compatible: boolean;
      score: number;
      issues: string[];
    };
  };
}

// Проверка на ATS-несовместимые элементы
function checkFormattingIssues(content: string): ATSIssue[] {
  const issues: ATSIssue[] = [];

  // Проверка таблиц
  if (content.includes('<table>') || content.match(/╔|╗|╚|╝|┌|┐|└|┘/)) {
    issues.push({
      type: 'critical',
      category: 'formatting',
      message: 'Обнаружены таблицы или box-drawing символы',
      suggestion: 'Удалите таблицы и замените на обычный текст. ATS системы не могут корректно парсить таблицы.'
    });
  }

  // Проверка изображений/графиков
  if (content.match(/<img|\[IMAGE\]|\[CHART\]|graphic|диаграмма/gi)) {
    issues.push({
      type: 'critical',
      category: 'formatting',
      message: 'Обнаружены изображения или графики',
      suggestion: 'Удалите все изображения. ATS не может прочитать текст в изображениях.'
    });
  }

  // Проверка колонок
  if (content.match(/column|колонка|multicolumn/gi)) {
    issues.push({
      type: 'warning',
      category: 'formatting',
      message: 'Возможно использование колонок',
      suggestion: 'Используйте одноколоночный формат. Мультиколоночный формат может нарушить структуру при парсинге.'
    });
  }

  // Проверка специальных символов
  const specialChars = content.match(/[♪♫♬♭♮♯•◦‣⁃]|arrow|стрелка|символ/g);
  if (specialChars && specialChars.length > 5) {
    issues.push({
      type: 'warning',
      category: 'formatting',
      message: 'Слишком много специальных символов',
      suggestion: 'Замените специальные символы на обычный текст. Используйте дефисы и буллеты (•) вместо сложных символов.'
    });
  }

  // Проверка шрифтов (если есть HTML или RTF разметка)
  if (content.match(/font-family|font-size|font-weight|color:/gi)) {
    issues.push({
      type: 'info',
      category: 'formatting',
      message: 'Обнаружено форматирование шрифтов',
      suggestion: 'Убедитесь, что резюме сохранено в простом текстовом формате или PDF без сложного форматирования.'
    });
  }

  // Проверка заголовков/подзаголовков
  const hasProperHeadings = content.match(/\n(ОПЫТ|EXPERIENCE|ОБРАЗОВАНИЕ|EDUCATION|НАВЫКИ|SKILLS|КОНТАКТЫ|CONTACT)/gi);
  if (!hasProperHeadings) {
    issues.push({
      type: 'warning',
      category: 'structure',
      message: 'Не найдены четкие заголовки секций',
      suggestion: 'Используйте четкие заголовки: ОПЫТ РАБОТЫ, ОБРАЗОВАНИЕ, НАВЫКИ, КОНТАКТЫ. Это помогает ATS правильно структурировать данные.'
    });
  }

  return issues;
}

// Проверка структуры резюме
function checkStructureIssues(content: string): ATSIssue[] {
  const issues: ATSIssue[] = [];

  // Проверка наличия обязательных секций
  const sections = {
    'контакты': /(контакт|contact|телефон|phone|email|почта)/gi,
    'опыт': /(опыт|experience|работа|work|профессиональный)/gi,
    'навыки': /(навыки|skills|технологии|technologies|stack)/gi,
    'образование': /(образование|education|университет|university|институт)/gi
  };

  const foundSections: string[] = [];
  for (const [section, pattern] of Object.entries(sections)) {
    if (pattern.test(content)) {
      foundSections.push(section);
    }
  }

  if (foundSections.length < 3) {
    issues.push({
      type: 'critical',
      category: 'structure',
      message: 'Недостаточно ключевых секций резюме',
      suggestion: `Добавьте обязательные секции: Контакты, Опыт работы, Навыки, Образование. Найдено только: ${foundSections.join(', ') || 'ничего'}`
    });
  }

  // Проверка длины резюме
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 200) {
    issues.push({
      type: 'warning',
      category: 'content',
      message: 'Резюме слишком короткое',
      suggestion: 'Добавьте больше деталей об опыте работы, проектах и достижениях. Оптимальная длина: 400-800 слов.'
    });
  } else if (wordCount > 1200) {
    issues.push({
      type: 'warning',
      category: 'content',
      message: 'Резюме слишком длинное',
      suggestion: 'Сократите резюме до 2-3 страниц. ATS системы могут не обработать слишком длинные документы полностью.'
    });
  }

  // Проверка формата дат
  const datePatterns = [
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/g, // 01.01.2024
    /(\d{4})-(\d{2})-(\d{2})/g, // 2024-01-01
    /(январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь)\s+(\d{4})/gi
  ];

  let hasDates = false;
  for (const pattern of datePatterns) {
    if (pattern.test(content)) {
      hasDates = true;
      break;
    }
  }

  if (!hasDates && content.match(/опыт|experience|работа/i)) {
    issues.push({
      type: 'warning',
      category: 'structure',
      message: 'Не найдены даты в опыте работы',
      suggestion: 'Добавьте даты начала и окончания работы в каждом месте работы. Формат: MM.YYYY - MM.YYYY или "настоящее время"'
    });
  }

  return issues;
}

// Проверка ключевых слов
function checkKeywordIssues(content: string, jobKeywords?: string[]): ATSIssue[] {
  const issues: ATSIssue[] = [];

  // Технические ключевые слова для разработчиков (если не указаны из вакансии)
  const defaultTechKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'react', 'vue', 'angular',
    'node.js', 'express', 'django', 'flask', 'spring', 'docker', 'kubernetes',
    'git', 'sql', 'nosql', 'mongodb', 'postgresql', 'aws', 'azure', 'gcp',
    'rest', 'api', 'graphql', 'microservices', 'ci/cd', 'agile', 'scrum'
  ];

  const keywordsToCheck = jobKeywords || defaultTechKeywords;
  const contentLower = content.toLowerCase();
  
  const foundKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const keyword of keywordsToCheck) {
    if (contentLower.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  const keywordCoverage = (foundKeywords.length / keywordsToCheck.length) * 100;

  if (keywordCoverage < 30) {
    issues.push({
      type: 'critical',
      category: 'keywords',
      message: `Низкое покрытие ключевых слов (${Math.round(keywordCoverage)}%)`,
      suggestion: `Добавьте релевантные ключевые слова из вакансии. Отсутствуют: ${missingKeywords.slice(0, 5).join(', ')}`
    });
  } else if (keywordCoverage < 60) {
    issues.push({
      type: 'warning',
      category: 'keywords',
      message: `Среднее покрытие ключевых слов (${Math.round(keywordCoverage)}%)`,
      suggestion: `Добавьте больше релевантных ключевых слов для лучшего матчинга с вакансией.`
    });
  }

  // Проверка на keyword stuffing
  const keywordDensity: { [key: string]: number } = {};
  foundKeywords.forEach(keyword => {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = contentLower.match(regex);
    keywordDensity[keyword] = matches ? matches.length : 0;
  });

  const overusedKeywords = Object.entries(keywordDensity)
    .filter(([_, count]) => count > 10)
    .map(([keyword, _]) => keyword);

  if (overusedKeywords.length > 0) {
    issues.push({
      type: 'warning',
      category: 'keywords',
      message: 'Обнаружен keyword stuffing (переиспользование ключевых слов)',
      suggestion: `Слишком часто используются слова: ${overusedKeywords.join(', ')}. Используйте синонимы и естественный язык.`
    });
  }

  return issues;
}

// Проверка совместимости с конкретными ATS системами
function checkATSSystemCompatibility(content: string) {
  const systems: { [key: string]: { compatible: boolean; score: number; issues: string[] } } = {
    'Taleo': { compatible: true, score: 100, issues: [] },
    'Workday': { compatible: true, score: 100, issues: [] },
    'Greenhouse': { compatible: true, score: 100, issues: [] },
    'Lever': { compatible: true, score: 100, issues: [] },
    'SmartRecruiters': { compatible: true, score: 100, issues: [] },
    'BambooHR': { compatible: true, score: 100, issues: [] }
  };

  // Проверки для всех систем
  const hasTables = content.includes('<table>') || content.match(/╔|╗|╚|╝/);
  const hasImages = content.match(/<img|\[IMAGE\]/gi);
  const hasComplexFormatting = content.match(/font-family|column|multicolumn/gi);

  if (hasTables) {
    Object.keys(systems).forEach(system => {
      systems[system].compatible = false;
      systems[system].score -= 20;
      systems[system].issues.push('Таблицы не поддерживаются');
    });
  }

  if (hasImages) {
    Object.keys(systems).forEach(system => {
      systems[system].compatible = false;
      systems[system].score -= 30;
      systems[system].issues.push('Изображения не читаются ATS');
    });
  }

  if (hasComplexFormatting) {
    Object.keys(systems).forEach(system => {
      systems[system].score -= 10;
      systems[system].issues.push('Сложное форматирование может быть потеряно');
    });
  }

  return systems;
}

// Основная функция проверки ATS совместимости
export function checkATSCompatibility(
  resumeContent: string,
  jobDescription?: string
): ATSCompatibilityResult {
  // Извлекаем ключевые слова из описания вакансии, если предоставлено
  const jobKeywords = jobDescription
    ? extractKeywordsFromJobDescription(jobDescription)
    : undefined;

  // Собираем все проверки
  const formattingIssues = checkFormattingIssues(resumeContent);
  const structureIssues = checkStructureIssues(resumeContent);
  const keywordIssues = checkKeywordIssues(resumeContent, jobKeywords);
  
  const allIssues = [...formattingIssues, ...structureIssues, ...keywordIssues];

  // Рассчитываем scores
  const formattingScore = calculateScore(formattingIssues);
  const structureScore = calculateScore(structureIssues);
  const keywordScore = calculateScore(keywordIssues);

  // Проверка совместимости с конкретными системами
  const atsSystems = checkATSSystemCompatibility(resumeContent);

  // Общий score
  const overallScore = Math.round(
    (formattingScore * 0.4 + structureScore * 0.3 + keywordScore * 0.3)
  );

  // Формируем рекомендации
  const recommendations = generateRecommendations(allIssues, overallScore);

  // Анализ плотности ключевых слов
  const keywordDensity = analyzeKeywordDensity(resumeContent, jobKeywords);

  return {
    overallScore,
    issues: allIssues,
    recommendations,
    keywordDensity,
    formattingScore,
    structureScore,
    keywordScore,
    atsSystems
  };
}

// Вспомогательные функции
function extractKeywordsFromJobDescription(jobDesc: string): string[] {
  // Извлекаем технические термины, навыки, технологии
  const keywords: string[] = [];
  
  // Паттерны для поиска технологий
  const techPatterns = [
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Go|Rust|PHP|Ruby|Swift|Kotlin)\b/gi,
    /\b(React|Vue|Angular|Svelte|Next\.js|Nuxt\.js)\b/gi,
    /\b(Node\.js|Express|Django|Flask|Spring|Laravel|Rails)\b/gi,
    /\b(Docker|Kubernetes|AWS|Azure|GCP|Terraform|Ansible)\b/gi,
    /\b(MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch)\b/gi,
    /\b(Git|GitHub|GitLab|CI\/CD|Jenkins|GitHub Actions)\b/gi
  ];

  techPatterns.forEach(pattern => {
    const matches = jobDesc.match(pattern);
    if (matches) {
      keywords.push(...matches.map(m => m.toLowerCase()));
    }
  });

  return [...new Set(keywords)]; // Убираем дубликаты
}

function calculateScore(issues: ATSIssue[]): number {
  let score = 100;
  
  issues.forEach(issue => {
    if (issue.type === 'critical') score -= 15;
    else if (issue.type === 'warning') score -= 5;
    else if (issue.type === 'info') score -= 2;
  });

  return Math.max(0, Math.min(100, score));
}

function generateRecommendations(issues: ATSIssue[], overallScore: number): string[] {
  const recommendations: string[] = [];

  if (overallScore < 60) {
    recommendations.push('Резюме требует существенной оптимизации для прохождения ATS систем');
  }

  const criticalIssues = issues.filter(i => i.type === 'critical');
  if (criticalIssues.length > 0) {
    recommendations.push(`Найдено ${criticalIssues.length} критических проблем. Исправьте их в первую очередь.`);
  }

  const formattingIssues = issues.filter(i => i.category === 'formatting');
  if (formattingIssues.length > 0) {
    recommendations.push('Упростите форматирование: используйте простой текст, избегайте таблиц и графиков');
  }

  const keywordIssues = issues.filter(i => i.category === 'keywords');
  if (keywordIssues.length > 0) {
    recommendations.push('Добавьте больше релевантных ключевых слов из описания вакансии');
  }

  if (recommendations.length === 0) {
    recommendations.push('Резюме хорошо оптимизировано для ATS систем!');
  }

  return recommendations;
}

function analyzeKeywordDensity(content: string, keywords?: string[]): { [key: string]: number } {
  const density: { [key: string]: number } = {};
  const contentLower = content.toLowerCase();
  const wordCount = content.split(/\s+/).length;

  const keywordsToCheck = keywords || [];
  
  keywordsToCheck.forEach(keyword => {
    const regex = new RegExp(keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = contentLower.match(regex);
    const count = matches ? matches.length : 0;
    density[keyword] = wordCount > 0 ? (count / wordCount) * 100 : 0;
  });

  return density;
}

