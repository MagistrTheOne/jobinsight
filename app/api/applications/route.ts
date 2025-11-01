import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  createApplication, 
  getUserApplications, 
  getApplicationStats,
  getApplicationsNeedingFollowUp 
} from '@/lib/db/queries';
import { createJobPosting } from '@/lib/db/queries';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-ip';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const company = searchParams.get('company');
    const favorite = searchParams.get('favorite') === 'true' ? true : searchParams.get('favorite') === 'false' ? false : undefined;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const statsOnly = searchParams.get('stats') === 'true';
    const followUp = searchParams.get('followUp') === 'true';

    if (statsOnly) {
      const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
      const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
      
      const stats = await getApplicationStats(session.user.id, startDate, endDate);
      return NextResponse.json({ success: true, stats });
    }

    if (followUp) {
      const followUpApplications = await getApplicationsNeedingFollowUp(session.user.id);
      return NextResponse.json({ success: true, applications: followUpApplications });
    }

    const applications = await getUserApplications(session.user.id, {
      status: status || undefined,
      company: company || undefined,
      favorite,
      limit,
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch applications' },
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

    const identifier = getClientIp(request);
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
      company,
      status = 'saved',
      appliedDate,
      applicationUrl,
      resumeVersion,
      coverLetter,
      notes,
      salaryOffer,
      nextFollowUp,
      isFavorite = false,
      tags = [],
      jobPostingId,
      // Job posting data (optional, creates job posting if provided)
      jobPosting,
    } = body;

    if (!title || !company) {
      return NextResponse.json(
        { error: 'Title and company are required' },
        { status: 400 }
      );
    }

    // Если передан jobPosting, создаем его
    let postingId = jobPostingId;
    if (jobPosting && !postingId) {
      const newPosting = await createJobPosting({
        id: crypto.randomUUID(),
        userId: session.user.id,
        title: jobPosting.title || title,
        company: jobPosting.company || company,
        url: jobPosting.url || applicationUrl,
        description: jobPosting.description,
        location: jobPosting.location,
        salary: jobPosting.salary,
        jobType: jobPosting.jobType,
        jobGrade: jobPosting.jobGrade,
        source: jobPosting.source,
        rawData: jobPosting.rawData || null,
      });
      postingId = newPosting.id;
    }

    const application = await createApplication({
      id: crypto.randomUUID(),
      userId: session.user.id,
      jobPostingId: postingId || null,
      title,
      company,
      status,
      appliedDate: appliedDate ? new Date(appliedDate) : null,
      applicationUrl: applicationUrl || null,
      resumeVersion: resumeVersion || null,
      coverLetter: coverLetter || null,
      notes: notes || null,
      salaryOffer: salaryOffer || null,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      isFavorite: isFavorite ? 1 : 0,
      tags: tags.length > 0 ? tags : null,
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error: any) {
    console.error('Create application error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create application' },
      { status: 500 }
    );
  }
}

