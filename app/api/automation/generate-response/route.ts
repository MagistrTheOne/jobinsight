import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEmailMessage, updateEmailMessage } from '@/lib/db/queries';
import { gigachatAPI } from '@/lib/gigachat';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, threadId } = await request.json();

    // Get message
    const message = await getEmailMessage(messageId, session.user.id);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Generate AI response using GigaChat
    // TODO: Integrate with email API to get full context (previous messages, application details)
    const aiResponse = await gigachatAPI.sendChatMessage([
      {
        role: 'system',
        content: 'Ты профессиональный помощник для ответов HR-менеджерам. Создавай вежливые, профессиональные ответы на основе контекста переписки и заявки на работу.',
      },
      {
        role: 'user',
        content: `Сообщение от HR:\n\n${message.body}\n\nСоздай профессиональный ответ. Будь вежливым, заинтересованным и профессиональным.`,
      },
    ]);

    // Analyze sentiment and intent
    const analysis = await gigachatAPI.sendChatMessage([
      {
        role: 'system',
        content: 'Анализируй тон и намерение сообщений от HR. Определяй sentiment (positive/neutral/negative) и intent (interview_request/rejection/offer/question/follow_up).',
      },
      {
        role: 'user',
        content: `Проанализируй это сообщение:\n\n${message.body}\n\nВерни только JSON: {"sentiment": "...", "intent": "..."}`,
      },
    ]);

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let intent = 'question';

    try {
      const parsed = JSON.parse(analysis.replace(/```json\n?/g, '').replace(/```/g, ''));
      sentiment = parsed.sentiment || 'neutral';
      intent = parsed.intent || 'question';
    } catch {
      // Use defaults if parsing fails
    }

    // Update message with AI suggestion
    await updateEmailMessage(messageId, {
      aiSuggestion: aiResponse,
      sentiment,
      intent,
    });

    return NextResponse.json({
      success: true,
      suggestion: aiResponse,
      sentiment,
      intent,
    });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', message: error.message },
      { status: 500 }
    );
  }
}

