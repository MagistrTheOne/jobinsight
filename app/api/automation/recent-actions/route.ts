import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Create automation_actions table and implement proper tracking
    // For now, return empty array
    return NextResponse.json({
      success: true,
      actions: [],
    });
  } catch (error: any) {
    console.error('Error fetching recent actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch actions', message: error.message },
      { status: 500 }
    );
  }
}

