// Tool Detector - uses AI to detect if user message needs tools

import { gigachatAPI } from '@/lib/gigachat';
import { ToolCall } from './types';
import { AVAILABLE_TOOLS } from './types';

const TOOL_DETECTION_PROMPT = `Ты умный помощник, который анализирует запросы пользователя и определяет, нужны ли инструменты для ответа.

Доступные инструменты:
${AVAILABLE_TOOLS.map(
  (tool) =>
    `- ${tool.name}: ${tool.description}\n  Параметры: ${JSON.stringify(tool.parameters.properties, null, 2)}`
).join('\n\n')}

Если пользователь запрашивает информацию, которую нужно искать в интернете (компании, вакансии, технологии, новости), используй tool "web_search".
Если пользователь спрашивает о вакансиях на hh.ru, используй "hh_ru_search".
Если нужна информация о профиле LinkedIn, используй "linkedin_profile".
Если нужно прочитать или отправить email, используй "email_read" или "email_send".
Если нужна информация о GitHub репозиториях, используй "github_repos".

Отвечай ТОЛЬКО JSON в формате:
{
  "needsTool": true/false,
  "tool": "tool_name" или null,
  "parameters": { ... } или null,
  "reasoning": "краткое объяснение"
}

Если инструмент не нужен, верни {"needsTool": false, "tool": null, "parameters": null, "reasoning": "..."}`;

export async function detectTool(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{
  needsTool: boolean;
  tool: ToolCall | null;
  reasoning: string;
}> {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: TOOL_DETECTION_PROMPT,
      },
      ...conversationHistory.slice(-5), // Last 5 messages for context
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    const response = await gigachatAPI.sendMessage(messages);
    
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        needsTool: false,
        tool: null,
        reasoning: 'Could not parse tool detection response',
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (parsed.needsTool && parsed.tool && parsed.parameters) {
      return {
        needsTool: true,
        tool: {
          tool: parsed.tool as ToolCall['tool'],
          parameters: parsed.parameters,
        },
        reasoning: parsed.reasoning || 'Tool needed for user request',
      };
    }

    return {
      needsTool: false,
      tool: null,
      reasoning: parsed.reasoning || 'No tool needed',
    };
  } catch (error: any) {
    console.error('Tool detection error:', error);
    // Fallback: simple keyword-based detection
    const lowerMessage = userMessage.toLowerCase();
    
    if (
      lowerMessage.includes('найди') ||
      lowerMessage.includes('поищи') ||
      lowerMessage.includes('что такое') ||
      lowerMessage.includes('информация о') ||
      lowerMessage.includes('find') ||
      lowerMessage.includes('search')
    ) {
      return {
        needsTool: true,
        tool: {
          tool: 'web_search',
          parameters: { query: userMessage, maxResults: 5 },
        },
        reasoning: 'User seems to be asking for information that requires web search',
      };
    }

    return {
      needsTool: false,
      tool: null,
      reasoning: 'Error in tool detection, no tool used',
    };
  }
}

