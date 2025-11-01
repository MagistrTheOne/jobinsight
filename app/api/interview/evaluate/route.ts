import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gigachatAPI } from '@/lib/gigachat';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
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
    const { question, answer, jobDescription } = body;

    if (!question || !answer || !jobDescription) {
      return NextResponse.json(
        { error: 'Question, answer and job description are required' },
        { status: 400 }
      );
    }

    // Оцениваем ответ
    const evaluation = await gigachatAPI.evaluateInterviewAnswer(question, answer, jobDescription);

    return NextResponse.json({ 
      success: true, 
      evaluation 
    });
  } catch (error: any) {
    console.error('Interview answer evaluation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}

