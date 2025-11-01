import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendChatMessage } from '@/lib/gigachat';
import { 
  createChat, 
  addChatMessage, 
  getChatById,
  getUserChats,
} from '@/lib/db/queries';
import { checkUsageLimit, getCurrentPeriodStart } from '@/lib/usage-limits';
import { incrementUsageLimit } from '@/lib/db/queries';
import { detectTool } from '@/lib/ai-tools/tool-detector';
import { executeTool } from '@/lib/ai-tools/tool-executor';
import { formatSearchResults } from '@/lib/ai-tools/web-search';

// Export runtime config for Next.js
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Требуется авторизация для отправки сообщений' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { chatId, message, systemPrompt } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check usage limits (using resume limit for now, can be changed to separate chat limit)
    const usageCheck = await checkUsageLimit(userId, 'resume');
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit exceeded',
          type: 'chat',
          limit: usageCheck.limit,
          used: usageCheck.used,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    let currentChatId = chatId;
    let isNewChat = false;
    let existingMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // If chatId provided, get existing messages
    if (currentChatId) {
      const chat = await getChatById(currentChatId, userId);
      if (!chat) {
        return NextResponse.json(
          { error: 'Chat not found' },
          { status: 404 }
        );
      }
      // Convert messages to format for API
      existingMessages = chat.messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));
    } else {
      // Create new chat with title from first message
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      const newChat = await createChat(userId, title);
      currentChatId = newChat.id;
      isNewChat = true;
    }

    // Add user message to chat
    await addChatMessage(currentChatId, 'user', message);

    // Prepare messages for GigaChat (include existing conversation)
    const messagesForAI = [...existingMessages, { role: 'user' as const, content: message }];

    // Check if user message needs tools
    const toolDetection = await detectTool(message, existingMessages);
    
    let toolResult = null;
    let finalUserMessage = message;

    // If tool is needed, execute it and include results in message
    if (toolDetection.needsTool && toolDetection.tool) {
      toolResult = await executeTool(toolDetection.tool, userId);
      
      if (toolResult.success) {
        // Format tool results for AI
        let toolResultsText = '';
        
        if (toolDetection.tool.tool === 'web_search' && toolResult.data?.results) {
          toolResultsText = `\n\n=== Результаты поиска в интернете ===\n${formatSearchResults(toolResult.data.results)}\n\nТеперь ответь на вопрос пользователя, используя эту информацию:`;
        } else {
          toolResultsText = `\n\n=== Результат выполнения инструмента "${toolDetection.tool.tool}" ===\n${JSON.stringify(toolResult.data, null, 2)}\n\nИспользуй эту информацию для ответа:`;
        }
        
        finalUserMessage = `${message}\n\n${toolResultsText}`;
      } else {
        // Tool execution failed, inform user
        finalUserMessage = `${message}\n\n[Примечание: Не удалось выполнить инструмент "${toolDetection.tool.tool}": ${toolResult.error}]`;
      }
      
      // Update messages with tool-enhanced message
      messagesForAI[messagesForAI.length - 1] = { role: 'user' as const, content: finalUserMessage };
    }

    // Send to GigaChat API
    const assistantResponse = await sendChatMessage(messagesForAI, systemPrompt);

    // Save assistant response
    await addChatMessage(currentChatId, 'assistant', assistantResponse);

    // Increment usage counter after successful chat
    const periodStart = getCurrentPeriodStart();
    await incrementUsageLimit(userId, 'resume', periodStart);

    // Get updated chat with all messages
    const updatedChat = await getChatById(currentChatId, userId);
    
    // Dispatch event for frontend to refresh chat list
    // Note: This is server-side, events are handled client-side

    return NextResponse.json({
      success: true,
      chatId: currentChatId,
      messages: updatedChat?.messages || [],
      newChat: isNewChat,
      chatTitle: updatedChat?.title,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Determine status code and detailed message
    let statusCode = 500;
    let errorMessage = error.message || 'Unknown error occurred';
    let errorDetails: any = null;

    if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
      statusCode = 422;
      errorMessage = 'Invalid request format or content. Please check your message content.';
      errorDetails = {
        type: 'validation_error',
        suggestion: 'Ensure your message is properly formatted and not too long (max ~100k characters).'
      };
    } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      statusCode = 401;
      errorMessage = 'Authentication failed. Please check GigaChat API credentials.';
    } else if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
      statusCode = 429;
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      statusCode = 504;
      errorMessage = 'Request timeout. The request took too long. Please try again with a shorter message.';
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Chat request failed',
        message: errorMessage,
        details: errorDetails
      },
      { status: statusCode }
    );
  }
}

