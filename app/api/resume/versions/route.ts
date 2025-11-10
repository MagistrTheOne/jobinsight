import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserResumeVersions } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumes = await getUserResumeVersions(session.user.id);

    return NextResponse.json({
      success: true,
      resumes,
    });
  } catch (error: any) {
    console.error('Failed to get resume versions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get resume versions',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

