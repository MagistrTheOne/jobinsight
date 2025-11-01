import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  getResumeVersionById, 
  updateResumeVersion, 
  deleteResumeVersion 
} from '@/lib/db/queries';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resume = await getResumeVersionById(params.id, session.user.id);
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume version not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, resume });
  } catch (error: any) {
    console.error('Get resume version error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch resume version' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const identifier = request.ip || 'anonymous';
    const rateLimitResult = await rateLimit(identifier, 20, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.template !== undefined) updateData.template = body.template;
    if (body.isDefault !== undefined) updateData.isDefault = body.isDefault ? 1 : 0;
    if (body.optimizedFor !== undefined) updateData.optimizedFor = body.optimizedFor;
    if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) && body.tags.length > 0 ? body.tags : null;

    const updated = await updateResumeVersion(params.id, session.user.id, updateData);

    return NextResponse.json({ success: true, resume: updated });
  } catch (error: any) {
    console.error('Update resume version error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update resume version' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteResumeVersion(params.id, session.user.id);

    return NextResponse.json({ success: true, message: 'Resume version deleted' });
  } catch (error: any) {
    console.error('Delete resume version error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete resume version' },
      { status: 500 }
    );
  }
}

