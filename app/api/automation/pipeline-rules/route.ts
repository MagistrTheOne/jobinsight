import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserAutomationRules } from '@/lib/db/queries';
import { getClientIp } from '@/lib/get-ip';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = getClientIp(request);
    const rateLimitResult = await rateLimit(identifier, 30, 60000); // 30 requests per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const rules = await getUserAutomationRules(session.user.id);

    // Parse JSON fields (triggerConditions and actions) if they are strings
    const parsedRules = rules.map(r => {
      try {
        return {
          ...r,
          actions: typeof r.actions === 'string' ? JSON.parse(r.actions) : r.actions,
          triggerConditions: typeof r.triggerConditions === 'string' 
            ? JSON.parse(r.triggerConditions) 
            : r.triggerConditions,
        };
      } catch (parseError) {
        console.error('Error parsing rule JSON:', parseError, r);
        // Return rule with original data if parsing fails
        return r;
      }
    });

    return NextResponse.json({
      success: true,
      rules: parsedRules,
    });
  } catch (error: any) {
    console.error('Error fetching pipeline rules:', error);
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse rules data', message: 'Invalid JSON format in database' },
        { status: 500 }
      );
    }
    
    // Handle database connection errors
    if (error.message?.includes('connect') || error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Database connection error', message: 'Unable to connect to database. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch rules', message: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

