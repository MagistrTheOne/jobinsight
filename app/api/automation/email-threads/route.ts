import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { getUserEmailThreads } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const threads = await getUserEmailThreads(session.user.id);

    return NextResponse.json({
      success: true,
      threads,
    });
  } catch (error: any) {
    console.error('Error fetching email threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email threads', message: error.message },
      { status: 500 }
    );
  }
}

