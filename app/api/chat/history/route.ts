import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getUserChats, getChatById, deleteChat } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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
    const chats = await getUserChats(userId);

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

