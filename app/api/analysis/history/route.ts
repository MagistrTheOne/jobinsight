import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getAnalysisHistory, createAnalysisHistory, deleteAnalysisHistory, getAnalysisById } from '@/lib/db/queries';
import { rateLimit } from '@/lib/rate-limit';

// GET - получить историю анализов пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') as 'job' | 'resume' | 'cover-letter' | null;

    const history = await getAnalysisHistory(session.user.id, limit);
    
    // Фильтруем по типу если указан
    const filteredHistory = type 
      ? history.filter(item => item.type === type)
      : history;

    return NextResponse.json({
      success: true,
      history: filteredHistory,
      count: filteredHistory.length,
    });

  } catch (error: any) {
    console.error('Failed to fetch analysis history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history', message: error.message },
      { status: 500 }
    );
  }
}

// POST - создать новый анализ в истории
export async function POST(request: NextRequest) {
  try {
    const identifier = request.ip || 'anonymous';
    const rateLimitResult = await rateLimit(identifier, 20, 60000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, title, data, jobUrl } = body;

    if (!type || !title || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, data' },
        { status: 400 }
      );
    }

    if (!['job', 'resume', 'cover-letter'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: job, resume, or cover-letter' },
        { status: 400 }
      );
    }

    const historyItem = await createAnalysisHistory({
      id: crypto.randomUUID(),
      userId: session.user.id,
      type: type as 'job' | 'resume' | 'cover-letter',
      title,
      data,
      jobUrl: jobUrl || null,
    });

    return NextResponse.json({
      success: true,
      item: historyItem,
    });

  } catch (error: any) {
    console.error('Failed to create analysis history:', error);
    return NextResponse.json(
      { error: 'Failed to create history item', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - удалить элемент истории
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    // Проверяем, что элемент принадлежит пользователю
    const item = await getAnalysisById(id, session.user.id);
    if (!item) {
      return NextResponse.json(
        { error: 'Analysis not found or access denied' },
        { status: 404 }
      );
    }

    await deleteAnalysisHistory(id, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Analysis deleted successfully',
    });

  } catch (error: any) {
    console.error('Failed to delete analysis history:', error);
    return NextResponse.json(
      { error: 'Failed to delete history item', message: error.message },
      { status: 500 }
    );
  }
}

