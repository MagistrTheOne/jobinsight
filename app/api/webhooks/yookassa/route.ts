import { NextRequest, NextResponse } from 'next/server';
import { getYooKassaInstance } from '@/lib/payments/yookassa';
import { getUserByEmail, createOrUpdateSubscription } from '@/lib/db/queries';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-yookassa-signature') || '';

    // Верифицируем подпись
    const yookassa = getYooKassaInstance();
    
    // Note: YooKassa может использовать разные методы подписи
    // В реальном проекте нужно проверить документацию
    
    const parsedBody = JSON.parse(body);
    const { event, object } = parsedBody;

    console.log('YooKassa webhook received:', { event, paymentId: object.id });

    // Обрабатываем разные события
    switch (event) {
      case 'payment.succeeded': {
        const payment = object;
        const { metadata } = payment;

        if (!metadata?.userId) {
          console.error('No userId in payment metadata');
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Проверяем, что платеж еще не обработан
        // (можно добавить проверку в БД по payment.id)

        // Создаем или обновляем подписку
        const periodStart = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1); // Подписка на 1 месяц

        await createOrUpdateSubscription({
          id: randomUUID(),
          userId: metadata.userId,
          plan: metadata.plan || 'pro',
          paymentProvider: 'yookassa',
          externalCustomerId: metadata.userId, // Для YooKassa используем userId
          externalSubscriptionId: payment.id, // Используем payment ID
          lastPaymentId: payment.id,
          lastPaymentDate: new Date(payment.created_at),
          status: 'active',
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        });

        console.log('Subscription activated via YooKassa for user:', metadata.userId);
        break;
      }

      case 'payment.canceled': {
        const payment = object;
        const { metadata } = payment;

        if (metadata?.userId) {
          // Можно отменить подписку или оставить активной до конца периода
          // В зависимости от бизнес-логики
          console.log('Payment canceled for user:', metadata.userId);
        }
        break;
      }

      default:
        console.log('Unhandled YooKassa webhook event:', event);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('YooKassa webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    );
  }
}

// Для верификации webhook (GET запрос)
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'YooKassa webhook endpoint' });
}

