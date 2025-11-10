import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getHRProfile, createOrUpdateHRProfile } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getHRProfile(session.user.id);
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Get HR profile error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch HR profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const profile = await createOrUpdateHRProfile(session.user.id, body);
    
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Create/update HR profile error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save HR profile' },
      { status: 500 }
    );
  }
}

