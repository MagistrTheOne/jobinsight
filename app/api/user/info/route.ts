import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserById } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        verified: user.verified === 1,
        title: user.title,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.error('Failed to get user info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user info',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
