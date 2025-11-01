import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { getUserAutomationRules } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rules = await getUserAutomationRules(session.user.id);

    return NextResponse.json({
      success: true,
      rules: rules.map(r => ({
        ...r,
        actions: typeof r.actions === 'string' ? JSON.parse(r.actions) : r.actions,
        triggerConditions: typeof r.triggerConditions === 'string' 
          ? JSON.parse(r.triggerConditions) 
          : r.triggerConditions,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching pipeline rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rules', message: error.message },
      { status: 500 }
    );
  }
}

