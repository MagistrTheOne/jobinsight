import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getChatById, deleteChat, updateChatTitle } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { chatId } = await params;
    const chat = await getChatById(chatId, session.user.id);
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { chatId } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Verify chat belongs to user
    const chat = await getChatById(chatId, session.user.id);
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Update chat title
    await updateChatTitle(chatId, title.trim());

    return NextResponse.json({
      success: true,
      message: 'Chat updated successfully',
    });

  } catch (error: any) {
    console.error('Failed to update chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update chat',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { chatId } = await params;
    await deleteChat(chatId, session.user.id);

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

