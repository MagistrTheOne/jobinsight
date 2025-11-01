import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { createSalaryNegotiation, updateSalaryNegotiation } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { applicationId, initialOffer, targetSalary, currentOffer, marketAverage, counterOfferDraft, aiRecommendation } = data;

    const negotiation = await createSalaryNegotiation({
      id: crypto.randomUUID(),
      applicationId,
      initialOffer,
      targetSalary,
      currentOffer,
      marketAverage,
      counterOfferDraft,
      aiRecommendation,
      negotiationStage: 'initial',
    });

    return NextResponse.json({
      success: true,
      negotiation,
    });
  } catch (error: any) {
    console.error('Error creating salary negotiation:', error);
    return NextResponse.json(
      { error: 'Failed to create negotiation', message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    const negotiation = await updateSalaryNegotiation(id, session.user.id, updateData);

    return NextResponse.json({
      success: true,
      negotiation,
    });
  } catch (error: any) {
    console.error('Error updating salary negotiation:', error);
    return NextResponse.json(
      { error: 'Failed to update negotiation', message: error.message },
      { status: 500 }
    );
  }
}

