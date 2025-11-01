import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserChats, getChatById, deleteChat } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    // If chatId provided, get specific chat
    if (chatId) {
      const chat = await getChatById(chatId, userId);
      if (!chat) {
        return NextResponse.json(
          { error: 'Chat not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        chat,
      });
    }

    // Otherwise, get all user chats
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const chats = await getUserChats(userId, limit);

    return NextResponse.json({
      success: true,
      chats,
    });

  } catch (error: any) {
    console.error('Failed to fetch chat history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chat history',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

