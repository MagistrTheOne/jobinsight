import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  createResumeVersion, 
  getUserResumeVersions,
  getDefaultResumeVersion
} from '@/lib/db/queries';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const defaultOnly = searchParams.get('default') === 'true';

    if (defaultOnly) {
      const defaultResume = await getDefaultResumeVersion(session.user.id);
      return NextResponse.json({ success: true, resume: defaultResume });
    }

    const resumes = await getUserResumeVersions(session.user.id);
    return NextResponse.json({ success: true, resumes });
  } catch (error: any) {
    console.error('Get resume versions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch resume versions' },
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

    const identifier = request.ip || 'anonymous';
    const rateLimitResult = await rateLimit(identifier, 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      template = 'modern',
      isDefault = false,
      optimizedFor,
      tags = [],
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const resume = await createResumeVersion({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title,
      content,
      template,
      isDefault: isDefault ? 1 : 0,
      optimizedFor: optimizedFor || null,
      tags: tags.length > 0 ? tags : null,
    });

    return NextResponse.json({ success: true, resume }, { status: 201 });
  } catch (error: any) {
    console.error('Create resume version error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create resume version' },
      { status: 500 }
    );
  }
}

