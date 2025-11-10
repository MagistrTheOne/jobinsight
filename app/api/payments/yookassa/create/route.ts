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
    const { plan, billingCycle = 'monthly' } = body;

    if (!plan || !['pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "pro" or "enterprise"' },
        { status: 400 }
      );
    }

    if (billingCycle && !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be "monthly" or "yearly"' },
        { status: 400 }
      );
    }

    // Определяем цену (в рублях)
    const prices: Record<string, { monthly: { value: string; description: string }; yearly?: { value: string; description: string } }> = {
      pro: {
        monthly: {
          value: '3990.00', // ~$50 USD по курсу
          description: 'JobInsight Pro подписка на месяц',
        },
        yearly: {
          value: '38300.00', // ~$480 USD по курсу (20% скидка)
          description: 'JobInsight Pro подписка на год',
        },
      },
      enterprise: {
        monthly: {
          value: '4990.00', // Custom цена
          description: 'JobInsight Enterprise подписка на месяц',
        },
        yearly: {
          value: '47900.00', // Custom цена с скидкой
          description: 'JobInsight Enterprise подписка на год',
        },
      },
    };

    const selectedPrice = prices[plan][billingCycle as keyof typeof prices[typeof plan]];
    if (!selectedPrice) {
      return NextResponse.json(
        { error: 'Invalid plan or billing cycle combination' },
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
        value: selectedPrice.value,
        currency: 'RUB',
      },
      description: selectedPrice.description,
      metadata: {
        userId: user.id,
        email: user.email || '',
        plan: plan,
        billingCycle: billingCycle,
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

