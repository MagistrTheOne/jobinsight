import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserById, updateUser } from '@/lib/db/queries';

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
        bio: user.bio,
        salaryExpectation: user.salaryExpectation,
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

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.role !== undefined) {
      if (['user', 'hr', 'admin'].includes(body.role)) {
        updateData.role = body.role;
      }
    }
    if (body.name !== undefined) updateData.name = body.name;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.salaryExpectation !== undefined) updateData.salaryExpectation = body.salaryExpectation;

    const updatedUser = await updateUser(session.user.id, updateData);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        verified: updatedUser.verified === 1,
        title: updatedUser.title,
        role: updatedUser.role,
        bio: updatedUser.bio,
        salaryExpectation: updatedUser.salaryExpectation,
      },
    });

  } catch (error: any) {
    console.error('Failed to update user info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user info',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
