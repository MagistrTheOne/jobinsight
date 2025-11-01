// Types for AI Tools/Connectors system

export type ToolType = 'web_search' | 'hh_ru_search' | 'linkedin_profile' | 'email_send' | 'email_read' | 'github_repos';

export interface ToolDefinition {
  name: string;
  description: string;
  type: ToolType;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      required?: boolean;
    }>;
    required?: string[];
  };
}

export interface ToolCall {
  tool: ToolType;
  parameters: Record<string, any>;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Available tools definitions
export const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    name: 'web_search',
    description: 'Поиск информации в интернете через Google. Используй для получения актуальной информации о компаниях, вакансиях, технологиях, новостях индустрии.',
    type: 'web_search',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Поисковый запрос на русском или английском языке',
          required: true,
        },
        maxResults: {
          type: 'number',
          description: 'Максимальное количество результатов (по умолчанию 5)',
          required: false,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'hh_ru_search',
    description: 'Поиск вакансий на hh.ru. Требует подключенной интеграции hh.ru API.',
    type: 'hh_ru_search',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Текст поискового запроса (название должности, ключевые слова)',
          required: true,
        },
        area: {
          type: 'string',
          description: 'ID региона (1 - Москва, 2 - СПб, и т.д.)',
          required: false,
        },
        experience: {
          type: 'string',
          description: 'Опыт работы: noExperience, between1And3, between3And6, moreThan6',
          required: false,
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'linkedin_profile',
    description: 'Получение информации о профиле LinkedIn. Требует подключенной интеграции LinkedIn API.',
    type: 'linkedin_profile',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL профиля LinkedIn',
          required: true,
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'email_read',
    description: 'Чтение последних писем из подключенной почты. Требует подключенной email интеграции.',
    type: 'email_read',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Количество последних писем (по умолчанию 10)',
          required: false,
        },
        unreadOnly: {
          type: 'boolean',
          description: 'Только непрочитанные письма',
          required: false,
        },
      },
    },
  },
  {
    name: 'email_send',
    description: 'Отправка email через подключенную почту. Требует подключенной email интеграции.',
    type: 'email_send',
    parameters: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Email получателя',
          required: true,
        },
        subject: {
          type: 'string',
          description: 'Тема письма',
          required: true,
        },
        body: {
          type: 'string',
          description: 'Текст письма',
          required: true,
        },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'github_repos',
    description: 'Получение информации о репозиториях GitHub пользователя. Требует подключенной GitHub интеграции.',
    type: 'github_repos',
    parameters: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'GitHub username',
          required: true,
        },
        limit: {
          type: 'number',
          description: 'Максимальное количество репозиториев (по умолчанию 10)',
          required: false,
        },
      },
      required: ['username'],
    },
  },
];

