import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getChatById, deleteChat } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const chat = await getChatById(params.chatId, session.user.id);
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

  } catch (error: any) {
    console.error('Failed to fetch chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chat',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await deleteChat(params.chatId, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Chat deleted successfully',
    });

  } catch (error: any) {
    console.error('Failed to delete chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete chat',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

