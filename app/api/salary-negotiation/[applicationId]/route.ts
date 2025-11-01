import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSalaryNegotiationByApplicationId } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = await params;
    const negotiation = await getSalaryNegotiationByApplicationId(
      applicationId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      negotiation,
    });
  } catch (error: any) {
    console.error('Error fetching salary negotiation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch negotiation', message: error.message },
      { status: 500 }
    );
  }
}

