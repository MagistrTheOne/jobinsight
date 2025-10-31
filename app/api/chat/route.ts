import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { sendChatMessage } from '@/lib/gigachat';
import { 
  createChat, 
  addChatMessage, 
  getChatById,
  getUserChats,
} from '@/lib/db/queries';
import { checkUsageLimit, getCurrentPeriodStart } from '@/lib/usage-limits';
import { incrementUsageLimit } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    // Send to GigaChat API
    const assistantResponse = await sendChatMessage(messagesForAI, systemPrompt);

    // Save assistant response
    await addChatMessage(currentChatId, 'assistant', assistantResponse);

    // Increment usage counter after successful chat
    const periodStart = getCurrentPeriodStart();
    await incrementUsageLimit(userId, 'resume', periodStart);

    // Get updated chat with all messages
    const updatedChat = await getChatById(currentChatId, userId);

    return NextResponse.json({
      success: true,
      chatId: currentChatId,
      messages: updatedChat?.messages || [],
      newChat: isNewChat,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Chat request failed',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

