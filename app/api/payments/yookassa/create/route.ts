import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getYooKassaInstance } from '@/lib/payments/yookassa';
import { getUserByEmail } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !['pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "pro" or "enterprise"' },
        { status: 400 }
      );
    }

    // Определяем цену (в рублях)
    const prices: Record<string, { value: string; description: string }> = {
      pro: {
        value: '749.00', // ~$9 USD по курсу
        description: 'JobInsight Pro подписка на месяц',
      },
      enterprise: {
        value: '4990.00', // Custom цена
        description: 'JobInsight Enterprise подписка',
      },
    };

    const price = prices[plan];
    if (!price) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(session.user.email || '');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Создаем платеж через YooKassa
    const yookassa = getYooKassaInstance();
    
    const successUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success?payment_id={PAYMENT_ID}`;
    
    const payment = await yookassa.createSubscription({
      amount: {
        value: price.value,
        currency: 'RUB',
      },
      description: price.description,
      metadata: {
        userId: user.id,
        email: user.email || '',
        plan: plan,
      },
    });

    // Возвращаем URL для редиректа на оплату
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
      status: payment.status,
    });

  } catch (error: any) {
    console.error('YooKassa payment creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create payment',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

