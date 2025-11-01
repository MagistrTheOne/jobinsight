import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { updateAutomationRule } from '@/lib/db/queries';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isActive } = await request.json();

    const rule = await updateAutomationRule(params.id, session.user.id, {
      isActive: isActive ? 1 : 0,
    });

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error: any) {
    console.error('Error updating automation rule:', error);
    return NextResponse.json(
      { error: 'Failed to update rule', message: error.message },
      { status: 500 }
    );
  }
}

