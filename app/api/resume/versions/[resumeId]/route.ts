import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  getResumeVersionById, 
  updateResumeVersion, 
  deleteResumeVersion 
} from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeId } = await params;
    const resume = await getResumeVersionById(resumeId, session.user.id);

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      resume,
    });
  } catch (error: any) {
    console.error('Failed to get resume:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get resume',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeId } = await params;
    const body = await request.json();
    const { content, title, isDefault } = body;

    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (title !== undefined) updateData.title = title;
    if (isDefault !== undefined) updateData.isDefault = isDefault ? 1 : 0;

    const updated = await updateResumeVersion(resumeId, session.user.id, updateData);

    return NextResponse.json({
      success: true,
      resume: updated,
    });
  } catch (error: any) {
    console.error('Failed to update resume:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update resume',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeId } = await params;
    await deleteResumeVersion(resumeId, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error: any) {
    console.error('Failed to delete resume:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete resume',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

