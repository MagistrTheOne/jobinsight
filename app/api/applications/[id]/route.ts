import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  getApplicationById, 
  updateApplication, 
  deleteApplication 
} from '@/lib/db/queries';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-ip';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const application = await getApplicationById(id, session.user.id);
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const identifier = getClientIp(request);
    const rateLimitResult = await rateLimit(identifier, 20, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.company !== undefined) updateData.company = body.company;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.appliedDate !== undefined) updateData.appliedDate = body.appliedDate ? new Date(body.appliedDate) : null;
    if (body.applicationUrl !== undefined) updateData.applicationUrl = body.applicationUrl;
    if (body.resumeVersion !== undefined) updateData.resumeVersion = body.resumeVersion;
    if (body.coverLetter !== undefined) updateData.coverLetter = body.coverLetter;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.salaryOffer !== undefined) updateData.salaryOffer = body.salaryOffer;
    if (body.nextFollowUp !== undefined) updateData.nextFollowUp = body.nextFollowUp ? new Date(body.nextFollowUp) : null;
    if (body.isFavorite !== undefined) updateData.isFavorite = body.isFavorite ? 1 : 0;
    if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) && body.tags.length > 0 ? body.tags : null;

    const updated = await updateApplication(id, session.user.id, updateData);

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deleteApplication(id, session.user.id);

    return NextResponse.json({ success: true, message: 'Application deleted' });
  } catch (error: any) {
    console.error('Delete application error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete application' },
      { status: 500 }
    );
  }
}

